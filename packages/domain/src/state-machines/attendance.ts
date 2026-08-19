// Máquina de estados do atendimento (STATE_MACHINES §1). Regras puras — espelhado
// pelo mesmo grafo do trigger app.enforce_attendance_transition no banco (V0003).
import { DomainError } from '../errors.ts';

export const ATTENDANCE_STATUSES = [
  'ABERTO',
  'RECEPCAO',
  'AGUARDANDO_TRIAGEM',
  'EM_TRIAGEM',
  'AGUARDANDO_ATENDIMENTO_MEDICO',
  'EM_ATENDIMENTO_MEDICO',
  'EM_ATENDIMENTO',
  'OBSERVACAO',
  'AGUARDANDO_REAVALIACAO',
  'EM_REAVALIACAO',
  'ENCERRADO',
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

const TRANSITIONS: Record<AttendanceStatus, readonly AttendanceStatus[]> = {
  ABERTO: ['AGUARDANDO_TRIAGEM', 'EM_TRIAGEM', 'AGUARDANDO_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO', 'ENCERRADO'],
  RECEPCAO: ['AGUARDANDO_TRIAGEM', 'EM_TRIAGEM', 'ENCERRADO'],
  AGUARDANDO_TRIAGEM: ['EM_TRIAGEM', 'AGUARDANDO_ATENDIMENTO_MEDICO', 'ENCERRADO'],
  EM_TRIAGEM: ['AGUARDANDO_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO', 'ENCERRADO'],
  AGUARDANDO_ATENDIMENTO_MEDICO: ['EM_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO', 'ENCERRADO'],
  EM_ATENDIMENTO_MEDICO: ['OBSERVACAO', 'AGUARDANDO_REAVALIACAO', 'EM_REAVALIACAO', 'ENCERRADO'],
  EM_ATENDIMENTO: ['OBSERVACAO', 'AGUARDANDO_REAVALIACAO', 'EM_REAVALIACAO', 'ENCERRADO'],
  OBSERVACAO: ['AGUARDANDO_REAVALIACAO', 'EM_REAVALIACAO', 'EM_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO', 'ENCERRADO'],
  AGUARDANDO_REAVALIACAO: ['EM_REAVALIACAO', 'EM_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO', 'ENCERRADO'],
  EM_REAVALIACAO: ['OBSERVACAO', 'AGUARDANDO_REAVALIACAO', 'EM_ATENDIMENTO_MEDICO', 'EM_ATENDIMENTO', 'ENCERRADO'],
  ENCERRADO: [], // terminal — nunca reabre
};

export const isActiveAttendance = (s: AttendanceStatus): boolean => s !== 'ENCERRADO';

export function canTransitionAttendance(from: AttendanceStatus, to: AttendanceStatus): boolean {
  if (from === to) return true;
  const allowed = TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/** Valida a transição ou lança INVALID_STATE_TRANSITION. */
export function assertAttendanceTransition(from: AttendanceStatus, to: AttendanceStatus): void {
  if (!canTransitionAttendance(from, to)) {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Transição de atendimento inválida: ${from} -> ${to}`,
      { from, to },
    );
  }
}
