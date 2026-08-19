import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface TfdModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function TfdModule({ patient, attendance, user, onSave }: TfdModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    municipioOrigem: patient?.cityOfOrigin || 'BAGRE / PA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    dataSolicitacao: new Date().toLocaleDateString('pt-BR'),
  };

  const [cid10, setCid10] = useState('S06.2 - Traumatismo cerebral difuso');
  const [quadroClinico, setQuadroClinico] = useState('Paciente necessita de avaliação neurocirúrgica especializada em serviço de alta complexidade.');
  const [justificativaTfd, setJustificativaTfd] = useState('Ausência de recurso médico neurocirúrgico e UTI especializada no município de origem.');
  const [meioTransporte, setMeioTransporte] = useState('UTI Aérea / Ambulância de Suporte Avançado (USA)');
  const [necessitaAcompanhante, setNecessitaAcompanhante] = useState<boolean>(true);

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, cid10, quadroClinico, justificativaTfd, meioTransporte, necessitaAcompanhante, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <InstitutionalPrintHeader documentTitle="LAUDO MÉDICO PARA TRATAMENTO FORA DE DOMICÍLIO (TFD)" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🚑 Tratamento Fora de Domicílio (Laudo TFD)</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO REGULAÇÃO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Município de Origem:</strong> {patientHeader.municipioOrigem}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Data da Solicitação:</strong> {patientHeader.dataSolicitacao}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Diagnóstico Principal (CID-10) *</label>
          <input className="form-control" value={cid10} onChange={e => setCid10(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Quadro Clínico Atual *</label>
          <textarea className="form-control" rows={3} value={quadroClinico} onChange={e => setQuadroClinico(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Justificativa Médica para TFD (Incapacidade de Tratamento Local) *</label>
          <textarea className="form-control" rows={3} value={justificativaTfd} onChange={e => setJustificativaTfd(e.target.value)} required />
        </div>

        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Meio de Transporte Indicado *</label>
            <select className="form-control" value={meioTransporte} onChange={e => setMeioTransporte(e.target.value)}>
              <option value="UTI Aérea / Ambulância de Suporte Avançado (USA)">UTI Aérea / Ambulância (USA)</option>
              <option value="Ambulância de Suporte Básico (USB)">Ambulância de Suporte Básico (USB)</option>
              <option value="Transporte Terrestre / Rodoviário">Transporte Terrestre / Rodoviário</option>
              <option value="Transporte Fluvial / Lancha">Transporte Fluvial / Lancha</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Necessita de Acompanhante?</label>
            <select className="form-control" value={necessitaAcompanhante ? 'Sim' : 'Não'} onChange={e => setNecessitaAcompanhante(e.target.value === 'Sim')}>
              <option value="Sim">Sim (Indicação Médica)</option>
              <option value="Não">Não</option>
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Emitir Laudo TFD</button>
        </div>
      </form>
    </div>
  );
}
