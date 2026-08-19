// Erros de domínio estruturados (Master/Implementação §38). O frontend recebe
// um `code` estável; a mensagem é auxiliar. Estes códigos espelham as exceções
// levantadas no banco (triggers/constraints), de modo que backend e banco falem
// a mesma língua.

export type DomainErrorCode =
  | 'PATIENT_NOT_FOUND'
  | 'DUPLICATE_PATIENT'
  | 'ATTENDANCE_NOT_FOUND'
  | 'ATTENDANCE_ALREADY_CLOSED'
  | 'BED_ALREADY_OCCUPIED'
  | 'ATTENDANCE_ALREADY_HAS_BED'
  | 'INVALID_OUTCOME'
  | 'DOCUMENT_IMMUTABLE'
  | 'DOCUMENT_ALREADY_INACTIVATED'
  | 'UNAUTHORIZED_ACTION'
  | 'INVALID_STATE_TRANSITION'
  | 'MISSING_REQUIRED_FIELD';

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: DomainErrorCode, message?: string, details?: Record<string, unknown>) {
    super(message ?? code);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}
