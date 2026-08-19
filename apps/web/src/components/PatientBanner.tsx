import React from 'react';

export interface PatientBannerProps {
  patient: {
    id: string;
    medicalRecordNumber: string;
    fullName: string;
    cpf?: string;
    cns?: string;
    motherName?: string;
    birthDate?: string;
    sex?: string;
    cityOfOrigin?: string;
    allergies?: string;
  };
  attendance: {
    id: string;
    openedAt: string;
    bedName?: string;
    sectorName?: string;
    physicianName?: string;
    specialty?: string;
  };
  activeCids?: string[];
  activeProtocols?: string[];
  hasPrescriptionToday?: boolean;
  hasPrescriptionTomorrow?: boolean;
}

export function PatientBanner({
  patient,
  attendance,
  activeCids = ['I60 - HEMORRAGIA SUBARACNOIDEA', 'S06 - TRAUMATISMO INTRACRANIANO', 'G960 - FISTULA LIQUORICA'],
  activeProtocols = ['PROTOCOLO AVC', 'PROTOCOLO SEPSE'],
  hasPrescriptionToday = true,
  hasPrescriptionTomorrow = true,
}: PatientBannerProps) {
  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return '27 anos';
    const birth = new Date(birthDateStr);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) years--;
    return `${years} anos`;
  };

  const calculateDaysInHospital = (openedAtStr?: string) => {
    if (!openedAtStr) return '6 dias';
    const start = new Date(openedAtStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="patient-banner">
      <div className="pb-header">
        <div className="pb-patient-info">
          <div className="pb-avatar">
            {patient.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="pb-name">{patient.fullName}</div>
            <div className="pb-details">
              <span><strong>Prontuário:</strong> {patient.medicalRecordNumber}</span>
              <span><strong>Nº do Atendimento:</strong> #{attendance.id.slice(0, 8)}</span>
              <span><strong>Sexo:</strong> {patient.sex === 'F' ? 'Feminino' : 'Masculino'}</span>
              <span><strong>Data de Nascimento:</strong> {patient.birthDate || '14/11/1998'}</span>
              <span><strong>Idade:</strong> {calculateAge(patient.birthDate)}</span>
              <span><strong>Nome da Mãe:</strong> {patient.motherName || 'ODILENE SILVA PINHEIRO'}</span>
            </div>
            <div className="pb-details" style={{ marginTop: '0.35rem' }}>
              <span><strong>Localização:</strong> {attendance.sectorName || 'SALA VERMELHA'} / {attendance.bedName || 'LEITO 02'}</span>
              <span><strong>Entrada:</strong> {new Date(attendance.openedAt).toLocaleString('pt-BR')}</span>
              <span><strong>Permanência:</strong> {calculateDaysInHospital(attendance.openedAt)}</span>
              <span><strong>Cidade Origem:</strong> {patient.cityOfOrigin || 'BAGRE / PA'}</span>
              <span><strong>Convênio:</strong> SUS</span>
              <span><strong>Médico Responsável:</strong> {attendance.physicianName || 'DR. THALES DJALON'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-badges-row">
        <div className="badge-alert">
          🚨 ALERGIAS: {patient.allergies ? patient.allergies.toUpperCase() : 'PACIENTE NEGA ALERGIAS'}
        </div>

        {activeCids.map((cid, i) => (
          <div key={i} className="badge-cid">
            🔵 Diagnóstico: {cid}
          </div>
        ))}

        {activeProtocols.map((proto, i) => (
          <div key={i} className="badge-protocol">
            📋 {proto}
          </div>
        ))}

        {hasPrescriptionToday && (
          <div className="badge-capsule capsule-today">
            💊 Prescrição Vigente
          </div>
        )}
        {hasPrescriptionTomorrow && (
          <div className="badge-capsule capsule-tomorrow" title="Próxima prescrição médica disponível">
            🔴 Próxima prescrição disponível
          </div>
        )}
      </div>
    </div>
  );
}
