import fs from 'node:fs';
import crypto from 'node:crypto';

import Database from 'better-sqlite3';

import { config } from './config.js';
import { hashPassword, verifyPassword } from './auth.js';

fs.mkdirSync(config.dataDir, { recursive: true });

export const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_url TEXT NOT NULL,
    post_path TEXT NOT NULL,
    post_title TEXT,
    post_id TEXT,
    emoji TEXT NOT NULL,
    emotion_label TEXT NOT NULL,
    sentiment_score INTEGER NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_reactions_post_path ON reactions(post_path);
  CREATE INDEX IF NOT EXISTS idx_reactions_post_url ON reactions(post_url);
  CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at);

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const insertReactionStatement = db.prepare(`
  INSERT INTO reactions (
    post_url,
    post_path,
    post_title,
    post_id,
    emoji,
    emotion_label,
    sentiment_score,
    ip_hash,
    user_agent,
    created_at
  ) VALUES (
    @postUrl,
    @postPath,
    @postTitle,
    @postId,
    @emoji,
    @emotionLabel,
    @sentimentScore,
    @ipHash,
    @userAgent,
    @createdAt
  )
`);

export function insertReaction(payload) {
  return insertReactionStatement.run(payload);
}

export function getAdminUserByUsername(username) {
  return db
    .prepare('SELECT id, username, password_hash AS passwordHash FROM admin_users WHERE username = ?')
    .get(username);
}

export async function ensureAdminUser() {
  if (!config.adminUsername || !config.adminPassword) {
    console.warn(
      '[kitty-chat] Nenhum usuario admin foi criado. Defina KITTY_ADMIN_USERNAME e KITTY_ADMIN_PASSWORD para habilitar o login do painel.'
    );
    return;
  }

  const existingUser = getAdminUserByUsername(config.adminUsername);
  if (existingUser) {
    const passwordMatches = await verifyPassword(config.adminPassword, existingUser.passwordHash);

    if (!passwordMatches) {
      const nextHash = await hashPassword(config.adminPassword);
      db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(
        nextHash,
        config.adminUsername
      );
      console.info(`[kitty-chat] Senha do admin sincronizada para: ${config.adminUsername}`);
    }

    return;
  }

  const totalUsers = db.prepare('SELECT COUNT(*) AS total FROM admin_users').get();
  if (totalUsers.total > 0) {
    console.warn(
      `[kitty-chat] Ja existem usuarios admin no banco. Nenhum novo usuario foi criado para ${config.adminUsername}.`
    );
    return;
  }

  const passwordHash = await hashPassword(config.adminPassword);
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(
    config.adminUsername,
    passwordHash
  );

  console.info(`[kitty-chat] Usuario admin inicial criado: ${config.adminUsername}`);
}

export function hashIpAddress(value) {
  if (!value) {
    return null;
  }

  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildPostsWhereClause(searchTerm) {
  if (!searchTerm) {
    return {
      clause: '',
      params: {},
    };
  }

  return {
    clause: `
      WHERE post_url LIKE @search
        OR post_path LIKE @search
        OR COALESCE(post_title, '') LIKE @search
        OR COALESCE(post_id, '') LIKE @search
    `,
    params: {
      search: `%${searchTerm}%`,
    },
  };
}

function mapPostRow(row) {
  const normalizedTitle =
    row.post_title && row.post_title.toLowerCase() !== 'srcdoc' ? row.post_title : null;
  const normalizedUrl =
    row.post_url && !row.post_url.startsWith('about:srcdoc') ? row.post_url : null;

  return {
    postUrl: normalizedUrl || row.post_path,
    postPath: row.post_path,
    postTitle: normalizedTitle || normalizedUrl || row.post_path,
    postId: row.post_id,
    totalReactions: row.total_reactions,
    averageSentiment: Number(row.average_sentiment ?? 0),
    positiveReactions: row.positive_reactions,
    neutralReactions: row.neutral_reactions,
    negativeReactions: row.negative_reactions,
    lastReactionAt: row.last_reaction_at,
  };
}

export function getOverviewStats() {
  const summary = db
    .prepare(`
      SELECT
        COUNT(*) AS total_reactions,
        COUNT(DISTINCT post_path) AS tracked_posts,
        ROUND(AVG(sentiment_score), 2) AS average_sentiment,
        ROUND(AVG(CASE WHEN sentiment_score > 0 THEN 1.0 ELSE 0 END) * 100, 1) AS positive_rate
      FROM reactions
    `)
    .get();

  const emojiBreakdown = db
    .prepare(`
      SELECT
        emoji,
        emotion_label,
        sentiment_score,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reactions), 0), 1) AS percentage
      FROM reactions
      GROUP BY emoji, emotion_label, sentiment_score
      ORDER BY sentiment_score ASC
    `)
    .all();

  const timeline = db
    .prepare(`
      SELECT
        date(created_at) AS day,
        COUNT(*) AS count,
        ROUND(AVG(sentiment_score), 2) AS average_sentiment
      FROM reactions
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY day ASC
    `)
    .all();

  const aggregatedPosts = db
    .prepare(`
      SELECT
        MAX(post_url) AS post_url,
        post_path,
        MAX(post_title) AS post_title,
        MAX(post_id) AS post_id,
        COUNT(*) AS total_reactions,
        ROUND(AVG(sentiment_score), 2) AS average_sentiment,
        SUM(CASE WHEN sentiment_score > 0 THEN 1 ELSE 0 END) AS positive_reactions,
        SUM(CASE WHEN sentiment_score = 0 THEN 1 ELSE 0 END) AS neutral_reactions,
        SUM(CASE WHEN sentiment_score < 0 THEN 1 ELSE 0 END) AS negative_reactions,
        MAX(created_at) AS last_reaction_at
      FROM reactions
      GROUP BY post_path
    `)
    .all()
    .map(mapPostRow);

  const topPosts = [...aggregatedPosts]
    .sort((left, right) => right.totalReactions - left.totalReactions)
    .slice(0, 5);

  const bestPosts = [...aggregatedPosts]
    .filter((item) => item.totalReactions > 0)
    .sort((left, right) => {
      if (right.averageSentiment !== left.averageSentiment) {
        return right.averageSentiment - left.averageSentiment;
      }

      return right.totalReactions - left.totalReactions;
    })
    .slice(0, 5);

  const worstPosts = [...aggregatedPosts]
    .filter((item) => item.totalReactions > 0)
    .sort((left, right) => {
      if (left.averageSentiment !== right.averageSentiment) {
        return left.averageSentiment - right.averageSentiment;
      }

      return right.totalReactions - left.totalReactions;
    })
    .slice(0, 5);

  return {
    summary: {
      totalReactions: summary.total_reactions ?? 0,
      trackedPosts: summary.tracked_posts ?? 0,
      averageSentiment: Number(summary.average_sentiment ?? 0),
      positiveRate: Number(summary.positive_rate ?? 0),
    },
    emojiBreakdown: emojiBreakdown.map((row) => ({
      emoji: row.emoji,
      emotionLabel: row.emotion_label,
      sentimentScore: row.sentiment_score,
      count: row.count,
      percentage: Number(row.percentage ?? 0),
    })),
    timeline: timeline.map((row) => ({
      day: row.day,
      count: row.count,
      averageSentiment: Number(row.average_sentiment ?? 0),
    })),
    topPosts,
    bestPosts,
    worstPosts,
  };
}

export function getPostsStats(searchTerm = '') {
  const { clause, params } = buildPostsWhereClause(searchTerm);

  return db
    .prepare(`
      SELECT
        MAX(post_url) AS post_url,
        post_path,
        MAX(post_title) AS post_title,
        MAX(post_id) AS post_id,
        COUNT(*) AS total_reactions,
        ROUND(AVG(sentiment_score), 2) AS average_sentiment,
        SUM(CASE WHEN sentiment_score > 0 THEN 1 ELSE 0 END) AS positive_reactions,
        SUM(CASE WHEN sentiment_score = 0 THEN 1 ELSE 0 END) AS neutral_reactions,
        SUM(CASE WHEN sentiment_score < 0 THEN 1 ELSE 0 END) AS negative_reactions,
        MAX(created_at) AS last_reaction_at
      FROM reactions
      ${clause}
      GROUP BY post_path
      ORDER BY total_reactions DESC, average_sentiment DESC
      LIMIT 100
    `)
    .all(params)
    .map(mapPostRow);
}

export function getPostStats({ postUrl, postPath }) {
  let whereClause = '';
  let params = {};

  if (postUrl) {
    whereClause = 'WHERE post_url = @postUrl';
    params = { postUrl };
  } else if (postPath) {
    whereClause = 'WHERE post_path = @postPath';
    params = { postPath };
  } else {
    return null;
  }

  const summary = db
    .prepare(`
      SELECT
        MAX(post_url) AS post_url,
        post_path,
        MAX(post_title) AS post_title,
        MAX(post_id) AS post_id,
        COUNT(*) AS total_reactions,
        ROUND(AVG(sentiment_score), 2) AS average_sentiment,
        SUM(CASE WHEN sentiment_score > 0 THEN 1 ELSE 0 END) AS positive_reactions,
        SUM(CASE WHEN sentiment_score = 0 THEN 1 ELSE 0 END) AS neutral_reactions,
        SUM(CASE WHEN sentiment_score < 0 THEN 1 ELSE 0 END) AS negative_reactions,
        MAX(created_at) AS last_reaction_at
      FROM reactions
      ${whereClause}
      GROUP BY post_path
      LIMIT 1
    `)
    .get(params);

  if (!summary) {
    return null;
  }

  const emojiBreakdown = db
    .prepare(`
      SELECT
        emoji,
        emotion_label,
        sentiment_score,
        COUNT(*) AS count
      FROM reactions
      ${whereClause}
      GROUP BY emoji, emotion_label, sentiment_score
      ORDER BY sentiment_score ASC
    `)
    .all(params);

  const timeline = db
    .prepare(`
      SELECT
        date(created_at) AS day,
        COUNT(*) AS count,
        ROUND(AVG(sentiment_score), 2) AS average_sentiment
      FROM reactions
      ${whereClause}
      GROUP BY date(created_at)
      ORDER BY day ASC
      LIMIT 30
    `)
    .all(params);

  return {
    summary: mapPostRow(summary),
    emojiBreakdown: emojiBreakdown.map((row) => ({
      emoji: row.emoji,
      emotionLabel: row.emotion_label,
      sentimentScore: row.sentiment_score,
      count: row.count,
    })),
    timeline: timeline.map((row) => ({
      day: row.day,
      count: row.count,
      averageSentiment: Number(row.average_sentiment ?? 0),
    })),
  };
}
