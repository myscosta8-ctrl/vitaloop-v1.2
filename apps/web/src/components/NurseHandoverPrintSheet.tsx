import React from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';
import type { HandoverData } from './NurseHandoverDrawer';

export interface NurseHandoverPrintSheetProps {
  beds: any[];
  handoversStore: Record<string, HandoverData>;
  shiftTurnText?: string;
}

export function NurseHandoverPrintSheet({ beds = [], handoversStore = {}, shiftTurnText }: NurseHandoverPrintSheetProps) {
  const occupiedBeds = (beds || []).filter(b => b && b.state === 'OCUPADO');

  const sectors = [
    { code: 'SALA_VERMELHA', name: 'SALA VERMELHA' },
    { code: 'INTERNACAO_ADULTO', name: 'INTERNAÇÃO ADULTO' },
    { code: 'PEDIATRIA', name: 'PEDIATRIA' },
    { code: 'OBSERVACAO', name: 'OBSERVAÇÃO' },
  ];

  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="nurse-handover-print-sheet" style={{ display: 'none' }}>
      <div style={{ padding: '15px', fontFamily: 'sans-serif', color: '#0F2B36' }}>
        {/* Cabeçalho Institucional de Breves */}
        <InstitutionalPrintHeader
          documentTitle="PASSAGEM DE PLANTÃO DE ENFERMAGEM"
          documentSubtitle={`Data: ${currentDate} às ${currentTime} • Turno: ${shiftTurnText || 'PLANTÃO 12H/24H'}`}
        />

        {/* Mapeamento por Setores */}
        {sectors.map(sec => {
          const sectorBeds = occupiedBeds.filter(b => b.sectorCode === sec.code);
          if (sectorBeds.length === 0) return null;

          return (
            <div key={sec.code} style={{ marginBottom: '18px', pageBreakInside: 'avoid' }}>
              <div
                style={{
                  background: '#0F2B36',
                  color: '#ffffff',
                  padding: '4px 10px',
                  fontWeight: 900,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: '3px',
                  marginBottom: '8px',
                }}
              >
                {sec.name} ({sectorBeds.length} {sectorBeds.length === 1 ? 'paciente' : 'pacientes'})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {sectorBeds.map(bed => {
                  const attId = bed.attendanceId || bed.id;
                  const handover = handoversStore ? handoversStore[attId] : undefined;
                  const isReviewed = handover?.isReviewedCurrentShift;
                  const isInherited = handover?.isInheritedFromPrevious;

                  return (
                    <div
                      key={bed.id}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        background: '#ffffff',
                        fontSize: '10px',
                        lineHeight: '1.35',
                      }}
                    >
                      {/* Topo do Card do Leito */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '4px',
                          marginBottom: '4px',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '11px', color: '#0F2B36' }}>{bed.name}</strong>
                          <span style={{ marginLeft: '6px', color: '#475569', fontWeight: 700 }}>
                            {bed.patientName}
                          </span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>
                          Pront: {bed.medicalRecordNumber}
                        </div>
                      </div>

                      {/* Status de Herança / Revisão */}
                      {(!isReviewed || isInherited) && (
                        <div
                          style={{
                            background: '#fefce8',
                            border: '1px solid #fef08a',
                            color: '#854d0e',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            fontSize: '9px',
                            fontWeight: 800,
                            marginBottom: '4px',
                          }}
                        >
                          ⚠ Não revisado neste plantão — dado do plantão anterior
                        </div>
                      )}

                      {/* Dados Clínicos e Assistenciais */}
                      <div>
                        <strong>HD:</strong> {bed.diagnosis || handover?.diagnosis || 'Em investigação'}<br />
                        <strong>Alergias:</strong> {handover?.allergies || bed.allergies || 'Nega alergias'}<br />
                        <strong>Consciência:</strong> {handover?.consciousnessLevel || 'Consciente'}<br />

                        <strong>Cuidados:</strong> AVP: {handover?.avpInstalled ? 'SIM' : 'NÃO'} {handover?.avpInsertionDate ? `(${handover.avpInsertionDate})` : ''} | Curativo: {handover?.dressingDone ? 'SIM' : 'NÃO'}<br />

                        {handover?.invasiveDevices && typeof handover.invasiveDevices === 'object' && (
                          <div>
                            <strong>Dispositivos:</strong>{' '}
                            {Object.entries(handover.invasiveDevices)
                              .filter(([_, val]) => Boolean(val))
                              .map(([k]) => k.toUpperCase())
                              .join(', ') || 'Nenhum'}
                            {handover.deviceDetails ? ` (${handover.deviceDetails})` : ''}
                          </div>
                        )}

                        {handover?.examName && (
                          <div>
                            <strong>Exame:</strong> {handover.examName} [{handover.examStatus || 'A realizar'}]
                          </div>
                        )}

                        {handover?.isRegulated && (
                          <div>
                            <strong>Regulação:</strong> {handover.regulationSystem} {handover.destinationHospital ? `-> ${handover.destinationHospital}` : ''}
                          </div>
                        )}

                        {handover?.pendingNotes && (
                          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #e2e8f0', color: '#0F2B36' }}>
                            <strong>Pendências:</strong> {handover.pendingNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Rodapé da Impressão */}
        <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #cbd5e1', fontSize: '9px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <div>Sistema Vitaloop UPA 24h • Marajó / PA</div>
          <div>Assinatura do Enfermeiro Plantonista: _________________________________________</div>
        </div>
      </div>
    </div>
  );
}
