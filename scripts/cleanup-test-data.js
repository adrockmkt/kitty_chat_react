import { db, removeTestReactions } from '../server/db.js';

function countCandidates() {
  return db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM reactions
      WHERE
        post_path IN ('srcdoc', 'about:srcdoc')
        OR post_url LIKE 'about:srcdoc%'
        OR post_title = 'srcdoc'
        OR post_url LIKE 'http://localhost:%'
        OR post_url LIKE 'https://localhost:%'
        OR post_url LIKE 'http://127.0.0.1:%'
        OR post_url LIKE 'https://127.0.0.1:%'
    `)
    .get().total;
}

function main() {
  const apply = process.argv.includes('--apply');
  const total = countCandidates();

  if (!apply) {
    console.info(
      `[kitty-chat] ${total} reações de teste/local foram encontradas. Rode "npm run cleanup:test-data:apply" para remover.`
    );
    return;
  }

  const result = removeTestReactions();
  console.info(`[kitty-chat] ${result.changes} reações de teste/local removidas com sucesso.`);
}

main();
