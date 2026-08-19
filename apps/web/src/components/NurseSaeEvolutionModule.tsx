import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface NurseSaeEvolutionModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function NurseSaeEvolutionModule({ patient, attendance, user, onSave }: NurseSaeEvolutionModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    dataHora: new Date().toLocaleString('pt-BR'),
  };

  // Página 1
  const [tempoInternacao, setTempoInternacao] = useState('6 dias');
  const [mecanismoTrauma, setMecanismoTrauma] = useState('Queda de objeto pesado sobre crânio');
  const [diagnosticoMedico, setDiagnosticoMedico] = useState('S06 - Traumatismo Intracraniano');
  const [historicoEvolutivo, setHistoricoEvolutivo] = useState(
    'Paciente grave mantido em VMI sob IOT #8.5 fixado em 22cm. Acesso venoso central em VJI D sem sinais flogísticos. Sonda nasoentérica com dieta em BI.'
  );
  const [dispositivosInvasivos, setDispositivosInvasivos] = useState('AVP D, TOT #8.5, SVD, SNE');

  // Página 2 (SAE - Sistematização da Assistência de Enfermagem)
  const [diagnosticosNanda, setDiagnosticosNanda] = useState([
    'Risco de aspiração relacionado ao rebaixamento do nível de consciência',
    'Integridade da pele prejudicada relacionada ao repouso no leito',
    'Troca de gases prejudicada relacionada ao trauma respiratório'
  ]);
  const [metasIntervencoesSae, setMetasIntervencoesSae] = useState(
    '1. Manter cabeceira elevada 30º-45º;\n2. Mudança de decúbito de 2/2h com checagem de proeminências ósseas;\n3. Aspiração de vias aéreas se necessário sob técnica estéril.'
  );

  const nurse = {
    nome: user?.name || 'MARCUS YAN (ENFERMEIRO)',
    coren: 'COREN/PA 64520',
    assinatura: 'Assinado eletronicamente via Vitaloop PEP (Selo de Autoria e Imutabilidade)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, tempoInternacao, mecanismoTrauma, diagnosticoMedico, historicoEvolutivo, dispositivosInvasivos, diagnosticosNanda, metasIntervencoesSae, nurse });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
      <InstitutionalPrintHeader documentTitle="EVOLUÇÃO E SAE DE ENFERMAGEM" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🩺 Evolução do Enfermeiro — SAE (2 Páginas)</span>
        <span className="badge-manchester badge-AZUL" style={{ background: '#0284c7' }}>DOC ENFERMEIRO</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* PÁGINA 1 */}
        <div style={{ border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', background: '#ffffff' }}>
          <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            PÁGINA 1 — Histórico e Exame Físico de Enfermagem
          </h4>

          <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
            <div><strong>Paciente:</strong> {patientHeader.nome}</div>
            <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
            <div><strong>Leito:</strong> {patientHeader.leito}</div>
            <div><strong>Data/Hora:</strong> {patientHeader.dataHora}</div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tempo de Internação</label>
              <input className="form-control" value={tempoInternacao} onChange={e => setTempoInternacao(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Mecanismo do Trauma</label>
              <input className="form-control" value={mecanismoTrauma} onChange={e => setMecanismoTrauma(e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Diagnósticos Médicos Associados</label>
              <input className="form-control" value={diagnosticoMedico} onChange={e => setDiagnosticoMedico(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Evolução e Exame Físico de Enfermagem *</label>
            <textarea className="form-control" rows={4} value={historicoEvolutivo} onChange={e => setHistoricoEvolutivo(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Dispositivos Invasivos em Uso</label>
            <input className="form-control" value={dispositivosInvasivos} onChange={e => setDispositivosInvasivos(e.target.value)} />
          </div>
        </div>

        {/* PÁGINA 2 */}
        <div style={{ border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', background: '#ffffff' }}>
          <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            PÁGINA 2 — Diagnósticos NANDA e Plano Terapêutico de Enfermagem
          </h4>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Diagnósticos de Enfermagem (NANDA) *</label>
            <textarea className="form-control" rows={3} value={diagnosticosNanda.join('\n')} onChange={e => setDiagnosticosNanda(e.target.value.split('\n'))} required />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Metas Clínicas e Intervenções de Enfermagem *</label>
            <textarea className="form-control" rows={4} value={metasIntervencoesSae} onChange={e => setMetasIntervencoesSae(e.target.value)} required />
          </div>

          <div className="form-grid" style={{ fontSize: '0.88rem', background: '#f1f5f9', padding: '0.85rem', borderRadius: '6px' }}>
            <div><strong>Enfermeiro Responsável:</strong> {nurse.nome}</div>
            <div><strong>Registro:</strong> {nurse.coren}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Assinatura Eletrônica:</strong> {nurse.assinatura}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            🖨️ Imprimir PDF
          </button>
          <button type="submit" className="btn btn-primary">Salvar Evolução SAE no Prontuário</button>
        </div>
      </form>
    </div>
  );
}
