import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decideNewSession,
  isSessionTimedOut,
  shouldInactivateUser,
  DEFAULT_SESSION_POLICY,
  type ActiveSession,
} from '../src/index.ts';

const sess = (id: string, iso: string): ActiveSession => ({ id, lastSeenAt: new Date(iso) });

test('limite de 2 dispositivos: terceiro é negado (política padrão)', () => {
  const active = [sess('a', '2026-08-16T10:00:00Z'), sess('b', '2026-08-16T11:00:00Z')];
  const d = decideNewSession(active);
  assert.deepEqual(d, { allowed: false, reason: 'MAX_DEVICES_REACHED' });
});

test('segundo dispositivo é permitido', () => {
  const active = [sess('a', '2026-08-16T10:00:00Z')];
  const d = decideNewSession(active);
  assert.deepEqual(d, { allowed: true, revoke: [] });
});

test('estratégia revoke-oldest encerra a sessão mais antiga', () => {
  const active = [sess('a', '2026-08-16T10:00:00Z'), sess('b', '2026-08-16T11:00:00Z')];
  const d = decideNewSession(active, DEFAULT_SESSION_POLICY, 'revoke-oldest');
  assert.deepEqual(d, { allowed: true, revoke: ['a'] });
});

test('timeout por inatividade', () => {
  const last = new Date('2026-08-16T10:00:00Z');
  assert.ok(isSessionTimedOut(last, new Date('2026-08-16T10:31:00Z')));
  assert.ok(!isSessionTimedOut(last, new Date('2026-08-16T10:20:00Z')));
});

test('inativação de usuário após 6 meses sem atividade', () => {
  const last = new Date('2026-01-01T00:00:00Z');
  assert.ok(shouldInactivateUser(last, new Date('2026-08-16T00:00:00Z')));
  assert.ok(!shouldInactivateUser(last, new Date('2026-03-01T00:00:00Z')));
  assert.ok(!shouldInactivateUser(null, new Date('2026-08-16T00:00:00Z')));
});
