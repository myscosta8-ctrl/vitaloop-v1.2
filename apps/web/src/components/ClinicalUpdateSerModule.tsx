import React, { useState } from 'react';

export interface ClinicalUpdateSerModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSave: (data: any) => void;
}

export function ClinicalUpdateSerModule({ patient, attendance, user, onSave }: ClinicalUpdateSerModuleProps) {
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    leito: 'SALA DE ESTABILIZAÇÃO — LEITO 02 (SER)',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    dataHora: new Date().toLocaleString('pt-BR'),
  };

  const [evolucaoQuadro, setEvolucaoQuadro] = useState(
    'Paciente em Sala de Estabilização (SER) sob monitoração neurointensiva contínua pós-TCE grave. Apresenta estabilização dos parâmetros hemodinâmicos após infusão de solução hipertônica. Manter sedação contínua e cabeceira elevada a 30º.'
  );

  const [tendenciaQuadro, setTendenciaQuadro] = useState<'Estável' | 'Melhora' | 'Piora' | 'Gravíssimo'>('Estável');
  const [condutasAdotadas, setCondutasAdotadas] = useState('Manter DVA se PAM < 75 mmHg; Solicitar controle gasométrico em 2 horas.');

  const physician = {
    nome: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
    assinatura: 'Assinado eletronicamente via Vitaloop PEP (Selo de Autoria e Imutabilidade)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ patientHeader, evolucaoQuadro, tendenciaQuadro, condutasAdotadas, physician });
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📄 Atualização de Quadro Clínico — SER</span>
        <span className="badge-manchester badge-AZUL">DOC MÉDICO</span>
      </div>

      <div className="alert alert-info" style={{ fontSize: '0.85rem' }}>
        🟢 Dados de identificação, prontuário, leito e CRM recuperados automaticamente do prontuário.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1.2rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
          <div><strong>Paciente:</strong> {patientHeader.nome}</div>
          <div><strong>Prontuário:</strong> {patientHeader.prontuario}</div>
          <div><strong>Localização:</strong> {patientHeader.leito}</div>
          <div><strong>Data/Hora:</strong> {patientHeader.dataHora}</div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Tendência do Quadro Clínico *</label>
          <select className="form-control" value={tendenciaQuadro} onChange={e => setTendenciaQuadro(e.target.value as any)}>
            <option value="Estável">🟢 Estável</option>
            <option value="Melhora">🟢 Melhora Clínica</option>
            <option value="Piora">🔴 Piora / Alerta</option>
            <option value="Gravíssimo">🔴 Gravíssimo / Risco Imutável</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Registro de Evolução e Atualização de Quadro (SER) *</label>
          <textarea className="form-control" rows={4} value={evolucaoQuadro} onChange={e => setEvolucaoQuadro(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Condutas Imediatas e Parâmetros de Alerta</label>
          <textarea className="form-control" rows={2} value={condutasAdotadas} onChange={e => setCondutasAdotadas(e.target.value)} />
        </div>

        <div className="form-grid" style={{ fontSize: '0.88rem', marginBottom: '1.2rem', background: '#f1f5f9', padding: '0.85rem', borderRadius: '6px' }}>
          <div><strong>Médico Solicitante:</strong> {physician.nome}</div>
          <div><strong>CRM:</strong> {physician.crm}</div>
          <div style={{ gridColumn: '1 / -1' }}><strong>Selo de Autenticação:</strong> {physician.assinatura}</div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            🖨️ Imprimir PDF
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar e Assinar no Prontuário
          </button>
        </div>
      </form>
    </div>
  );
}
