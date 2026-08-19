import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freezeSnapshot, renderDocumentHtml, StandardHtmlPdfRenderer } from '../src/index.ts';

test('pdfRenderer: gera HTML/PDF completo a partir de snapshot imutável', async () => {
  const snapshot = freezeSnapshot({
    documentType: 'EVOLUCAO_MEDICA',
    version: 1,
    patient: { medicalRecordNumber: 'PRONT-12345', fullName: 'Maria das Dores' },
    attendanceId: 'att-999',
    author: { id: 'usr-1', name: 'Dr. Carlos Silva', registration: 'CRM-SP 123456', profession: 'MEDICO' },
    body: {
      anamnese: 'Paciente queixa-se de dor precordial há 2 horas.',
      conduta: 'Eletrocardiograma, analgesia e observação na Emergência.'
    }
  });

  const html = renderDocumentHtml(snapshot, {
    code: 'EVOLUCAO_MEDICA',
    name: 'Evolução Médica Diária',
    professionScope: 'MEDICO',
    requireFullPrint: true
  });

  assert.ok(html.includes('VITALOOP UPA'));
  assert.ok(html.includes('Maria das Dores'));
  assert.ok(html.includes('PRONT-12345'));
  assert.ok(html.includes('Dr. Carlos Silva'));
  assert.ok(html.includes('dor precordial'));

  const renderer = new StandardHtmlPdfRenderer('EVOLUCAO_MEDICA');
  const pdfBytes = await renderer.render(snapshot);
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.length > 100);
});
