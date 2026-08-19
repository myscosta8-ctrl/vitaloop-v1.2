import React, { useState } from 'react';
import { DocumentWorkspaceModal } from './DocumentWorkspaceModal';

export interface ReevaluationModuleProps {
  attendance: any;
  patient: any;
  user: any;
  onSaveReevaluation: (reevaluationData: any) => void;
}

const INITIAL_WAITING_REEVALUATION_LIST = [
  {
    id: 'att-6592',
    openedAt: '31/07/2026 12:38',
    status: 'AGUARDANDO_REAVALIACAO',
    patientName: 'SADRAQUE PINHEIRO DE SOUZA',
    medicalRecordNumber: 'PRONT-137603',
    bedCode: 'INT_ADULT_03',
    sectorName: 'Internação Adulto',
    hoursInObs: '4 horas em observação',
    triageLevel: 'LARANJA',
    diagnosis: 'S06.0 — Concussão cerebral / Traumatismo cranioencefálico leve',
  },
  {
    id: 'att-6599',
    openedAt: '31/07/2026 09:15',
    status: 'AGUARDANDO_REAVALIACAO',
    patientName: 'JOAO ALMEIDA PEREIRA',
    medicalRecordNumber: 'PRONT-101188',
    bedCode: 'OBS_02',
    sectorName: 'Observação',
    hoursInObs: '7 horas em observação',
    triageLevel: 'AMARELO',
    diagnosis: 'I10 — Crise Hipertensiva',
  },
];

export function ReevaluationModule({ attendance, patient, user, onSaveReevaluation }: ReevaluationModuleProps) {
  const [waitingList, setWaitingList] = useState(INITIAL_WAITING_REEVALUATION_LIST);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [reevaluationText, setReevaluationText] = useState('Paciente reavaliado após 4 horas de observação clínica na Internação Adulto. Apresenta melhora da cefaleia, sem episódios de vômitos, neurologicamente preservado, afebril, hemodinamicamente estável.');
  const [adjustedPrescription, setAdjustedPrescription] = useState('1. Orientação de alta hospitalar com sinais de alarme para TCE;\n2. Analgesia se dor (Dipirona 500mg VO de 6/6h por 3 dias).');
  const [outcomeDecision, setOutcomeDecision] = useState<'ALTA' | 'OBSERVACAO' | 'TRANSFERENCIA'>('ALTA');

  const handleStartReevaluation = (att: any) => {
    setSelectedAttendance(att);
    setIsModalOpen(true);
  };

  const handleReleaseReevaluation = () => {
    if (!selectedAttendance) return;
    onSaveReevaluation({
      attendanceId: selectedAttendance.id,
      patientName: selectedAttendance.patientName,
      doctorName: user?.name || 'DR. THALES DJALON (MÉDICO)',
      reevaluationText,
      adjustedPrescription,
      outcomeDecision,
      status: outcomeDecision === 'ALTA' ? 'ENCERRADO' : 'OBSERVACAO',
    });
    setWaitingList(waitingList.filter(item => item.id !== selectedAttendance.id));
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>FILA ASSISTENCIAL — REAVALIAÇÃO MÉDICA</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Pacientes em leitos de observação/internação aguardando reavaliação periódica</p>
      </div>

      <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
        <div className="card-title">PACIENTES EM FILA DE REAVALIAÇÃO ({waitingList.length})</div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Leito / Setor</th>
                <th>Tempo Observação</th>
                <th>Atendimento</th>
                <th>Prontuário</th>
                <th>Paciente</th>
                <th>Diagnóstico Atual</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {waitingList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>Nenhum paciente aguardando reavaliação no momento.</td>
                </tr>
              ) : (
                waitingList.map(att => (
                  <tr key={att.id}>
                    <td><strong>{att.bedCode}</strong> ({att.sectorName})</td>
                    <td style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>{att.hoursInObs}</td>
                    <td><strong>#{att.id}</strong></td>
                    <td><strong>{att.medicalRecordNumber}</strong></td>
                    <td><strong>{att.patientName}</strong></td>
                    <td style={{ fontSize: '0.82rem' }}>{att.diagnosis}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleStartReevaluation(att)}>
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

      {/* MODAL DE TRABALHO SOBREPOSTO DE REAVALIAÇÃO MÉDICA */}
      {isModalOpen && selectedAttendance && (
        <DocumentWorkspaceModal
          isOpen={true}
          documentType="MEDICAL_EVOLUTION"
          title="REAVALIAÇÃO MÉDICA — EVOLUÇÃO"
          patient={{ fullName: selectedAttendance.patientName, medicalRecordNumber: selectedAttendance.medicalRecordNumber }}
          attendance={selectedAttendance}
          user={user}
          onClose={() => setIsModalOpen(false)}
          onRelease={handleReleaseReevaluation}
        >
          <div className="card">
            <div className="card-title">1. EVOLUÇÃO MÉDICA DE REAVALIAÇÃO</div>
            <textarea className="form-control" rows={4} value={reevaluationText} onChange={e => setReevaluationText(e.target.value)} />
          </div>
          <div className="card">
            <div className="card-title">2. AJUSTE DE PRESCRIÇÃO / CONDUTA</div>
            <textarea className="form-control" rows={3} value={adjustedPrescription} onChange={e => setAdjustedPrescription(e.target.value)} />
          </div>
          <div className="card">
            <div className="card-title">3. DECISÃO DA REAVALIAÇÃO</div>
            <select className="form-control" value={outcomeDecision} onChange={e => setOutcomeDecision(e.target.value as any)}>
              <option value="ALTA">Alta Médica Domiciliar</option>
              <option value="OBSERVACAO">Manter em Observação UPA</option>
              <option value="TRANSFERENCIA">Encaminhar para Regulação / Transferência (SER)</option>
            </select>
          </div>
        </DocumentWorkspaceModal>
      )}
    </div>
  );
}
