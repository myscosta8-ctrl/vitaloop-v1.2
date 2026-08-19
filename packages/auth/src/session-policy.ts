// Políticas de sessão (Master §9; RBAC §16). Regras puras e testáveis;
// a persistência (tabela sessions) fica na API/infra.

export interface SessionPolicyConfig {
  maxDevices: number; // Master: 2
  idleTimeoutMinutes: number; // timeout por inatividade
  inactivityDays: number; // inativação do usuário após 6 meses (180 dias)
}

export const DEFAULT_SESSION_POLICY: SessionPolicyConfig = {
  maxDevices: 2,
  idleTimeoutMinutes: 30,
  inactivityDays: 180,
};

export interface ActiveSession {
  id: string;
  lastSeenAt: Date;
}

export type NewSessionDecision =
  | { allowed: true; revoke: string[] }
  | { allowed: false; reason: 'MAX_DEVICES_REACHED' };

/**
 * Decide se um novo dispositivo pode abrir sessão.
 * Política atual (DP-002): ao atingir o limite, o novo login é IMPEDIDO
 * (opção conservadora). `strategy = 'revoke-oldest'` alterna para encerrar a
 * sessão ativa mais antiga, quando a instituição assim definir.
 */
export function decideNewSession(
  active: readonly ActiveSession[],
  cfg: SessionPolicyConfig = DEFAULT_SESSION_POLICY,
  strategy: 'deny' | 'revoke-oldest' = 'deny',
): NewSessionDecision {
  if (active.length < cfg.maxDevices) return { allowed: true, revoke: [] };
  if (strategy === 'deny') return { allowed: false, reason: 'MAX_DEVICES_REACHED' };
  // revoke-oldest: mantém (maxDevices - 1) mais recentes e revoga o restante.
  const sorted = [...active].sort((a, b) => a.lastSeenAt.getTime() - b.lastSeenAt.getTime());
  const revoke = sorted.slice(0, active.length - (cfg.maxDevices - 1)).map((s) => s.id);
  return { allowed: true, revoke };
}

/** Sessão expirou por inatividade? */
export function isSessionTimedOut(
  lastSeenAt: Date,
  now: Date,
  cfg: SessionPolicyConfig = DEFAULT_SESSION_POLICY,
): boolean {
  const minutes = (now.getTime() - lastSeenAt.getTime()) / 60000;
  return minutes >= cfg.idleTimeoutMinutes;
}

/** Usuário deve ser inativado (não excluído) após N dias sem atividade? */
export function shouldInactivateUser(
  lastActivityAt: Date | null,
  now: Date,
  cfg: SessionPolicyConfig = DEFAULT_SESSION_POLICY,
): boolean {
  if (lastActivityAt === null) return false;
  const days = (now.getTime() - lastActivityAt.getTime()) / 86_400_000;
  return days >= cfg.inactivityDays;
}
