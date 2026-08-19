// Máquina de estados do documento clínico (STATE_MACHINES §2; ADR-004).
// Espelha o trigger app.enforce_immutable_after_release (V0004/V0006).
import { DomainError } from '../errors.ts';

export const DOCUMENT_STATUSES = ['RASCUNHO', 'FINALIZADO', 'LIBERADO', 'INATIVADO'] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

const TRANSITIONS: Record<DocumentStatus, readonly DocumentStatus[]> = {
  RASCUNHO: ['FINALIZADO'],
  FINALIZADO: ['RASCUNHO', 'LIBERADO'], // volta a rascunho só antes de liberar
  LIBERADO: ['INATIVADO'], // imutável; correção só por inativação + novo documento
  INATIVADO: [],
};

export const isEditable = (s: DocumentStatus): boolean => s === 'RASCUNHO' || s === 'FINALIZADO';
export const isImmutable = (s: DocumentStatus): boolean => s === 'LIBERADO' || s === 'INATIVADO';

export function canTransitionDocument(from: DocumentStatus, to: DocumentStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

/** Bloqueia edição de conteúdo após liberação (Master §18). */
export function assertContentEditable(status: DocumentStatus): void {
  if (status === 'INATIVADO') {
    throw new DomainError('DOCUMENT_ALREADY_INACTIVATED', 'Documento inativado é imutável.');
  }
  if (status === 'LIBERADO') {
    throw new DomainError('DOCUMENT_IMMUTABLE', 'Documento liberado é imutável.');
  }
}

export function assertDocumentTransition(from: DocumentStatus, to: DocumentStatus): void {
  if (from === 'INATIVADO') {
    throw new DomainError('DOCUMENT_ALREADY_INACTIVATED', 'Documento já inativado.');
  }
  if (!canTransitionDocument(from, to)) {
    throw new DomainError('DOCUMENT_IMMUTABLE', `Transição de documento inválida: ${from} -> ${to}`, {
      from,
      to,
    });
  }
}

/** Ao liberar, exige-se o snapshot (a fotografia) — Master §18, constraint em V0006. */
export function assertReleasable(to: DocumentStatus, hasSnapshot: boolean): void {
  if (to === 'LIBERADO' && !hasSnapshot) {
    throw new DomainError('MISSING_REQUIRED_FIELD', 'Liberação exige snapshot do documento.');
  }
}
