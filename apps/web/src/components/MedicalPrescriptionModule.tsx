import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface MedicalPrescriptionModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function MedicalPrescriptionModule({ patient, attendance, user, onSave }: MedicalPrescriptionModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA VERMELHA — LEITO 02',
    alergias: patient?.allergies || 'PACIENTE NEGA ALERGIAS',
    peso: '74 kg',
    validade: '24 HORAS (Vigência: 16/08 12:00 a 17/08 12:00)',
  };

  const [diet, setDiet] = useState('Dieta Enteral por Sonda Nasoentérica (SNE) 1.2 kcal/mL — 1500 mL/dia em BI.');

  const [medications, setMedications] = useState([
    { item: '1', name: 'DIPIRONA 1G INJETÁVEL', dose: '1 AMP (2 mL)', via: 'EV', freq: '6/6h', horários: '06h - 12h - 18h - 00h', ifNeeded: false },
    { item: '2', name: 'CEFTRIAXONA 2G PO P/ INJ', dose: '2g', via: 'EV', freq: '24/24h', horários: '08h', ifNeeded: false },
    { item: '3', name: 'OMEPRAZOL 40MG INJETÁVEL', dose: '1 FR/AMP', via: 'EV', freq: '24/24h', horários: '07h', ifNeeded: false },
    { item: '4', name: 'MANITOL 20% SOLUÇÃO INJETÁVEL', dose: '250 mL', via: 'EV em 30 min', freq: '8/8h', horários: '06h - 14h - 22h', ifNeeded: true },
  ]);

  const [nursingInstructions, setNursingInstructions] = useState([
    '1. Manter paciente em decúbito elevado a 30º;',
    '2. Monitoração contínua de SSVV (PA, FC, SpO2, Temp) de 2/2h;',
    '3. Glicemia capilar de 6/6h;',
    '4. Manter SNE aberta em frasco coletor.',
  ]);

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, diet, medications, nursingInstructions, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <InstitutionalPrintHeader documentTitle="PRESCRIÇÃO MÉDICA HOSPITALAR" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>💊 Prescrição Médica Hospitalar (Oficial UPA)</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO CENTRAL</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Leito:</strong> {patientHeader.leito}</div>
          <div><strong>Alergias:</strong> <span style={{ color: '#b91c1c', fontWeight: 700 }}>{patientHeader.alergias}</span></div>
          <div><strong>Peso:</strong> {patientHeader.peso}</div>
          <div><strong>Validade Prescrição:</strong> {patientHeader.validade}</div>
        </div>

        {/* 1. DIETA */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-title" style={{ fontSize: '0.95rem' }}>1. Dieta</div>
          <input className="form-control" value={diet} onChange={e => setDiet(e.target.value)} required />
        </div>

        {/* 2. MEDICAMENTOS */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-title" style={{ fontSize: '0.95rem' }}>2. Medicamentos e Soluções (Tabela de Aprazamento)</div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Item</th>
                  <th>Medicamento / Solução</th>
                  <th>Dose</th>
                  <th>Via</th>
                  <th>Frequência</th>
                  <th>Horários Aprazados</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.item}</td>
                    <td><strong>{m.name}</strong> {m.ifNeeded && <span className="badge-manchester badge-AMARELO">Se Necessário</span>}</td>
                    <td>{m.dose}</td>
                    <td>{m.via}</td>
                    <td>{m.freq}</td>
                    <td><input className="form-control" value={m.horários} onChange={e => {
                      const updated = [...medications];
                      updated[idx].horários = e.target.value;
                      setMedications(updated);
                    }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. ORIENTAÇÕES DE ENFERMAGEM */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-title" style={{ fontSize: '0.95rem' }}>3. Cuidados e Orientações de Enfermagem</div>
          <textarea className="form-control" rows={3} value={nursingInstructions.join('\n')} onChange={e => setNursingInstructions(e.target.value.split('\n'))} required />
        </div>

        {/* RODAPÉ DE CHECAGEM DA ENFERMAGEM (5 ASSINATURAS OPERACIONAIS) */}
        <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          <strong>ÁREA DE CHECAGEM OPERACIONAL DE ENFERMAGEM (5 ASSINATURAS):</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginTop: '0.5rem', textAlign: 'center' }}>
            <div style={{ border: '1px dashed #cbd5e1', padding: '0.4rem' }}>Técnico Tarde</div>
            <div style={{ border: '1px dashed #cbd5e1', padding: '0.4rem' }}>Técnico Noite</div>
            <div style={{ border: '1px dashed #cbd5e1', padding: '0.4rem' }}>Técnico Manhã</div>
            <div style={{ border: '1px dashed #cbd5e1', padding: '0.4rem' }}>Enfermeiro</div>
            <div style={{ border: '1px solid var(--brand-navy)', padding: '0.4rem', fontWeight: 800 }}>Médico Solicitante</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir PDF</button>
          <button type="submit" className="btn btn-primary">Emitir e Liberação de Prescrição</button>
        </div>
      </form>
    </div>
  );
}
