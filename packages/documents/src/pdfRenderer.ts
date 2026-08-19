// =====================================================================
// Engine de Geração de Documentos / PDF Fiel ao Modelo Institucional
// Conforme ADR-004 e ADR-010 (PDF gerado estritamente a partir do snapshot imutável)
// =====================================================================

import type { DocumentSnapshot, DocumentTypeMeta, PdfRenderer } from './index.js';

export function renderDocumentHtml(snapshot: DocumentSnapshot, meta?: DocumentTypeMeta): string {
  const generatedDate = new Date(snapshot.generatedAt).toLocaleString('pt-BR');
  const requireFullPrint = meta?.requireFullPrint ?? true;

  const bodyJson = JSON.stringify(snapshot.body, null, 2);
  const bodyFields = Object.entries(snapshot.body)
    .map(([key, val]) => `
      <div style="margin-bottom: 8px;">
        <strong style="text-transform: capitalize; color: #1e293b;">${key.replace(/_/g, ' ')}:</strong>
        <span style="color: #334155;">${typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
      </div>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${meta?.name ?? snapshot.documentType} - Prontuário Eletrônico Vitaloop UPA</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12pt; color: #0f172a; margin: 0; padding: 20px; line-height: 1.5; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 16pt; margin: 0; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; }
    .header h2 { font-size: 12pt; margin: 4px 0 0 0; color: #475569; font-weight: normal; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10pt; }
    .content-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; min-height: 250px; background: #ffffff; margin-bottom: 20px; }
    .footer { margin-top: 30px; border-top: 1px dashed #94a3b8; padding-top: 16px; display: flex; justify-content: space-between; font-size: 9pt; color: #64748b; }
    .signature-block { margin-top: 40px; text-align: center; width: 250px; margin-left: auto; margin-right: auto; }
    .signature-line { border-top: 1px solid #334155; margin-bottom: 4px; }
    .watermark { position: fixed; bottom: 10px; right: 10px; font-size: 8pt; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA</h1>
    <h2>${meta?.name ?? snapshot.documentType.replace(/_/g, ' ')}</h2>
  </div>

  <div class="meta-box">
    <div><strong>Paciente:</strong> ${snapshot.patient.fullName}</div>
    <div><strong>Prontuário (Nº):</strong> ${snapshot.patient.medicalRecordNumber}</div>
    <div><strong>Nº Atendimento:</strong> ${snapshot.attendanceId}</div>
    <div><strong>Data/Hora de Liberação:</strong> ${generatedDate}</div>
  </div>

  <div class="content-box">
    <h3 style="margin-top:0; color:#0284c7; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">Registro Assistencial Imutável</h3>
    ${bodyFields || `<pre style="font-family: inherit;">${bodyJson}</pre>`}
  </div>

  <div class="signature-block">
    <div class="signature-line"></div>
    <strong>${snapshot.author.name}</strong><br>
    <span>${snapshot.author.profession ?? 'Profissional da Saúde'} — Reg.: ${snapshot.author.registration ?? 'N/I'}</span>
  </div>

  <div class="footer">
    <div>Documento Imutável Assinado Eletronicamente — Vitaloop UPA</div>
    <div>${requireFullPrint ? 'Impressão Integral Obrigatória' : 'Impressão Parcial Permitida'}</div>
  </div>

  <div class="watermark">
    Hash de Integridade / Snapshot v${snapshot.version} — ${snapshot.generatedAt}
  </div>
</body>
</html>`;
}

/** Implementation of PdfRenderer using text/HTML output (suitable for print dialogs & PDF export). */
export class StandardHtmlPdfRenderer implements PdfRenderer {
  readonly documentType: string;

  constructor(documentType: string) {
    this.documentType = documentType;
  }

  async render(snapshot: DocumentSnapshot): Promise<Uint8Array> {
    const html = renderDocumentHtml(snapshot);
    return new TextEncoder().encode(html);
  }
}
