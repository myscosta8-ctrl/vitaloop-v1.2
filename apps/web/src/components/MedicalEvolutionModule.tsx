import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface MedicalEvolutionModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function MedicalEvolutionModule({ patient, attendance, user, onSave }: MedicalEvolutionModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    dataHora: new Date().toLocaleString('pt-BR'),
  };

  // Página 1
  const [diagnosticoPrincipal, setDiagnosticoPrincipal] = useState('S06.2 - Traumatismo cerebral difuso com hemorragia subaracnoidea');
  const [hda, setHda] = useState('Paciente mantido em sedação profunda pós-TCE grave decorrente de queda de objeto pesado.');
  const [comorbidades, setComorbidades] = useState('Hipertensão Arterial Sistêmica');
  const [reconciliacaoMedicamentosa, setReconciliacaoMedicamentosa] = useState('Losartana 50mg/dia (suspensa temporariamente)');
  const [alergias, setAlergias] = useState(patient?.allergies || 'PACIENTE NEGA ALERGIAS');
  const [riscoTev, setRiscoTev] = useState('Alto Risco (Compressão Pneumática Intermitente indicada)');
  const [criteriosSepse, setCriteriosSepse] = useState('Ausentes no momento');
  const [antibioticoterapia, setAntibioticoterapia] = useState('Ceftriaxona 2g EV/dia (Dia 3 de 7)');
  const [evolucaoDia, setEvolucaoDia] = useState('Paciente hemodinamicamente estável sem aminas. Ventilação mecânica adaptada.');
  const [exameFisico, setExameFisico] = useState('Pupilas isocóricas e fotorreagentes. Ausculta cardíaca em ritmo regular 2T sem sopros. Murmúrio vesicular presente bilateralmente.');

  // Página 2
  const [examesImagens, setExamesImagens] = useState('TC de Crânio (31/07): Sem expansão do hematoma. Gasometria arterial normal.');
  const [dataPrevistaAlta, setDataPrevistaAlta] = useState('Reavaliação diária (Aguardando leito UTI)');
  const [condutaMedica, setCondutaMedica] = useState('1. Manter IOT + VMI;\n2. Manter desmame gradual de sedação sob RASS -2;\n3. Manter antibioticoterapia profilática;\n4. Aguardar regulação de leito.');

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
    assinatura: 'Assinado eletronicamente via Vitaloop PEP (Selo de Autoria e Imutabilidade)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      patientHeader,
      diagnosticoPrincipal, hda, comorbidades, reconciliacaoMedicamentosa, alergias,
      riscoTev, criteriosSepse, antibioticoterapia, evolucaoDia, exameFisico,
      examesImagens, dataPrevistaAlta, condutaMedica, physician
    });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <InstitutionalPrintHeader documentTitle="EVOLUÇÃO MÉDICA HOSPITALAR DIÁRIA" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📑 Evolução Médica Diária de Enfermaria Clínica (2 Páginas)</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* PÁGINA 1 */}
        <div style={{ border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', background: '#ffffff' }}>
          <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            PÁGINA 1 — Avaliação Clínica Diária e Exame Físico
          </h4>

          <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
            <div><strong>Paciente:</strong> {patientHeader.nome}</div>
            <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
            <div><strong>Leito:</strong> {patientHeader.leito}</div>
            <div><strong>Data/Hora:</strong> {patientHeader.dataHora}</div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Diagnóstico Principal (CID-10) *</label>
            <input className="form-control" value={diagnosticoPrincipal} onChange={e => setDiagnosticoPrincipal(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">HDA / História Relevante</label>
            <textarea className="form-control" rows={2} value={hda} onChange={e => setHda(e.target.value)} />
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Comorbidades</label>
              <input className="form-control" value={comorbidades} onChange={e => setComorbidades(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Reconciliação Medicamentosa</label>
              <input className="form-control" value={reconciliacaoMedicamentosa} onChange={e => setReconciliacaoMedicamentosa(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Alergias Conhecidas</label>
              <input className="form-control" value={alergias} onChange={e => setAlergias(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Risco para TEV</label>
              <input className="form-control" value={riscoTev} onChange={e => setRiscoTev(e.target.value)} />
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Critérios de Sepse</label>
              <input className="form-control" value={criteriosSepse} onChange={e => setCriteriosSepse(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Antibioticoterapia Atual / Duração</label>
              <input className="form-control" value={antibioticoterapia} onChange={e => setAntibioticoterapia(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Evolução Clínica do Dia</label>
            <textarea className="form-control" rows={3} value={evolucaoDia} onChange={e => setEvolucaoDia(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Exame Físico por Sistemas</label>
            <textarea className="form-control" rows={3} value={exameFisico} onChange={e => setExameFisico(e.target.value)} />
          </div>
        </div>

        {/* PÁGINA 2 */}
        <div style={{ border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', background: '#ffffff' }}>
          <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            PÁGINA 2 — Laboratório, Imagem e Conduta Médica
          </h4>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Resultados de Exames / Imagem / Culturas</label>
            <textarea className="form-control" rows={2} value={examesImagens} onChange={e => setExamesImagens(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Data Prevista de Alta / Reavaliação</label>
            <input className="form-control" value={dataPrevistaAlta} onChange={e => setDataPrevistaAlta(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Conduta Médica Passo a Passo *</label>
            <textarea className="form-control" rows={4} value={condutaMedica} onChange={e => setCondutaMedica(e.target.value)} required />
          </div>

          <div className="form-grid" style={{ fontSize: '0.88rem', background: '#f1f5f9', padding: '0.85rem', borderRadius: '6px' }}>
            <div><strong>Médico Responsável:</strong> {physician.nome}</div>
            <div><strong>CRM:</strong> {physician.crm}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Assinatura Eletrônica:</strong> {physician.assinatura}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            🖨️ Imprimir PDF
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar Evolução Diária no Prontuário
          </button>
        </div>
      </form>
    </div>
  );
}
