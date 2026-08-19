import React, { useState } from 'react';
import { DocumentWorkspaceModal } from './DocumentWorkspaceModal';

export interface ConsultationsModuleProps {
  attendance: any;
  patient: any;
  user: any;
  onSaveConsultation: (consultationData: any) => void;
}

const INITIAL_WAITING_MEDICAL_LIST = [
  {
    id: 'att-6592',
    openedAt: '31/07/2026 12:38',
    triagedAt: '31/07/2026 12:44',
    status: 'AGUARDANDO_ATENDIMENTO_MEDICO',
    patientName: 'SADRAQUE PINHEIRO DE SOUZA',
    medicalRecordNumber: 'PRONT-137603',
    cpf: '034.900.072-71',
    age: '27 anos',
    sex: 'M',
    cityOfOrigin: 'BAGRE / PA',
    triageLevel: 'LARANJA',
    triageLevelText: 'LARANJA — MUITO URGENTE',
    targetMinutes: 10,
    chiefComplaint: 'Trauma craniano pós-queda',
    vitalsSummary: 'PA: 120/80 mmHg • FC: 84 bpm • SpO2: 98% • Temp: 36.7ºC',
    allergies: 'PACIENTE NEGA ALERGIAS',
  },
  {
    id: 'att-6598',
    openedAt: '31/07/2026 13:00',
    triagedAt: '31/07/2026 13:12',
    status: 'AGUARDANDO_ATENDIMENTO_MEDICO',
    patientName: 'MARIA DAS GRACAS SILVA',
    medicalRecordNumber: 'PRONT-109282',
    cpf: '210.340.891-00',
    age: '58 anos',
    sex: 'F',
    cityOfOrigin: 'BREVES / PA',
    triageLevel: 'AMARELO',
    triageLevelText: 'AMARELO — URGENTE',
    targetMinutes: 60,
    chiefComplaint: 'Cefaleia com picos hipertensivos',
    vitalsSummary: 'PA: 160/100 mmHg • FC: 92 bpm • SpO2: 97% • Temp: 36.5ºC',
    allergies: 'Alergia a Penicilina',
  },
];

export function ConsultationsModule({ attendance, patient, user, onSaveConsultation }: ConsultationsModuleProps) {
  const [waitingList, setWaitingList] = useState(INITIAL_WAITING_MEDICAL_LIST);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [anamnese, setAnamnese] = useState('Paciente masculino, 27 anos, vítima de trauma cranioencefálico leve por queda de objeto de pequena altura sobre a região temporal direita há aproximadamente 2 horas.');
  const [physicalExam, setPhysicalExam] = useState('BEG, corado, hidratado, anictérico, acianótico, consciente e orientado em tempo e espaço. Pupilas isocóricas e fotorreagentes.');
  const [diagnostics, setDiagnostics] = useState('S06.0 — Concussão cerebral / Traumatismo cranioencefálico leve');
  const [conductPrescription, setConductPrescription] = useState('1. Analgesia com Dipirona 1g IV;\n2. Manter em observação clínica por 6 horas para reavaliação.');
  const [decision, setDecision] = useState<'ALTA' | 'OBSERVACAO' | 'INTERNACAO'>('OBSERVACAO');

  const handleStartConsultation = (att: any) => {
    setSelectedAttendance(att);
    setIsModalOpen(true);
  };

  const handleReleaseConsultation = () => {
    if (!selectedAttendance) return;
    onSaveConsultation({
      attendanceId: selectedAttendance.id,
      patientName: selectedAttendance.patientName,
      doctorName: user?.name || 'DR. THALES DJALON (MÉDICO)',
      anamnese,
      physicalExam,
      diagnostics,
      conductPrescription,
      decision,
      status: decision === 'OBSERVACAO' ? 'OBSERVACAO' : 'ENCERRADO',
    });
    setWaitingList(waitingList.filter(item => item.id !== selectedAttendance.id));
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>FILA ASSISTENCIAL — AGUARDANDO ATENDIMENTO MÉDICO</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Pacientes com triagem concluída aguardando Atendimento Médico na UPA 24h</p>
      </div>

      <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
        <div className="card-title">PACIENTES EM FILA MÉDICA ({waitingList.length})</div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Triagem</th>
                <th>Prioridade Manchester</th>
                <th>Atendimento</th>
                <th>Prontuário</th>
                <th>Paciente</th>
                <th>Queixa / Sinais Vitais</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {waitingList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>Nenhum paciente na fila médica no momento.</td>
                </tr>
              ) : (
                waitingList.map(att => (
                  <tr key={att.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{att.triagedAt}</td>
                    <td><span className={`badge-manchester badge-${att.triageLevel}`}>{att.triageLevelText}</span></td>
                    <td><strong>#{att.id}</strong></td>
                    <td><strong>{att.medicalRecordNumber}</strong></td>
                    <td><strong>{att.patientName}</strong></td>
                    <td style={{ fontSize: '0.82rem' }}>
                      <div><strong>{att.chiefComplaint}</strong></div>
                      <div style={{ color: '#64748b', fontSize: '0.76rem' }}>{att.vitalsSummary}</div>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleStartConsultation(att)}>
                        ▶ Atender
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE TRABALHO SOBREPOSTO DE CONSULTA MÉDICA */}
      {isModalOpen && selectedAttendance && (
        <DocumentWorkspaceModal
          isOpen={true}
          documentType="MEDICAL_CONSULTATION"
          title="ATENDIMENTO MÉDICO — CONSULTÓRIO"
          patient={{ fullName: selectedAttendance.patientName, medicalRecordNumber: selectedAttendance.medicalRecordNumber }}
          attendance={selectedAttendance}
          user={user}
          onClose={() => setIsModalOpen(false)}
          onRelease={handleReleaseConsultation}
        >
          <div className="card">
            <div className="card-title">1. ANAMNESE E HISTÓRIA CLÍNICA</div>
            <textarea className="form-control" rows={3} value={anamnese} onChange={e => setAnamnese(e.target.value)} />
          </div>
          <div className="card">
            <div className="card-title">2. EXAME FÍSICO</div>
            <textarea className="form-control" rows={3} value={physicalExam} onChange={e => setPhysicalExam(e.target.value)} />
          </div>
          <div className="card">
            <div className="card-title">3. DIAGNÓSTICOS (CID-10)</div>
            <textarea className="form-control" rows={2} value={diagnostics} onChange={e => setDiagnostics(e.target.value)} />
          </div>
          <div className="card">
            <div className="card-title">4. CONDUTA E PRESCRIÇÃO</div>
            <textarea className="form-control" rows={3} value={conductPrescription} onChange={e => setConductPrescription(e.target.value)} />
          </div>
          <div className="card">
            <div className="card-title">5. DECISÃO CLÍNICA / DESFECHO</div>
            <select className="form-control" value={decision} onChange={e => setDecision(e.target.value as any)}>
              <option value="OBSERVACAO">Manter em Observação UPA (Permanência &lt; 24h)</option>
              <option value="INTERNACAO">Encaminhar para Internação UPA (AIH)</option>
              <option value="ALTA">Alta Médica Domiciliar</option>
            </select>
          </div>
        </DocumentWorkspaceModal>
      )}
    </div>
  );
}
