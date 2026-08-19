// Autenticação por sessão + montagem do AuthContext (permissões efetivas).
import { createHash } from 'node:crypto';
import type { Database } from './db.ts';
import { isSessionTimedOut, type SessionPolicyConfig } from '@vitaloop/auth';
import type { AuthContext } from '@vitaloop/domain';

export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export interface RequestUser extends AuthContext {
  sessionId: string;
}

/** Resolve o token de sessão em um usuário autenticado, aplicando timeout. */
export async function authenticate(
  db: Database,
  token: string,
  policy: SessionPolicyConfig,
  now = new Date(),
): Promise<RequestUser | null> {
  const tokenHash = hashToken(token);
  return db.loginTx(async (c) => {
    const s = await c.query(
      'SELECT * FROM app.resolve_session($1)',
      [tokenHash],
    );
    const row = s.rows[0] as
      | {
          session_id: string;
          user_id: string;
          last_seen_at: Date;
          revoked_at: Date | null;
          expires_at: Date | null;
          is_active: boolean;
        }
      | undefined;
    if (!row) return null;
    if (row.revoked_at) return null;
    if (!row.is_active) return null;
    if (row.expires_at && row.expires_at.getTime() < now.getTime()) return null;
    if (isSessionTimedOut(row.last_seen_at, now, policy)) return null;

    const perms = await c.query('SELECT app.user_permissions($1) AS code', [row.user_id]);
    const permissions = new Set<string>(perms.rows.map((r: { code: string }) => r.code));

    // Toca a sessão e a atividade do usuário (dentro do escopo de identidade).
    await c.query('SELECT set_config($1,$2,true)', ['app.user_id', row.user_id]);
    await c.query('UPDATE sessions SET last_seen_at = now() WHERE id = $1', [row.session_id]);
    await c.query('UPDATE users SET last_activity_at = now() WHERE id = $1', [row.user_id]);

    return {
      userId: row.user_id,
      sessionId: row.session_id,
      isActive: row.is_active,
      permissions,
    };
  });
}
