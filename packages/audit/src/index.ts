// Modelo de evento de auditoria (Master §52; ADR-011). O registro persistente
// é feito pela API na MESMA transação da operação (tabela audit_events), e
// operações estruturais críticas também disparam auditoria via trigger no banco.
// Nunca colocar dado clínico desnecessário no metadata.

export const AUDIT_ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'ACCESS',
  'ACCESS_ATTEMPT',
  'READ',
  'CREATE',
  'UPDATE',
  'SIGN',
  'PRINT',
  'REPRINT',
  'INACTIVATE',
  'PERMISSION_CHANGE',
  'STATE_CHANGE',
  'OUTCOME',
  'TRANSFER',
  'ADMIN_CHANGE',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditEvent {
  actorId: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/** Constrói um evento normalizado (não persiste). */
export function buildAuditEvent(input: AuditEvent): Required<Omit<AuditEvent, 'entityType' | 'entityId' | 'requestId'>> & AuditEvent {
  return {
    metadata: {},
    ...input,
    actorId: input.actorId,
    action: input.action,
  };
}
