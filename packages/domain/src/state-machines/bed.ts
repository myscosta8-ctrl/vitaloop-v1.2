// Estados e transições de leito (STATE_MACHINES §3; ADR-007). Sem RESERVADO
// nem HIGIENIZACAO. As invariantes de ocupação única vivem no banco (V0007);
// aqui ficam as transições de estado e as regras do leito extra.
import { DomainError } from '../errors.ts';

export const BED_STATES = [
  'LIVRE',
  'OCUPADO',
  'INTERDITADO',
  'MANUTENCAO',
  'LEITO_EXTRA_DISPONIVEL',
  'LEITO_EXTRA_OCUPADO',
  'DESATIVADO',
] as const;
export type BedState = (typeof BED_STATES)[number];

const TRANSITIONS: Record<BedState, readonly BedState[]> = {
  LIVRE: ['OCUPADO', 'INTERDITADO', 'MANUTENCAO', 'DESATIVADO'],
  OCUPADO: ['LIVRE'],
  INTERDITADO: ['LIVRE', 'DESATIVADO'],
  MANUTENCAO: ['LIVRE', 'DESATIVADO'],
  LEITO_EXTRA_DISPONIVEL: ['LEITO_EXTRA_OCUPADO', 'DESATIVADO'],
  LEITO_EXTRA_OCUPADO: ['LEITO_EXTRA_DISPONIVEL'],
  DESATIVADO: ['LIVRE'],
};

export const isOccupied = (s: BedState): boolean =>
  s === 'OCUPADO' || s === 'LEITO_EXTRA_OCUPADO';

export function canTransitionBed(from: BedState, to: BedState): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function assertBedTransition(from: BedState, to: BedState): void {
  if (!canTransitionBed(from, to)) {
    throw new DomainError('INVALID_STATE_TRANSITION', `Transição de leito inválida: ${from} -> ${to}`, {
      from,
      to,
    });
  }
}

export const EXTRA_BED_AUTO_CLOSE_MINUTES = 30; // Master §28

/** Leito extra vazio há >= 30 min deve fechar automaticamente (job idempotente). */
export function shouldAutoCloseExtraBed(
  state: BedState,
  isExtra: boolean,
  emptySince: Date | null,
  now: Date,
): boolean {
  if (!isExtra || state !== 'LEITO_EXTRA_DISPONIVEL' || emptySince === null) return false;
  const minutes = (now.getTime() - emptySince.getTime()) / 60000;
  return minutes >= EXTRA_BED_AUTO_CLOSE_MINUTES;
}
