import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface TherapeuticPlanModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function TherapeuticPlanModule({ patient, attendance, user, onSave }: TherapeuticPlanModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
  };

  const [diagnosticos, setDiagnosticos] = useState('S06 - Traumatismo Intracraniano; I60 - Hemorragia Subaracnoidea');
  const [motivoInternacao, setMotivoInternacao] = useState('Necessidade de neuroproteção contínua e suporte ventilatório pós-TCE grave.');
  const [objetivosTerapeuticos, setObjetivosTerapeuticos] = useState(
    '1. Estabilização da PIC e PAM > 80 mmHg (Meta: 24-48h);\n2. Desmame ventilatório gradual conforme evolução neuro (Meta: 72h);\n3. Prevenção de infecções secundárias.'
  );

  const [protocolosInstitucionais, setProtocolosInstitucionais] = useState<string[]>([
    'TCE', 'Controle da dor', 'Identificação segura', 'Prevenção de LPP', 'Prevenção de queda'
  ]);

  const [previsaoInternacaoDias, setPrevisaoInternacaoDias] = useState<number>(5);
  const [equipeMultidisciplinar, setEquipeMultidisciplinar] = useState<string[]>([
    'Enfermagem (Obrigatório)', 'Fisioterapia Respiratória', 'Nutrição Clínica'
  ]);

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const toggleProtocol = (item: string) => {
    if (protocolosInstitucionais.includes(item)) setProtocolosInstitucionais(protocolosInstitucionais.filter(p => p !== item));
    else setProtocolosInstitucionais([...protocolosInstitucionais, item]);
  };

  const toggleEquipe = (item: string) => {
    if (equipeMultidisciplinar.includes(item)) setEquipeMultidisciplinar(equipeMultidisciplinar.filter(e => e !== item));
    else setEquipeMultidisciplinar([...equipeMultidisciplinar, item]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, diagnosticos, motivoInternacao, objetivosTerapeuticos, protocolosInstitucionais, previsaoInternacaoDias, equipeMultidisciplinar, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <InstitutionalPrintHeader documentTitle="PLANO TERAPÊUTICO MULTIPROFISSIONAL" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🎯 Plano Terapêutico Institucional</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Leito:</strong> {patientHeader.leito}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">1. Diagnósticos Ativos (Principal na primeira linha) *</label>
          <textarea className="form-control" rows={2} value={diagnosticos} onChange={e => setDiagnosticos(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">2. Motivo da Internação / Permanência *</label>
          <input className="form-control" value={motivoInternacao} onChange={e => setMotivoInternacao(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">3. Objetivos da Terapêutica (Metas por Tempo Previsto) *</label>
          <textarea className="form-control" rows={3} value={objetivosTerapeuticos} onChange={e => setObjetivosTerapeuticos(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">4. Elegível para Protocolo Institucional (Checkboxes Oficial)</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
            {['Antibioticoprofilaxia', 'Cirurgia segura', 'Controle da dor', 'Identificação segura', 'Jejum', 'Prevenção de LPP', 'Prevenção de queda', 'TCE', 'TEV'].map(prot => (
              <label key={prot} style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <input type="checkbox" checked={protocolosInstitucionais.includes(prot)} onChange={() => toggleProtocol(prot)} /> {prot}
              </label>
            ))}
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">5. Tempo de Internação Previsto (Dias)</label>
            <input className="form-control" type="number" value={previsaoInternacaoDias} onChange={e => setPrevisaoInternacaoDias(Number(e.target.value))} required />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">6. Equipe Multidisciplinar Requerida</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
              {['Enfermagem (Obrigatório)', 'Fisioterapia Respiratória', 'Nutrição Clínica', 'Psicologia Hospitalar', 'Serviço Social'].map(eq => (
                <label key={eq} style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <input type="checkbox" checked={equipeMultidisciplinar.includes(eq)} onChange={() => toggleEquipe(eq)} /> {eq}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Salvar Plano Terapêutico</button>
        </div>
      </form>
    </div>
  );
}
