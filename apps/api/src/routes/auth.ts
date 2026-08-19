// Rotas de autenticação: login com verificação de senha, limite de 2
// dispositivos e criação de sessão (Master §9; RBAC §16).
import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { decideNewSession, DEFAULT_SESSION_POLICY, type ActiveSession } from '@vitaloop/auth';
import type { Database } from '../db.ts';
import { hashToken } from '../context.ts';

const LoginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  deviceLabel: z.string().optional(),
});

export function registerAuthRoutes(app: FastifyInstance, db: Database): void {
  app.post('/auth/login', async (req, reply) => {
    const body = LoginBody.parse(req.body);

    const login = await db.loginTx(async (c) => {
      const r = await c.query('SELECT * FROM app.get_login($1)', [body.username]);
      return r.rows[0] as { id: string; password_hash: string; is_active: boolean } | undefined;
    });

    // Resposta genérica para não revelar existência de usuário.
    if (!login || !login.is_active) return reply.code(401).send({ error: 'INVALID_CREDENTIALS' });
    const ok = await bcrypt.compare(body.password, login.password_hash);
    if (!ok) return reply.code(401).send({ error: 'INVALID_CREDENTIALS' });

    // Cria sessão com identidade do próprio usuário (RLS self-write).
    const token = randomBytes(32).toString('base64url');
    const result = await db.withUserTx({ userId: login.id }, async (c) => {
      const active = await c.query(
        'SELECT id, last_seen_at FROM sessions WHERE user_id=$1 AND revoked_at IS NULL',
        [login.id],
      );
      const sessions: ActiveSession[] = active.rows.map((r: { id: string; last_seen_at: Date }) => ({
        id: r.id,
        lastSeenAt: r.last_seen_at,
      }));
      const decision = decideNewSession(sessions, DEFAULT_SESSION_POLICY, 'deny');
      if (!decision.allowed) return { error: 'MAX_DEVICES_REACHED' as const };

      const ins = await c.query(
        `INSERT INTO sessions(user_id, token_hash, device_label, expires_at)
         VALUES ($1,$2,$3, now() + interval '12 hours') RETURNING id`,
        [login.id, hashToken(token), body.deviceLabel ?? null],
      );
      await c.query(
        `INSERT INTO audit_events(actor_id, action, entity_type, entity_id)
         VALUES ($1,'LOGIN','session',$2)`,
        [login.id, ins.rows[0].id],
      );
      return { sessionId: ins.rows[0].id as string };
    });

    if ('error' in result) return reply.code(409).send({ error: result.error });
    return reply.send({ token, sessionId: result.sessionId });
  });

  app.post('/auth/logout', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    await db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      await c.query(
        `UPDATE sessions SET revoked_at=now(), revoked_reason='logout' WHERE id=$1`,
        [user.sessionId],
      );
      await c.query(
        `INSERT INTO audit_events(actor_id, action, entity_type, entity_id)
         VALUES ($1,'LOGOUT','session',$2)`,
        [user.userId, user.sessionId],
      );
    });
    return reply.send({ ok: true });
  });
}
