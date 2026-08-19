import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertCanRegisterOutcome,
  authorize,
  can,
  DomainError,
  type AuthContext,
  type OutcomeActor,
} from '../src/index.ts';

const actor = (isPhysician: boolean, perms: string[]): OutcomeActor => ({
  isPhysician,
  can: (p) => perms.includes(p),
});

test('desfecho: óbito exige médico', () => {
  const nurse = actor(false, ['outcome.create']);
  assert.throws(() => assertCanRegisterOutcome('OBITO', nurse), (e: unknown) =>
    e instanceof DomainError && e.code === 'UNAUTHORIZED_ACTION',
  );
  const doctor = actor(true, ['outcome.create']);
  assert.doesNotThrow(() => assertCanRegisterOutcome('OBITO', doctor));
});

test('desfecho: evasão pode ser registrada por não-médico autorizado', () => {
  const nurse = actor(false, ['outcome.create']);
  assert.doesNotThrow(() => assertCanRegisterOutcome('EVASAO', nurse));
});

test('desfecho: sem permissão de desfecho é negado', () => {
  const someone = actor(true, []);
  assert.throws(() => assertCanRegisterOutcome('ALTA', someone), (e: unknown) =>
    e instanceof DomainError && e.code === 'UNAUTHORIZED_ACTION',
  );
});

test('desfecho: código inválido', () => {
  const doctor = actor(true, ['outcome.create']);
  assert.throws(
    () => assertCanRegisterOutcome('INEXISTENTE' as never, doctor),
    (e: unknown) => e instanceof DomainError && e.code === 'INVALID_OUTCOME',
  );
});

test('authorize: usuário inativo nunca autoriza', () => {
  const ctx: AuthContext = {
    userId: 'u1',
    isActive: false,
    permissions: new Set(['patient.read']),
  };
  assert.ok(!can(ctx, 'patient.read'));
  assert.throws(() => authorize(ctx, 'patient.read'), (e: unknown) =>
    e instanceof DomainError && e.code === 'UNAUTHORIZED_ACTION',
  );
});
