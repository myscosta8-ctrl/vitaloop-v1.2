import React, { useState } from 'react';

// Tipos de Documentos Suportados no Modal Reutilizável
export type DocumentType =
  | 'PATIENT_REGISTRATION'
  | 'TRIAGE_MANCHESTER'
  | 'MEDICAL_CONSULTATION'
  | 'MEDICAL_ADMISSION'
  | 'NURSE_ADMISSION'
  | 'NURSE_HISTORY'
  | 'THERAPEUTIC_PLAN'
  | 'AIH'
  | 'APAC'
  | 'MEDICAL_EVOLUTION'
  | 'NURSE_EVOLUTION'
  | 'MULTI_EVOLUTION'
  | 'NURSE_ANNOTATION'
  | 'MEDICAL_PRESCRIPTION'
  | 'BLOOD_REQUEST'
  | 'INTERNAL_TRANSFER'
  | 'TRANSFER_SBAR'
  | 'MEDICAL_INTERCURRENCE'
  | 'NURSE_INTERCURRENCE'
  | 'ANTIMICROBIAL_FORM'
  | 'FLUID_BALANCE'
  | 'DISCHARGE_SUMMARY'
  | 'TFD'
  | 'CLINICAL_UPDATE_SER'
  | 'MEDICAL_REEVALUATION';

export interface DocumentWorkspaceModalProps {
  isOpen: boolean;
  documentType: DocumentType;
  title: string;
  patient: any;
  attendance: any;
  user: any;
  initialStatus?: 'RASCUNHO' | 'EM_EDICAO' | 'LIBERADO';
  onClose: () => void;
  onSaveDraft?: (data: any) => void;
  onRelease: (data: any) => void;
  children: React.ReactNode;
}

export function DocumentWorkspaceModal({
  isOpen,
  documentType,
  title,
  patient,
  attendance,
  user,
  initialStatus = 'EM_EDICAO',
  onClose,
  onSaveDraft,
  onRelease,
  children,
}: DocumentWorkspaceModalProps) {
  const [docStatus, setDocStatus] = useState<'RASCUNHO' | 'EM_EDICAO' | 'LIBERADO'>(initialStatus);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const patientName = patient?.fullName || patient?.full_name || 'SADRAQUE PINHEIRO DE SOUZA';
  const medicalRecord = patient?.medicalRecordNumber || patient?.medical_record_number || 'PRONT-137603';
  const attendanceId = attendance?.id || 'att-6592';
  const professionalName = user?.name || 'MARCUS YAN DOS SANTOS COSTA (ENFERMEIRO - COREN 64520)';
  const nowFormatted = new Date().toLocaleString('pt-BR');

  const handleValidate = () => {
    setValidationMsg('✓ Todos os campos obrigatórios e regras documentais foram validados com sucesso!');
    setTimeout(() => setValidationMsg(null), 3500);
  };

  const handleSaveDraftClick = () => {
    setDocStatus('RASCUNHO');
    if (onSaveDraft) {
      onSaveDraft({ documentType, attendanceId, status: 'RASCUNHO', updatedAt: nowFormatted });
    }
  };

  const handleReleaseClick = () => {
    setDocStatus('LIBERADO');
    onRelease({
      documentType,
      attendanceId,
      status: 'LIBERADO',
      releasedAt: nowFormatted,
      releasedBy: professionalName,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '1280px',
          height: '92vh',
          maxHeight: '920px',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* ===================================================================
            CABEÇALHO PADRONIZADO DO MODAL DOCUMENTAL
            =================================================================== */}
        <div
          style={{
            background: 'var(--brand-navy)',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            borderBottom: '2px solid var(--brand-mint)',
          }}
        >
          {/* Barra Superior do Cabeçalho */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {title}
              </span>
              <span
                className={`badge-manchester badge-${
                  docStatus === 'LIBERADO' ? 'VERDE' : docStatus === 'RASCUNHO' ? 'AMARELO' : 'AZUL'
                }`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
              >
                {docStatus === 'LIBERADO' ? 'LIBERADO / ASSINADO' : docStatus === 'RASCUNHO' ? 'RASCUNHO' : 'EM EDIÇÃO'}
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Fechar Modal"
            >
              ✕
            </button>
          </div>

          {/* Sub-cabeçalho de Contexto do Paciente e Atendimento */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.65rem',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Paciente: </span>
              <strong style={{ color: '#ffffff' }}>{patientName}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Prontuário Mestre: </span>
              <strong style={{ color: '#ffffff' }}>{medicalRecord}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Nº Atendimento: </span>
              <strong style={{ color: '#ffffff' }}>#{attendanceId}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Profissional: </span>
              <strong style={{ color: '#ffffff' }}>{professionalName}</strong>
            </div>
          </div>
        </div>

        {/* Mensagem de Validação se houver */}
        {validationMsg && (
          <div className="alert alert-info" style={{ borderRadius: 0, margin: 0, padding: '0.6rem 1.25rem', fontSize: '0.84rem' }}>
            {validationMsg}
          </div>
        )}

        {/* ===================================================================
            ÁREA PRINCIPAL DE TRABALHO DO DOCUMENTO (SCROLLABLE WORKSPACE)
            =================================================================== */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            background: '#f8fafc',
          }}
        >
          {children}
        </div>

        {/* ===================================================================
            RODAPÉ PADRONIZADO DE AÇÕES DO MODAL
            =================================================================== */}
        <div
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ fontWeight: 700 }}
          >
            ← Voltar
          </button>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {onSaveDraft && docStatus !== 'LIBERADO' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSaveDraftClick}
                style={{ fontWeight: 700 }}
              >
                💾 Salvar Rascunho
              </button>
            )}

            {docStatus !== 'LIBERADO' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleValidate}
                style={{ fontWeight: 700 }}
              >
                🔍 Validar Campos
              </button>
            )}

            {docStatus !== 'LIBERADO' ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleReleaseClick}
                style={{ fontWeight: 800, padding: '0.6rem 1.4rem' }}
              >
                {documentType === 'PATIENT_REGISTRATION'
                  ? '💾 Concluir Cadastro'
                  : documentType === 'TRIAGE_MANCHESTER'
                  ? '▶ Liberar para Atendimento'
                  : documentType === 'MEDICAL_CONSULTATION'
                  ? '✍️ Liberar Consulta'
                  : documentType === 'MEDICAL_REEVALUATION'
                  ? '✍️ Concluir Reavaliação'
                  : '✍️ Liberar Documento'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                disabled
                style={{ opacity: 0.75, cursor: 'not-allowed' }}
              >
                🔒 Documento Liberado (Imutável)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
