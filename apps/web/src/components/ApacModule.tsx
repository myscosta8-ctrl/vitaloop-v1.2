import React, { useState } from 'react';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

export interface ApacModuleProps {
  patient: any;
  attendance: any;
  user: any;
  onSaveApac: (apacData: any) => void;
}

export function ApacModule({ patient, attendance, user, onSaveApac }: ApacModuleProps) {
  // Campos 1 a 2: Estabelecimento Solicitante (AUTOMÁTICO)
  const establishment = {
    nome: 'UNIDADE DE PRONTO ATENDIMENTO — VITALOOP UPA 24H',
    cnes: '2748591',
  };

  // Campos 3 a 14: Identificação do Paciente (AUTOMÁTICO)
  const patientData = {
    nome: patient?.fullName || 'SADRAQUE PINHEIRO DE SOUZA',
    prontuario: patient?.medicalRecordNumber || 'PRONT-137603',
    cns: patient?.cns || '704707717173434',
    dataNascimento: patient?.birthDate || '14/11/1998',
    sexo: patient?.sex === 'F' ? 'Feminino' : 'Masculino',
    nomeMae: patient?.motherName || 'ODILENE SILVA PINHEIRO',
    telefone: patient?.phone || '(91) 98452-1102',
    endereco: 'RUA PRINCIPAL, Nº 142 — BAIRRO CENTRO',
    municipio: patient?.cityOfOrigin || 'BAGRE',
    ibgeCode: '1501200',
    uf: 'PA',
    cep: '68475-000',
  };

  // Campos 15 a 32: Tabela de Procedimentos Solicitados (até 6 linhas) (CLÍNICO AUTOMATIZADO + AUTOMÁTICO)
  const [procedures, setProcedures] = useState([
    { code: '02.04.01.008-0', name: 'TOMOGRAFIA COMPUTADORIZADA DE CRÂNIO', qty: 1 },
    { code: '02.02.01.031-7', name: 'GASOMETRIA ARTERIAL', qty: 2 },
    { code: '02.02.02.038-0', name: 'HEMOGRAMA COMPLETO', qty: 1 },
  ]);

  // Campo 33: Descrição do Procedimento / Anamnese (CLÍNICO AUTOMATIZADO)
  const [descricaoProcedimento, setDescricaoProcedimento] = useState(
    'Solicitação de exames de imagem neurodiagnóstica e controle laboratorial de urgência pós-trauma craniano grave para reavaliação de conduta cirúrgica.'
  );

  // Campos 34 a 36: CID-10 Principal, Secundário e Causas Associadas (CLÍNICO AUTOMATIZADO / CLÍNICO)
  const [cidPrincipal, setCidPrincipal] = useState('S06.2 - Traumatismo cerebral difuso');
  const [cidSecundario, setCidSecundario] = useState('I60.9 - Hemorragia subaracnoidea não especificada');
  const [cidCausasAssociadas, setCidCausasAssociadas] = useState('G96.0 - Fístula liquórica');

  // Campo 37: Justificativa Clínica da Indicação (CLÍNICO AUTOMATIZADO)
  const [justificativaClinica, setJustificativaClinica] = useState(
    'Paciente em acompanhamento de urgência na UPA por traumatismo craniano grave. Exames necessários para definir necessidade de intervenção neurocirúrgica e transferência para leito de alta complexidade.'
  );

  // Campos 38 a 42: Solicitante (AUTOMÁTICO)
  const solicitante = {
    nomeProfissional: user?.name || 'DR. THALES DJALON CHAGAS DE ARAUJO',
    dataSolicitacao: new Date().toLocaleDateString('pt-BR'),
    tipoDocumento: 'CRM',
    numDocumento: user?.registration || 'CRM/PA 14522',
    assinatura: 'Assinado eletronicamente via Vitaloop PEP (Selo de Autoria e Imutabilidade)',
  };

  // Campos 43 a 50: Autorização Administrativa / APAC (AUTORIZAÇÃO - PENDENTE)
  const autorizacao = {
    nomeAutorizador: 'Pendente de análise pela Central de Regulação Ambulatorial',
    codigoOrgaoEmissor: 'CER-PA/01',
    documentoAutorizador: 'Pendente',
    numDocumentoAutorizador: 'Pendente',
    dataAutorizacao: 'Pendente de emissão',
    assinaturaAutorizador: 'Pendente',
    numApac: 'Pendente de emissão',
    validadeApac: 'Pendente de concessão',
  };

  // Campos 51 a 52: Estabelecimento Executante (AUTOMÁTICO)
  const executante = {
    nomeFantasia: 'CENTRO DIAGNÓSTICO DE ALTA COMPLEXIDADE (CEDIM)',
    cnes: '3948201',
  };

  const handleGeneratePdf = () => {
    window.print();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const apacSnapshot = {
      establishment,
      patientData,
      procedures,
      descricaoProcedimento,
      cidPrincipal,
      cidSecundario,
      cidCausasAssociadas,
      justificativaClinica,
      solicitante,
      autorizacao,
      executante,
      fieldsMappedCount: 52,
    };
    onSaveApac(apacSnapshot);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <InstitutionalPrintHeader documentTitle="LAUDO PARA SOLICITAÇÃO / AUTORIZAÇÃO DE APAC (SUS)" />
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.5rem', fontWeight: 800 }}>
            Laudo para Solicitação / Autorização de Procedimento Ambulatorial (APAC)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Dados preenchidos automaticamente a partir do prontuário (Mapeamento dos 52 campos oficiais)
          </p>
        </div>

        <button className="btn btn-mint" onClick={handleGeneratePdf}>
          🖨️ Visualizar / Imprimir Laudo APAC (PDF)
        </button>
      </div>

      {/* Legenda de Cores dos Campos */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', background: '#f8fafc' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.4rem' }}>
          LEGENDA DE PREENCHIMENTO INTELIGENTE:
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 700 }}>
          <span style={{ color: '#15803d' }}>🟢 Preenchido automaticamente (Sistema)</span>
          <span style={{ color: '#0369a1' }}>🔵 Preenchido pelo profissional</span>
          <span style={{ color: '#b45309' }}>🟡 Sugestão do sistema (Revisão pelo profissional)</span>
          <span style={{ color: '#64748b' }}>⚪ Pendente de autorização (Regulação / APAC)</span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* CAMPOS 1 A 2: ESTABELECIMENTO SOLICITANTE (AUTOMÁTICO) */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 1 a 2 — Estabelecimento Solicitante</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO DO SISTEMA</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>1 — Nome do Estabelecimento de Saúde:</strong> {establishment.nome}</div>
            <div><strong>2 — CNES Solicitante:</strong> {establishment.cnes}</div>
          </div>
        </div>

        {/* CAMPOS 3 A 14: IDENTIFICAÇÃO DO PACIENTE (AUTOMÁTICO) */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 3 a 14 — Identificação do Paciente</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO DO CADASTRO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>3 — Nome do Paciente:</strong> {patientData.nome}</div>
            <div><strong>4 — Nº do Prontuário:</strong> {patientData.prontuario}</div>
            <div><strong>5 — Cartão SUS (CNS):</strong> {patientData.cns}</div>
            <div><strong>6 — Data de Nascimento:</strong> {patientData.dataNascimento}</div>
            <div><strong>7 — Sexo:</strong> {patientData.sexo}</div>
            <div><strong>8 — Nome da Mãe / Responsável:</strong> {patientData.nomeMae}</div>
            <div><strong>9 — Telefone de Contato:</strong> {patientData.telefone}</div>
            <div><strong>10 — Endereço:</strong> {patientData.endereco}</div>
            <div><strong>11 — Município de Residência:</strong> {patientData.municipio}</div>
            <div><strong>12 — Código IBGE:</strong> {patientData.ibgeCode}</div>
            <div><strong>13 — UF:</strong> {patientData.uf}</div>
            <div><strong>14 — CEP:</strong> {patientData.cep}</div>
          </div>
        </div>

        {/* CAMPOS 15 A 32: PROCEDIMENTOS SOLICITADOS (CLÍNICO AUTOMATIZADO) */}
        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="card-title">
            <span>Campos 15 a 32 — Procedimentos Solicitados (Até 6 itens)</span>
            <span className="badge-manchester badge-AMARELO">🟡 CÓDIGOS AUTOMÁTICOS / SELEÇÃO</span>
          </div>
          <div className="table-responsive" style={{ marginBottom: '0.5rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Código SUS (Automático)</th>
                  <th>Nome do Procedimento Principal</th>
                  <th style={{ width: '15%' }}>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {procedures.map((p, idx) => (
                  <tr key={idx}>
                    <td><strong>{p.code}</strong></td>
                    <td>{p.name}</td>
                    <td>
                      <input
                        className="form-control"
                        type="number"
                        min="1"
                        value={p.qty}
                        onChange={e => {
                          const updated = [...procedures];
                          updated[idx].qty = Number(e.target.value);
                          setProcedures(updated);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CAMPO 33: DESCRIÇÃO DO PROCEDIMENTO / JUSTIFICATIVA (CLÍNICO AUTOMATIZADO) */}
        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="card-title">
            <span>Campo 33 — Descrição do Procedimento / Anamnese</span>
            <span className="badge-manchester badge-AMARELO">🟡 SUGESTÃO DO PRONTUÁRIO</span>
          </div>
          <div className="form-group">
            <label className="form-label">Descrição e Indicação Registradas no Atendimento</label>
            <textarea className="form-control" rows={3} value={descricaoProcedimento} onChange={e => setDescricaoProcedimento(e.target.value)} required />
          </div>
        </div>

        {/* CAMPOS 34 A 36: DIAGNÓSTICO E CIDS */}
        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="card-title">
            <span>Campos 34 a 36 — Diagnóstico e CIDs</span>
            <span className="badge-manchester badge-AZUL">🔵 CLÍNICO / CONFIRMAÇÃO</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">34 — CID-10 Principal *</label>
              <input className="form-control" value={cidPrincipal} onChange={e => setCidPrincipal(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">35 — CID-10 Secundário</label>
              <input className="form-control" value={cidSecundario} onChange={e => setCidSecundario(e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">36 — CID-10 Causas Associadas</label>
              <input className="form-control" value={cidCausasAssociadas} onChange={e => setCidCausasAssociadas(e.target.value)} />
            </div>
          </div>
        </div>

        {/* CAMPO 37: JUSTIFICATIVA CLÍNICA DA INDICAÇÃO */}
        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="card-title">
            <span>Campo 37 — Justificativa Clínica da Indicação</span>
            <span className="badge-manchester badge-AZUL">🔵 CLÍNICO / DECISÃO</span>
          </div>
          <div className="form-group">
            <label className="form-label">Justificativa da Necessidade Ambulatorial Especializada</label>
            <textarea className="form-control" rows={3} value={justificativaClinica} onChange={e => setJustificativaClinica(e.target.value)} required />
          </div>
        </div>

        {/* CAMPOS 38 A 42: SOLICITAÇÃO E PROFISSIONAL SOLICITANTE */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 38 a 42 — Profissional Solicitante e Autenticação</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO / USUÁRIO LOGADO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>38 — Nome Profissional Solicitante:</strong> {solicitante.nomeProfissional}</div>
            <div><strong>39 — Data da Solicitação:</strong> {solicitante.dataSolicitacao}</div>
            <div><strong>40 — Tipo de Documento:</strong> {solicitante.tipoDocumento}</div>
            <div><strong>41 — Nº do Documento Profissional:</strong> {solicitante.numDocumento}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>42 — Assinatura e Carimbo:</strong> {solicitante.assinatura}</div>
          </div>
        </div>

        {/* CAMPOS 43 A 50: AUTORIZAÇÃO ADMINISTRATIVA / APAC (AUTORIZAÇÃO - PENDENTE) */}
        <div className="card" style={{ borderLeft: '4px solid #94a3b8' }}>
          <div className="card-title">
            <span>Campos 43 a 50 — Autorização de Procedimento Ambulatorial (APAC)</span>
            <span className="badge-manchester" style={{ background: '#64748b' }}>⚪ PENDENTE DE AUTORIZAÇÃO</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem', color: '#64748b' }}>
            <div><strong>43 — Nome Profissional Autorizador:</strong> {autorizacao.nomeAutorizador}</div>
            <div><strong>44 — Código Órgão Emissor:</strong> {autorizacao.codigoOrgaoEmissor}</div>
            <div><strong>45 — Documento Autorizador:</strong> {autorizacao.documentoAutorizador}</div>
            <div><strong>46 — Nº Documento Autorizador:</strong> {autorizacao.numDocumentoAutorizador}</div>
            <div><strong>47 — Data da Autorização:</strong> {autorizacao.dataAutorizacao}</div>
            <div><strong>48 — Assinatura Autorizador:</strong> {autorizacao.assinaturaAutorizador}</div>
            <div><strong>49 — Nº da APAC:</strong> {autorizacao.numApac}</div>
            <div><strong>50 — Período Validade APAC:</strong> {autorizacao.validadeApac}</div>
          </div>
        </div>

        {/* CAMPOS 51 A 52: ESTABELECIMENTO EXECUTANTE */}
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="card-title">
            <span>Campos 51 e 52 — Estabelecimento Executante</span>
            <span className="badge-manchester badge-VERDE">🟢 AUTOMÁTICO DA UNIDADE EXECUTANTE</span>
          </div>
          <div className="form-grid" style={{ fontSize: '0.88rem' }}>
            <div><strong>51 — Nome Fantasia Executante:</strong> {executante.nomeFantasia}</div>
            <div><strong>52 — CNES Executante:</strong> {executante.cnes}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }} type="submit">
            Confeccionar e Liberar Laudo de APAC no Prontuário
          </button>
        </div>
      </form>
    </div>
  );
}
