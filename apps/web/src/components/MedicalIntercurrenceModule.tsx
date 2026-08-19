import React, { useState } from 'react';

export interface MedicalIntercurrenceModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function MedicalIntercurrenceModule({ patient, attendance, user, onSave }: MedicalIntercurrenceModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    dataHora: new Date().toLocaleString('pt-BR'),
  };

  const [descricaoIntercorrencia, setDescricaoIntercorrencia] = useState(
    'Paciente apresentou episódio de rebaixamento transitório de SpO2 (88%) acompanhado de bradicardia (FC 48 bpm). Realizada aspiração endotraqueal com saída de secreção mucoide espessa em moderada quantidade.'
  );

  const [condutasAdotadas, setCondutasAdotadas] = useState(
    '1. Aumentada FiO2 para 100% por 10 minutos com recuperação da SpO2 para 99%;\n2. Realizada ausculta pulmonar com melhora dos murmúrios;\n3. Solicitada gasometria de controle.'
  );

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, descricaoIntercorrencia, condutasAdotadas, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>⚠️ Nota de Intercorrência Médica</span>
        <span className="badge-manchester badge-VERMELHO">DOC MÉDICO URGÊNCIA</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Leito:</strong> {patientHeader.leito}</div>
          <div><strong>Data/Hora do Evento:</strong> {patientHeader.dataHora}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Descrição Detalhada da Intercorrência Médica *</label>
          <textarea className="form-control" rows={4} value={descricaoIntercorrencia} onChange={e => setDescricaoIntercorrencia(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Condutas Médicas de Emergência Executadas *</label>
          <textarea className="form-control" rows={3} value={condutasAdotadas} onChange={e => setCondutasAdotadas(e.target.value)} required />
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-danger">Registrar Intercorrência no Prontuário</button>
        </div>
      </form>
    </div>
  );
}
