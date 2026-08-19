// Shared helpers for DB scripts. No external config framework: read env directly.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, '..', '..');
export const MIGRATIONS_DIR = join(ROOT, 'database', 'migrations');
export const SEEDS_DIR = join(ROOT, 'database', 'seeds');
export const TESTS_DIR = join(ROOT, 'database', 'tests');

// Migrator connection (superuser/owner). Falls back to the local dev cluster.
export function migratorUrl() {
  return (
    process.env.DATABASE_MIGRATOR_URL ||
    process.env.DATABASE_URL ||
    'postgres://postgres@127.0.0.1:55432/vitaloop_upa'
  );
}

// Application connection (non-superuser, subject to RLS). Used by RLS tests.
export function appUrl() {
  return (
    process.env.DATABASE_APP_URL ||
    'postgres://vitaloop_app:devpass@127.0.0.1:55432/vitaloop_upa'
  );
}

export async function withClient(url, fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/**
 * List `.sql` files in a directory sorted lexicographically (V0001, V0002, ...).
 * `pattern` scopes the greenfield series and ignores any quarantined legacy files
 * (ADR-001): migrations `V####__*.sql`, seeds `S####__*.sql`, tests `*.sql`.
 */
export function listSql(dir, pattern = /\.sql$/) {
  return readdirSync(dir)
    .filter((f) => pattern.test(f))
    .sort()
    .map((f) => ({ name: f, path: join(dir, f), sql: readFileSync(join(dir, f), 'utf8') }));
}

export function log(...args) {
  console.log('[db]', ...args);
}
