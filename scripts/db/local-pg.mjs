#!/usr/bin/env node
// Convenience wrapper to start/stop a throwaway local PostgreSQL cluster for
// development, under .localdb/. Requires the PostgreSQL 16 server binaries
// (initdb, pg_ctl) on PATH or under /usr/lib/postgresql/16/bin. Not for
// production. Note: PostgreSQL refuses to run as the OS root user.
import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, log } from './lib.mjs';

const DATA = join(ROOT, '.localdb', 'data');
const PORT = process.env.PGPORT || '55432';
const BIN = process.env.PG_BIN || '/usr/lib/postgresql/16/bin';
const bin = (n) => join(BIN, n);
const cmd = process.argv[2] || 'start';

function run(file, args) {
  return execFileSync(file, args, { stdio: 'inherit' });
}

if (cmd === 'start') {
  if (!existsSync(DATA)) {
    mkdirSync(join(ROOT, '.localdb'), { recursive: true });
    log('initdb', DATA);
    run(bin('initdb'), ['-D', DATA, '-U', 'postgres', '--auth=trust']);
  }
  run(bin('pg_ctl'), [
    '-D', DATA,
    '-o', `-p ${PORT} -c listen_addresses=127.0.0.1`,
    '-l', join(ROOT, '.localdb', 'server.log'),
    'start',
  ]);
  log(`postgres up on 127.0.0.1:${PORT} (db: create with 'createdb -p ${PORT} vitaloop_upa')`);
} else if (cmd === 'stop') {
  run(bin('pg_ctl'), ['-D', DATA, 'stop']);
} else {
  log(`usage: local-pg.mjs start|stop`);
  process.exit(1);
}
