import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';

import cookieParser from 'cookie-parser';
import express from 'express';

import {
  attachSession,
  clearSessionCookie,
  requireAuth,
  setSessionCookie,
  verifyPassword,
} from './auth.js';
import { apiBasePaths, config } from './config.js';
import {
  ensureAdminUser,
  getAdminUserByUsername,
  getOverviewStats,
  getPostStats,
  getPostsStats,
  hashIpAddress,
  insertReaction,
} from './db.js';
import { reactionMap } from './reactions.js';

const reactionCooldown = new Map();

function applyPublicCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip ?? req.socket.remoteAddress ?? '';
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim();
}

function enforceReactionRateLimit(req, res, next) {
  const ipAddress = getClientIp(req);
  const postPath = sanitizeText(req.body?.postPath);
  const fingerprint = `${hashIpAddress(ipAddress) ?? 'anonymous'}:${postPath}`;
  const lastSeen = reactionCooldown.get(fingerprint);

  if (lastSeen && Date.now() - lastSeen < config.rateLimitWindowMs) {
    return res.status(429).json({
      error: 'Reacao recebida recentemente para este post. Aguarde alguns segundos.',
    });
  }

  reactionCooldown.set(fingerprint, Date.now());
  return next();
}

function registerApiRoutes(app, prefix) {
  app.get(`${prefix}/health`, (_req, res) => {
    res.json({ ok: true });
  });

  app.options(`${prefix}/reactions`, (_req, res) => {
    applyPublicCors(res);
    return res.status(204).end();
  });

  app.post(`${prefix}/reactions`, enforceReactionRateLimit, (req, res) => {
    applyPublicCors(res);
    const emoji = sanitizeText(req.body?.emoji);
    const reaction = reactionMap.get(emoji);
    const postUrl = sanitizeText(req.body?.postUrl);
    const postPath = sanitizeText(req.body?.postPath || req.body?.postId);
    const postTitle = sanitizeText(req.body?.postTitle);
    const postId = sanitizeText(req.body?.postId);

    if (!reaction) {
      return res.status(400).json({ error: 'Emoji invalido.' });
    }

    if (!postUrl || !postPath) {
      return res.status(400).json({ error: 'postUrl e postPath sao obrigatorios.' });
    }

    insertReaction({
      postUrl,
      postPath,
      postTitle: postTitle || null,
      postId: postId || null,
      emoji: reaction.emoji,
      emotionLabel: reaction.label,
      sentimentScore: reaction.score,
      ipHash: hashIpAddress(getClientIp(req)),
      userAgent: sanitizeText(req.headers['user-agent']) || null,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      reaction: {
        emoji: reaction.emoji,
        emotionLabel: reaction.label,
        sentimentScore: reaction.score,
      },
    });
  });

  app.post(`${prefix}/auth/login`, async (req, res) => {
    const username = sanitizeText(req.body?.username);
    const password = sanitizeText(req.body?.password);

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario e senha sao obrigatorios.' });
    }

    const user = getAdminUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    setSessionCookie(res, user.username);

    return res.json({
      success: true,
      user: {
        username: user.username,
      },
    });
  });

  app.post(`${prefix}/auth/logout`, (_req, res) => {
    clearSessionCookie(res);
    res.json({ success: true });
  });

  app.get(`${prefix}/auth/session`, (req, res) => {
    if (!req.session?.username) {
      return res.status(401).json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      user: {
        username: req.session.username,
      },
    });
  });

  app.get(`${prefix}/stats/overview`, requireAuth, (_req, res) => {
    res.json(getOverviewStats());
  });

  app.get(`${prefix}/stats/posts`, requireAuth, (req, res) => {
    const search = sanitizeText(req.query?.search);
    res.json({
      posts: getPostsStats(search),
    });
  });

  app.get(`${prefix}/stats/post`, requireAuth, (req, res) => {
    const postUrl = sanitizeText(req.query?.url);
    const postPath = sanitizeText(req.query?.path);
    const details = getPostStats({ postUrl, postPath });

    if (!details) {
      return res.status(404).json({ error: 'Post nao encontrado.' });
    }

    return res.json(details);
  });
}

function registerStaticRoutes(app) {
  if (!fs.existsSync(config.distDir)) {
    app.get('/', (_req, res) => {
      res
        .status(200)
        .send('Frontend ainda nao foi buildado. Rode "npm run build" para servir a interface por este servidor.');
    });

    return;
  }

  app.use('/assets', express.static(path.join(config.distDir, 'assets')));
  app.use(express.static(config.distDir));

  const indexFile = path.join(config.distDir, 'index.html');

  app.get('/', (_req, res) => {
    if (config.basePath) {
      return res.redirect(config.basePath);
    }

    return res.sendFile(indexFile);
  });

  if (config.basePath) {
    app.get(config.basePath, (_req, res) => res.sendFile(indexFile));
    app.get(`${config.basePath}/*path`, (_req, res) => res.sendFile(indexFile));
  }
}

async function startServer() {
  await ensureAdminUser();

  const app = express();
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(attachSession);

  apiBasePaths.forEach((prefix) => registerApiRoutes(app, prefix));
  registerStaticRoutes(app);

  app.listen(config.port, () => {
    console.info(
      `[kitty-chat] Servidor rodando em http://localhost:${config.port}${config.basePath || ''}`
    );
  });
}

startServer().catch((error) => {
  console.error('[kitty-chat] Falha ao iniciar o servidor:', error);
  process.exitCode = 1;
});
