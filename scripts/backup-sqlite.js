import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

import { config } from '../server/config.js';

function getTimestamp() {
  return new Date().toISOString().replaceAll(':', '-');
}

async function main() {
  const backupDir = path.join(config.dataDir, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const destination = path.join(backupDir, `kitty-chat-${getTimestamp()}.sqlite`);

  if (!fs.existsSync(config.dbPath)) {
    console.error(`[kitty-chat] Banco não encontrado em ${config.dbPath}`);
    process.exit(1);
  }

  const db = new Database(config.dbPath, { readonly: true });
  await db.backup(destination);
  db.close();

  console.info(`[kitty-chat] Backup criado em ${destination}`);
}

main().catch((error) => {
  console.error('[kitty-chat] Falha ao criar backup:', error);
  process.exit(1);
});
