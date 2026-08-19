// Smoke E2E in-process (Fastify inject) do pipeline principal contra o banco:
// login → criar paciente → abrir atendimento → encerrar (ALTA).
// Requer banco migrado+seedeado e a role de aplicação. Usa DATABASE_MIGRATOR_URL
// para preparar um usuário de teste e DATABASE_APP_URL para a API (sob RLS).
import assert from 'node:assert/strict';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { loadConfig } from '../src/config.ts';
import { buildServer } from '../src/server.ts';

const migratorUrl =
  process.env.DATABASE_MIGRATOR_URL ?? 'postgres://postgres@127.0.0.1:55432/vitaloop_upa';

/** Gera um CPF válido (dígitos verificadores) e único por execução. */
function genCPF(): string {
  const d: number[] = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const check = (len: number): number => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += (d[i] as number) * (len + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  d.push(check(9));
  d.push(check(10));
  return d.join('');
}

async function prepareUser(): Promise<void> {
  const c = new pg.Client({ connectionString: migratorUrl });
  await c.connect();
  try {
    const hash = bcrypt.hashSync('smokepass', 8);
    await c.query(
      `INSERT INTO users(id, username, full_name, password_hash, is_active)
       VALUES ('99999999-9999-9999-9999-999999999999','smoke_user','Smoke User',$1,true)
       ON CONFLICT (id) DO UPDATE SET password_hash=EXCLUDED.password_hash, is_active=true`,
      [hash],
    );
    // Médico (desfecho/físico) + Administrativo (recepção: paciente/atendimento).
    await c.query(
      `INSERT INTO user_roles(user_id, role_id)
       SELECT '99999999-9999-9999-9999-999999999999', id FROM roles
       WHERE code IN ('MEDICO','ADMINISTRATIVO')
       ON CONFLICT DO NOTHING`,
    );
    // Revoga sessões anteriores para reiniciar a contagem de dispositivos.
    await c.query(
      `UPDATE sessions SET revoked_at=now(), revoked_reason='smoke-reset'
       WHERE user_id='99999999-9999-9999-9999-999999999999' AND revoked_at IS NULL`,
    );
  } finally {
    await c.end();
  }
}

async function sectorId(): Promise<string> {
  const c = new pg.Client({ connectionString: migratorUrl });
  await c.connect();
  try {
    const r = await c.query(`SELECT id FROM upa_sectors WHERE code='RECEPCAO'`);
    return r.rows[0].id as string;
  } finally {
    await c.end();
  }
}

async function main(): Promise<void> {
  await prepareUser();
  const sector = await sectorId();
  const app = buildServer(loadConfig());

  const login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { username: 'smoke_user', password: 'smokepass' },
  });
  assert.equal(login.statusCode, 200, `login: ${login.body}`);
  const token = login.json().token as string;
  const auth = { authorization: `Bearer ${token}` };
  console.log('OK login');

  const mrn = `MRN-SMOKE-${Date.now()}`;
  const cpf = genCPF();
  const create = await app.inject({
    method: 'POST',
    url: '/patients',
    headers: auth,
    payload: { medicalRecordNumber: mrn, fullName: 'Paciente Smoke', cpf },
  });
  assert.equal(create.statusCode, 201, `create patient: ${create.body}`);
  const patientId = create.json().id as string;
  console.log('OK create patient');

  const dup = await app.inject({
    method: 'POST',
    url: '/patients',
    headers: auth,
    payload: { medicalRecordNumber: `${mrn}-x`, fullName: 'Dup', cpf },
  });
  assert.equal(dup.statusCode, 409, `dup should be blocked: ${dup.body}`);
  console.log('OK duplicate blocked');

  const open = await app.inject({
    method: 'POST',
    url: '/attendances',
    headers: auth,
    payload: { patientId, sectorId: sector, reason: 'smoke' },
  });
  assert.equal(open.statusCode, 201, `open attendance: ${open.body}`);
  const attendanceId = open.json().id as string;
  console.log('OK open attendance');

  const close = await app.inject({
    method: 'POST',
    url: `/attendances/${attendanceId}/close`,
    headers: auth,
    payload: { outcomeCode: 'ALTA', notes: 'melhora' },
  });
  assert.equal(close.statusCode, 200, `close attendance: ${close.body}`);
  console.log('OK close attendance (ALTA by physician)');

  await app.close();
  console.log('\nSMOKE PASSED');
}

main().catch((err) => {
  console.error('SMOKE FAILED:', err.message);
  process.exit(1);
});
