// Regras de desfecho (STATE_MACHINES §6; Master §36). Espelha o catálogo
// `outcomes` (V0008/S0002) e a autorização de close_attendance.
import { DomainError } from './errors.ts';

export const OUTCOME_TYPES = [
  'ALTA',
  'TRANSFERENCIA',
  'OBITO',
  'EVASAO',
  'MELHOR_EM_CASA',
  'OUTRO',
] as const;
export type OutcomeType = (typeof OUTCOME_TYPES)[number];

/** Desfechos privativos do médico (alta por melhora, óbito, transferência,
 *  Melhor em Casa). Evasão pode ser registrada por qualquer profissional
 *  autorizado; OUTRO é configurável. */
export const OUTCOME_REQUIRES_PHYSICIAN: Record<OutcomeType, boolean> = {
  ALTA: true,
  TRANSFERENCIA: true,
  OBITO: true,
  MELHOR_EM_CASA: true,
  EVASAO: false,
  OUTRO: false,
};

export interface OutcomeActor {
  isPhysician: boolean;
  can: (permission: string) => boolean;
}

/** Autoriza o registro de desfecho por um ator. Lança em caso de negação. */
export function assertCanRegisterOutcome(outcome: OutcomeType, actor: OutcomeActor): void {
  if (!OUTCOME_TYPES.includes(outcome)) {
    throw new DomainError('INVALID_OUTCOME', `Desfecho inválido: ${outcome}`);
  }
  if (!actor.can('outcome.create')) {
    throw new DomainError('UNAUTHORIZED_ACTION', 'Sem permissão para registrar desfecho.');
  }
  if (OUTCOME_REQUIRES_PHYSICIAN[outcome] && !actor.isPhysician) {
    throw new DomainError('UNAUTHORIZED_ACTION', `Desfecho ${outcome} exige médico.`, { outcome });
  }
}
