-- =====================================================================
-- S0002 — Setores da UPA, catálogo de desfechos e tipos de documento.
-- Idempotente. Somente setores DA UPA (ADR-009).
-- =====================================================================

INSERT INTO upa_sectors(code, name) VALUES
  ('RECEPCAO','Recepção'),
  ('TRIAGEM','Triagem / Classificação de Risco'),
  ('CONSULTORIO','Consultórios Médicos'),
  ('OBSERVACAO','Sala de Observação'),
  ('EMERGENCIA','Sala de Emergência / Estabilização'),
  ('MEDICACAO','Sala de Medicação/Procedimentos'),
  ('ISOLAMENTO','Isolamento')
ON CONFLICT (code) DO NOTHING;

-- Desfechos (Master §36). requires_physician conforme regras assistenciais.
INSERT INTO outcomes(code, name, requires_physician) VALUES
  ('ALTA','Alta por melhora/condição clínica', true),
  ('TRANSFERENCIA','Transferência', true),
  ('OBITO','Óbito', true),
  ('EVASAO','Evasão', false),
  ('MELHOR_EM_CASA','Melhor em Casa (continuidade)', true),
  ('OUTRO','Outro (configurável)', false)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name, requires_physician = EXCLUDED.requires_physician;

-- Tipos de documento institucionais (modelos em docs/reference/institutional-forms).
-- require_full_print = true por padrão (DP-005).
INSERT INTO document_types(code, name, profession_scope, require_full_print) VALUES
  ('EVOLUCAO_MEDICA','Evolução Médica Diária','MEDICO', true),
  ('NOTA_INTERCORRENCIA_MEDICA','Nota de Intercorrência Médica','MEDICO', true),
  ('FICHA_ADMISSAO_MEDICA','Ficha de Admissão Médica','MEDICO', true),
  ('PRESCRICAO_MEDICA','Prescrição Médica','MEDICO', true),
  ('RECEITUARIO_MEDICO','Receituário Médico','MEDICO', true),
  ('SUMARIO_ALTA','Sumário de Alta','MEDICO', true),
  ('ATUALIZACAO_QUADRO_CLINICO','Atualização de Quadro Clínico','MEDICO', true),
  ('LAUDO_AIH','Laudo para Autorização de Internação Hospitalar (AIH)','MEDICO', true),
  ('SOLICITACAO_HEMOCOMPONENTE','Solicitação de Sangue, Componentes e Derivados','MEDICO', true),
  ('TFD','Tratamento Fora de Domicílio (TFD)','MEDICO', true),
  ('ADMISSAO_ENFERMAGEM','Histórico/Admissão de Enfermagem','ENFERMEIRO', true),
  ('EVOLUCAO_ENFERMAGEM','Evolução do Enfermeiro (SAE)','ENFERMEIRO', true),
  ('NOTA_INTERCORRENCIA_ENFERMAGEM','Nota de Intercorrência de Enfermagem','ENFERMEIRO', true),
  ('BALANCO_HIDRICO','Balanço Hídrico','ENFERMEIRO', true),
  ('PLANO_TERAPEUTICO','Plano Terapêutico','MULTI', true),
  ('SBAR_TRANSFERENCIA','Transferência Interna de Pacientes (SBAR)','MULTI', true),
  ('FORMULARIO_ANTIMICROBIANO','Formulário de Antimicrobiano (ATM)','MEDICO', true)
ON CONFLICT (code) DO NOTHING;

-- Versão 1 ativa para cada tipo de documento.
INSERT INTO document_versions(document_type_id, version, template_ref, active)
SELECT dt.id, 1, dt.code || '_v1', true FROM document_types dt
ON CONFLICT (document_type_id, version) DO NOTHING;
