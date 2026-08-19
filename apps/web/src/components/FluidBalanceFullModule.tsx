import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface FluidBalanceFullModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function FluidBalanceFullModule({ patient, attendance, user, onSave }: FluidBalanceFullModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    dataReferencia: new Date().toLocaleDateString('pt-BR'),
    situacao: 'EM ABERTO (Controle de 24 Horas)',
  };

  // Entradas (Ganhos) em mL
  const [ganhos, setGanhos] = useState({
    soroterapia: 1000,
    dietas: 1200,
    medicamentosEv: 250,
    outrosGanhos: 0,
  });

  // Saídas (Perdas) em mL
  const [perdas, setPerdas] = useState({
    diurese: 1450,
    drenos: 150,
    vomitos: 0,
    evacuacoes: 100,
    outrasPerdas: 0,
  });

  // Cálculos Automáticos Garantidos pelo Sistema
  const totalGanhos = ganhos.soroterapia + ganhos.dietas + ganhos.medicamentosEv + ganhos.outrosGanhos;
  const totalPerdas = perdas.diurese + perdas.drenos + perdas.vomitos + perdas.evacuacoes + perdas.outrasPerdas;
  const balancoFinal = totalGanhos - totalPerdas;

  const tecnico = {
    nome: user?.name || 'TÉC. ROBERTO SILVA',
    coren: 'COREN/PA-TEC 89412',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, ganhos, perdas, totalGanhos, totalPerdas, balancoFinal, tecnico });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
      <InstitutionalPrintHeader documentTitle="CONTROLE DE BALANÇO HÍDRICO (24 HORAS)" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>💧 Controle de Balanço Hídrico (Janela 24h)</span>
        <span className="badge-manchester badge-VERDE" style={{ background: '#16a34a' }}>DOC TÉCNICO ENFERMAGEM</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Leito:</strong> {patientHeader.leito}</div>
          <div><strong>Data Referência:</strong> {patientHeader.dataReferencia}</div>
        </div>

        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          {/* TABELA DE GANHOS */}
          <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="card-title" style={{ fontSize: '0.95rem', color: '#15803d' }}>📥 Ganhos / Entradas (mL)</div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Soroterapia (mL)</label>
              <input className="form-control" type="number" value={ganhos.soroterapia} onChange={e => setGanhos({ ...ganhos, soroterapia: Number(e.target.value) })} />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Dietas / SNE (mL)</label>
              <input className="form-control" type="number" value={ganhos.dietas} onChange={e => setGanhos({ ...ganhos, dietas: Number(e.target.value) })} />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Medicamentos / Diluições EV (mL)</label>
              <input className="form-control" type="number" value={ganhos.medicamentosEv} onChange={e => setGanhos({ ...ganhos, medicamentosEv: Number(e.target.value) })} />
            </div>
            <div style={{ marginTop: '0.75rem', fontWeight: 800, color: '#15803d', fontSize: '1rem', borderTop: '1px solid #bbf7d0', paddingTop: '0.4rem' }}>
              Total de Ganhos: {totalGanhos} mL
            </div>
          </div>

          {/* TABELA DE PERDAS */}
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <div className="card-title" style={{ fontSize: '0.95rem', color: '#b91c1c' }}>📤 Perdas / Saídas (mL)</div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Diurese (SVD/Espontânea) (mL)</label>
              <input className="form-control" type="number" value={perdas.diurese} onChange={e => setPerdas({ ...perdas, diurese: Number(e.target.value) })} />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Drenos / Secreções (mL)</label>
              <input className="form-control" type="number" value={perdas.drenos} onChange={e => setPerdas({ ...perdas, drenos: Number(e.target.value) })} />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Vômitos / Aspiração (mL)</label>
              <input className="form-control" type="number" value={perdas.vomitos} onChange={e => setPerdas({ ...perdas, vomitos: Number(e.target.value) })} />
            </div>
            <div style={{ marginTop: '0.75rem', fontWeight: 800, color: '#b91c1c', fontSize: '1rem', borderTop: '1px solid #fca5a5', paddingTop: '0.4rem' }}>
              Total de Perdas: {totalPerdas} mL
            </div>
          </div>
        </div>

        {/* CARD DE RESULTADO DO CÁLCULO AUTOMÁTICO */}
        <div className="card" style={{ background: balancoFinal >= 0 ? '#f0fdf4' : '#fef2f2', border: `2px solid ${balancoFinal >= 0 ? '#16a34a' : '#dc2626'}`, textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
            CÁLCULO AUTOMÁTICO DO BALANÇO HÍDRICO (24h)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: balancoFinal >= 0 ? '#15803d' : '#b91c1c', margin: '0.3rem 0' }}>
            {balancoFinal >= 0 ? `+${balancoFinal} mL (Positivo)` : `${balancoFinal} mL (Negativo)`}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>
            Cálculo realizado automaticamente pelo sistema (Total Ganhos {totalGanhos} mL - Total Perdas {totalPerdas} mL).
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Registrar Fechamento do Balanço</button>
        </div>
      </form>
    </div>
  );
}
