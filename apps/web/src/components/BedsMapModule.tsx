import React, { useState } from 'react';
import { NurseHandoverDrawer, HandoverData } from './NurseHandoverDrawer';
import { NurseHandoverPrintSheet } from './NurseHandoverPrintSheet';

export interface BedMovementHistory {
  id: string;
  timestamp: string;
  patientName: string;
  medicalRecordNumber: string;
  fromBedName: string;
  toBedName: string;
  reason: string;
  responsible: string;
  movementType: 'ALOCAÇÃO' | 'REALOCAÇÃO' | 'MUDANÇA_CONTEXTO' | 'RESERVA' | 'CANCELAMENTO_RESERVA' | 'BLOQUEIO' | 'DESBLOQUEIO' | 'ALTA' | 'ABERTURA_LEITO_EXTRA' | 'ENCERRAMENTO_LEITO_EXTRA';
}

export interface BedData {
  id: string;
  code: string;
  name: string;
  sectorCode: 'SALA_VERMELHA' | 'INTERNACAO_ADULTO' | 'PEDIATRIA' | 'OBSERVACAO';
  sectorName: string;
  state: 'LIVRE' | 'OCUPADO' | 'RESERVADO' | 'BLOQUEADO';
  isExtra: boolean;
  isolationReason?: string | null;
  patientName?: string;
  medicalRecordNumber?: string;
  attendanceId?: string;
  contextType?: 'OBSERVACAO' | 'INTERNACAO';
  assignedAt?: string;
  patientAge?: string;
  patientSex?: 'M' | 'F';
  diagnosis?: string;
  clinicalNote?: string;
  reservationReason?: string;
  reservationTime?: string;
  reservationUser?: string;
  blockReason?: string;
  blockTime?: string;
  blockUser?: string;
}

export interface BedsMapModuleProps {
  beds: any[];
  patients: any[];
  user?: any;
  onRefreshData?: () => void;
  onSelectPatientChart?: (patient: any, attendance: any, context: 'observation' | 'hospitalization') => void;
}

// 36 LEITOS ASSISTENCIAIS FÍSICOS PERMANENTES DA UPA BREVES
const INITIAL_36_PHYSICAL_BEDS: BedData[] = [
  // SALA VERMELHA (4 leitos)
  { id: 'b-ev-1', code: 'EMERG_01', name: 'Leito 01', sectorCode: 'SALA_VERMELHA', sectorName: 'Sala Vermelha', state: 'LIVRE', isExtra: false },
  { id: 'b-ev-2', code: 'EMERG_02', name: 'Leito 02', sectorCode: 'SALA_VERMELHA', sectorName: 'Sala Vermelha', state: 'OCUPADO', isExtra: false, patientName: 'SADRAQUE PINHEIRO DE SOUZA', medicalRecordNumber: 'PRONT-137603', attendanceId: 'att-6592', contextType: 'OBSERVACAO', assignedAt: '31/07/2026 12:38', patientAge: '27 anos', patientSex: 'M', diagnosis: 'HD: Trauma Craniano' },
  { id: 'b-ev-3', code: 'EMERG_03', name: 'Leito 03', sectorCode: 'SALA_VERMELHA', sectorName: 'Sala Vermelha', state: 'LIVRE', isExtra: false },
  { id: 'b-ev-4', code: 'EMERG_04', name: 'Leito 04', sectorCode: 'SALA_VERMELHA', sectorName: 'Sala Vermelha', state: 'LIVRE', isExtra: false },

  // INTERNAÇÃO ADULTO (17 leitos: 1 a 16 + 1 Isolamento)
  { id: 'b-ia-1', code: 'INT_ADULT_01', name: 'Leito 01', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'OCUPADO', isExtra: false, patientName: 'MARIA DAS GRACAS SILVA', medicalRecordNumber: 'PRONT-109282', attendanceId: 'att-6590', contextType: 'INTERNACAO', assignedAt: '30/07/2026 09:15', patientAge: '58 anos', patientSex: 'F', diagnosis: 'HD: AVC Isquêmico' },
  { id: 'b-ia-2', code: 'INT_ADULT_02', name: 'Leito 02', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-3', code: 'INT_ADULT_03', name: 'Leito 03', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-4', code: 'INT_ADULT_04', name: 'Leito 04', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-5', code: 'INT_ADULT_05', name: 'Leito 05', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-6', code: 'INT_ADULT_06', name: 'Leito 06', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-7', code: 'INT_ADULT_07', name: 'Leito 07', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-8', code: 'INT_ADULT_08', name: 'Leito 08', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-9', code: 'INT_ADULT_09', name: 'Leito 09', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-10', code: 'INT_ADULT_10', name: 'Leito 10', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-11', code: 'INT_ADULT_11', name: 'Leito 11', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-12', code: 'INT_ADULT_12', name: 'Leito 12', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false },
  { id: 'b-ia-13', code: 'INT_ADULT_13', name: 'Leito 13', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'OCUPADO', isExtra: false, patientName: 'RAIMUNDO SANTANA FEITOZA DUARTE', medicalRecordNumber: 'PRONT-104402', attendanceId: 'att-6593', contextType: 'INTERNACAO', assignedAt: '05/08/2026 08:00', patientAge: '68 anos', patientSex: 'M', diagnosis: 'HD: AVC?', clinicalNote: 'TC de crânio 31/08 8h HRPM' },
  { id: 'b-ia-14', code: 'INT_ADULT_14', name: 'Leito 14', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'OCUPADO', isExtra: false, patientName: 'VINDA MARIA DA COSTA ARAUJO', medicalRecordNumber: 'PRONT-108831', attendanceId: 'att-6594', contextType: 'INTERNACAO', assignedAt: '10/08/2026 12:21', patientAge: '72 anos', patientSex: 'F', diagnosis: 'HD: CELULITE' },
  { id: 'b-ia-15', code: 'INT_ADULT_15', name: 'Leito 15', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'OCUPADO', isExtra: false, patientName: 'RAIMUNDO RODRIGUES CASTRO', medicalRecordNumber: 'PRONT-102219', attendanceId: 'att-6595', contextType: 'INTERNACAO', assignedAt: '15/08/2026 16:21', patientAge: '65 anos', patientSex: 'M', diagnosis: 'HD: ERISIPELA MID', clinicalNote: 'Apresentou hipoglicemia no plantão noturno' },
  { id: 'b-ia-16', code: 'INT_ADULT_16', name: 'Leito 16', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'OCUPADO', isExtra: false, patientName: 'MARIA DE LOURDES MAIA BARBOSA', medicalRecordNumber: 'PRONT-103322', attendanceId: 'att-6596', contextType: 'INTERNACAO', assignedAt: '07/08/2026 17:23', patientAge: '63 anos', patientSex: 'F', diagnosis: 'HD: Pielonefrite' },
  { id: 'b-ia-iso', code: 'INT_ADULT_ISO', name: 'Leito 17 - ISO', sectorCode: 'INTERNACAO_ADULTO', sectorName: 'Internação Adulto', state: 'LIVRE', isExtra: false, isolationReason: 'Isolamento Respiratório/Contato' },

  // PEDIATRIA (6 leitos: 1 a 5 + 1 Isolamento)
  { id: 'b-ped-1', code: 'PED_01', name: 'Leito 01', sectorCode: 'PEDIATRIA', sectorName: 'Pediatria', state: 'LIVRE', isExtra: false },
  { id: 'b-ped-2', code: 'PED_02', name: 'Leito 02', sectorCode: 'PEDIATRIA', sectorName: 'Pediatria', state: 'LIVRE', isExtra: false },
  { id: 'b-ped-3', code: 'PED_03', name: 'Leito 03', sectorCode: 'PEDIATRIA', sectorName: 'Pediatria', state: 'LIVRE', isExtra: false },
  { id: 'b-ped-4', code: 'PED_04', name: 'Leito 04', sectorCode: 'PEDIATRIA', sectorName: 'Pediatria', state: 'LIVRE', isExtra: false },
  { id: 'b-ped-5', code: 'PED_05', name: 'Leito 05', sectorCode: 'PEDIATRIA', sectorName: 'Pediatria', state: 'LIVRE', isExtra: false },
  { id: 'b-ped-iso', code: 'PED_ISO', name: 'Leito 06 - ISO', sectorCode: 'PEDIATRIA', sectorName: 'Pediatria', state: 'LIVRE', isExtra: false, isolationReason: 'Isolamento Pediatria' },

  // OBSERVAÇÃO (9 leitos: 1 a 8 + 1 Isolamento)
  { id: 'b-obs-1', code: 'OBS_01', name: 'Leito 01', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'OCUPADO', isExtra: false, patientName: 'JOAO FERREIRA DE SOUZA', medicalRecordNumber: 'PRONT-112044', attendanceId: 'att-6591', contextType: 'OBSERVACAO', assignedAt: '01/08/2026 08:30', patientAge: '45 anos', patientSex: 'M', diagnosis: 'HD: Crise Hipertensiva' },
  { id: 'b-obs-2', code: 'OBS_02', name: 'Leito 02', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false },
  { id: 'b-obs-3', code: 'OBS_03', name: 'Leito 03', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false },
  { id: 'b-obs-4', code: 'OBS_04', name: 'Leito 04', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false },
  { id: 'b-obs-5', code: 'OBS_05', name: 'Leito 05', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false },
  { id: 'b-obs-6', code: 'OBS_06', name: 'Leito 06', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false },
  { id: 'b-obs-7', code: 'OBS_07', name: 'Leito 07', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false },
  { id: 'b-obs-8', code: 'OBS_08', name: 'Leito 08', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false },
  { id: 'b-obs-iso', code: 'OBS_ISO', name: 'Leito 09 - ISO', sectorCode: 'OBSERVACAO', sectorName: 'Observação', state: 'LIVRE', isExtra: false, isolationReason: 'Isolamento Observação' },
];

const INITIAL_HISTORY: BedMovementHistory[] = [
  {
    id: 'hist-1',
    timestamp: '31/07/2026 12:38',
    patientName: 'SADRAQUE PINHEIRO DE SOUZA',
    medicalRecordNumber: 'PRONT-137603',
    fromBedName: 'Recepção / Triagem',
    toBedName: 'Leito Emergência 02',
    reason: 'Admissão Emergencial de Urgência',
    responsible: 'MARCUS YAN (ENFERMEIRO)',
    movementType: 'ALOCAÇÃO',
  },
  {
    id: 'hist-2',
    timestamp: '01/08/2026 08:30',
    patientName: 'JOAO FERREIRA DE SOUZA',
    medicalRecordNumber: 'PRONT-112044',
    fromBedName: 'Leito Obs. 01',
    toBedName: 'Leito Obs. 01',
    reason: 'Alocação Inicial em Observação',
    responsible: 'DR. THALES DJALON',
    movementType: 'ALOCAÇÃO',
  },
];

export function BedsMapModule({ beds: externalBeds, patients, user, onRefreshData, onSelectPatientChart }: BedsMapModuleProps) {
  const [bedList, setBedList] = useState<BedData[]>(INITIAL_36_PHYSICAL_BEDS);
  const [extraBeds, setExtraBeds] = useState<BedData[]>([]);
  const [movementHistory, setMovementHistory] = useState<BedMovementHistory[]>(INITIAL_HISTORY);

  // ESTADO DA PASSAGEM DE PLANTÃO (HANDOVERS STORE)
  const [handoversStore, setHandoversStore] = useState<Record<string, HandoverData>>({
    'att-6592': {
      attendanceId: 'att-6592',
      patientName: 'SADRAQUE PINHEIRO DE SOUZA',
      medicalRecordNumber: 'PRONT-137603',
      bedId: 'b-ev-2',
      bedName: 'Leito 02',
      sectorName: 'Sala Vermelha',
      patientAge: '27 anos',
      patientSex: 'M',
      diagnosis: 'HD: Trauma Craniano',
      allergies: 'PACIENTE NEGA ALERGIAS',
      statusText: 'OBSERVAÇÃO',
      isReviewedCurrentShift: true,
      isInheritedFromPrevious: false,
      savedAt: '17/08/2026 21:00',
      nurseName: 'MARCUS YAN (ENFERMEIRO)',
      nurseCoren: 'COREN/PA 64520',
      dressingDone: true,
      dressingDetails: 'Curativo oclusivo limpo em região parietal D',
      avpInstalled: true,
      avpInsertionDate: '16/08/2026',
      consciousnessLevel: 'Sedado RASS -2 / VMI',
      companionPresent: false,
      invasiveDevices: { svd: true, sne: true, dreno: false, o2: false, cvc: true, tot: true, tracheo: false, outros: false },
      deviceDetails: 'TOT #8.5 fixado 22cm, CVC VJI D, SVD diurese clara',
      examName: 'TC de Crânio',
      examStatus: 'RESULTADO_DISPONIVEL',
      examDate: '17/08/2026',
      examPreparation: '',
      examResultNotes: 'Sem novas lesões expansivas',
      notificationDisease: '',
      collectionDate: '',
      notificationDate: '',
      notificationStatus: '',
      bloodComponents: { ch: true, pfc: false, cp: false, crioprecipitado: false },
      bloodRequested: true,
      bloodTransfused: true,
      bloodQuantity: '2 bolsas CH',
      bloodNotes: '',
      isRegulated: true,
      regulationSystem: 'SER',
      regulationDate: '17/08/2026',
      destinationHospital: 'HRPM (Hospital Regional do Marajó)',
      transportType: 'Ambulância USA',
      bedReleased: true,
      redRoomDischarge: false,
      pendingNotes: 'Aguardando liberação de leito UTI no HRPM para transporte.',
    },
    'att-6590': {
      attendanceId: 'att-6590',
      patientName: 'MARIA DAS GRACAS SILVA',
      medicalRecordNumber: 'PRONT-109282',
      bedId: 'b-ia-1',
      bedName: 'Leito 01',
      sectorName: 'Internação Adulto',
      patientAge: '58 anos',
      patientSex: 'F',
      diagnosis: 'HD: AVC Isquêmico',
      allergies: 'Dipirona',
      statusText: 'INTERNADO',
      isReviewedCurrentShift: false,
      isInheritedFromPrevious: true,
      previousShiftTimestamp: '17/08/2026 13:00',
      dressingDone: false,
      dressingDetails: '',
      avpInstalled: true,
      avpInsertionDate: '15/08/2026',
      consciousnessLevel: 'Consciente, orientado, paresia em MDE',
      companionPresent: true,
      invasiveDevices: { svd: false, sne: false, dreno: false, o2: false, cvc: false, tot: false, tracheo: false, outros: false },
      deviceDetails: '',
      examName: 'Ecocardiograma',
      examStatus: 'A_REALIZAR',
      examDate: '',
      examPreparation: 'Aguardando agendamento',
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
      pendingNotes: 'Fisioterapia motora 2x/dia. Aceitando dieta branda.',
    },
  });

  // Drawer de Passagem de Plantão
  const [isHandoverDrawerOpen, setIsHandoverDrawerOpen] = useState<boolean>(false);
  const [handoverBedTarget, setHandoverBedTarget] = useState<BedData | null>(null);

  const handleOpenHandoverForBed = (bed: BedData) => {
    setHandoverBedTarget(bed);
    setIsHandoverDrawerOpen(true);
  };

  const handleSaveHandoverData = (savedHandover: HandoverData) => {
    setHandoversStore(prev => ({
      ...prev,
      [savedHandover.attendanceId]: savedHandover,
    }));
    setIsHandoverDrawerOpen(false);
    setActionSuccess(`Passagem de plantão do paciente ${savedHandover.patientName} (${savedHandover.bedName}) salva com sucesso!`);
  };

  // Modais de Ação Existentes do Mapa
  const [selectedBed, setSelectedBed] = useState<BedData | null>(null);
  const [activeModal, setActiveModal] = useState<'ACTIONS' | 'RELOCATE' | 'RESERVE' | 'BLOCK' | 'HISTORY' | null>(null);

  // Formulários dos Modais Existentes
  const [targetBedId, setTargetBedId] = useState<string>('');
  const [relocateReason, setRelocateReason] = useState<string>('Necessidade assistencial');
  const [customReason, setCustomReason] = useState<string>('');
  
  const [reserveReason, setReserveReason] = useState<string>('Reserva prévia para paciente em transporte');
  const [blockReason, setBlockReason] = useState<string>('Manutenção');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Estatísticas Automáticas
  const totalPhysical = 36;
  const officialBeds = bedList;
  const totalOccupied = officialBeds.filter(b => b.state === 'OCUPADO').length + extraBeds.filter(b => b.state === 'OCUPADO').length;
  const totalFree = officialBeds.filter(b => b.state === 'LIVRE').length + extraBeds.filter(b => b.state === 'LIVRE').length;
  const totalReserved = officialBeds.filter(b => b.state === 'RESERVADO').length + extraBeds.filter(b => b.state === 'RESERVADO').length;
  const totalBlocked = officialBeds.filter(b => b.state === 'BLOQUEADO').length + extraBeds.filter(b => b.state === 'BLOQUEADO').length;
  const totalExtraActive = extraBeds.length;

  const formatBadgeText = (count: number, wordSingular: string, wordPlural: string) => {
    return `${count} ${count === 1 ? wordSingular : wordPlural}`;
  };

  // Abrir Leito Extra Contextual por Setor (Integrado à grade do próprio setor)
  const handleOpenExtraBedForSector = (sectorCode: 'SALA_VERMELHA' | 'INTERNACAO_ADULTO' | 'PEDIATRIA' | 'OBSERVACAO', sectorName: string) => {
    const sectorExtras = extraBeds.filter(b => b.sectorCode === sectorCode);
    const newExtraNumber = sectorExtras.length + 1;
    const timestamp = new Date().toLocaleString('pt-BR');

    const newExtra: BedData = {
      id: `extra-${sectorCode}-${Date.now()}`,
      code: `EXTRA_${sectorCode}_${newExtraNumber}`,
      name: `Leito Extra ${newExtraNumber.toString().padStart(2, '0')} (${sectorName})`,
      sectorCode,
      sectorName,
      state: 'LIVRE',
      isExtra: true,
    };

    setExtraBeds(prev => [...prev, newExtra]);

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: 'N/A',
      medicalRecordNumber: 'N/A',
      fromBedName: 'N/A',
      toBedName: newExtra.name,
      reason: `Abertura de leito extra temporário no setor ${sectorName}`,
      responsible: 'MARCUS YAN (ENFERMEIRO)',
      movementType: 'ABERTURA_LEITO_EXTRA',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActionSuccess(`Leito Extra (${newExtra.name}) aberto com sucesso no setor ${sectorName}!`);
  };

  // Encerrar Leito Extra
  const handleCloseExtraBed = (extraBedId: string) => {
    const extraBed = extraBeds.find(b => b.id === extraBedId);
    if (!extraBed) return;

    if (extraBed.state === 'OCUPADO') {
      alert(`Não é possível encerrar o ${extraBed.name} enquanto houver paciente ocupando o leito. Primeiro realoque ou dê alta ao paciente.`);
      return;
    }

    const timestamp = new Date().toLocaleString('pt-BR');
    setExtraBeds(prev => prev.filter(b => b.id !== extraBedId));

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: 'N/A',
      medicalRecordNumber: 'N/A',
      fromBedName: extraBed.name,
      toBedName: 'N/A',
      reason: `Encerramento de leito extra no setor ${extraBed.sectorName}`,
      responsible: 'MARCUS YAN (ENFERMEIRO)',
      movementType: 'ENCERRAMENTO_LEITO_EXTRA',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActiveModal(null);
    setActionSuccess(`${extraBed.name} encerrado com sucesso.`);
  };

  // 1. Executar Realocação de Leito
  const handleExecuteRelocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed || !targetBedId) return;

    const allCurrentBeds = [...bedList, ...extraBeds];
    const targetBed = allCurrentBeds.find(b => b.id === targetBedId);
    if (!targetBed) return;

    const finalReason = relocateReason === 'Outro' ? (customReason || 'Outro motivo assistencial') : relocateReason;
    const timestamp = new Date().toLocaleString('pt-BR');

    // Atualiza leito antigo (LIVRE) e novo leito (OCUPADO)
    const updateBedState = (b: BedData) => {
      if (b.id === selectedBed.id) {
        return { ...b, state: 'LIVRE' as const, patientName: undefined, medicalRecordNumber: undefined, attendanceId: undefined, contextType: undefined, assignedAt: undefined, diagnosis: undefined, clinicalNote: undefined };
      }
      if (b.id === targetBedId) {
        return {
          ...b,
          state: 'OCUPADO' as const,
          patientName: selectedBed.patientName,
          medicalRecordNumber: selectedBed.medicalRecordNumber,
          attendanceId: selectedBed.attendanceId,
          contextType: selectedBed.contextType || 'OBSERVACAO',
          assignedAt: timestamp,
          patientAge: selectedBed.patientAge,
          patientSex: selectedBed.patientSex,
          diagnosis: selectedBed.diagnosis,
          clinicalNote: selectedBed.clinicalNote,
        };
      }
      return b;
    };

    setBedList(prev => prev.map(updateBedState));
    setExtraBeds(prev => prev.map(updateBedState));

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: selectedBed.patientName || 'PACIENTE',
      medicalRecordNumber: selectedBed.medicalRecordNumber || 'PRONT-000',
      fromBedName: selectedBed.name,
      toBedName: targetBed.name,
      reason: finalReason,
      responsible: 'MARCUS YAN (ENFERMEIRO)',
      movementType: 'REALOCAÇÃO',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActiveModal(null);
    setSelectedBed(null);
    setActionSuccess(`Paciente ${selectedBed.patientName} realocado do ${selectedBed.name} para o ${targetBed.name}!`);
  };

  // 2. Alternar Contexto Assistencial (Observação ➔ Internado)
  const handleToggleContext = (bedId: string, currentContext?: 'OBSERVACAO' | 'INTERNACAO') => {
    const newContext: 'OBSERVACAO' | 'INTERNACAO' = currentContext === 'INTERNACAO' ? 'OBSERVACAO' : 'INTERNACAO';
    const timestamp = new Date().toLocaleString('pt-BR');
    const bed = [...bedList, ...extraBeds].find(b => b.id === bedId);

    const updateContext = (b: BedData): BedData => b.id === bedId ? { ...b, contextType: newContext } : b;
    setBedList(prev => prev.map(updateContext));
    setExtraBeds(prev => prev.map(updateContext));

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: bed?.patientName || 'PACIENTE',
      medicalRecordNumber: bed?.medicalRecordNumber || 'PRONT-000',
      fromBedName: bed?.name || 'Leito',
      toBedName: bed?.name || 'Leito',
      reason: `Mudança de contexto assistencial para ${newContext === 'INTERNACAO' ? 'INTERNADO' : 'OBSERVAÇÃO'}`,
      responsible: 'DR. THALES DJALON (MÉDICO)',
      movementType: 'MUDANÇA_CONTEXTO',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActiveModal(null);
    setActionSuccess(`Contexto assistencial de ${bed?.patientName} alterado para ${newContext === 'INTERNACAO' ? 'INTERNADO' : 'OBSERVAÇÃO'}.`);
  };

  // 3. Executar Reserva de Leito
  const handleExecuteReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    const timestamp = new Date().toLocaleString('pt-BR');
    const updateReservation = (b: BedData) => b.id === selectedBed.id ? {
      ...b,
      state: 'RESERVADO' as const,
      reservationReason: reserveReason,
      reservationTime: timestamp,
      reservationUser: 'MARCUS YAN (ENFERMEIRO)',
    } : b;

    setBedList(prev => prev.map(updateReservation));
    setExtraBeds(prev => prev.map(updateReservation));

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: 'RESERVA PREVENTIVA',
      medicalRecordNumber: 'N/A',
      fromBedName: selectedBed.name,
      toBedName: selectedBed.name,
      reason: reserveReason,
      responsible: 'MARCUS YAN (ENFERMEIRO)',
      movementType: 'RESERVA',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActiveModal(null);
    setActionSuccess(`${selectedBed.name} reservado com sucesso.`);
  };

  // 4. Cancelar Reserva
  const handleCancelReservation = (bedId: string) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const bed = [...bedList, ...extraBeds].find(b => b.id === bedId);

    const clearReservation = (b: BedData) => b.id === bedId ? { ...b, state: 'LIVRE' as const, reservationReason: undefined, reservationTime: undefined, reservationUser: undefined } : b;
    setBedList(prev => prev.map(clearReservation));
    setExtraBeds(prev => prev.map(clearReservation));

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: 'N/A',
      medicalRecordNumber: 'N/A',
      fromBedName: bed?.name || 'Leito',
      toBedName: bed?.name || 'Leito',
      reason: 'Cancelamento de reserva e retorno ao status LIVRE',
      responsible: 'MARCUS YAN (ENFERMEIRO)',
      movementType: 'CANCELAMENTO_RESERVA',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActiveModal(null);
    setActionSuccess(`Reserva do ${bed?.name} cancelada. Leito disponível.`);
  };

  // 5. Executar Bloqueio de Leito
  const handleExecuteBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    const timestamp = new Date().toLocaleString('pt-BR');
    const updateBlock = (b: BedData) => b.id === selectedBed.id ? {
      ...b,
      state: 'BLOQUEADO' as const,
      blockReason: blockReason,
      blockTime: timestamp,
      blockUser: 'MARCUS YAN (ENFERMEIRO)',
    } : b;

    setBedList(prev => prev.map(updateBlock));
    setExtraBeds(prev => prev.map(updateBlock));

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: 'N/A',
      medicalRecordNumber: 'N/A',
      fromBedName: selectedBed.name,
      toBedName: selectedBed.name,
      reason: blockReason,
      responsible: 'MARCUS YAN (ENFERMEIRO)',
      movementType: 'BLOQUEIO',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActiveModal(null);
    setActionSuccess(`${selectedBed.name} bloqueado para ${blockReason}.`);
  };

  // 6. Desbloquear Leito
  const handleUnblockBed = (bedId: string) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const bed = [...bedList, ...extraBeds].find(b => b.id === bedId);

    const clearBlock = (b: BedData) => b.id === bedId ? { ...b, state: 'LIVRE' as const, blockReason: undefined, blockTime: undefined, blockUser: undefined } : b;
    setBedList(prev => prev.map(clearBlock));
    setExtraBeds(prev => prev.map(clearBlock));

    const newHistoryEvent: BedMovementHistory = {
      id: `hist-${Date.now()}`,
      timestamp,
      patientName: 'N/A',
      medicalRecordNumber: 'N/A',
      fromBedName: bed?.name || 'Leito',
      toBedName: bed?.name || 'Leito',
      reason: 'Desbloqueio e liberação do leito para uso',
      responsible: 'MARCUS YAN (ENFERMEIRO)',
      movementType: 'DESBLOQUEIO',
    };
    setMovementHistory(prev => [newHistoryEvent, ...prev]);

    setActiveModal(null);
    setActionSuccess(`${bed?.name} liberado para uso.`);
  };

  // Setores Oficiais (Sem setor "Provisório" isolado)
  const sectors = [
    {
      code: 'SALA_VERMELHA' as const,
      name: 'SALA VERMELHA',
      physicalCount: 4,
      physicalBeds: bedList.filter(b => b.sectorCode === 'SALA_VERMELHA'),
      extraBedsSector: extraBeds.filter(b => b.sectorCode === 'SALA_VERMELHA'),
    },
    {
      code: 'INTERNACAO_ADULTO' as const,
      name: 'INTERNAÇÃO ADULTO',
      physicalCount: 17,
      physicalBeds: bedList.filter(b => b.sectorCode === 'INTERNACAO_ADULTO'),
      extraBedsSector: extraBeds.filter(b => b.sectorCode === 'INTERNACAO_ADULTO'),
    },
    {
      code: 'PEDIATRIA' as const,
      name: 'PEDIATRIA',
      physicalCount: 6,
      physicalBeds: bedList.filter(b => b.sectorCode === 'PEDIATRIA'),
      extraBedsSector: extraBeds.filter(b => b.sectorCode === 'PEDIATRIA'),
    },
    {
      code: 'OBSERVACAO' as const,
      name: 'OBSERVAÇÃO',
      physicalCount: 9,
      physicalBeds: bedList.filter(b => b.sectorCode === 'OBSERVACAO'),
      extraBedsSector: extraBeds.filter(b => b.sectorCode === 'OBSERVACAO'),
    },
  ];

  // Todos os leitos livres para realocação
  const availableBedsForRelocation = [...bedList, ...extraBeds].filter(b => b.state === 'LIVRE' && b.id !== selectedBed?.id);

  return (
    <div>
      {/* Título e Subtítulo Institucional */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.35rem', fontWeight: 800 }}>Mapa de Leitos</h2>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.print()}
          style={{
            fontWeight: 800,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: 'var(--brand-navy)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          🖨️ Imprimir Passagem
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionSuccess}</span>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }} onClick={() => setActionSuccess(null)}>✕</button>
        </div>
      )}

      {/* Resumo Operacional Institucional */}
      <div className="card" style={{ background: '#ffffff', borderLeft: '5px solid var(--brand-navy)', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          RESUMO OPERACIONAL DOS LEITOS FÍSICOS DA UNIDADE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', textAlign: 'center' }}>
          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-navy)' }}>{totalPhysical}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>LEITOS FÍSICOS</div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '3px solid #10b981' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{totalFree}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669' }}>LIVRES</div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '3px solid #ef4444' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444' }}>{totalOccupied}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626' }}>OCUPADOS</div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '3px solid #f59e0b' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>{totalReserved}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706' }}>RESERVADOS</div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '3px solid #94a3b8' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#64748b' }}>{totalBlocked}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>BLOQUEADOS</div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '3px solid #38bdf8' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7' }}>{totalExtraActive}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>EXTRAS ATIVOS</div>
          </div>
        </div>
      </div>

      {/* Renderização dos 4 Setores com Leito Extra Integrado na Mesma Grade Visual */}
      {sectors.map(sec => {
        const allSectorBeds = [...sec.physicalBeds, ...sec.extraBedsSector];
        const secOccupied = allSectorBeds.filter(b => b.state === 'OCUPADO').length;
        const secFree = allSectorBeds.filter(b => b.state === 'LIVRE').length;

        return (
          <div key={sec.code} className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title" style={{ fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span>{sec.name}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginLeft: '0.6rem' }}>
                  ({sec.physicalCount} leitos físicos{sec.extraBedsSector.length > 0 ? ` + ${sec.extraBedsSector.length} extra` : ''})
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', gap: '0.5rem' }}>
                <span className="status-LIVRE">{formatBadgeText(secFree, 'LIVRE', 'LIVRES')}</span>
                <span className="status-OCUPADO">{formatBadgeText(secOccupied, 'OCUPADO', 'OCUPADOS')}</span>
              </div>
            </div>

            {/* Grade de Leitos do Setor */}
            <div className="beds-grid">
              {allSectorBeds.map(bed => {
                const isOcc = bed.state === 'OCUPADO';
                const isRes = bed.state === 'RESERVADO';
                const isBlk = bed.state === 'BLOQUEADO';
                const attId = bed.attendanceId || bed.id;
                const handover = handoversStore[attId];

                return (
                  <div
                    key={bed.id}
                    className={`bed-card ${isOcc ? 'occupied' : isRes ? 'reserved' : isBlk ? 'blocked' : 'free'} ${bed.isExtra ? 'extra' : ''}`}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    onClick={() => {
                      setSelectedBed(bed);
                      if (isOcc) {
                        handleOpenHandoverForBed(bed);
                      }
                    }}
                  >
                    <div>
                      {/* Topo do Cartão: Código / Nome do Leito */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--brand-navy)' }}>
                          {bed.name} {bed.isExtra ? '• EXTRA' : ''}
                        </span>
                        {isRes && <span className="bed-status status-RESERVADO">RESERVADO</span>}
                        {isBlk && <span className="bed-status status-BLOQUEADO">BLOQUEADO</span>}
                      </div>

                      {/* Identificação Principal do Paciente quando Ocupado (Conforme Imagem de Referência) */}
                      {isOcc ? (
                        <div style={{ marginTop: '0.35rem' }}>
                          <div style={{ fontWeight: 900, color: 'var(--brand-navy)', fontSize: '0.98rem', lineHeight: '1.25', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            {bed.patientName}
                          </div>

                          {/* Badges de Contexto Assistencial e Status de Passagem de Plantão */}
                          <div style={{ marginBottom: '0.45rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                            {bed.contextType === 'INTERNACAO' ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                                INTERNADO
                              </span>
                            ) : (
                              <span style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                                OBSERVACAO
                              </span>
                            )}

                            {/* PÍLULAS DISCRETAS DA PASSAGEM DE PLANTÃO */}
                            {handover?.isReviewedCurrentShift ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                🟢 PASSAGEM SALVA
                              </span>
                            ) : handover?.isInheritedFromPrevious ? (
                              <span style={{ background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                ⚠ HERDADO DO PLANTÃO
                              </span>
                            ) : (
                              <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                🟡 PENDENTE DE REVISÃO
                              </span>
                            )}
                          </div>

                          {/* Diagnóstico ou Nota Clínica */}
                          {bed.diagnosis && (
                            <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
                              {bed.diagnosis}
                            </div>
                          )}

                          {bed.clinicalNote && (
                            <div style={{ marginTop: '0.35rem', background: '#fffbe6', border: '1px solid #fef08a', padding: '0.35rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', color: '#854d0e', fontWeight: 600 }}>
                              {bed.clinicalNote}
                            </div>
                          )}
                        </div>
                      ) : isRes ? (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#a16207' }}>
                          <div><strong>Motivo:</strong> {bed.reservationReason}</div>
                          <div style={{ fontSize: '0.72rem', color: '#854d0e', marginTop: '0.2rem' }}>Por {bed.reservationUser}</div>
                        </div>
                      ) : isBlk ? (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                          <div><strong>Motivo:</strong> {bed.blockReason}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Por {bed.blockUser}</div>
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                          Leito Vazio
                        </div>
                      )}
                    </div>

                    {bed.isolationReason && (
                      <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 800, marginTop: '0.5rem' }}>
                        ⚠️ {bed.isolationReason}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Botão Contextual "+ Abrir Leito Extra" Posicionado Exatamente ao Lado do Úlmo Leito do Setor (Conforme Imagem de Referência) */}
              <div
                className="bed-card"
                style={{
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '130px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                }}
                onClick={() => handleOpenExtraBedForSector(sec.code, sec.name)}
                title={`Abrir leito extra no setor ${sec.name}`}
              >
                <div style={{ textAlign: 'center', color: 'var(--brand-navy)', fontWeight: 700, fontSize: '0.88rem' }}>
                  + Abrir leito extra
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ===================================================================
          MODAL 1: MENU DE AÇÕES NO LEITO
          =================================================================== */}
      {activeModal === 'ACTIONS' && selectedBed && (
        <div className="sidebar-backdrop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-title">
              <span>{selectedBed.name} {selectedBed.isExtra ? '(LEITO EXTRA)' : ''}</span>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div style={{ fontSize: '0.88rem', marginBottom: '1.2rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
              <div><strong>Setor:</strong> {selectedBed.sectorName}</div>
              <div><strong>Status Atual:</strong> {selectedBed.state}</div>
              {selectedBed.patientName && (
                <div style={{ marginTop: '0.4rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                  <div><strong>Paciente:</strong> {selectedBed.patientName}</div>
                  <div><strong>Prontuário:</strong> {selectedBed.medicalRecordNumber}</div>
                  <div><strong>Contexto Assistencial:</strong> {selectedBed.contextType === 'INTERNACAO' ? 'INTERNADO' : 'OBSERVAÇÃO'}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* LEITO OCUPADO */}
              {selectedBed.state === 'OCUPADO' && (
                <>
                  <button className="btn btn-primary" onClick={() => {
                    setActiveModal(null);
                    onSelectPatientChart?.(
                      { fullName: selectedBed.patientName, medicalRecordNumber: selectedBed.medicalRecordNumber },
                      { id: selectedBed.attendanceId || 'att-6592', openedAt: new Date().toISOString() },
                      selectedBed.contextType === 'INTERNACAO' ? 'hospitalization' : 'observation'
                    );
                  }}>
                    📄 Acessar Prontuário do Paciente
                  </button>

                  <button className="btn btn-mint" onClick={() => {
                    setTargetBedId(availableBedsForRelocation[0]?.id || '');
                    setActiveModal('RELOCATE');
                  }}>
                    🔄 Realocar Paciente de Leito
                  </button>

                  <button className="btn btn-secondary" onClick={() => handleToggleContext(selectedBed.id, selectedBed.contextType)}>
                    🔁 Mudar Contexto ({selectedBed.contextType === 'INTERNACAO' ? 'Mudar para OBSERVAÇÃO' : 'Mudar para INTERNADO'})
                  </button>

                  <button className="btn btn-secondary" onClick={() => setActiveModal('HISTORY')}>
                    📜 Ver Histórico de Movimentações
                  </button>

                  <button className="btn btn-danger" onClick={() => {
                    const updateFree = (b: BedData) => b.id === selectedBed.id ? { ...b, state: 'LIVRE' as const, patientName: undefined, medicalRecordNumber: undefined } : b;
                    setBedList(prev => prev.map(updateFree));
                    setExtraBeds(prev => prev.map(updateFree));
                    setActiveModal(null);
                    setActionSuccess(`Leito ${selectedBed.name} desocupado.`);
                  }}>
                    🟢 Desocupar / Liberar Leito (Alta)
                  </button>

                  {selectedBed.isExtra && (
                    <div style={{ fontSize: '0.78rem', color: '#b91c1c', background: '#fef2f2', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
                      ⚠️ Leito extra ocupado. Para encerrar, primeiro realoque ou dê alta ao paciente.
                    </div>
                  )}
                </>
              )}

              {/* LEITO LIVRE */}
              {selectedBed.state === 'LIVRE' && (
                <>
                  <button className="btn btn-mint" onClick={() => {
                    const updateAllocated = (b: BedData) => b.id === selectedBed.id ? {
                      ...b,
                      state: 'OCUPADO' as const,
                      patientName: 'SADRAQUE PINHEIRO DE SOUZA',
                      medicalRecordNumber: 'PRONT-137603',
                      attendanceId: 'att-6592',
                      contextType: selectedBed.sectorCode === 'INTERNACAO_ADULTO' ? 'INTERNACAO' as const : 'OBSERVACAO' as const,
                      assignedAt: new Date().toLocaleString('pt-BR'),
                    } : b;
                    setBedList(prev => prev.map(updateAllocated));
                    setExtraBeds(prev => prev.map(updateAllocated));
                    setActiveModal(null);
                    setActionSuccess(`Paciente alocado no ${selectedBed.name}!`);
                  }}>
                    👤 Alocar Paciente neste Leito
                  </button>

                  <button className="btn btn-secondary" onClick={() => setActiveModal('RESERVE')}>
                    🟡 Reservar Leito
                  </button>

                  <button className="btn btn-secondary" onClick={() => setActiveModal('BLOCK')}>
                    ⚫ Bloquear Leito (Manutenção / Limpeza)
                  </button>

                  <button className="btn btn-secondary" onClick={() => setActiveModal('HISTORY')}>
                    📜 Ver Histórico de Movimentações
                  </button>

                  {selectedBed.isExtra && (
                    <button className="btn btn-danger" onClick={() => handleCloseExtraBed(selectedBed.id)}>
                      ❌ Encerrar Leito Extra
                    </button>
                  )}
                </>
              )}

              {/* LEITO RESERVADO */}
              {selectedBed.state === 'RESERVADO' && (
                <>
                  <button className="btn btn-danger" onClick={() => handleCancelReservation(selectedBed.id)}>
                    🟢 Cancelar Reserva e Liberar Leito
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveModal('HISTORY')}>
                    📜 Ver Histórico de Movimentações
                  </button>
                </>
              )}

              {/* LEITO BLOQUEADO */}
              {selectedBed.state === 'BLOQUEADO' && (
                <>
                  <button className="btn btn-mint" onClick={() => handleUnblockBed(selectedBed.id)}>
                    🟢 Desbloquear / Liberar para Uso
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveModal('HISTORY')}>
                    📜 Ver Histórico de Movimentações
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: REALOCAR PACIENTE DE LEITO
          =================================================================== */}
      {activeModal === 'RELOCATE' && selectedBed && (
        <div className="sidebar-backdrop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-title">
              <span>🔄 REALOCAR PACIENTE DA UPA</span>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handleExecuteRelocation}>
              <div className="form-grid" style={{ fontSize: '0.88rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', marginBottom: '1rem' }}>
                <div><strong>Paciente:</strong> {selectedBed.patientName}</div>
                <div><strong>Prontuário:</strong> {selectedBed.medicalRecordNumber}</div>
                <div><strong>Leito Atual:</strong> {selectedBed.name} ({selectedBed.sectorName})</div>
                <div><strong>Contexto:</strong> {selectedBed.contextType === 'INTERNACAO' ? 'INTERNADO' : 'OBSERVAÇÃO'}</div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Selecione o Novo Leito (Somente Livres) *</label>
                {availableBedsForRelocation.length === 0 ? (
                  <div className="alert alert-warning" style={{ fontSize: '0.85rem' }}>Não há leitos livres disponíveis no momento.</div>
                ) : (
                  <select className="form-control" value={targetBedId} onChange={e => setTargetBedId(e.target.value)} required>
                    {availableBedsForRelocation.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.sectorName} {b.isExtra ? '(Extra)' : ''} (🟢 Livre)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Motivo da Realocação *</label>
                <select className="form-control" value={relocateReason} onChange={e => setRelocateReason(e.target.value)}>
                  <option value="Necessidade assistencial">Necessidade assistencial</option>
                  <option value="Isolamento">Isolamento</option>
                  <option value="Gravidade clínica">Gravidade clínica</option>
                  <option value="Necessidade de monitorização">Necessidade de monitorização</option>
                  <option value="Adequação do setor">Adequação do setor</option>
                  <option value="Organização da unidade">Organização da unidade</option>
                  <option value="Solicitação médica">Solicitação médica</option>
                  <option value="Solicitação da enfermagem">Solicitação da enfermagem</option>
                  <option value="Manutenção/interdição do leito">Manutenção/interdição do leito</option>
                  <option value="Outro">Outro motivo</option>
                </select>
              </div>

              {relocateReason === 'Outro' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Descreva o Motivo *</label>
                  <input className="form-control" value={customReason} onChange={e => setCustomReason(e.target.value)} required />
                </div>
              )}

              <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={availableBedsForRelocation.length === 0}>
                  Confirmar Realocação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: RESERVAR LEITO
          =================================================================== */}
      {activeModal === 'RESERVE' && selectedBed && (
        <div className="sidebar-backdrop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', background: '#ffffff' }}>
            <div className="card-title">
              <span>🟡 RESERVAR LEITO — {selectedBed.name}</span>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handleExecuteReservation}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Motivo da Reserva *</label>
                <input className="form-control" value={reserveReason} onChange={e => setReserveReason(e.target.value)} required />
              </div>

              <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-warning">Confirmar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: BLOQUEAR LEITO
          =================================================================== */}
      {activeModal === 'BLOCK' && selectedBed && (
        <div className="sidebar-backdrop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', background: '#ffffff' }}>
            <div className="card-title">
              <span>⚫ BLOQUEAR LEITO — {selectedBed.name}</span>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handleExecuteBlock}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Motivo do Bloqueio *</label>
                <select className="form-control" value={blockReason} onChange={e => setBlockReason(e.target.value)}>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Limpeza / Higienização">Limpeza / Higienização</option>
                  <option value="Problema estrutural">Problema estrutural</option>
                  <option value="Equipamento indisponível">Equipamento indisponível</option>
                  <option value="Isolamento / adequação física">Isolamento / adequação física</option>
                  <option value="Outro">Outro motivo</option>
                </select>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Confirmar Bloqueio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 5: HISTÓRICO DE MOVIMENTAÇÕES (AUDITORIA)
          =================================================================== */}
      {activeModal === 'HISTORY' && selectedBed && (
        <div className="sidebar-backdrop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '680px', background: '#ffffff', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="card-title">
              <span>📜 HISTÓRICO DE MOVIMENTAÇÕES — {selectedBed.name}</span>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Paciente</th>
                    <th>Movimentação</th>
                    <th>Motivo</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {movementHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma movimentação registrada.</td>
                    </tr>
                  ) : (
                    movementHistory.map(h => (
                      <tr key={h.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h.timestamp}</td>
                        <td><strong>{h.patientName}</strong></td>
                        <td>{h.fromBedName} ➔ {h.toBedName}</td>
                        <td>{h.reason}</td>
                        <td style={{ fontSize: '0.8rem' }}>{h.responsible}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER DA PASSAGEM DE PLANTÃO DA ENFERMAGEM */}
      <NurseHandoverDrawer
        isOpen={isHandoverDrawerOpen}
        bed={handoverBedTarget}
        user={user}
        existingHandover={handoverBedTarget ? handoversStore[handoverBedTarget.attendanceId || handoverBedTarget.id] : null}
        previousHandover={handoverBedTarget ? handoversStore[handoverBedTarget.attendanceId || handoverBedTarget.id] : null}
        onClose={() => {
          setIsHandoverDrawerOpen(false);
          setHandoverBedTarget(null);
        }}
        onSaveHandover={handleSaveHandoverData}
        onOpenRelocate={() => {
          if (handoverBedTarget) {
            setSelectedBed(handoverBedTarget);
            setActiveModal('RELOCATE');
          }
        }}
        onOpenDischarge={() => {
          if (handoverBedTarget) {
            setSelectedBed(handoverBedTarget);
            setActiveModal('ACTIONS');
          }
        }}
      />

      {/* IMPRESSÃO A4 DA PASSAGEM DE PLANTÃO DE ENFERMAGEM */}
      <NurseHandoverPrintSheet
        beds={[...bedList, ...extraBeds]}
        handoversStore={handoversStore}
      />
    </div>
  );
}
