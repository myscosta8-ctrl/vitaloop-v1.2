import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface MedicalAdmissionModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function MedicalAdmissionModule({ patient, attendance, user, onSave }: MedicalAdmissionModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    dataNascimento: patient?.birthDate || '14/11/1998',
    sexo: patient?.sex === 'F' ? 'Feminino' : 'Masculino',
    nomeMae: patient?.motherName || 'ODILENE SILVA PINHEIRO',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    dataHoraAdmissao: new Date().toLocaleString('pt-BR'),
  };

  const [queixaPrincipal, setQueixaPrincipal] = useState('Trauma craniano pós-queda de objeto pesado em Bagre/PA.');
  const [hda, setHda] = useState('Paciente deu entrada na UPA trazido por ambulância em coma com rebaixamento do nível de consciência.');
  const [antecedentesPessoais, setAntecedentesPessoais] = useState('HAS, Nega Diabetes, Nega Alergias.');
  const [exameFisicoAdmissao, setExameFisicoAdmissao] = useState('GCS 4 (AO1 RV1 RM2), pupilas midriáticas, PAS 162x96, SpO2 98% em VMI.');
  const [hipotesesDiagnosticas, setHipotesesDiagnosticas] = useState('S06 - Traumatismo Intracraniano | I60 - Hemorragia Subaracnoidea');
  const [condutaInicial, setCondutaInicial] = useState('IOT + Sedação + Encaminhar para Sala Vermelha / Pedido de Leito UTI.');

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, queixaPrincipal, hda, antecedentesPessoais, exameFisicoAdmissao, hipotesesDiagnosticas, condutaInicial, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <InstitutionalPrintHeader documentTitle="ADMISSÃO MÉDICA HOSPITALAR" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📋 Ficha de Admissão Médica (2 Páginas)</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Mãe:</strong> {patientHeader.nomeMae}</div>
          <div><strong>Data/Hora Admissão:</strong> {patientHeader.dataHoraAdmissao}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Queixa Principal (Sugerida da Triagem)</label>
          <input className="form-control" value={queixaPrincipal} onChange={e => setQueixaPrincipal(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">História da Doença Atual (HDA) *</label>
          <textarea className="form-control" rows={3} value={hda} onChange={e => setHda(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Antecedentes Pessoais e Familiares</label>
          <input className="form-control" value={antecedentesPessoais} onChange={e => setAntecedentesPessoais(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Exame Físico Geral de Admissão *</label>
          <textarea className="form-control" rows={3} value={exameFisicoAdmissao} onChange={e => setExameFisicoAdmissao(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Hipóteses Diagnósticas (CID-10)</label>
          <input className="form-control" value={hipotesesDiagnosticas} onChange={e => setHipotesesDiagnosticas(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Conduta Inicial de Admissão</label>
          <textarea className="form-control" rows={2} value={condutaInicial} onChange={e => setCondutaInicial(e.target.value)} required />
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Salvar Admissão no Prontuário</button>
        </div>
      </form>
    </div>
  );
}
