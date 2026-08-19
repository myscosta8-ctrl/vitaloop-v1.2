import React, { useState } from 'react';
import { DocumentWorkspaceModal, DocumentType } from './DocumentWorkspaceModal';

// Módulos Internos de Conteúdo Documental
import { AihModule } from './AihModule';
import { ApacModule } from './ApacModule';
import { BloodRequestModule } from './BloodRequestModule';
import { ClinicalUpdateSerModule } from './ClinicalUpdateSerModule';
import { MedicalEvolutionModule } from './MedicalEvolutionModule';
import { MedicalAdmissionModule } from './MedicalAdmissionModule';
import { AntimicrobialFormModule } from './AntimicrobialFormModule';
import { MedicalIntercurrenceModule } from './MedicalIntercurrenceModule';
import { TherapeuticPlanModule } from './TherapeuticPlanModule';
import { MedicalPrescriptionModule } from './MedicalPrescriptionModule';
import { DischargeSummaryModule } from './DischargeSummaryModule';
import { TfdModule } from './TfdModule';
import { NurseSaeEvolutionModule } from './NurseSaeEvolutionModule';
import { NurseHistoryModule } from './NurseHistoryModule';
import { NurseIntercurrenceModule } from './NurseIntercurrenceModule';
import { PatientTransferSbarModule } from './PatientTransferSbarModule';
import { FluidBalanceFullModule } from './FluidBalanceFullModule';

interface PatientChartPermanenceProps {
  patient: any;
  attendance: any;
  isHospitalization?: boolean;
}

type PermanenceTab = 'SUMMARY' | 'TIMELINE' | 'DOCUMENTS' | 'FLUID_BALANCE';

export function PatientChartPermanence({ patient, attendance, isHospitalization = false }: PatientChartPermanenceProps) {
  const [activeTab, setActiveTab] = useState<PermanenceTab>('SUMMARY');
  const [activeModalDoc, setActiveModalDoc] = useState<{
    type: DocumentType;
    title: string;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const openDocumentModal = (type: DocumentType, title: string) => {
    setActiveModalDoc({ type, title });
  };

  const closeModal = () => {
    setActiveModalDoc(null);
  };

  const handleDocumentReleased = (data: any) => {
    setNotification(`✓ Documento liberado e assinado eletronicamente.`);
    setActiveModalDoc(null);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div>
      {/* Cabeçalho da Área Limpo */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.35rem', fontWeight: 800 }}>
            {isHospitalization ? 'Internação' : 'Sala de Observação'}
          </h2>
        </div>
      </div>

      {notification && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          {notification}
        </div>
      )}

      {/* BANNER ERGONÔMICO DO PACIENTE */}
      <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid var(--brand-navy)', background: '#ffffff', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
              Atendimento #{attendance?.id || 'att-6592'}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.1rem' }}>
              {patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
              Prontuário: <strong>{patient?.medicalRecordNumber || '137603'}</strong> • Mãe: {patient?.motherName || 'ODILENE SILVA PINHEIRO'} • Sexo: {patient?.sex || 'M'} • Origem: {patient?.cityOfOrigin || 'BAGRE / PA'}
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
            <span className="badge-manchester badge-LARANJA">
              MUITO URGENTE
            </span>
            <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
              Leito: <strong style={{ color: 'var(--brand-navy)' }}>INT_ADULT_03</strong> (Internação Adulto)
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS CLÍNICAS (OPÇÃO 1) */}
      <div className="pep-tabs-container">
        <button
          className={`pep-tab-btn ${activeTab === 'SUMMARY' ? 'active' : ''}`}
          onClick={() => setActiveTab('SUMMARY')}
        >
          <span>📌 Resumo Clínico</span>
        </button>

        <button
          className={`pep-tab-btn ${activeTab === 'TIMELINE' ? 'active' : ''}`}
          onClick={() => setActiveTab('TIMELINE')}
        >
          <span>📑 Linha do Tempo</span>
        </button>

        <button
          className={`pep-tab-btn ${activeTab === 'DOCUMENTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('DOCUMENTS')}
        >
          <span>✍️ Emitir Documentos</span>
        </button>

        <button
          className={`pep-tab-btn ${activeTab === 'FLUID_BALANCE' ? 'active' : ''}`}
          onClick={() => setActiveTab('FLUID_BALANCE')}
        >
          <span>💧 Balanço Hídrico</span>
        </button>
      </div>

      {/* ===================================================================
          ABA 1: RESUMO CLÍNICO (DASHBOARD DO LEITO)
          =================================================================== */}
      {activeTab === 'SUMMARY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card de Alertas de Risco & Sinais Vitais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

            {/* Sinais Vitais Recentes */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                🩺 Sinais Vitais Recentes (10:30)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Pressão Arterial</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-navy)' }}>120/80 <span style={{ fontSize: '0.7rem' }}>mmHg</span></div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Freq. Cardíaca</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-navy)' }}>84 <span style={{ fontSize: '0.7rem' }}>bpm</span></div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Saturação O₂</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669' }}>98%</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Temperatura</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-navy)' }}>36.7ºC</div>
                </div>
              </div>
            </div>

            {/* Alertas de Risco do Paciente */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                ⚠️ Alertas e Precauções Clínicas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.55rem 0.8rem', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⛔</span>
                  <span>Alergia: Paciente nega alergias conhecidas</span>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.55rem 0.8rem', borderRadius: '6px', color: '#92400e', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🚶‍♂️</span>
                  <span>Risco de Queda: Elevado (Escala Morse)</span>
                </div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.55rem 0.8rem', borderRadius: '6px', color: '#0369a1', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🛏️</span>
                  <span>Tempo de Leito: 18h 45min em permanência</span>
                </div>
              </div>
            </div>

          </div>

          {/* Resumo da Prescrição Médica Vigente */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
                💊 Prescrição Médica Vigente
              </div>
              <span className="badge-soft-blue">Válida até 19:00</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>1. Dipirona 1g IV</strong> — De 6 em 6 horas (Se dor ou febre)</div>
                <span className="badge-soft-green">Checado 10:00</span>
              </div>
              <div style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>2. Ceftriaxona 1g IV</strong> — De 12 em 12 horas</div>
                <span className="badge-soft-amber">Próximo: 14:00</span>
              </div>
              <div style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>3. Soro Fisiológico 0.9% 500ml IV</strong> — Manutenção 24h</div>
                <span className="badge-soft-green">Em infusão</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          ABA 2: LINHA DO TEMPO (FEED CRONOLÓGICO)
          =================================================================== */}
      {activeTab === 'TIMELINE' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            📑 Linha do Tempo do Prontuário
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Evento 1 */}
            <div style={{ borderLeft: '3px solid var(--brand-mint)', paddingLeft: '1rem', position: 'relative' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Hoje às 10:30 — Enfermeiro Marcus Yan</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0.15rem 0' }}>Evolução de Enfermagem (SAE)</div>
              <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                Paciente consciente, orientado, calmo, eupneico em ar ambiente. Acesso venoso periférico em MSE salinizado sem sinais flogísticos.
              </p>
            </div>

            {/* Evento 2 */}
            <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '1rem', position: 'relative' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Hoje às 08:15 — Dr. Thales Djalon (Médico)</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0.15rem 0' }}>Evolução Médica</div>
              <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                Paciente admitido pós-trauma. Mantendo conduta conservadora com sedação leve. Solicitada nova tomografia de controle.
              </p>
            </div>

            {/* Evento 3 */}
            <div style={{ borderLeft: '3px solid #d97706', paddingLeft: '1rem', position: 'relative' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Ontem às 22:00 — Dra. Ana Silva</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0.15rem 0' }}>Admissão Médica</div>
              <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                Admissão inicial na sala de observação grave procedente de Bagre/PA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          ABA 3: EMITIR DOCUMENTOS (CENTRAL SUAVE COM CARDS E BADGES)
          =================================================================== */}
      {activeTab === 'DOCUMENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>

          {/* DOCUMENTOS MÉDICOS */}
          <div className="card" style={{ borderTop: '3px solid #0284c7', padding: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Documentos Médicos</span>
              <span className="badge-soft-blue">Médico</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('MEDICAL_ADMISSION', 'Admissão Médica')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>📝 Admissão Médica</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>Assinado</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('MEDICAL_EVOLUTION', 'Evolução Médica')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>📊 Evolução Médica</span>
                <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>1 hoje (08:15)</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('MEDICAL_PRESCRIPTION', 'Prescrição Médica')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>💊 Prescrição Médica</span>
                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>Vigente</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('MEDICAL_INTERCURRENCE', 'Intercorrência Médica')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>⚠️ Intercorrência Médica</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('DISCHARGE_SUMMARY', 'Sumário de Alta')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>📄 Sumário de Alta</span>
              </button>
            </div>
          </div>

          {/* DOCUMENTOS DE ENFERMAGEM */}
          <div className="card" style={{ borderTop: '3px solid #059669', padding: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Documentos de Enfermagem</span>
              <span className="badge-soft-green">Enfermagem</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('NURSE_HISTORY', 'Histórico de Enfermagem')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>📋 Histórico de Enfermagem</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>Admissão</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('NURSE_EVOLUTION', 'Evolução e SAE')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>📈 Evolução e SAE</span>
                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>1 hoje (10:30)</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('NURSE_ANNOTATION', 'Anotação de Enfermagem')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>✍️ Anotação de Enfermagem</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('NURSE_INTERCURRENCE', 'Intercorrência de Enfermagem')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>🚨 Intercorrência</span>
              </button>
            </div>
          </div>

          {/* REGULAÇÃO E AIH/APAC */}
          <div className="card" style={{ borderTop: '3px solid #d97706', padding: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#d97706', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Regulação e Laudos</span>
              <span className="badge-soft-amber">Regulação</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('AIH', 'Laudo de AIH')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>📑 Laudo de AIH</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('APAC', 'Laudo de APAC')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>📑 Laudo de APAC</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('BLOOD_REQUEST', 'Solicitação de Sangue')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>🩸 Solicitação de Sangue</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('TRANSFER_SBAR', 'Guia de Transferência SBAR')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>🚚 Transferência SBAR</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openDocumentModal('TFD', 'Laudo TFD')} style={{ justifyContent: 'space-between', textAlign: 'left' }}>
                <span>🚑 Laudo TFD</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================
          ABA 4: BALANÇO HÍDRICO
          =================================================================== */}
      {activeTab === 'FLUID_BALANCE' && (
        <FluidBalanceFullModule
          patient={patient}
          attendance={attendance}
          user={{ name: 'ENFERMEIRO' }}
          onSave={closeModal}
        />
      )}

      {/* MODAL DE WORKSPACE DOCUMENTAL */}
      {activeModalDoc && (
        <DocumentWorkspaceModal
          isOpen={true}
          documentType={activeModalDoc.type}
          title={activeModalDoc.title}
          patient={patient}
          attendance={attendance}
          user={null}
          onClose={closeModal}
          onRelease={handleDocumentReleased}
        >
          {activeModalDoc.type === 'AIH' && <AihModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSaveAih={closeModal} />}
          {activeModalDoc.type === 'APAC' && <ApacModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSaveApac={closeModal} />}
          {activeModalDoc.type === 'BLOOD_REQUEST' && <BloodRequestModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSaveBloodRequest={closeModal} />}
          {activeModalDoc.type === 'CLINICAL_UPDATE_SER' && <ClinicalUpdateSerModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'MEDICAL_EVOLUTION' && <MedicalEvolutionModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'MEDICAL_ADMISSION' && <MedicalAdmissionModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'ANTIMICROBIAL_FORM' && <AntimicrobialFormModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'MEDICAL_INTERCURRENCE' && <MedicalIntercurrenceModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'THERAPEUTIC_PLAN' && <TherapeuticPlanModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'MEDICAL_PRESCRIPTION' && <MedicalPrescriptionModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'DISCHARGE_SUMMARY' && <DischargeSummaryModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'TFD' && <TfdModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'NURSE_EVOLUTION' && <NurseSaeEvolutionModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'NURSE_HISTORY' && <NurseHistoryModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'NURSE_INTERCURRENCE' && <NurseIntercurrenceModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'TRANSFER_SBAR' && <PatientTransferSbarModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'FLUID_BALANCE' && <FluidBalanceFullModule patient={patient} attendance={attendance} user={{ name: 'ENFERMEIRO' }} onSave={closeModal} />}
          {activeModalDoc.type === 'NURSE_ANNOTATION' && (
            <div className="card">
              <div className="card-title">ANOTAÇÃO DE ENFERMAGEM</div>
              <textarea className="form-control" rows={6} placeholder="Registre a anotação pontual de enfermagem..." />
            </div>
          )}
        </DocumentWorkspaceModal>
      )}
    </div>
  );
}
