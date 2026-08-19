import React, { useState } from 'react';

export interface AihModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSaveAih: (aihData: any) => void;
}

export function AihModule({ patient, attendance, user, onSaveAih }: AihModuleProps) {
  // Campos 1 a 4: Estabelecimento de Saúde (AUTOMÁTICO)
  const establishment = {
    solicitante: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    cnesSolicitante: '2748591',
    executante: 'HOSPITAL MUNICIPAL DE REFERÊNCIA (HMB)',
    cnesExecutante: '3819402',
  };

  // Campos 5 a 19: Identificação do Paciente (AUTOMÁTICO)
  const patientData = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    cns: patient?.cns || '704707717173434',
    dataNascimento: patient?.birthDate || '14/11/1998',
    sexo: patient?.sex === 'F' ? 'Feminino' : 'Masculino',
    racaCor: 'Parda',
    etnia: 'Não declarada',
    nomeMae: patient?.motherName || 'ODILENE SILVA PINHEIRO',
    telefone: patient?.phone || '(91) 98452-1102',
    responsavel: 'MARCOS PINHEIRO DE SOUZA (IRMÃO)',
    telefoneResponsavel: '(91) 98452-1102',
    endereco: 'RUA PRINCIPAL, Nº 142 — BAIRRO CENTRO',
    municipio: patient?.cityOfOrigin || 'BAGRE',
    ibgeCode: '1501200',
    uf: 'PA',
    cep: '68475-000',
  };

  // Campo 20: Principais sinais e sintomas clínicos (CLÍNICO AUTOMATIZADO)
  const [sintomasClinicos, setSintomasClinicos] = useState(
    'Paciente admitido proveniente de Bagre/PA pós-trauma cranioencefálico grave. Apresenta cefaleia holocraniana intensa, vômitos em jato, otorragia à direita e rebaixamento do nível de consciência (Glasgow 4).'
  );

  // Campo 21: Condições que justificam a internação (CLÍNICO)
  const [justificativaInternacao, setJustificativaInternacao] = useState(
    'Necessidade imperiosa de suporte de UTI Neurológica, monitoração de pressão intracraniana (PIC), controle neurointensivo e suporte ventilatório mecânico pós-trauma grave.'
  );

  // Campo 22: Principais resultados de provas diagnósticas (CLÍNICO AUTOMATIZADO)
  const [selectedExams, setSelectedExams] = useState<string[]>([
    'TC CRÂNIO (07/08): Fratura temporoparietal à direita com hematoma subgaleal e hemorragia subaracnoidea grave.',
    'GASOMETRIA ARTERIAL: pH 7.45 | pO2 130 | pCO2 28 | HCO3 23 | SatO2 98%',
    'HEMOGRAMA: Leucócitos 23.230/mm³ (Desvio à esquerda), Plaquetas 278.000',
  ]);

  // Campos 23 a 26: Diagnóstico e CIDs (CLÍNICO / CLÍNICO AUTOMATIZADO)
  const [diagnosticoInicial, setDiagnosticoInicial] = useState('TRAUMATISMO CRANIOENCEFÁLICO GRAVE COM HEMORRAGIA SUBARACNOIDEA');
  const [cidPrincipal, setCidPrincipal] = useState('S06.2 - Traumatismo cerebral difuso');
  const [cidSecundario, setCidSecundario] = useState('I60.9 - Hemorragia subaracnoidea não especificada');
  const [cidCausasAssociadas, setCidCausasAssociadas] = useState('G96.0 - Fístula liquórica');

  // Campos 27 a 28: Procedimento Solicitado e Código SUS (CLÍNICO AUTOMATIZADO + AUTOMÁTICO)
  const [procedimentoSolicitado, setProcedimentoSolicitado] = useState('TRATAMENTO DE TRAUMATISMO CRANIOENCEFÁLICO GRAVE EM UTI');
  const [codigoProcedimento, setCodigoProcedimento] = useState('03.03.14.009-8');

  // Campos 29 a 30: Clínica e Caráter (CLÍNICO AUTOMATIZADO)
  const [clinica, setClinica] = useState('UTI ADULTO');
  const [caraterInternacao, setCaraterInternacao] = useState<'Emergência' | 'Eletivo'>('Emergência');

  // Campos 31 a 35: Documentos e Solicitante (AUTOMÁTICO)
  const solicitante = {
    documentoPaciente: patientData.cns || '034.900.072-71',
    crm: user?.registration || 'CRM/PA 14522',
    nomeMedico: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    dataSolicitacao: new Date().toLocaleDateString('pt-BR'),
    assinatura: 'Assinado eletronicamente via Vitaloop PEP (Selo de Autoria e Imutabilidade)',
  };

  // Campos 36 a 45: Causas Externas (CONDICIONAL)
  const [isCausaExterna, setIsCausaExterna] = useState<boolean>(true);
  const [causaExternaDetails, setCausaExternaDetails] = useState({
    acidenteTransito: false,
    acidenteTrabalhoTipico: true,
    acidenteTrabalhoTrajeto: false,
    cnpjSeguradora: '',
    numBilhete: '',
    serie: '',
    cnpjEmpresa: '04.123.456/0001-89',
    cnaeEmpresa: '4120-4/00',
    cbo: '7152-10',
    vinculoPrevidencia: 'CLT / Empregado Regido pela CLT',
  });

  // Campos 46 a 52: Autorização Administrativa (AUTORIZAÇÃO - PENDENTE)
  const autorizacao = {
    nomeAutorizador: 'Aguardando Regulação Externa SUS / SERG',
    orgaoEmissor: 'Central Estadual de Regulação de Leitos (CERL-PA)',
    documentoAutorizador: 'Pendente',
    numDocumentoAutorizador: 'Pendente',
    dataAutorizacao: 'Pendente de emissão',
    assinaturaAutorizador: 'Pendente',
    numAih: 'Pendente de concessão',
  };

  const handleGeneratePdf = () => {
    alert('Laudo de AIH oficial gerado com sucesso! Pronto para impressão ou envio à Central de Regulação.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fullAihSnapshot = {
      establishment,
      patientData,
      sintomasClinicos,
      justificativaInternacao,
      selectedExams,
      diagnosticoInicial,
      cidPrincipal,
      cidSecundario,
      cidCausasAssociadas,
      procedimentoSolicitado,
      codigoProcedimento,
      clinica,
      caraterInternacao,
      solicitante,
      isCausaExterna,
      causaExternaDetails: isCausaExterna ? causaExternaDetails : null,
      autorizacao,
      fieldsMappedCount: 52,
    };
    onSaveAih(fullAihSnapshot);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.5rem', fontWeight: 800 }}>
            Laudo para Solicitação de AIH
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Dados preenchidos automaticamente a partir do prontuário (Mapeamento dos 52 campos oficiais)
          </p>
        </div>

        <button className="btn btn-mint" onClick={handleGeneratePdf}>
          🖨️ Visualizar / Imprimir Laudo de AIH (PDF)
        </button>
      </div>

      {/* Legenda de Cores dos Campos */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', background: '#f8fafc' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.4rem' }}>
          LEGENDA DE PREENCHIMENTO INTELIGENTE:
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 700 }}>
          <span style={{ color: '#15803d' }}>🟢 Preenchido automaticamente (Sistema)</span>
          <span style={{ color: '#0369a1' }}>🔵 Preenchido pelo médico</span>
          <span style={{ color: '#b45309' }}>🟡 Sugestão do sistema (Revisão pelo médico)</span>
          <span style={{ color: '#64748b' }}>⚪ Pendente de autorização (Regulação)</span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* CAMPOS 1 A 4: ESTABELECIMENTO DE SAÚDE (AUTOMÁTICO) */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 1 a 4 — Estabelecimento de Saúde</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO DO SISTEMA</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>1 — Nome Estabelecimento Solicitante:</strong> {establishment.solicitante}</div>
            <div><strong>2 — CNES Solicitante:</strong> {establishment.cnesSolicitante}</div>
            <div><strong>3 — Nome Estabelecimento Executante:</strong> {establishment.executante}</div>
            <div><strong>4 — CNES Executante:</strong> {establishment.cnesExecutante}</div>
          </div>
        </div>

        {/* CAMPOS 5 A 19: IDENTIFICAÇÃO DO PACIENTE (AUTOMÁTICO) */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 5 a 19 — Identificação do Paciente</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO DO CADASTRO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>5 — Nome do Paciente:</strong> {patientData.nome}</div>
            <div><strong>6 — Nº do Prontuário:</strong> {patientData.prontuario}</div>
            <div><strong>7 — Cartão SUS (CNS):</strong> {patientData.cns}</div>
            <div><strong>8 — Data de Nascimento:</strong> {patientData.dataNascimento}</div>
            <div><strong>9 — Sexo:</strong> {patientData.sexo}</div>
            <div><strong>10 — Raça/Cor:</strong> {patientData.racaCor}</div>
            <div><strong>10.1 — Etnia:</strong> {patientData.etnia}</div>
            <div><strong>11 — Nome da Mãe:</strong> {patientData.nomeMae}</div>
            <div><strong>12 — Telefone de Contato:</strong> {patientData.telefone}</div>
            <div><strong>13 — Responsável:</strong> {patientData.responsavel}</div>
            <div><strong>14 — Telefone Responsável:</strong> {patientData.telefoneResponsavel}</div>
            <div><strong>15 — Endereço:</strong> {patientData.endereco}</div>
            <div><strong>16 — Município de Residência:</strong> {patientData.municipio}</div>
            <div><strong>17 — Código IBGE:</strong> {patientData.ibgeCode}</div>
            <div><strong>18 — UF:</strong> {patientData.uf}</div>
            <div><strong>19 — CEP:</strong> {patientData.cep}</div>
          </div>
        </div>

        {/* CAMPO 20: PRINCIPAIS SINAIS E SINTOMAS CLÍNICOS (CLÍNICO AUTOMATIZADO) */}
        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="card-title">
            <span>Campo 20 — Principais Sinais e Sintomas Clínicos</span>
            <span className="badge-manchester badge-AMARELO">🟡 SUGESTÃO DO PRONTUÁRIO</span>
          </div>
          <div className="form-group">
            <label className="form-label">Sinais e Sintomas Registrados na Triagem / Anamnese</label>
            <textarea className="form-control" rows={3} value={sintomasClinicos} onChange={e => setSintomasClinicos(e.target.value)} required />
          </div>
        </div>

        {/* CAMPO 21: CONDIÇÕES QUE JUSTIFICAM A INTERNAÇÃO (CLÍNICO) */}
        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="card-title">
            <span>Campo 21 — Condições que Justificam a Internação</span>
            <span className="badge-manchester badge-AZUL">🔵 PREENCHIDO PELO MÉDICO</span>
          </div>
          <div className="form-group">
            <label className="form-label">Justificativa Médica para Internação Hospitalar</label>
            <textarea className="form-control" rows={3} value={justificativaInternacao} onChange={e => setJustificativaInternacao(e.target.value)} required />
          </div>
        </div>

        {/* CAMPO 22: PRINCIPAIS RESULTADOS DE PROVAS DIAGNÓSTICAS (CLÍNICO AUTOMATIZADO) */}
        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="card-title">
            <span>Campo 22 — Principais Resultados de Provas Diagnósticas</span>
            <span className="badge-manchester badge-AMARELO">🟡 SUGESTÃO DOS EXAMES DO EPISÓDIO</span>
          </div>
          <div className="form-group">
            <label className="form-label">Selecione/Revise os Exames Relevantes para Justificar a AIH</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.3rem' }}>
              {selectedExams.map((ex, idx) => (
                <div key={idx} style={{ padding: '0.6rem 0.85rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '0.88rem' }}>
                  ✓ {ex}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CAMPOS 23 A 26: DIAGNÓSTICO E CIDS */}
        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="card-title">
            <span>Campos 23 a 26 — Diagnóstico e CIDs</span>
            <span className="badge-manchester badge-AZUL">🔵 CLÍNICO / DIAGNÓSTICOS</span>
          </div>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">23 — Diagnóstico Inicial</label>
              <input className="form-control" value={diagnosticoInicial} onChange={e => setDiagnosticoInicial(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">24 — CID-10 Principal *</label>
              <input className="form-control" value={cidPrincipal} onChange={e => setCidPrincipal(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">25 — CID-10 Secundário</label>
              <input className="form-control" value={cidSecundario} onChange={e => setCidSecundario(e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">26 — CID-10 Causas Associadas</label>
              <input className="form-control" value={cidCausasAssociadas} onChange={e => setCidCausasAssociadas(e.target.value)} />
            </div>
          </div>
        </div>

        {/* CAMPOS 27 A 28: PROCEDIMENTO SOLICITADO E CÓDIGO SUS */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 27 e 28 — Procedimento Solicitado e Código SUS</span>
            <span className="badge-manchester badge-VERDE">🟢 CÓDIGO AUTOMÁTICO</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">27 — Descrição do Procedimento Solicitado</label>
              <select className="form-control" value={procedimentoSolicitado} onChange={e => {
                setProcedimentoSolicitado(e.target.value);
                if (e.target.value.includes('UTI')) setCodigoProcedimento('03.03.14.009-8');
                else setCodigoProcedimento('03.03.01.006-2');
              }}>
                <option value="TRATAMENTO DE TRAUMATISMO CRANIOENCEFÁLICO GRAVE EM UTI">TRATAMENTO DE TRAUMATISMO CRANIOENCEFÁLICO GRAVE EM UTI</option>
                <option value="TRATAMENTO DE ACIDENTE VASCULAR CEREBRAL (AVC) EM UTI">TRATAMENTO DE ACIDENTE VASCULAR CEREBRAL (AVC) EM UTI</option>
                <option value="TRATAMENTO CLINICO DE PACIENTE EM ENFERMARIA">TRATAMENTO CLINICO DE PACIENTE EM ENFERMARIA</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">28 — Código do Procedimento SUS (Automático)</label>
              <input className="form-control" value={codigoProcedimento} disabled style={{ background: '#f1f5f9', fontWeight: 800 }} />
            </div>
          </div>
        </div>

        {/* CAMPOS 29 A 30: CLÍNICA E CARÁTER DA INTERNAÇÃO */}
        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="card-title">
            <span>Campos 29 e 30 — Clínica e Caráter da Internação</span>
            <span className="badge-manchester badge-AMARELO">🟡 SUGESTÃO CONTEXTUAL</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">29 — Clínica de Internação</label>
              <select className="form-control" value={clinica} onChange={e => setClinica(e.target.value)}>
                <option value="UTI ADULTO">UTI ADULTO</option>
                <option value="CLÍNICA MÉDICA">CLÍNICA MÉDICA</option>
                <option value="PEDIATRIA">PEDIATRIA</option>
                <option value="CIRÚRGICA">CIRÚRGICA</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">30 — Caráter da Internação</label>
              <select className="form-control" value={caraterInternacao} onChange={e => setCaraterInternacao(e.target.value as any)}>
                <option value="Emergência">Emergência</option>
                <option value="Eletivo">Eletivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* CAMPOS 31 A 35: DOCUMENTOS E SOLICITANTE */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 31 a 35 — Profissional Solicitante e Autenticação</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO / USUÁRIO LOGADO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>31 — Documento do Paciente:</strong> {solicitante.documentoPaciente}</div>
            <div><strong>32 — Reg. Profissional:</strong> {solicitante.crm}</div>
            <div><strong>33 — Nome Profissional Solicitante:</strong> {solicitante.nomeMedico}</div>
            <div><strong>34 — Data da Solicitação:</strong> {solicitante.dataSolicitacao}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>35 — Assinatura e Carimbo:</strong> {solicitante.assinatura}</div>
          </div>
        </div>

        {/* CAMPOS 36 A 45: CAUSAS EXTERNAS (CONDICIONAL) */}
        <div className="card" style={{ borderLeft: '4px solid #cbd5e1' }}>
          <div className="card-title">
            <span>Campos 36 a 45 — Causas Externas (Acidentes / Violências)</span>
            <label style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isCausaExterna} onChange={e => setIsCausaExterna(e.target.checked)} /> Causa Externa Indicada
            </label>
          </div>

          {isCausaExterna ? (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">37 — Acidente de Trânsito</label>
                <select className="form-control" value={causaExternaDetails.acidenteTransito ? 'Sim' : 'Não'} onChange={e => setCausaExternaDetails({ ...causaExternaDetails, acidenteTransito: e.target.value === 'Sim' })}>
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">38 — Acidente de Trabalho Típico</label>
                <select className="form-control" value={causaExternaDetails.acidenteTrabalhoTipico ? 'Sim' : 'Não'} onChange={e => setCausaExternaDetails({ ...causaExternaDetails, acidenteTrabalhoTipico: e.target.value === 'Sim' })}>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">43 — CNPJ Empresa</label>
                <input className="form-control" value={causaExternaDetails.cnpjEmpresa} onChange={e => setCausaExternaDetails({ ...causaExternaDetails, cnpjEmpresa: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">44 — CNAE Empresa</label>
                <input className="form-control" value={causaExternaDetails.cnaeEmpresa} onChange={e => setCausaExternaDetails({ ...causaExternaDetails, cnaeEmpresa: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">45 — Vínculo com a Previdência</label>
                <input className="form-control" value={causaExternaDetails.vinculoPrevidencia} onChange={e => setCausaExternaDetails({ ...causaExternaDetails, vinculoPrevidencia: e.target.value })} />
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Campos de causas externas dispensados para este atendimento.</div>
          )}
        </div>

        {/* CAMPOS 46 A 52: AUTORIZAÇÃO ADMINISTRATIVA (AUTORIZAÇÃO - PENDENTE) */}
        <div className="card" style={{ borderLeft: '4px solid #94a3b8' }}>
          <div className="card-title">
            <span>Campos 46 a 52 — Autorização de Internação Hospitalar</span>
            <span className="badge-manchester" style={{ background: '#64748b' }}>⚪ PENDENTE DE AUTORIZAÇÃO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem', color: '#64748b' }}>
            <div><strong>46 — Nome Autorizador:</strong> {autorizacao.nomeAutorizador}</div>
            <div><strong>47 — Órgão Emissor:</strong> {autorizacao.orgaoEmissor}</div>
            <div><strong>48 — Documento Autorizador:</strong> {autorizacao.documentoAutorizador}</div>
            <div><strong>49 — Nº Documento:</strong> {autorizacao.numDocumentoAutorizador}</div>
            <div><strong>50 — Data Autorização:</strong> {autorizacao.dataAutorizacao}</div>
            <div><strong>51 — Assinatura Autorizador:</strong> {autorizacao.assinaturaAutorizador}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>52 — Nº da Autorização de Internação Hospitalar (AIH):</strong> {autorizacao.numAih}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }} type="submit">
            Confeccionar e Liberar Laudo de AIH no Prontuário
          </button>
        </div>
      </form>
    </div>
  );
}
