#!/usr/bin/env node
// Applies database/migrations/V####__*.sql in order, tracked in schema_migrations.
// Each migration runs inside its own transaction. Idempotent by filename +
// checksum: a migration whose checksum changed after being applied is refused
// (structural changes must be new migrations, never edits — Master §56).
//
//   node scripts/db/migrate.mjs           apply pending migrations
//   node scripts/db/migrate.mjs --reset   drop & recreate public schema first
import { createHash } from 'node:crypto';
import { listSql, migratorUrl, withClient, MIGRATIONS_DIR, log } from './lib.mjs';

const reset = process.argv.includes('--reset');
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

await withClient(migratorUrl(), async (c) => {
  if (reset) {
    log('reset: dropping schema public');
    await c.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    await c.query('DROP SCHEMA IF EXISTS app CASCADE;');
  }
  await c.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   text PRIMARY KEY,
      checksum   text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    );`);

  const applied = new Map(
    (await c.query('SELECT filename, checksum FROM schema_migrations')).rows.map((r) => [
      r.filename,
      r.checksum,
    ]),
  );

  let count = 0;
  for (const m of listSql(MIGRATIONS_DIR, /^V\d+__.*\.sql$/)) {
    const checksum = sha(m.sql);
    if (applied.has(m.name)) {
      if (applied.get(m.name) !== checksum) {
        throw new Error(
          `migration ${m.name} changed after being applied — create a new migration instead`,
        );
      }
      continue;
    }
    log('applying', m.name);
    try {
      await c.query('BEGIN');
      await c.query(m.sql);
      await c.query('INSERT INTO schema_migrations(filename, checksum) VALUES ($1,$2)', [
        m.name,
        checksum,
      ]);
      await c.query('COMMIT');
      count++;
    } catch (err) {
      await c.query('ROLLBACK');
      throw new Error(`migration ${m.name} failed: ${err.message}`);
    }
  }
  log(count ? `applied ${count} migration(s)` : 'up to date');
});
