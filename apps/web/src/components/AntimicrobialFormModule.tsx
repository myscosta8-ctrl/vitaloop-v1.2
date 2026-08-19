import React, { useState } from 'react';

export interface AntimicrobialFormModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function AntimicrobialFormModule({ patient, attendance, user, onSave }: AntimicrobialFormModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
  };

  const [antimicrobiano, setAntimicrobiano] = useState('CEFTRIAXONA 2G PO P/ INJ');
  const [doseViaFreq, setDoseViaFreq] = useState('2g EV 24/24h');
  const [duracaoDias, setDuracaoDias] = useState<number>(7);
  const [focoInfeccioso, setFocoInfeccioso] = useState('Profilaxia de infecção em trauma SNC / Sistema Respiratório');
  const [justificativa, setJustificativa] = useState('Indicação de antibioticoterapia de espectro ampliado pós-trauma expansivo com risco bacteriano.');
  const [parecerCcih, setParecerCcih] = useState('Aguardando Avaliação da Comissão de Controle de Infecção Hospitalar (CCIH)');

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, antimicrobiano, doseViaFreq, duracaoDias, focoInfeccioso, justificativa, parecerCcih, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>💊 Formulário de Antimicrobiano (ATM)</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Leito:</strong> {patientHeader.leito}</div>
        </div>

        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Antimicrobiano Solicitado *</label>
            <input className="form-control" value={antimicrobiano} onChange={e => setAntimicrobiano(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Dose / Via / Frequência *</label>
            <input className="form-control" value={doseViaFreq} onChange={e => setDoseViaFreq(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Duração Prevista (Dias) *</label>
            <input className="form-control" type="number" value={duracaoDias} onChange={e => setDuracaoDias(Number(e.target.value))} required />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Foco Infeccioso / Diagnóstico</label>
          <input className="form-control" value={focoInfeccioso} onChange={e => setFocoInfeccioso(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Justificativa Médica para Liberação ATM *</label>
          <textarea className="form-control" rows={3} value={justificativa} onChange={e => setJustificativa(e.target.value)} required />
        </div>

        <div className="card" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', marginBottom: '1.25rem' }}>
          <div className="card-title" style={{ fontSize: '0.9rem', color: '#64748b' }}>Parecer de Autorização CCIH (Etapa de Comissão)</div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>{parecerCcih}</div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Solicitar ATM no Prontuário</button>
        </div>
      </form>
    </div>
  );
}
