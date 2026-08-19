import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAttendanceTransition,
  canTransitionAttendance,
  isActiveAttendance,
  assertDocumentTransition,
  assertContentEditable,
  assertReleasable,
  isImmutable,
  canTransitionBed,
  shouldAutoCloseExtraBed,
  DomainError,
} from '../src/index.ts';

test('atendimento: transições válidas e inválidas', () => {
  assert.ok(canTransitionAttendance('ABERTO', 'EM_TRIAGEM'));
  assert.ok(canTransitionAttendance('EM_ATENDIMENTO', 'OBSERVACAO'));
  assert.ok(canTransitionAttendance('OBSERVACAO', 'EM_ATENDIMENTO')); // reavaliação
  assert.ok(!canTransitionAttendance('EM_TRIAGEM', 'OBSERVACAO'));
  assert.ok(!isActiveAttendance('ENCERRADO'));
});

test('atendimento: encerrado nunca reabre', () => {
  assert.throws(() => assertAttendanceTransition('ENCERRADO', 'ABERTO'), (e: unknown) => {
    return e instanceof DomainError && e.code === 'INVALID_STATE_TRANSITION';
  });
});

test('documento: liberado é imutável', () => {
  assert.ok(isImmutable('LIBERADO'));
  assert.throws(() => assertContentEditable('LIBERADO'), (e: unknown) =>
    e instanceof DomainError && e.code === 'DOCUMENT_IMMUTABLE',
  );
  assert.throws(() => assertContentEditable('INATIVADO'), (e: unknown) =>
    e instanceof DomainError && e.code === 'DOCUMENT_ALREADY_INACTIVATED',
  );
});

test('documento: única saída de LIBERADO é INATIVADO', () => {
  assert.doesNotThrow(() => assertDocumentTransition('LIBERADO', 'INATIVADO'));
  assert.throws(() => assertDocumentTransition('LIBERADO', 'RASCUNHO'));
  assert.throws(() => assertDocumentTransition('INATIVADO', 'LIBERADO'), (e: unknown) =>
    e instanceof DomainError && e.code === 'DOCUMENT_ALREADY_INACTIVATED',
  );
});

test('documento: liberação exige snapshot', () => {
  assert.throws(() => assertReleasable('LIBERADO', false), (e: unknown) =>
    e instanceof DomainError && e.code === 'MISSING_REQUIRED_FIELD',
  );
  assert.doesNotThrow(() => assertReleasable('LIBERADO', true));
});

test('leito: transições e fechamento automático de extra', () => {
  assert.ok(canTransitionBed('LIVRE', 'OCUPADO'));
  assert.ok(!canTransitionBed('OCUPADO', 'MANUTENCAO'));
  const now = new Date('2026-08-16T12:00:00Z');
  const empty31 = new Date('2026-08-16T11:29:00Z');
  const empty10 = new Date('2026-08-16T11:50:00Z');
  assert.ok(shouldAutoCloseExtraBed('LEITO_EXTRA_DISPONIVEL', true, empty31, now));
  assert.ok(!shouldAutoCloseExtraBed('LEITO_EXTRA_DISPONIVEL', true, empty10, now));
  assert.ok(!shouldAutoCloseExtraBed('LIVRE', false, empty31, now));
});
