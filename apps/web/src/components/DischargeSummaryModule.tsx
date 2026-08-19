import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface DischargeSummaryModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function DischargeSummaryModule({ patient, attendance, user, onSave }: DischargeSummaryModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    dataAdmissao: '31/07/2026 12:38',
    dataAlta: new Date().toLocaleString('pt-BR'),
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
  };

  const [cidEntrada, setCidEntrada] = useState('S06.2 - Traumatismo cerebral difuso');
  const [cidSaida, setCidSaida] = useState('S06.2 - Traumatismo cerebral difuso (Em resolução)');
  const [resumoInternacao, setResumoInternacao] = useState(
    'Paciente admitido pós-TCE grave. Permaneceu em Sala Vermelha por 6 dias sob suporte neurointensivo, evoluindo com excelente resposta ao tratamento conservador, estabilização hemodinâmica e desmame ventilatório completo.'
  );

  const [procedimentosRealizados, setProcedimentosRealizados] = useState('IOT + VMI, Cateterismo Venoso Central, TC de Crânio seriadas.');
  const [condicaoAlta, setCondicaoAlta] = useState('Melhorado / Consciente e Orientado / Sem déficits motores agudos.');
  const [medicamentosAlta, setMedicamentosAlta] = useState('Dipirona 500mg se dor; Paracetamol 750mg de 8/8h.');
  const [orientacoesAlta, setOrientaçõesAlta] = useState('Retornar à UPA se apresentar cefaleia intensa, vômitos, sonolência excessiva ou convulsão.');

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, cidEntrada, cidSaida, resumoInternacao, procedimentosRealizados, condicaoAlta, medicamentosAlta, orientacoesAlta, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <InstitutionalPrintHeader documentTitle="SUMÁRIO DE ALTA HOSPITALAR" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🎓 Sumário de Alta Médica (2 Páginas)</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Data Admissão:</strong> {patientHeader.dataAdmissao}</div>
          <div><strong>Data Alta:</strong> {patientHeader.dataAlta}</div>
        </div>

        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">CID Entrada *</label>
            <input className="form-control" value={cidEntrada} onChange={e => setCidEntrada(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">CID Saída *</label>
            <input className="form-control" value={cidSaida} onChange={e => setCidSaida(e.target.value)} required />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Resumo Clínico da Internação *</label>
          <textarea className="form-control" rows={3} value={resumoInternacao} onChange={e => setResumoInternacao(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Exames e Procedimentos Realizados</label>
          <input className="form-control" value={procedimentosRealizados} onChange={e => setProcedimentosRealizados(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Condição de Alta *</label>
          <input className="form-control" value={condicaoAlta} onChange={e => setCondicaoAlta(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Medicamentos de Alta</label>
          <textarea className="form-control" rows={2} value={medicamentosAlta} onChange={e => setMedicamentosAlta(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Orientações de Alta ao Paciente *</label>
          <textarea className="form-control" rows={2} value={orientacoesAlta} onChange={e => setOrientaçõesAlta(e.target.value)} required />
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Concluir Sumário de Alta</button>
        </div>
      </form>
    </div>
  );
}
