import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(serverDir, '..');

function normalizeBasePath(value) {
  if (!value || value === '/') {
    return '';
  }

  const trimmed = value.startsWith('/') ? value : `/${value}`;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  rootDir,
  distDir: path.join(rootDir, 'dist'),
  dataDir: path.join(rootDir, 'data'),
  dbPath: path.join(rootDir, 'data', 'kitty-chat.sqlite'),
  basePath: normalizeBasePath(process.env.KITTY_BASE_PATH ?? '/kitty-chat'),
  sessionSecret: process.env.KITTY_SESSION_SECRET ?? 'kitty-chat-dev-secret',
  adminUsername: process.env.KITTY_ADMIN_USERNAME,
  adminPassword: process.env.KITTY_ADMIN_PASSWORD,
  rateLimitWindowMs: Number(process.env.KITTY_REACTION_COOLDOWN_MS ?? 15000),
  sessionTtlMs: Number(process.env.KITTY_SESSION_TTL_MS ?? 1000 * 60 * 60 * 24 * 7),
};

export const apiBasePaths = Array.from(
  new Set(['/api', config.basePath ? `${config.basePath}/api` : '/api'])
);
