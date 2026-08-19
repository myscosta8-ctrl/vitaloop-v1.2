import React, { useState } from 'react';
import { DocumentWorkspaceModal } from './DocumentWorkspaceModal';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface TriageModuleProps {
  attendance: any;
  patient: any;
  user: any;
  onFinishTriage: (triageData: any) => void;
}

const INITIAL_WAITING_TRIAGE_LIST = [
  {
    id: 'att-6592',
    openedAt: '31/07/2026 12:38',
    status: 'AGUARDANDO_TRIAGEM',
    patientName: 'SADRAQUE PINHEIRO DE SOUZA',
    medicalRecordNumber: 'PRONT-137603',
    cpf: '034.900.072-71',
    age: '27 anos',
    sex: 'M',
    cityOfOrigin: 'BAGRE / PA',
    demandType: 'Espontânea / Trauma',
    chiefComplaint: 'Queda de objeto sobre a região temporal direita com dor intensa',
    allergies: 'PACIENTE NEGA ALERGIAS',
    comorbidities: 'Nenhuma relata',
    medications: 'Nenhuma em uso regular',
    waitTimeMinutes: 18,
  },
  {
    id: 'att-6597',
    openedAt: '31/07/2026 13:10',
    status: 'AGUARDANDO_TRIAGEM',
    patientName: 'RAIMUNDO SANTANA FEITOZA',
    medicalRecordNumber: 'PRONT-104402',
    cpf: '128.450.902-88',
    age: '68 anos',
    sex: 'M',
    cityOfOrigin: 'BREVES / PA',
    demandType: 'Demanda Espontânea',
    chiefComplaint: 'Cefaleia súbita e episódios de tontura',
    allergies: 'Alergia a Dipirona',
    comorbidities: 'HAS • DM2',
    medications: 'Losartana 50mg • Metformina 850mg',
    waitTimeMinutes: 25,
  },
];

const FLOWCHARTS_DATA: Record<
  string,
  {
    name: string;
    discriminators: {
      text: string;
      code: 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'AZUL';
      color: string;
      bgColor: string;
      priority: number;
      targetMinutes: number;
      levelText: string;
    }[];
  }
> = {
  TRAUMA_CRANIANO: {
    name: 'Trauma Cranioencefálico / Politrauma',
    discriminators: [
      {
        text: 'Glasgow <= 8 ou Inconsciente ou Amputação traumática grave',
        code: 'VERMELHO',
        color: '#dc2626',
        bgColor: '#fef2f2',
        priority: 1,
        targetMinutes: 0,
        levelText: 'VERMELHO — EMERGENTE — ATENDIMENTO IMEDIATO',
      },
      {
        text: 'Mecanismo de trauma grave / Anisocoria / Perda de consciência presenciada',
        code: 'LARANJA',
        color: '#ea580c',
        bgColor: '#fff7ed',
        priority: 2,
        targetMinutes: 10,
        levelText: 'LARANJA — MUITO URGENTE — ATÉ 10 MINUTOS',
      },
      {
        text: 'Cefaleia moderada pós-trauma sem déficit focal',
        code: 'AMARELO',
        color: '#d97706',
        bgColor: '#fefce8',
        priority: 3,
        targetMinutes: 60,
        levelText: 'AMARELO — URGENTE — ATÉ 60 MINUTOS',
      },
      {
        text: 'Escoriações superficiais pós-trauma leve',
        code: 'VERDE',
        color: '#16a34a',
        bgColor: '#f0fdf4',
        priority: 4,
        targetMinutes: 120,
        levelText: 'VERDE — POUCO URGENTE — ATÉ 120 MINUTOS',
      },
    ],
  },
  DOR_TORACICA: {
    name: 'Dor Torácica / Suspeita de SCA',
    discriminators: [
      {
        text: 'Dor precordial típica em aperto + sudorese fria ou instabilidade',
        code: 'VERMELHO',
        color: '#dc2626',
        bgColor: '#fef2f2',
        priority: 1,
        targetMinutes: 0,
        levelText: 'VERMELHO — EMERGENTE — ATENDIMENTO IMEDIATO',
      },
      {
        text: 'Dor precordial intensa em paciente com fatores de risco',
        code: 'LARANJA',
        color: '#ea580c',
        bgColor: '#fff7ed',
        priority: 2,
        targetMinutes: 10,
        levelText: 'LARANJA — MUITO URGENTE — ATÉ 10 MINUTOS',
      },
      {
        text: 'Dor atípica ou pleurítica sem alteração hemodinâmica',
        code: 'AMARELO',
        color: '#d97706',
        bgColor: '#fefce8',
        priority: 3,
        targetMinutes: 60,
        levelText: 'AMARELO — URGENTE — ATÉ 60 MINUTOS',
      },
      {
        text: 'Dor à palpação de parede torácica sem outros sintomas',
        code: 'VERDE',
        color: '#16a34a',
        bgColor: '#f0fdf4',
        priority: 4,
        targetMinutes: 120,
        levelText: 'VERDE — POUCO URGENTE — ATÉ 120 MINUTOS',
      },
    ],
  },
  FEBRE_ADULTO: {
    name: 'Febre / Suspeita de Infecção',
    discriminators: [
      {
        text: 'Sinais de Sepse Grave / Choque Séptico / Púrpura',
        code: 'VERMELHO',
        color: '#dc2626',
        bgColor: '#fef2f2',
        priority: 1,
        targetMinutes: 0,
        levelText: 'VERMELHO — EMERGENTE — ATENDIMENTO IMEDIATO',
      },
      {
        text: 'Febre alta com rigidez de nuca / Alteração do estado mental',
        code: 'LARANJA',
        color: '#ea580c',
        bgColor: '#fff7ed',
        priority: 2,
        targetMinutes: 10,
        levelText: 'LARANJA — MUITO URGENTE — ATÉ 10 MINUTOS',
      },
      {
        text: 'Febre alta (>= 39ºC) em imunodeprimido',
        code: 'AMARELO',
        color: '#d97706',
        bgColor: '#fefce8',
        priority: 3,
        targetMinutes: 60,
        levelText: 'AMARELO — URGENTE — ATÉ 60 MINUTOS',
      },
      {
        text: 'Febre baixa isolada sem outros sinais de alerta',
        code: 'VERDE',
        color: '#16a34a',
        bgColor: '#f0fdf4',
        priority: 4,
        targetMinutes: 120,
        levelText: 'VERDE — POUCO URGENTE — ATÉ 120 MINUTOS',
      },
    ],
  },
};

export function TriageModule({ attendance, patient, user, onFinishTriage }: TriageModuleProps) {
  const [waitingList, setWaitingList] = useState(INITIAL_WAITING_TRIAGE_LIST);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Queixa Principal
  const [queixaPrincipal, setQueixaPrincipal] = useState('Dor torácica há aproximadamente 2 horas');
  const [inicioSintomas, setInicioSintomas] = useState<'Súbito' | 'Gradual' | 'Insidioso'>('Súbito');
  const [evolucaoSintomas, setEvolucaoSintomas] = useState<'Piorando' | 'Estável' | 'Melhorando'>('Piorando');
  const [tempoEvolucao, setTempoEvolucao] = useState('2h');

  // Sinais Vitais
  const [systolicBp, setSystolicBp] = useState<number>(130);
  const [diastolicBp, setDiastolicBp] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(92);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [oxygenSat, setOxygenSat] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(36.7);
  const [glicemia, setGlicemia] = useState<string>('');

  // Dor
  const [painLevel, setPainLevel] = useState<number>(8);
  const [painLocation, setPainLocation] = useState<string>('Região Precordial');

  // Sinais de Alerta
  const [warningFlags, setWarningFlags] = useState<{ [key: string]: boolean }>({
    consciencia: false,
    respiracao: false,
    hemodinamica: false,
    convulsao: false,
    sangramento: false,
    neurologico: false,
    dorIntensa: true,
  });

  // Contexto Clínico
  const [comorbidities, setComorbidities] = useState<string>('HAS • DM2');
  const [medications, setMedications] = useState<string>('Losartana • Metformina');
  const [allergies, setAllergies] = useState<string>('Dipirona');

  // Manchester Protocol Selection
  const [selectedFlowchartKey, setSelectedFlowchartKey] = useState<string>('DOR_TORACICA');
  const [selectedDiscriminatorIndex, setSelectedDiscriminatorIndex] = useState<number>(1);
  const [triageNotes, setTriageNotes] = useState('Paciente orientado em tempo e espaço, sudoreico, relata dor em aperto.');

  const currentFlowchart = FLOWCHARTS_DATA[selectedFlowchartKey] || FLOWCHARTS_DATA['DOR_TORACICA'];
  const currentDiscriminator = currentFlowchart.discriminators[selectedDiscriminatorIndex] || currentFlowchart.discriminators[0];

  const handleStartTriage = (att: any) => {
    setSelectedAttendance(att);
    setQueixaPrincipal(att.chiefComplaint || 'Dor torácica há aproximadamente 2 horas');
    if (att.allergies) setAllergies(att.allergies);
    if (att.comorbidities) setComorbidities(att.comorbidities);
    if (att.medications) setMedications(att.medications);
    setIsModalOpen(true);
  };

  const handleReleaseTriage = () => {
    if (!selectedAttendance) return;
    const fullTriageResult = {
      attendanceId: selectedAttendance.id,
      patientName: selectedAttendance.patientName,
      status: 'AGUARDANDO_ATENDIMENTO_MEDICO',
      queixaPrincipal,
      sinaisVitais: { bp: `${systolicBp}/${diastolicBp}`, heartRate, respiratoryRate, oxygenSat, temperature, glicemia: glicemia || '—' },
      classificacao: { colorCode: currentDiscriminator.code, levelText: currentDiscriminator.levelText },
    };

    setWaitingList(waitingList.filter(item => item.id !== selectedAttendance.id));
    setIsModalOpen(false);
    onFinishTriage(fullTriageResult);
  };

  const handlePrintTriage = () => {
    window.print();
  };

  const toggleWarningFlag = (key: string) => {
    setWarningFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Vital Alarm Checkers
  const isSpO2Critical = oxygenSat < 95;
  const isTempHigh = temperature >= 37.8;
  const isHeartRateHigh = heartRate > 100 || heartRate < 50;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>FILA ASSISTENCIAL — AGUARDANDO TRIAGEM</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Pacientes com atendimento aberto aguardando avaliação de triagem (Protocolo de Manchester)</p>
      </div>

      <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
        <div className="card-title">PACIENTES EM FILA DE TRIAGEM ({waitingList.length})</div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Entrada</th>
                <th>Atendimento</th>
                <th>Prontuário</th>
                <th>Paciente</th>
                <th>Idade/Sexo</th>
                <th>Demanda / Queixa Inicial</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {waitingList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>Nenhum atendimento aguardando triagem no momento.</td>
                </tr>
              ) : (
                waitingList.map(att => (
                  <tr key={att.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{att.openedAt}</td>
                    <td><strong>#{att.id}</strong></td>
                    <td><strong>{att.medicalRecordNumber}</strong></td>
                    <td><strong>{att.patientName}</strong></td>
                    <td>{att.age} • {att.sex}</td>
                    <td style={{ fontSize: '0.82rem' }}>{att.chiefComplaint}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleStartTriage(att)}>
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

      {/* MODAL DE TRABALHO SOBREPOSTO DA FICHA DE TRIAGEM */}
      {isModalOpen && selectedAttendance && (
        <DocumentWorkspaceModal
          isOpen={true}
          documentType="TRIAGE_MANCHESTER"
          title="CLASSIFICAÇÃO DE RISCO — PROTOCOLO DE MANCHESTER"
          patient={{ fullName: selectedAttendance.patientName, medicalRecordNumber: selectedAttendance.medicalRecordNumber }}
          attendance={selectedAttendance}
          user={user}
          onClose={() => setIsModalOpen(false)}
          onRelease={handleReleaseTriage}
        >
          {/* COMPACT PATIENT SUMMARY BANNER */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                {selectedAttendance.patientName}
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginLeft: '0.75rem' }}>
                  {selectedAttendance.age} • {selectedAttendance.sex}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                Atendimento: <strong>#{selectedAttendance.id}</strong> • Prontuário: <strong>{selectedAttendance.medicalRecordNumber}</strong> • Tempo na Fila: <strong style={{ color: '#0284c7' }}>{selectedAttendance.waitTimeMinutes || 18} min</strong>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px',
                }}
              >
                ⚠ Alergias: {allergies || 'Paciente nega alergias'}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePrintTriage}
                style={{ fontWeight: 700, background: '#ffffff' }}
              >
                🖨️ Imprimir Ficha
              </button>
            </div>
          </div>

          {/* 1. QUEIXA PRINCIPAL */}
          <div className="card" style={{ marginBottom: '1.15rem' }}>
            <div className="card-title">1. QUEIXA PRINCIPAL</div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Queixa Principal do Paciente *</label>
              <textarea
                className="form-control"
                rows={3}
                style={{
                  width: '100%',
                  minHeight: '95px',
                  maxHeight: '200px',
                  resize: 'vertical',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.88rem',
                  lineHeight: '1.45',
                  boxSizing: 'border-box',
                }}
                value={queixaPrincipal}
                onChange={e => setQueixaPrincipal(e.target.value)}
                placeholder="Descreva a queixa motivadora da procura ao serviço de urgência"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Início dos Sintomas</label>
                <select
                  className="form-control"
                  value={inicioSintomas}
                  onChange={e => setInicioSintomas(e.target.value as any)}
                >
                  <option value="Súbito">Súbito</option>
                  <option value="Gradual">Gradual</option>
                  <option value="Insidioso">Insidioso</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Evolução Clínica</label>
                <select
                  className="form-control"
                  value={evolucaoSintomas}
                  onChange={e => setEvolucaoSintomas(e.target.value as any)}
                >
                  <option value="Piorando">Piorando</option>
                  <option value="Estável">Estável</option>
                  <option value="Melhorando">Melhorando</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Tempo de Evolução</label>
                <input
                  className="form-control"
                  value={tempoEvolucao}
                  onChange={e => setTempoEvolucao(e.target.value)}
                  placeholder="ex: 2 horas, 3 dias"
                />
              </div>
            </div>
          </div>

          {/* 2. SINAIS VITAIS - CARDS HORIZONTAIS COMPACTOS */}
          <div className="card" style={{ marginBottom: '1.15rem' }}>
            <div className="card-title">2. SINAIS VITAIS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {/* PA */}
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>PA (mmHg) *</div>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginTop: '0.25rem' }}>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem' }}
                    value={systolicBp}
                    onChange={e => setSystolicBp(Number(e.target.value))}
                  />
                  <span>/</span>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem' }}
                    value={diastolicBp}
                    onChange={e => setDiastolicBp(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* FC */}
              <div style={{ background: isHeartRateHigh ? '#fff7ed' : '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: `1px solid ${isHeartRateHigh ? '#fdba74' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isHeartRateHigh ? '#c2410c' : '#64748b', textTransform: 'uppercase' }}>
                  FC (bpm) * {isHeartRateHigh && '⚠'}
                </div>
                <input
                  type="number"
                  className="form-control"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem', marginTop: '0.25rem' }}
                  value={heartRate}
                  onChange={e => setHeartRate(Number(e.target.value))}
                />
              </div>

              {/* FR */}
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>FR (irpm) *</div>
                <input
                  type="number"
                  className="form-control"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem', marginTop: '0.25rem' }}
                  value={respiratoryRate}
                  onChange={e => setRespiratoryRate(Number(e.target.value))}
                />
              </div>

              {/* SpO2 */}
              <div style={{ background: isSpO2Critical ? '#fef2f2' : '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: `1px solid ${isSpO2Critical ? '#fca5a5' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isSpO2Critical ? '#991b1b' : '#64748b', textTransform: 'uppercase' }}>
                  SpO₂ (%) * {isSpO2Critical && '🚨'}
                </div>
                <input
                  type="number"
                  className="form-control"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem', marginTop: '0.25rem', color: isSpO2Critical ? '#991b1b' : 'inherit', fontWeight: isSpO2Critical ? 800 : 400 }}
                  value={oxygenSat}
                  onChange={e => setOxygenSat(Number(e.target.value))}
                />
              </div>

              {/* TEMP */}
              <div style={{ background: isTempHigh ? '#fff7ed' : '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: `1px solid ${isTempHigh ? '#fdba74' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isTempHigh ? '#c2410c' : '#64748b', textTransform: 'uppercase' }}>
                  TEMP (°C) * {isTempHigh && '🌡️'}
                </div>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem', marginTop: '0.25rem' }}
                  value={temperature}
                  onChange={e => setTemperature(Number(e.target.value))}
                />
              </div>

              {/* GLICEMIA */}
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>GLICEMIA (mg/dL)</div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="—"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem', marginTop: '0.25rem' }}
                  value={glicemia}
                  onChange={e => setGlicemia(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 3. AVALIAÇÃO DA DOR */}
          <div className="card" style={{ marginBottom: '1.15rem' }}>
            <div className="card-title">3. ESCALA DE DOR (EVA 0–10)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  Intensidade da Dor: <strong style={{ fontSize: '1rem', color: painLevel >= 7 ? '#dc2626' : painLevel >= 4 ? '#d97706' : '#16a34a' }}>{painLevel} / 10</strong>
                </span>
                <input
                  className="form-control"
                  style={{ width: '220px', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                  value={painLocation}
                  onChange={e => setPainLocation(e.target.value)}
                  placeholder="Localização da dor (ex: Precordial)"
                />
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={e => setPainLevel(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: painLevel >= 7 ? '#dc2626' : '#0F2B36' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                <span>0 — Sem dor</span>
                <span>2 — Leve</span>
                <span>5 — Moderada</span>
                <span>8 — Intensa</span>
                <span>10 — Insuportável</span>
              </div>
            </div>
          </div>

          {/* 4. SINAIS DE ALERTA CLÍNICOS */}
          <div className="card" style={{ marginBottom: '1.15rem', background: '#fafafa' }}>
            <div className="card-title">4. SINAIS DE ALERTA E ALERTAS CRÍTICOS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {[
                { key: 'consciencia', label: 'Alteração da Consciência / Transe' },
                { key: 'respiracao', label: 'Desconforto Respiratório Agudo' },
                { key: 'hemodinamica', label: 'Instabilidade Hemodinâmica' },
                { key: 'convulsão', label: 'Crise Convulsiva / Pós-ictal' },
                { key: 'sangramento', label: 'Sangramento Ativo Importante' },
                { key: 'neurologico', label: 'Déficit Neurológico Focal' },
                { key: 'dorIntensa', label: 'Dor Torácica ou Intensa' },
              ].map(item => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.8rem',
                    fontWeight: warningFlags[item.key] ? 700 : 500,
                    color: warningFlags[item.key] ? '#991b1b' : '#334155',
                    background: warningFlags[item.key] ? '#fef2f2' : '#ffffff',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '5px',
                    border: `1px solid ${warningFlags[item.key] ? '#fca5a5' : '#e2e8f0'}`,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!warningFlags[item.key]}
                    onChange={() => toggleWarningFlag(item.key)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* 5. CONTEXTO CLÍNICO E ANTECEDENTES */}
          <div className="card" style={{ marginBottom: '1.15rem' }}>
            <div className="card-title">5. CONTEXTO CLÍNICO E HISTÓRICO RESUMIDO</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Comorbidades / Condições de Risco</label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={comorbidities}
                  onChange={e => setComorbidities(e.target.value)}
                  placeholder="ex: HAS • DM2 • Cardiopatia"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Medicações de Uso Contínuo</label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={medications}
                  onChange={e => setMedications(e.target.value)}
                  placeholder="ex: Losartana • Metformina"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>Alergias Conhecidas</label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.82rem', color: '#991b1b', fontWeight: 600 }}
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="ex: Dipirona, Penicilina"
                />
              </div>
            </div>
          </div>

          {/* 6. MANCHESTER — DESTAQUE VISUAL DA CLASSIFICAÇÃO COM SELEÇÃO DE 1-CLIQUE */}
          <div className="card" style={{ marginBottom: '1.15rem', borderLeft: `6px solid ${currentDiscriminator.color}` }}>
            <div className="card-title">6. CLASSIFICAÇÃO DE RISCO (PROTOCOLO DE MANCHESTER)</div>

            {/* SELEÇÃO DO FLUXOGRAMA DO PROTOCOLO */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Fluxograma do Protocolo *</label>
              <select
                className="form-control"
                value={selectedFlowchartKey}
                onChange={e => {
                  setSelectedFlowchartKey(e.target.value);
                  setSelectedDiscriminatorIndex(0);
                }}
              >
                {Object.entries(FLOWCHARTS_DATA).map(([key, f]) => (
                  <option key={key} value={key}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* SELEÇÃO VISUAL DIRETA DA COR DE PRIORIDADE DE MANCHESTER (1-CLIQUE) */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Selecione a Classificação de Risco (1-Clique) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                {currentFlowchart.discriminators.map((d, index) => {
                  const isSelected = selectedDiscriminatorIndex === index;
                  return (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => setSelectedDiscriminatorIndex(index)}
                      style={{
                        background: isSelected ? d.color : d.bgColor,
                        color: isSelected ? '#ffffff' : d.color,
                        border: `2px solid ${d.color}`,
                        borderRadius: '8px',
                        padding: '0.65rem 0.5rem',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: '0.25rem',
                        boxShadow: isSelected ? '0 4px 10px rgba(0,0,0,0.18)' : 'none',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.12s ease-in-out',
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>
                        {d.code === 'VERMELHO' ? '🔴' : d.code === 'LARANJA' ? '🟠' : d.code === 'AMARELO' ? '🟡' : d.code === 'VERDE' ? '🟢' : '🔵'}
                      </span>
                      <span>{d.code}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 600 }}>
                        {d.targetMinutes === 0 ? 'IMEDIATO' : `${d.targetMinutes} MIN`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BANNER PROMINENTE DO RESULTADO DE MANCHESTER */}
            <div
              style={{
                background: currentDiscriminator.bgColor,
                border: `2px solid ${currentDiscriminator.color}`,
                borderRadius: '8px',
                padding: '1.15rem',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                CLASSIFICAÇÃO SELECIONADA
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: currentDiscriminator.color, marginTop: '0.2rem' }}>
                {currentDiscriminator.levelText}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginTop: '0.35rem' }}>
                Discriminador Fundamentador: <em>"{currentDiscriminator.text}"</em>
              </div>
            </div>
          </div>

          {/* 7. INFORMAÇÕES COMPLEMENTARES */}
          <div className="card" style={{ marginBottom: '1.15rem' }}>
            <div className="card-title">7. INFORMAÇÕES COMPLEMENTARES</div>
            <textarea
              className="form-control"
              rows={4}
              style={{
                width: '100%',
                minHeight: '120px',
                maxHeight: '240px',
                resize: 'vertical',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
                lineHeight: '1.45',
                boxSizing: 'border-box',
              }}
              value={triageNotes}
              onChange={e => setTriageNotes(e.target.value)}
              placeholder="Registre detalhes adicionais do atendimento de triagem, aspecto geral do paciente ou observações da enfermagem"
            />
          </div>

          {/* 📄 SHEET OCULTA EXCLUSIVA PARA IMPRESSÃO IMPERCEPTÍVEL NA UI */}
          <div className="triage-print-sheet" style={{ display: 'none' }}>
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
              <InstitutionalPrintHeader documentTitle="FICHA DE CLASSIFICAÇÃO DE RISCO — PROTOCOLO DE MANCHESTER" />

              <div style={{ marginBottom: '15px', fontSize: '13px' }}>
                <strong>Paciente:</strong> {selectedAttendance.patientName} ({selectedAttendance.age} • {selectedAttendance.sex})<br />
                <strong>Atendimento:</strong> #{selectedAttendance.id} | <strong>Prontuário:</strong> {selectedAttendance.medicalRecordNumber}<br />
                <strong>Alergias:</strong> {allergies || 'Nega alergias'}
              </div>

              <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>QUEIXA PRINCIPAL</h4>
                <div>{queixaPrincipal} (Início: {inicioSintomas} • Evolução: {evolucaoSintomas} • Tempo: {tempoEvolucao})</div>
              </div>

              <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>SINAIS VITAIS E DOR</h4>
                <div>PA: {systolicBp}/{diastolicBp} mmHg | FC: {heartRate} bpm | FR: {respiratoryRate} irpm | SpO₂: {oxygenSat}% | T: {temperature}°C | Dor: {painLevel}/10 ({painLocation})</div>
              </div>

              <div style={{ border: `2px solid ${currentDiscriminator.color}`, padding: '12px', background: currentDiscriminator.bgColor, marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: currentDiscriminator.color }}>{currentDiscriminator.levelText}</h3>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Fluxograma: {currentFlowchart.name}</div>
                <div style={{ fontSize: '12px' }}>Discriminador: {currentDiscriminator.text}</div>
              </div>

              <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>OBSERVAÇÃO DA ENFERMAGEM</h4>
                <div>{triageNotes}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '12px' }}>
                <div>________________________________________<br />Assinatura / Carimbo do Enfermeiro</div>
                <div>Data/Hora: ____/____/2026 às ____:____</div>
              </div>
            </div>
          </div>
        </DocumentWorkspaceModal>
      )}
    </div>
  );
}

