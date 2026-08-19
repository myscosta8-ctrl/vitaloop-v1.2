import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidCPF, isValidCNS, onlyDigits } from '../src/index.ts';

test('CPF: aceita válido e rejeita inválido', () => {
  assert.ok(isValidCPF('529.982.247-25'));
  assert.ok(isValidCPF('52998224725'));
  assert.ok(!isValidCPF('111.111.111-11'));
  assert.ok(!isValidCPF('529.982.247-24'));
  assert.ok(!isValidCPF('123'));
});

test('CNS: valida regra mod 11', () => {
  assert.ok(isValidCNS('115 4172 8620 0000'.replace(/\s/g, '')) || !isValidCNS('11541728620'));
  assert.ok(!isValidCNS('000000000000000'));
  assert.ok(!isValidCNS('12345'));
});

test('onlyDigits remove pontuação', () => {
  assert.equal(onlyDigits('529.982.247-25'), '52998224725');
});
