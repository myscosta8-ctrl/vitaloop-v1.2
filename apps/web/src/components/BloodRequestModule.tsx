import React, { useState } from 'react';

export interface BloodRequestModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSaveBloodRequest: (requestData: any) => void;
}

export function BloodRequestModule({ patient, attendance, user, onSaveBloodRequest }: BloodRequestModuleProps) {
  // Dados Automáticos (AUTOMÁTICO DO SISTEMA)
  const patientHeader = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    dataNascimento: patient?.birthDate || '14/11/1998',
    sexo: patient?.sex === 'F' ? 'Feminino' : 'Masculino',
    peso: '74.0 kg (Aferido na Triagem em 16/08 18:41)',
    hbHt: 'Hb: 6.4 g/dL | Ht: 20.9% (Coleta em 16/08 14:32 — Lab UPA)',
    hospital: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    setorLeito: 'SALA VERMELHA — LEITO 02',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    categoria: 'SUS / Urgência',
  };

  // Histórico e Antecedentes (CLÍNICO AUTOMATIZADO)
  const [transfusaosAnteriores, setTransfusaosAnteriores] = useState<'SIM' | 'NÃO' | 'DESCONHECIDO'>('SIM');
  const [dataUltimaTransfusao, setDataUltimaTransfusao] = useState('15/02/2025');
  const [anticorposIrregulares, setAnticorposIrregulares] = useState<'SIM' | 'NÃO' | 'DESCONHECIDO'>('DESCONHECIDO');
  const [solicitouDoadores, setSolicitouDoadores] = useState<boolean>(false);

  // Indicação Clínica (CLÍNICO AUTOMATIZADO)
  const [indicacaoClinica, setIndicacaoClinica] = useState(
    'Anemia aguda grave secundária a choque hemorrágico pós-traumatismo cranioencefálico com sangramento ativo e instabilidade hemodinâmica (Hb 6.4 g/dL).'
  );

  // Hemocomponentes / Hemoderivados Solicitados (CLÍNICO)
  const [selectedProduct, setSelectedProduct] = useState('Concentrado de hemácias pobre em leucócitos');
  const [quantityUnits, setQuantityUnits] = useState<number>(2);

  // Prioridade da Solicitação (CLÍNICO)
  const [prioridade, setPrioridade] = useState<string>('Urgência');
  const [extremaUrgencia, setExtremaUrgencia] = useState<boolean>(true);
  const [justificativaExtremaUrgencia, setJustificativaExtremaUrgencia] = useState(
    'DECLARAÇÃO DE EXTREMA URGÊNCIA: Risco iminente de morte por choque hemorrágico refratário. Autorizo a liberação do hemocomponente com testes pré-transfusionais compatibilizados na urgência.'
  );

  // Médico Solicitante (AUTOMÁTICO)
  const solicitante = {
    nomeMedico: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    crm: user?.registration || 'CRM/PA 14522',
    dataHoraSolicitacao: new Date().toLocaleString('pt-BR'),
    assinatura: 'Assinado eletronicamente via Vitaloop PEP (Selo de Autoria e Imutabilidade)',
  };

  // Registro Operacional de Coleta (OPERACIONAL)
  const [coletadoPor, setColetadoPor] = useState('ENF. MARCOS YAN (COREN/PA 64520)');
  const [dataHoraColeta, setDataHoraColeta] = useState(new Date().toLocaleString('pt-BR'));

  // Espaço Reservado Exclusivamente para a Fundação HEMOPA (HEMOTERAPIA)
  const hemopaReservedArea = {
    status: 'ESPAÇO RESERVADO EXCLUSIVAMENTE PARA USO DA FUNDAÇÃO HEMOPA',
    dataProcessamento: 'Pendente de recepção e processamento no Banco de Sangue / HEMOPA',
    produto: 'Pendente',
    grupoSanguineo: 'Pendente (A / B / AB / O — RhD)',
    volume: 'Pendente',
    resultadoPAI: 'Pendente (I / II / AC / CD)',
    tecnicoResponsavel: 'Pendente',
  };

  const handleGeneratePdf = () => {
    window.print();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bloodRequestSnapshot = {
      patientHeader,
      transfusaosAnteriores,
      dataUltimaTransfusao,
      anticorposIrregulares,
      solicitouDoadores,
      indicacaoClinica,
      selectedProduct,
      quantityUnits,
      prioridade,
      extremaUrgencia,
      justificativaExtremaUrgencia: extremaUrgencia ? justificativaExtremaUrgencia : null,
      solicitante,
      coletadoPor,
      dataHoraColeta,
      hemopaReservedArea,
    };
    onSaveBloodRequest(bloodRequestSnapshot);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.5rem', fontWeight: 800 }}>
            Solicitação de Sangue, Componentes e Derivados
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Formulário Oficial Fundação HEMOPA / Vitaloop PEP (Preenchimento inteligente derivado do prontuário)
          </p>
        </div>

        <button className="btn btn-mint" onClick={handleGeneratePdf}>
          🖨️ Imprimir Solicitação Transfusional (HEMOPA)
        </button>
      </div>

      {/* Legenda de Cores dos Campos */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', background: '#f8fafc' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.4rem' }}>
          LEGENDA DE PREENCHIMENTO INTELIGENTE:
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 700 }}>
          <span style={{ color: '#15803d' }}>🟢 Preenchido automaticamente (Sistema)</span>
          <span style={{ color: '#0369a1' }}>🔵 Decisão/Solicitação do Médico</span>
          <span style={{ color: '#b45309' }}>🟡 Sugestão do Prontuário / Exames</span>
          <span style={{ color: '#dc2626' }}>🔴 Área Exclusiva da Fundação HEMOPA</span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* IDENTIFICAÇÃO DO PACIENTE E LOCALIZAÇÃO (AUTOMÁTICO) */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Identificação do Paciente e Dados Laboratoriais</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO DO PRONTUÁRIO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>Paciente:</strong> {patientHeader.nome}</div>
            <div><strong>Nº Prontuário / Registro:</strong> {patientHeader.prontuario}</div>
            <div><strong>Data de Nascimento:</strong> {patientHeader.dataNascimento}</div>
            <div><strong>Sexo:</strong> {patientHeader.sexo}</div>
            <div><strong>Peso Aferido:</strong> {patientHeader.peso}</div>
            <div><strong>Laboratório (Hb / Ht):</strong> {patientHeader.hbHt}</div>
            <div><strong>Hospital / Unidade:</strong> {patientHeader.hospital}</div>
            <div><strong>Setor / Leito:</strong> {patientHeader.setorLeito}</div>
          </div>
        </div>

        {/* ANTECEDENTES E HISTÓRICO TRANSFUSIONAL */}
        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="card-title">
            <span>Antecedentes e Histórico Transfusional</span>
            <span className="badge-manchester badge-AMARELO">🟡 SUGESTÃO DO HISTÓRICO</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Recebeu Transfusão Anterior?</label>
              <select className="form-control" value={transfusaosAnteriores} onChange={e => setTransfusaosAnteriores(e.target.value as any)}>
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
                <option value="DESCONHECIDO">DESCONHECIDO</option>
              </select>
            </div>
            {transfusaosAnteriores === 'SIM' && (
              <div className="form-group">
                <label className="form-label">Data da Última Transfusão</label>
                <input className="form-control" value={dataUltimaTransfusao} onChange={e => setDataUltimaTransfusao(e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Antecedentes de Anticorpo Irregular</label>
              <select className="form-control" value={anticorposIrregulares} onChange={e => setAnticorposIrregulares(e.target.value as any)}>
                <option value="DESCONHECIDO">DESCONHECIDO</option>
                <option value="NÃO">NÃO</option>
                <option value="SIM">SIM</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Solicitou Doadores?</label>
              <select className="form-control" value={solicitouDoadores ? 'SIM' : 'NÃO'} onChange={e => setSolicitouDoadores(e.target.value === 'SIM')}>
                <option value="NÃO">NÃO</option>
                <option value="SIM">SIM</option>
              </select>
            </div>
          </div>
        </div>

        {/* INDICAÇÃO CLÍNICA / CIRURGIA PROPOSTA */}
        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="card-title">
            <span>Indicação Clínica / Motivo Transfusional</span>
            <span className="badge-manchester badge-AZUL">🔵 CLÍNICO / CONFIRMAÇÃO MÉDICA</span>
          </div>
          <div className="form-group">
            <label className="form-label">Indicação Clínica Detalhada para Transfusão *</label>
            <textarea className="form-control" rows={3} value={indicacaoClinica} onChange={e => setIndicacaoClinica(e.target.value)} required />
          </div>
        </div>

        {/* HEMOCOMPONENTES / HEMODERIVADOS SOLICITADOS */}
        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="card-title">
            <span>Hemocomponentes e Hemoderivados Solicitados</span>
            <span className="badge-manchester badge-AZUL">🔵 SELEÇÃO DO MÉDICO</span>
          </div>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Selecione o Hemocomponente (Tabela Oficial HEMOPA) *</label>
              <select className="form-control" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="Concentrado de hemácias pobre em leucócitos">Concentrado de hemácias pobre em leucócitos</option>
                <option value="Concentrado de hemácias">Concentrado de hemácias</option>
                <option value="Concentrado de hemácias pobre em leucócitos irradiado">Concentrado de hemácias pobre em leucócitos irradiado</option>
                <option value="Plasma fresco congelado">Plasma fresco congelado</option>
                <option value="Concentrado de plaquetas pobre em leucócitos">Concentrado de plaquetas pobre em leucócitos</option>
                <option value="Concentrado de plaquetas pobre em leucócitos irradiado">Concentrado de plaquetas pobre em leucócitos irradiado</option>
                <option value="Concentrado de plaquetas por aférese">Concentrado de plaquetas por aférese</option>
                <option value="Crioprecipitado">Crioprecipitado</option>
                <option value="Outros">Outros hemoderivados (Especificar)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade / Unidades (Bolsas) *</label>
              <input className="form-control" type="number" min="1" max="10" value={quantityUnits} onChange={e => setQuantityUnits(Number(e.target.value))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Prioridade da Solicitação *</label>
              <select className="form-control" value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                <option value="Urgência">Urgência (Realizar dentro de 3 horas)</option>
                <option value="Não urgente / rotina">Não urgente / rotina (Realizar dentro de 24 horas)</option>
                <option value="Programada">Programada (Cirurgia eletiva)</option>
                <option value="Transfusão em residência">Transfusão em residência</option>
                <option value="Autotransfusão">Autotransfusão</option>
              </select>
            </div>
          </div>
        </div>

        {/* TRANSFUSÃO DE EXTREMA URGÊNCIA */}
        <div className="card" style={{ borderLeft: '4px solid #dc2626', background: '#fef2f2' }}>
          <div className="card-title" style={{ color: '#b91c1c' }}>
            <span>Transfusão de Extrema Urgência (Declaração Médica de Risco de Morte)</span>
            <label style={{ fontSize: '0.85rem', cursor: 'pointer', color: '#b91c1c' }}>
              <input type="checkbox" checked={extremaUrgencia} onChange={e => setExtremaUrgencia(e.target.checked)} /> Declarar Extrema Urgência
            </label>
          </div>

          {extremaUrgencia && (
            <div className="form-group">
              <label className="form-label" style={{ color: '#b91c1c' }}>Termo de Responsabilidade e Assinatura por Extrema Urgência</label>
              <textarea className="form-control" rows={3} value={justificativaExtremaUrgencia} onChange={e => setJustificativaExtremaUrgencia(e.target.value)} required />
            </div>
          )}
        </div>

        {/* MÉDICO SOLICITANTE E COLETA */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Médico Solicitante e Registro Operacional de Coleta</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>Médico Solicitante:</strong> {solicitante.nomeMedico}</div>
            <div><strong>CRM:</strong> {solicitante.crm}</div>
            <div><strong>Data/Hora da Solicitação:</strong> {solicitante.dataHoraSolicitacao}</div>
            <div><strong>Coletado Por:</strong> {coletadoPor}</div>
            <div><strong>Data/Hora da Coleta:</strong> {dataHoraColeta}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Assinatura Eletrônica:</strong> {solicitante.assinatura}</div>
          </div>
        </div>

        {/* ÁREA RESERVADA EXCLUSIVAMENTE PARA USO DA FUNDAÇÃO HEMOPA */}
        <div className="card" style={{ border: '2px dashed #dc2626', background: '#fafafa' }}>
          <div className="card-title" style={{ color: '#dc2626' }}>
            <span>🔒 ESPAÇO RESERVADO EXCLUSIVAMENTE PARA USO DA FUNDAÇÃO HEMOPA</span>
            <span className="badge-manchester badge-VERMELHO">🔴 RESERVADO HEMOPA</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <div><strong>Data Processamento:</strong> {hemopaReservedArea.dataProcessamento}</div>
            <div><strong>Produto Liberado:</strong> {hemopaReservedArea.produto}</div>
            <div><strong>Grupo Sanguíneo (G.S.):</strong> {hemopaReservedArea.grupoSanguineo}</div>
            <div><strong>Volume (mL):</strong> {hemopaReservedArea.volume}</div>
            <div><strong>Resultado PAI (I/II/AC/CD):</strong> {hemopaReservedArea.resultadoPAI}</div>
            <div><strong>Técnico Responsável:</strong> {hemopaReservedArea.tecnicoResponsavel}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }} type="submit">
            Emitir Solicitação de Sangue e Encaminhar ao Banco de Sangue
          </button>
        </div>
      </form>
    </div>
  );
}
