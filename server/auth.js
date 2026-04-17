import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

import { config } from './config.js';

const SESSION_COOKIE = 'kitty_chat_session';

function encode(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function sign(payload) {
  return crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payload)
    .digest('base64url');
}

export function createSessionCookie(username) {
  const payload = encode({
    username,
    expiresAt: Date.now() + config.sessionTtlMs,
  });

  return `${payload}.${sign(payload)}`;
}

export function readSessionCookie(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (sign(payload) !== signature) {
    return null;
  }

  try {
    const decoded = decode(payload);
    if (!decoded.username || !decoded.expiresAt || decoded.expiresAt < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function attachSession(req, _res, next) {
  const session = readSessionCookie(req.cookies?.[SESSION_COOKIE]);
  req.session = session;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.session?.username) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  return next();
}

export function setSessionCookie(res, username) {
  res.cookie(SESSION_COOKIE, createSessionCookie(username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: config.sessionTtlMs,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
