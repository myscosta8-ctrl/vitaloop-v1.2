import React, { useState } from 'react';

export interface NurseIntercurrenceModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function NurseIntercurrenceModule({ patient, attendance, user, onSave }: NurseIntercurrenceModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    dataHora: new Date().toLocaleString('pt-BR'),
  };

  const [descricaoIntercorrencia, setDescricaoIntercorrencia] = useState(
    'Paciente apresentou refluxo de dieta por sonda nasoentérica acompanhado de tosse episódica. Suspensas dietas temporariamente e aspirada orofaringe.'
  );

  const [cuidadosPrestados, setCuidadosPrestados] = useState(
    '1. Posicionado paciente em fowler 45º;\n2. Aberta SNE em frasco coletor para descompressão;\n3. Comunicado médico plantonista Dr. Thales Djalon.'
  );

  const nurse = {
    nome: user?.name || 'MARCUS YAN (ENFERMEIRO)',
    coren: 'COREN/PA 64520',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, descricaoIntercorrencia, cuidadosPrestados, nurse });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid #ea580c' }}>
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>⚠️ Nota de Intercorrência de Enfermagem</span>
        <span className="badge-manchester badge-LARANJA">DOC ENFERMEIRO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Leito:</strong> {patientHeader.leito}</div>
          <div><strong>Data/Hora do Evento:</strong> {patientHeader.dataHora}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Descrição da Intercorrência de Enfermagem *</label>
          <textarea className="form-control" rows={3} value={descricaoIntercorrencia} onChange={e => setDescricaoIntercorrencia(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Cuidados Imediatos Prestados e Comunicação Médica *</label>
          <textarea className="form-control" rows={3} value={cuidadosPrestados} onChange={e => setCuidadosPrestados(e.target.value)} required />
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-warning">Registrar Intercorrência no Prontuário</button>
        </div>
      </form>
    </div>
  );
}
