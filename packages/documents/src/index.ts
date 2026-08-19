// Catálogo de documentos e snapshot (Master §17–19, §45–48; ADR-004/010).
// O snapshot é a fotografia imutável dos dados no momento da liberação; o PDF é
// renderizado a partir dele, nunca de dados cadastrais mutáveis.

export interface DocumentTypeMeta {
  code: string;
  name: string;
  professionScope: string;
  requireFullPrint: boolean; // DP-005
}

export interface DocumentSnapshot {
  documentType: string;
  version: number;
  generatedAt: string; // ISO
  patient: { medicalRecordNumber: string; fullName: string };
  attendanceId: string;
  author: { id: string; name: string; registration?: string; profession?: string };
  /** Corpo específico do documento — validado antes de congelar. */
  body: Record<string, unknown>;
}

/** Congela um snapshot a partir dos dados atuais (chamado ao liberar). */
export function freezeSnapshot(input: Omit<DocumentSnapshot, 'generatedAt'>): DocumentSnapshot {
  return { ...input, generatedAt: new Date().toISOString() };
}

/** Interface de um renderer de PDF por tipo de documento (implementação na API/infra). */
export interface PdfRenderer {
  readonly documentType: string;
  render(snapshot: DocumentSnapshot): Promise<Uint8Array>;
}

export { renderDocumentHtml, StandardHtmlPdfRenderer } from './pdfRenderer.ts';

/** Regra de impressão: bloqueia impressão parcial quando o tipo exige integral. */
export function assertPrintAllowed(meta: DocumentTypeMeta, partial: boolean): void {
  if (partial && meta.requireFullPrint) {
    throw new Error('PARTIAL_PRINT_NOT_ALLOWED');
  }
}

