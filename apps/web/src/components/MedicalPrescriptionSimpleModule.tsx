import React, { useState } from 'react';

export interface MedicalPrescriptionSimpleModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function MedicalPrescriptionSimpleModule({ patient, attendance, user, onSave }: MedicalPrescriptionSimpleModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    endereco: 'RUA PRINCIPAL, Nº 142 — BAGRE / PA',
    unidade: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    data: new Date().toLocaleDateString('pt-BR'),
  };

  const [receitaTexto, setReceitaTexto] = useState(
    '1. DIPIRONA SÓDICA 500MG ------------ 1 CAIXA\n   Tomar 1 comprimido de 6 em 6 horas se dor ou febre.\n\n2. PARACETAMOL 750MG ---------------- 1 CAIXA\n   Tomar 1 comprimido de 8 em 8 horas em caso de dor residual.'
  );

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, receitaTexto, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📝 Receituário Médico (Uso Domiciliar)</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Endereço:</strong> {patientHeader.endereco}</div>
          <div><strong>Unidade Solicitante:</strong> {patientHeader.unidade}</div>
          <div><strong>Data da Emissão:</strong> {patientHeader.data}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Prescrição Domiciliar e Posologia *</label>
          <textarea className="form-control" rows={6} value={receitaTexto} onChange={e => setReceitaTexto(e.target.value)} required style={{ fontFamily: 'monospace' }} />
        </div>

        <div className="form-grid" style={{ fontSize: '0.88rem', background: '#f1f5f9', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
          <div><strong>Médico Prescritor:</strong> {physician.nome}</div>
          <div><strong>CRM:</strong> {physician.crm}</div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Emitir Receita Médica</button>
        </div>
      </form>
    </div>
  );
}
