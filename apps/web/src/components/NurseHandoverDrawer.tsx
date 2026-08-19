import React, { useState, useEffect } from 'react';

export interface HandoverData {
  id?: string;
  attendanceId: string;
  patientName: string;
  medicalRecordNumber: string;
  bedId: string;
  bedName: string;
  sectorName: string;
  patientAge?: string;
  patientSex?: 'M' | 'F';
  diagnosis?: string;
  allergies?: string;
  statusText?: string;
  
  // Status de Revisão
  isReviewedCurrentShift: boolean;
  isInheritedFromPrevious: boolean;
  previousShiftTimestamp?: string;
  savedAt?: string;
  nurseName?: string;
  nurseCoren?: string;

  // 1. Assistência e Cuidados
  dressingDone: boolean | null;
  dressingDetails: string;
  avpInstalled: boolean | null;
  avpInsertionDate: string;
  consciousnessLevel: string;
  companionPresent: boolean | null;
  invasiveDevices: {
    svd: boolean;
    sne: boolean;
    dreno: boolean;
    o2: boolean;
    cvc: boolean;
    tot: boolean;
    tracheo: boolean;
    outros: boolean;
  };
  deviceDetails: string;

  // 2. Exames e Procedimentos
  examName: string;
  examStatus: 'A_REALIZAR' | 'AGUARDANDO_LAUDO' | 'RESULTADO_DISPONIVEL' | '';
  examDate: string;
  examPreparation: string;
  examResultNotes: string;

  // 3. Sorologia / Notificação Compulsória
  notificationDisease: string;
  collectionDate: string;
  notificationDate: string;
  notificationStatus: 'PENDENTE' | 'AGUARDANDO' | 'DISPONIVEL' | '';

  // 4. Hemoterapia
  bloodComponents: {
    ch: boolean;
    pfc: boolean;
    cp: boolean;
    crioprecipitado: boolean;
  };
  bloodRequested: boolean | null;
  bloodTransfused: boolean | null;
  bloodQuantity: string;
  bloodNotes: string;

  // 5. Regulação e Transferência
  isRegulated: boolean | null;
  regulationSystem: 'SER' | 'SISREG' | 'NENHUM';
  regulationDate: string;
  destinationHospital: string;
  transportType: string;
  bedReleased: boolean | null;
  redRoomDischarge: boolean | null;

  // 6. Observações e Pendências
  pendingNotes: string;
}

export interface NurseHandoverDrawerProps {
  isOpen: boolean;
  bed: any;
  user: any;
  existingHandover?: HandoverData | null;
  previousHandover?: HandoverData | null;
  onClose: () => void;
  onSaveHandover: (handover: HandoverData) => void;
  onOpenRelocate: () => void;
  onOpenDischarge: () => void;
}

export function NurseHandoverDrawer({
  isOpen,
  bed,
  user,
  existingHandover,
  previousHandover,
  onClose,
  onSaveHandover,
  onOpenRelocate,
  onOpenDischarge,
}: NurseHandoverDrawerProps) {
  if (!isOpen || !bed) return null;

  const attendanceId = bed.attendanceId || bed.id;
  const draftKey = `vitaloop_handover_draft_${attendanceId}`;

  // Estado inicial do formulário
  const defaultHandover: HandoverData = {
    attendanceId,
    patientName: bed.patientName || 'PACIENTE NÃO IDENTIFICADO',
    medicalRecordNumber: bed.medicalRecordNumber || 'N/A',
    bedId: bed.id,
    bedName: bed.name,
    sectorName: bed.sectorName,
    patientAge: bed.patientAge || '58 anos',
    patientSex: bed.patientSex || 'M',
    diagnosis: bed.diagnosis || 'HD: Em investigação clínica',
    allergies: bed.allergies || 'PACIENTE NEGA ALERGIAS',
    statusText: bed.contextType === 'INTERNACAO' ? 'INTERNADO' : 'OBSERVAÇÃO',

    isReviewedCurrentShift: false,
    isInheritedFromPrevious: false,

    dressingDone: null,
    dressingDetails: '',
    avpInstalled: null,
    avpInsertionDate: new Date().toLocaleDateString('pt-BR'),
    consciousnessLevel: 'Consciente e Orientado',
    companionPresent: null,
    invasiveDevices: { svd: false, sne: false, dreno: false, o2: false, cvc: false, tot: false, tracheo: false, outros: false },
    deviceDetails: '',

    examName: '',
    examStatus: '',
    examDate: '',
    examPreparation: '',
    examResultNotes: '',

    notificationDisease: '',
    collectionDate: '',
    notificationDate: '',
    notificationStatus: '',

    bloodComponents: { ch: false, pfc: false, cp: false, crioprecipitado: false },
    bloodRequested: null,
    bloodTransfused: null,
    bloodQuantity: '',
    bloodNotes: '',

    isRegulated: null,
    regulationSystem: 'NENHUM',
    regulationDate: '',
    destinationHospital: '',
    transportType: '',
    bedReleased: null,
    redRoomDischarge: null,

    pendingNotes: '',
  };

  const [form, setForm] = useState<HandoverData>(defaultHandover);
  const [hasDraftPrompt, setHasDraftPrompt] = useState<boolean>(false);
  const [draftData, setDraftData] = useState<HandoverData | null>(null);

  // Efeito para re-inicializar os dados do formulário sempre que o leito selecionado mudar
  useEffect(() => {
    if (!bed) return;
    const currentAttId = bed.attendanceId || bed.id;

    const baseForm: HandoverData = {
      attendanceId: currentAttId,
      patientName: bed.patientName || 'PACIENTE NÃO IDENTIFICADO',
      medicalRecordNumber: bed.medicalRecordNumber || 'N/A',
      bedId: bed.id,
      bedName: bed.name,
      sectorName: bed.sectorName || 'Setor Assisencial',
      patientAge: bed.patientAge || '58 anos',
      patientSex: bed.patientSex || 'M',
      diagnosis: bed.diagnosis || 'HD: Em investigação clínica',
      allergies: bed.allergies || 'PACIENTE NEGA ALERGIAS',
      statusText: bed.contextType === 'INTERNACAO' ? 'INTERNADO' : 'OBSERVAÇÃO',

      isReviewedCurrentShift: false,
      isInheritedFromPrevious: false,

      dressingDone: false,
      dressingDetails: '',
      avpInstalled: true,
      avpInsertionDate: new Date().toLocaleDateString('pt-BR'),
      consciousnessLevel: 'Consciente e Orientado',
      companionPresent: false,
      invasiveDevices: { svd: false, sne: false, dreno: false, o2: false, cvc: false, tot: false, tracheo: false, outros: false },
      deviceDetails: '',

      examName: '',
      examStatus: '',
      examDate: '',
      examPreparation: '',
      examResultNotes: '',

      notificationDisease: '',
      collectionDate: '',
      notificationDate: '',
      notificationStatus: '',

      bloodComponents: { ch: false, pfc: false, cp: false, crioprecipitado: false },
      bloodRequested: false,
      bloodTransfused: false,
      bloodQuantity: '',
      bloodNotes: '',

      isRegulated: false,
      regulationSystem: 'NENHUM',
      regulationDate: '',
      destinationHospital: '',
      transportType: '',
      bedReleased: false,
      redRoomDischarge: false,

      pendingNotes: '',
    };

    if (existingHandover) {
      setForm({
        ...baseForm,
        ...existingHandover,
        invasiveDevices: { ...baseForm.invasiveDevices, ...(existingHandover.invasiveDevices || {}) },
        bloodComponents: { ...baseForm.bloodComponents, ...(existingHandover.bloodComponents || {}) },
      });
    } else if (previousHandover) {
      setForm({
        ...baseForm,
        ...previousHandover,
        invasiveDevices: { ...baseForm.invasiveDevices, ...(previousHandover.invasiveDevices || {}) },
        bloodComponents: { ...baseForm.bloodComponents, ...(previousHandover.bloodComponents || {}) },
        isReviewedCurrentShift: false,
        isInheritedFromPrevious: true,
        previousShiftTimestamp: previousHandover.savedAt || new Date().toLocaleString('pt-BR'),
      });
    } else {
      setForm(baseForm);
    }

    // Verificar se existe rascunho salvo no localStorage para este atendimento
    try {
      const savedDraft = localStorage.getItem(`vitaloop_handover_draft_${currentAttId}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setDraftData(parsed);
        setHasDraftPrompt(true);
      } else {
        setHasDraftPrompt(false);
        setDraftData(null);
      }
    } catch (err) {
      console.error('Erro ao ler rascunho local:', err);
    }
  }, [isOpen, bed?.id, existingHandover, previousHandover]);

  // Efeito de auto-rascunho ao modificar campos
  const updateFormField = (key: keyof HandoverData, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (err) {
        console.error('Erro ao auto-salvar rascunho:', err);
      }
      return updated;
    });
  };

  const updateNestedDevices = (deviceKey: keyof HandoverData['invasiveDevices']) => {
    setForm(prev => {
      const updatedDevices = { ...prev.invasiveDevices, [deviceKey]: !prev.invasiveDevices[deviceKey] };
      const updated = { ...prev, invasiveDevices: updatedDevices };
      try {
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const updateNestedBlood = (bloodKey: keyof HandoverData['bloodComponents']) => {
    setForm(prev => {
      const updatedBlood = { ...prev.bloodComponents, [bloodKey]: !prev.bloodComponents[bloodKey] };
      const updated = { ...prev, bloodComponents: updatedBlood };
      try {
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const handleApplyDraft = () => {
    if (draftData) {
      setForm(draftData);
    }
    setHasDraftPrompt(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(draftKey);
    setHasDraftPrompt(false);
  };

  const handleCopyPreviousShift = () => {
    if (previousHandover) {
      setForm({
        ...previousHandover,
        isReviewedCurrentShift: false,
        isInheritedFromPrevious: true,
        previousShiftTimestamp: previousHandover.savedAt || new Date().toLocaleString('pt-BR'),
      });
      alert('Dados do plantão anterior copiados com sucesso! Revise as informações e clique em Salvar Passagem.');
    } else {
      alert('Nenhum registro de passagem anterior foi encontrado para este paciente.');
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalHandover: HandoverData = {
      ...form,
      isReviewedCurrentShift: true,
      isInheritedFromPrevious: false,
      savedAt: new Date().toLocaleString('pt-BR'),
      nurseName: user?.name || 'ENFERMEIRO PLANTONISTA',
      nurseCoren: user?.registration || 'COREN/PA',
    };
    localStorage.removeItem(draftKey);
    onSaveHandover(finalHandover);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(94vw, 640px)',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideLeft 0.2s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ===================================================================
            1. CABEÇALHO FIXO DO DRAWER
            =================================================================== */}
        <div
          style={{
            background: 'var(--brand-navy)',
            color: '#ffffff',
            padding: '1rem 1.25rem',
            borderBottom: '3px solid var(--brand-mint)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {bed.name} <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>• {bed.sectorName}</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.4rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>

          {/* DADOS DO PACIENTE NO CABEÇALHO */}
          <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
              {form.patientName}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>{form.patientAge} • {form.patientSex === 'F' ? 'Feminino' : 'Masculino'}</span>
              <span>Prontuário: <strong>{form.medicalRecordNumber}</strong></span>
              <span
                style={{
                  background: form.statusText === 'INTERNADO' ? '#dcfce7' : '#ffedd5',
                  color: form.statusText === 'INTERNADO' ? '#15803d' : '#c2410c',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                }}
              >
                {form.statusText}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
              {form.diagnosis}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#fca5a5', fontWeight: 700, marginTop: '0.1rem' }}>
              ⚠ Alergias: {form.allergies}
            </div>
          </div>

        </div>

        {/* ALERTA DE DADOS HERDADOS OU RASCUNHO */}
        {form.isInheritedFromPrevious && !form.isReviewedCurrentShift && (
          <div
            style={{
              background: '#fefce8',
              borderBottom: '1px solid #fef08a',
              padding: '0.6rem 1rem',
              color: '#854d0e',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>⚠ DADOS HERDADOS DO PLANTÃO ANTERIOR ({form.previousShiftTimestamp || 'Plantão Anterior'}). Ajuste o que mudou e clique em Salvar Passagem.</span>
          </div>
        )}

        {hasDraftPrompt && (
          <div
            style={{
              background: '#eff6ff',
              borderBottom: '1px solid #bfdbfe',
              padding: '0.6rem 1rem',
              color: '#1e40af',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>ℹ️ Rascunho não salvo encontrado neste navegador.</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleApplyDraft}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                Restaurar Rascunho
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleDiscardDraft}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            2. CONTEÚDO ROLÁVEL COM OS 6 BLOCOS ASSISTENCIAIS
            =================================================================== */}
        <form
          onSubmit={handleSaveSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem',
            background: '#f8fafc',
          }}
        >
          {/* BLOCO 1: ASSISTÊNCIA E CUIDADOS DE ENFERMAGEM */}
          <div className="card" style={{ padding: '0.9rem', borderLeft: '4px solid #0284c7' }}>
            <div className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              1. ASSISTÊNCIA E CUIDADOS DE ENFERMAGEM
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {/* Curativo */}
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Curativo Realizado?</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.dressingDone === false ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateFormField('dressingDone', form.dressingDone === false ? null : false)}
                  >
                    NÃO
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.dressingDone === true ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateFormField('dressingDone', form.dressingDone === true ? null : true)}
                  >
                    SIM
                  </button>
                </div>
              </div>

              {/* AVP */}
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Acesso Venoso Periférico (AVP)?</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.avpInstalled === false ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateFormField('avpInstalled', form.avpInstalled === false ? null : false)}
                  >
                    NÃO
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.avpInstalled === true ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateFormField('avpInstalled', form.avpInstalled === true ? null : true)}
                  >
                    SIM
                  </button>
                </div>
              </div>
            </div>

            {form.dressingDone && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Detalhes do Curativo</label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={form.dressingDetails}
                  onChange={e => updateFormField('dressingDetails', e.target.value)}
                  placeholder="ex: Curativo oclusivo limpo e seco em região parietal D"
                />
              </div>
            )}

            {form.avpInstalled && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Data de Inserção do AVP</label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={form.avpInsertionDate}
                  onChange={e => updateFormField('avpInsertionDate', e.target.value)}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Nível de Consciência</label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={form.consciousnessLevel}
                  onChange={e => updateFormField('consciousnessLevel', e.target.value)}
                  placeholder="ex: Consciente, Torporoso, Sedado RASS -2"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Acompanhante Presente?</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.companionPresent === false ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateFormField('companionPresent', form.companionPresent === false ? null : false)}
                  >
                    NÃO
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.companionPresent === true ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateFormField('companionPresent', form.companionPresent === true ? null : true)}
                  >
                    SIM
                  </button>
                </div>
              </div>
            </div>

            {/* Dispositivos Invasivos */}
            <div>
              <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '0.4rem' }}>
                Dispositivos Invasivos Instalados:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.4rem' }}>
                {[
                  { key: 'svd', label: 'SVD' },
                  { key: 'sne', label: 'SNE' },
                  { key: 'dreno', label: 'Dreno' },
                  { key: 'o2', label: 'O₂' },
                  { key: 'cvc', label: 'CVC' },
                  { key: 'tot', label: 'TOT' },
                  { key: 'tracheo', label: 'Traqueo' },
                ].map(item => {
                  const isActive = !!form.invasiveDevices[item.key as keyof HandoverData['invasiveDevices']];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateNestedDevices(item.key as any)}
                      style={{
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: `1px solid ${isActive ? '#0284c7' : '#cbd5e1'}`,
                        background: isActive ? '#0284c7' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '0.65rem' }}>
              <label className="form-label" style={{ fontSize: '0.76rem' }}>Detalhamento dos Dispositivos</label>
              <input
                className="form-control"
                style={{ fontSize: '0.82rem' }}
                value={form.deviceDetails}
                onChange={e => updateFormField('deviceDetails', e.target.value)}
                placeholder="ex: SVD com diurese clara 1450mL; O2 Cateter nasal a 2L/min"
              />
            </div>
          </div>

          {/* BLOCO 2: EXAMES E PROCEDIMENTOS */}
          <div className="card" style={{ padding: '0.9rem', borderLeft: '4px solid #0F2B36' }}>
            <div className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              2. EXAMES E PROCEDIMENTOS
            </div>

            <div className="form-group" style={{ marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ fontSize: '0.76rem' }}>Exame / Procedimento</label>
              <input
                className="form-control"
                style={{ fontSize: '0.82rem' }}
                value={form.examName}
                onChange={e => updateFormField('examName', e.target.value)}
                placeholder="ex: TC de Crânio, Gasometria, Usg de Abdômen"
              />
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '0.3rem' }}>Situação do Exame:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'A_REALIZAR', label: 'A realizar' },
                  { key: 'AGUARDANDO_LAUDO', label: 'Aguardando laudo' },
                  { key: 'RESULTADO_DISPONIVEL', label: 'Resultado disponível' },
                ].map(item => {
                  const isActive = form.examStatus === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateFormField('examStatus', isActive ? '' : item.key)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: `1px solid ${isActive ? '#0F2B36' : '#cbd5e1'}`,
                        background: isActive ? '#0F2B36' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {form.examStatus === 'A_REALIZAR' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>Data agendada</label>
                  <input className="form-control" style={{ fontSize: '0.82rem' }} value={form.examDate} onChange={e => updateFormField('examDate', e.target.value)} placeholder="dd/mm/aaaa" />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>Hora</label>
                  <input className="form-control" style={{ fontSize: '0.82rem' }} placeholder="hh:mm" />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>Local</label>
                  <input className="form-control" style={{ fontSize: '0.82rem' }} value={form.examPreparation} onChange={e => updateFormField('examPreparation', e.target.value)} placeholder="ex: HRPM" />
                </div>
              </div>
            )}

            {form.examStatus === 'AGUARDANDO_LAUDO' && (
              <div style={{ marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Observação sobre o laudo</label>
                <input className="form-control" style={{ fontSize: '0.82rem' }} value={form.examResultNotes} onChange={e => updateFormField('examResultNotes', e.target.value)} placeholder="ex: Previsão para amanhã" />
              </div>
            )}

            {form.examStatus === 'RESULTADO_DISPONIVEL' && (
              <div style={{ marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Resultado / laudo</label>
                <input className="form-control" style={{ fontSize: '0.82rem' }} value={form.examResultNotes} onChange={e => updateFormField('examResultNotes', e.target.value)} placeholder="ex: Sem expansão do hematoma" />
              </div>
            )}
          </div>

          {/* BLOCO 3: SOROLOGIA / NOTIFICAÇÃO COMPULSÓRIA */}
          <div className="card" style={{ padding: '0.9rem', borderLeft: '4px solid #d97706' }}>
            <div className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              3. SOROLOGIA / NOTIFICAÇÃO COMPULSÓRIA (SINAN)
            </div>

            <div className="form-group" style={{ marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ fontSize: '0.76rem' }}>Agravo / Doença Notificável</label>
              <input
                className="form-control"
                style={{ fontSize: '0.82rem' }}
                value={form.notificationDisease}
                onChange={e => updateFormField('notificationDisease', e.target.value)}
                placeholder="ex: Dengue, VIHs, Sífilis, Acidente de Trabalho, Violência"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>Data Notificação</label>
                <input className="form-control" style={{ fontSize: '0.8rem' }} value={form.notificationDate} onChange={e => updateFormField('notificationDate', e.target.value)} placeholder="dd/mm/aaaa" />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>Data Coleta</label>
                <input className="form-control" style={{ fontSize: '0.8rem' }} value={form.collectionDate} onChange={e => updateFormField('collectionDate', e.target.value)} placeholder="dd/mm/aaaa" />
              </div>
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '0.3rem' }}>Situação:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'PENDENTE', label: 'Coleta pendente' },
                  { key: 'AGUARDANDO', label: 'Aguardando resultado' },
                  { key: 'DISPONIVEL', label: 'Resultado disponível' },
                ].map(item => {
                  const isActive = form.notificationStatus === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateFormField('notificationStatus', isActive ? '' : item.key)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: `1px solid ${isActive ? '#d97706' : '#cbd5e1'}`,
                        background: isActive ? '#d97706' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BLOCO 4: HEMOTERAPIA */}
          <div className="card" style={{ padding: '0.9rem', borderLeft: '4px solid #dc2626' }}>
            <div className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              4. HEMOTERAPIA (HEMOPA)
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '0.3rem' }}>
                Tipo de Hemocomponente:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'ch', label: 'CH (Concentrado de Hemácias)' },
                  { key: 'pfc', label: 'PFC (Plasma)' },
                  { key: 'cp', label: 'CP (Plaquetas)' },
                  { key: 'crioprecipitado', label: 'Crio' },
                ].map(item => {
                  const isActive = !!form.bloodComponents[item.key as keyof HandoverData['bloodComponents']];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateNestedBlood(item.key as any)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: `1px solid ${isActive ? '#dc2626' : '#cbd5e1'}`,
                        background: isActive ? '#dc2626' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>Solicitado?</label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button type="button" className={`btn btn-sm ${form.bloodRequested === false ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('bloodRequested', form.bloodRequested === false ? null : false)}>NÃO</button>
                  <button type="button" className={`btn btn-sm ${form.bloodRequested === true ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('bloodRequested', form.bloodRequested === true ? null : true)}>SIM</button>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>Transfundido?</label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button type="button" className={`btn btn-sm ${form.bloodTransfused === false ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('bloodTransfused', form.bloodTransfused === false ? null : false)}>NÃO</button>
                  <button type="button" className={`btn btn-sm ${form.bloodTransfused === true ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('bloodTransfused', form.bloodTransfused === true ? null : true)}>SIM</button>
                </div>
              </div>
            </div>

            {form.bloodTransfused && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>Data da transfusão</label>
                  <input className="form-control" style={{ fontSize: '0.8rem' }} placeholder="dd/mm/aaaa" />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>Quantidade / Bolsas</label>
                  <input className="form-control" style={{ fontSize: '0.8rem' }} value={form.bloodQuantity} onChange={e => updateFormField('bloodQuantity', e.target.value)} placeholder="ex: 2 bolsas CH" />
                </div>
              </div>
            )}
          </div>

          {/* BLOCO 5: REGULAÇÃO E TRANSFERÊNCIA (SER / SISREG) */}
          <div className="card" style={{ padding: '0.9rem', borderLeft: '4px solid #16a34a' }}>
            <div className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              5. REGULAÇÃO E TRANSFERÊNCIA (SER / SISREG)
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ fontSize: '0.76rem' }}>Paciente Regulado?</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" className={`btn btn-sm ${form.isRegulated === false ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('isRegulated', form.isRegulated === false ? null : false)}>NÃO</button>
                <button type="button" className={`btn btn-sm ${form.isRegulated === true ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('isRegulated', form.isRegulated === true ? null : true)}>SIM</button>
              </div>
            </div>

            {form.isRegulated && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '0.3rem' }}>Tipo:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {[
                        { key: 'SER', label: 'SER' },
                        { key: 'SISREG', label: 'SISREG' },
                      ].map(item => {
                        const isActive = form.regulationSystem === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => updateFormField('regulationSystem', isActive ? 'NENHUM' : item.key)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              borderRadius: '5px',
                              cursor: 'pointer',
                              border: `1px solid ${isActive ? '#16a34a' : '#cbd5e1'}`,
                              background: isActive ? '#16a34a' : '#ffffff',
                              color: isActive ? '#ffffff' : '#475569',
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Data de cadastro</label>
                    <input className="form-control" style={{ fontSize: '0.82rem' }} value={form.regulationDate} onChange={e => updateFormField('regulationDate', e.target.value)} placeholder="dd/mm/aaaa" />
                  </div>
                </div>

                <div style={{ marginBottom: '0.65rem' }}>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>Leito liberado p/ outro hospital?</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button type="button" className={`btn btn-sm ${form.bedReleased === false ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('bedReleased', form.bedReleased === false ? null : false)}>NÃO</button>
                    <button type="button" className={`btn btn-sm ${form.bedReleased === true ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('bedReleased', form.bedReleased === true ? null : true)}>SIM</button>
                  </div>
                </div>

                {form.bedReleased && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.76rem' }}>Qual hospital?</label>
                      <input className="form-control" style={{ fontSize: '0.82rem' }} value={form.destinationHospital} onChange={e => updateFormField('destinationHospital', e.target.value)} placeholder="ex: HRPM" />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.76rem' }}>Tipo de transporte</label>
                      <input className="form-control" style={{ fontSize: '0.82rem' }} value={form.transportType} onChange={e => updateFormField('transportType', e.target.value)} placeholder="ex: UTI Aérea" />
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div style={{ marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Alta da Sala Vermelha?</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button type="button" className={`btn btn-sm ${form.redRoomDischarge === false ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('redRoomDischarge', form.redRoomDischarge === false ? null : false)}>NÃO</button>
                  <button type="button" className={`btn btn-sm ${form.redRoomDischarge === true ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateFormField('redRoomDischarge', form.redRoomDischarge === true ? null : true)}>SIM</button>
                </div>
              </div>

              {form.redRoomDischarge && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Data da alta</label>
                    <input className="form-control" style={{ fontSize: '0.82rem' }} placeholder="dd/mm/aaaa" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Horário da alta</label>
                    <input className="form-control" style={{ fontSize: '0.82rem' }} placeholder="hh:mm" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BLOCO 6: OBSERVAÇÕES E PENDÊNCIAS PARA O PRÓXIMO PLANTÃO */}
          <div className="card" style={{ padding: '0.9rem', borderLeft: '4px solid var(--brand-navy)' }}>
            <div className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              6. OBSERVAÇÕES E PENDÊNCIAS PARA O PRÓXIMO PLANTÃO
            </div>
            <textarea
              className="form-control"
              rows={4}
              style={{
                width: '100%',
                minHeight: '120px',
                maxHeight: '250px',
                resize: 'vertical',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
                lineHeight: '1.45',
                boxSizing: 'border-box',
              }}
              value={form.pendingNotes}
              onChange={e => updateFormField('pendingNotes', e.target.value)}
              placeholder="Descreva pendências prioritárias, intercorrências do plantão, medicações a vigiar e instruções assistenciais relevantes para o enfermeiro que assumirá o leito."
            />
          </div>

          {/* BOTÃO DE ENVIAR / SALVAR OCULTO APENAS PARA SUBMIT VIA ENTER SE NECESSÁRIO */}
          <button type="submit" style={{ display: 'none' }} />
        </form>

        {/* ===================================================================
            3. RODAPÉ FIXO DO DRAWER
            =================================================================== */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#ffffff',
            borderTop: '1px solid #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ fontWeight: 700 }}
          >
            ← Cancelar / Fechar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveSubmit}
            style={{
              padding: '0.6rem 1.4rem',
              fontWeight: 800,
              fontSize: '0.92rem',
              background: 'var(--brand-navy)',
            }}
          >
            💾 SALVAR PASSAGEM DE PLANTÃO
          </button>
        </div>
      </div>
    </div>
  );
}
