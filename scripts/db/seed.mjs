#!/usr/bin/env node
// Applies database/seeds/S####__*.sql. Seeds must be idempotent (upsert), so
// re-running is safe. Only configuration data (professions, permissions, roles,
// sectors, catalogs, document types, outcomes) — never fictitious patients.
import { listSql, migratorUrl, withClient, SEEDS_DIR, log } from './lib.mjs';

await withClient(migratorUrl(), async (c) => {
  for (const s of listSql(SEEDS_DIR, /^S\d+__.*\.sql$/)) {
    log('seeding', s.name);
    await c.query('BEGIN');
    try {
      await c.query(s.sql);
      await c.query('COMMIT');
    } catch (err) {
      await c.query('ROLLBACK');
      throw new Error(`seed ${s.name} failed: ${err.message}`);
    }
  }
  log('seeds applied');
});
