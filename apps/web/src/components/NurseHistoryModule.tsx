import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface NurseHistoryModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function NurseHistoryModule({ patient, attendance, user, onSave }: NurseHistoryModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    dataNascimento: patient?.birthDate || '14/11/1998',
    sexo: patient?.sex === 'F' ? 'Feminino' : 'Masculino',
    nomeMae: patient?.motherName || 'ODILENE SILVA PINHEIRO',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    dataHoraAdmissao: new Date().toLocaleString('pt-BR'),
  };

  const [anamneseEnfermagem, setAnamneseEnfermagem] = useState(
    'Admitido via emergência acompanhado por familiares. Reside em Bagre/PA. Nega antecedentes cirúrgicos. Familiar refere alergia a sulfa.'
  );

  const [necessidadesBasicas, setNecessidadesBasicas] = useState('Necessidades de oxigenação, eliminação e integridade cutânea alteradas.');
  const [exameFisicoAdmissao, setExameFisicoAdmissao] = useState('Anictérico, acianótico, afebril no momento. Lesão contusa em região parietal D com curativo oclusivo limpo.');
  const [escalaBraden, setEscalaBraden] = useState('Pontuação: 12 (Alto Risco de Lesão por Pressão)');
  const [escalaMorse, setEscalaMorse] = useState('Pontuação: 65 (Alto Risco de Queda)');

  const nurse = {
    nome: user?.name || 'MARCUS YAN (ENFERMEIRO)',
    coren: 'COREN/PA 64520',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, anamneseEnfermagem, necessidadesBasicas, exameFisicoAdmissao, escalaBraden, escalaMorse, nurse });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
      <InstitutionalPrintHeader documentTitle="HISTÓRICO DE ENFERMAGEM — ADMISSÃO HOSPITALAR" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📋 Histórico de Enfermagem de Admissão (2 Páginas)</span>
        <span className="badge-manchester badge-AZUL" style={{ background: '#0284c7' }}>DOC ENFERMEIRO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Mãe:</strong> {patientHeader.nomeMae}</div>
          <div><strong>Data/Hora Admissão:</strong> {patientHeader.dataHoraAdmissao}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Anamnese de Enfermagem de Admissão *</label>
          <textarea className="form-control" rows={3} value={anamneseEnfermagem} onChange={e => setAnamneseEnfermagem(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Necessidades Humanas Básicas Identificadas</label>
          <textarea className="form-control" rows={2} value={necessidadesBasicas} onChange={e => setNecessidadesBasicas(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Exame Físico Geral de Enfermagem *</label>
          <textarea className="form-control" rows={3} value={exameFisicoAdmissao} onChange={e => setExameFisicoAdmissao(e.target.value)} required />
        </div>

        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Avaliação de Risco para LPP (Escala de Braden)</label>
            <input className="form-control" value={escalaBraden} onChange={e => setEscalaBraden(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Avaliação de Risco para Queda (Escala de Morse)</label>
            <input className="form-control" value={escalaMorse} onChange={e => setEscalaMorse(e.target.value)} />
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Salvar Histórico de Enfermagem</button>
        </div>
      </form>
    </div>
  );
}
