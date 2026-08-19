import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface PatientTransferSbarModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function PatientTransferSbarModule({ patient, attendance, user, onSave }: PatientTransferSbarModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    setorOrigem: 'SALA VERMELHA',
    setorDestino: 'OBSERVAÇÃO ADULTO / ENFERMARIA',
    dataHora: new Date().toLocaleString('pt-BR'),
  };

  // SBAR
  const [situation, setSituation] = useState('Paciente em pós-estabilização de TCE grave sendo transferido para leito de observação contínua.');
  const [background, setBackground] = useState('Admitido pós-queda em Bagre/PA com hemorragia subaracnoidea. Submetido a VMI e suporte hipertônico.');
  const [assessment, setAssessment] = useState('Nível de consciência RASS -1, SpO2 98% em AA, PA 120x80 mmHg, AVP em MSE pervio sem sinais flogísticos.');
  const [recommendation, setRecommendation] = useState('1. Monitorar SSVV de 4/4h;\n2. Manter SNE fechada durante transporte;\n3. Realizar checagem de SBAR no leito receptor.');

  // Sinais Vitais no momento do transporte
  const vitalsSbar = { temp: 36.6, fc: 78, fr: 18, spo2: 98, pa: '120x80' };

  // Responsáveis (Transmissor + Receptor)
  const [enfermeiroTransmissor, setEnfermeiroTransmissor] = useState(user?.name || 'ENF. MARCOS YAN (COREN/PA 64520)');
  const [enfermeiroReceptor, setEnfermeiroReceptor] = useState('ENF. ANA CARLA SILVA (COREN/PA 58912)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, situation, background, assessment, recommendation, vitalsSbar, enfermeiroTransmissor, enfermeiroReceptor });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
      <InstitutionalPrintHeader documentTitle="GUIA DE TRANSFERÊNCIA INTERNA DE PACIENTE (METODOLOGIA SBAR)" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🔄 Transferência Interna de Pacientes — SBAR (2 Páginas)</span>
        <span className="badge-manchester badge-AZUL" style={{ background: '#0284c7' }}>DOC ENFERMEIRO SBAR</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* PÁGINA 1 */}
        <div style={{ border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', background: '#ffffff' }}>
          <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            PÁGINA 1 — Passagem de Plantão SBAR (Situação, Histórico e Avaliação)
          </h4>

          <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
            <div><strong>Paciente:</strong> {patientHeader.nome}</div>
            <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
            <div><strong>Origem ➔ Destino:</strong> {patientHeader.setorOrigem} ➔ {patientHeader.setorDestino}</div>
            <div><strong>Data/Hora Transferência:</strong> {patientHeader.dataHora}</div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">S — Situation (Situação Atual do Paciente) *</label>
            <textarea className="form-control" rows={2} value={situation} onChange={e => setSituation(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">B — Background (Histórico Clínico e Antecedentes) *</label>
            <textarea className="form-control" rows={2} value={background} onChange={e => setBackground(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">A — Assessment (Avaliação Atual e Dispositivos) *</label>
            <textarea className="form-control" rows={2} value={assessment} onChange={e => setAssessment(e.target.value)} required />
          </div>

          <div className="card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.4rem' }}>Sinais Vitais na Transferência (Grade SBAR):</div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.88rem', fontWeight: 700 }}>
              <span>PA: {vitalsSbar.pa} mmHg</span>
              <span>FC: {vitalsSbar.fc} bpm</span>
              <span>FR: {vitalsSbar.fr} ipm</span>
              <span>SpO2: {vitalsSbar.spo2}%</span>
              <span>Temp: {vitalsSbar.temp}ºC</span>
            </div>
          </div>
        </div>

        {/* PÁGINA 2 */}
        <div style={{ border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', background: '#ffffff' }}>
          <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            PÁGINA 2 — Recomendações e Assinaturas dos Enfermeiros (Transmissor / Receptor)
          </h4>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">R — Recommendation (Recomendações para o Setor Receptor) *</label>
            <textarea className="form-control" rows={3} value={recommendation} onChange={e => setRecommendation(e.target.value)} required />
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Enfermeiro Transmissor (Quem Entrega)</label>
              <input className="form-control" value={enfermeiroTransmissor} onChange={e => setEnfermeiroTransmissor(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Enfermeiro Receptor (Quem Recebe no Leito)</label>
              <input className="form-control" value={enfermeiroReceptor} onChange={e => setEnfermeiroReceptor(e.target.value)} required />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Efetivar Transferência SBAR</button>
        </div>
      </form>
    </div>
  );
}
