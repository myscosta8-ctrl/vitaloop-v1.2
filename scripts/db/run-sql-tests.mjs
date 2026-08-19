#!/usr/bin/env node
// Runs database/tests/*.sql.
//   - database/tests/fixtures.sql is applied first, as the migrator, COMMITTED
//     (idempotent) so both migrator and app-role tests can reference known rows.
//   - Files named `app_*.sql` connect as the non-superuser application role, so
//     RLS is actually enforced (Master §33). All others connect as the migrator
//     (superuser bypasses RLS — used for integrity/trigger tests).
//   - Each test file runs inside a transaction that is ROLLED BACK, so tests
//     never mutate committed state.
// Convention: a test RAISES EXCEPTION on failure; success is silent/NOTICE.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listSql, migratorUrl, appUrl, withClient, TESTS_DIR, log } from './lib.mjs';

// 1) Load fixtures (committed).
await withClient(migratorUrl(), async (c) => {
  await c.query(readFileSync(join(TESTS_DIR, 'fixtures.sql'), 'utf8'));
});
log('fixtures loaded');

// 2) Run test files (t_* and app_*), skipping the fixtures file itself.
let failures = 0;
const files = listSql(TESTS_DIR, /^(t_|app_).*\.sql$/);

for (const t of files) {
  const asApp = t.name.startsWith('app_');
  const url = asApp ? appUrl() : migratorUrl();
  try {
    await withClient(url, async (c) => {
      await c.query('BEGIN');
      try {
        await c.query(t.sql);
      } finally {
        await c.query('ROLLBACK');
      }
    });
    log(`PASS  ${t.name}${asApp ? ' (app role)' : ''}`);
  } catch (err) {
    failures++;
    log(`FAIL  ${t.name}: ${String(err.message).split('\n')[0]}`);
  }
}

log(`${files.length - failures}/${files.length} db tests passed`);
process.exit(failures ? 1 : 0);
