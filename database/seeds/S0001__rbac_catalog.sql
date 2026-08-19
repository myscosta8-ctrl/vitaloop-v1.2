-- =====================================================================
-- S0001 — Catálogo RBAC: profissões, permissões, funções e mapeamento.
-- Idempotente. Deriva de docs/RBAC_RLS.md e VITALOOP_UPA_RBAC_RLS.md.
-- Seed de configuração — nunca dados de paciente (Master §67).
-- =====================================================================

INSERT INTO professions(code, name) VALUES
  ('MEDICO','Médico'),
  ('ENFERMEIRO','Enfermeiro'),
  ('TECNICO_ENFERMAGEM','Técnico de Enfermagem'),
  ('FISIOTERAPEUTA','Fisioterapeuta'),
  ('PSICOLOGO','Psicólogo'),
  ('ASSISTENTE_SOCIAL','Assistente Social'),
  ('FARMACEUTICO','Farmacêutico'),
  ('ADMINISTRATIVO','Administrativo')
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions(code, description) VALUES
  ('patient.read','Ler paciente'),
  ('patient.create','Criar paciente'),
  ('patient.update_demographic','Atualizar dados demográficos'),
  ('attendance.read','Ler atendimento'),
  ('attendance.create','Abrir atendimento'),
  ('attendance.update','Atualizar/transicionar atendimento'),
  ('triage.create','Registrar triagem'),
  ('vitalsign.create','Registrar sinais vitais'),
  ('medical.evolution.create','Criar/assinar evolução médica'),
  ('medical.prescription.create','Criar prescrição médica'),
  ('nursing.admission.create','Admissão de enfermagem'),
  ('nursing.history.create','Histórico de enfermagem'),
  ('nursing.evolution.create','Evolução de enfermagem (privativa do enfermeiro)'),
  ('nursing.note.create','Anotação de enfermagem (técnico)'),
  ('nursing.prescription.create','Prescrição de enfermagem'),
  ('exam.request.create','Solicitar exame'),
  ('exam.result.read','Ler resultado de exame'),
  ('exam.result.attach','Anexar/liberar resultado'),
  ('interconsultation.create','Solicitar interconsulta'),
  ('interconsultation.respond','Responder interconsulta'),
  ('document.read','Ler documento'),
  ('document.create','Criar documento'),
  ('document.sign','Assinar/liberar documento'),
  ('document.inactivate','Inativar documento'),
  ('document.print','Imprimir documento'),
  ('document.reprint','Reimprimir documento'),
  ('bed.read','Ler leitos'),
  ('bed.assign','Alocar leito'),
  ('bed.release','Liberar leito'),
  ('bed.manage','Gerenciar leitos'),
  ('transfer.create','Solicitar transferência'),
  ('regulation.create','Registrar regulação'),
  ('outcome.create','Registrar desfecho'),
  ('outcome.physician','Registrar desfecho privativo do médico (alta/óbito)'),
  ('aih.create','Preencher AIH'),
  ('aih.validate','Validar AIH'),
  ('sigtap.read','Consultar SIGTAP'),
  ('pharmacy.dispense','Dispensar medicamento'),
  ('inventory.manage','Gerenciar estoque'),
  ('safety_event.create','Notificar evento de segurança'),
  ('safety_event.read','Ler eventos de segurança'),
  ('commission.manage','Gerenciar comissões'),
  ('audit.read','Ler auditoria'),
  ('audit.manage','Gerenciar auditoria'),
  ('admin.users.read','Administrar usuários'),
  ('admin.sessions.manage','Gerenciar sessões'),
  ('admin.external_access.grant','Conceder acesso interunidade')
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles(code, name) VALUES
  ('ADMINISTRACAO','Administração'),
  ('DIRECAO','Direção'),
  ('COORDENACAO','Coordenação'),
  ('MEDICO','Médico'),
  ('ENFERMEIRO','Enfermeiro'),
  ('TECNICO_ENFERMAGEM','Técnico de Enfermagem'),
  ('FISIOTERAPEUTA','Fisioterapeuta'),
  ('PSICOLOGO','Psicólogo'),
  ('ASSISTENTE_SOCIAL','Assistente Social'),
  ('FARMACIA','Farmácia'),
  ('RESPONSAVEL_RESULTADOS','Responsável por Resultados'),
  ('ADMINISTRATIVO','Administrativo'),
  ('SAME_AUDITORIA','SAME / Auditoria')
ON CONFLICT (code) DO NOTHING;

-- Mapeamento função → permissão (matriz RBAC §4).
WITH m(role_code, perm_code) AS (VALUES
  -- ADMINISTRACAO (sistema): usuários, sessões, acesso externo, auditoria
  ('ADMINISTRACAO','admin.users.read'),('ADMINISTRACAO','admin.sessions.manage'),
  ('ADMINISTRACAO','admin.external_access.grant'),('ADMINISTRACAO','audit.read'),
  ('ADMINISTRACAO','patient.read'),
  -- DIRECAO / COORDENACAO (leitura/gestão)
  ('DIRECAO','patient.read'),('DIRECAO','attendance.read'),('DIRECAO','document.read'),
  ('DIRECAO','document.print'),('DIRECAO','audit.read'),('DIRECAO','commission.manage'),
  ('COORDENACAO','patient.read'),('COORDENACAO','attendance.read'),('COORDENACAO','document.read'),
  ('COORDENACAO','document.print'),('COORDENACAO','bed.read'),('COORDENACAO','bed.manage'),
  ('COORDENACAO','audit.read'),
  -- MEDICO
  ('MEDICO','patient.read'),('MEDICO','attendance.read'),('MEDICO','attendance.update'),
  ('MEDICO','vitalsign.create'),
  ('MEDICO','medical.evolution.create'),('MEDICO','medical.prescription.create'),
  ('MEDICO','exam.request.create'),('MEDICO','exam.result.read'),
  ('MEDICO','interconsultation.create'),('MEDICO','interconsultation.respond'),
  ('MEDICO','document.read'),('MEDICO','document.create'),('MEDICO','document.sign'),
  ('MEDICO','document.inactivate'),('MEDICO','document.print'),('MEDICO','document.reprint'),
  ('MEDICO','bed.read'),('MEDICO','bed.assign'),
  ('MEDICO','transfer.create'),('MEDICO','regulation.create'),
  ('MEDICO','outcome.create'),('MEDICO','outcome.physician'),
  ('MEDICO','aih.create'),('MEDICO','sigtap.read'),
  ('MEDICO','safety_event.create'),('MEDICO','safety_event.read'),
  -- ENFERMEIRO
  ('ENFERMEIRO','patient.read'),('ENFERMEIRO','attendance.read'),('ENFERMEIRO','attendance.update'),
  ('ENFERMEIRO','triage.create'),('ENFERMEIRO','vitalsign.create'),
  ('ENFERMEIRO','nursing.admission.create'),('ENFERMEIRO','nursing.history.create'),
  ('ENFERMEIRO','nursing.evolution.create'),('ENFERMEIRO','nursing.note.create'),
  ('ENFERMEIRO','nursing.prescription.create'),
  ('ENFERMEIRO','exam.request.create'),('ENFERMEIRO','exam.result.read'),
  ('ENFERMEIRO','interconsultation.create'),('ENFERMEIRO','interconsultation.respond'),
  ('ENFERMEIRO','document.read'),('ENFERMEIRO','document.create'),('ENFERMEIRO','document.sign'),
  ('ENFERMEIRO','document.inactivate'),('ENFERMEIRO','document.print'),
  ('ENFERMEIRO','bed.read'),('ENFERMEIRO','bed.assign'),('ENFERMEIRO','bed.release'),
  ('ENFERMEIRO','bed.manage'),
  ('ENFERMEIRO','transfer.create'),
  ('ENFERMEIRO','outcome.create'),  -- pode registrar evasão (não outcome.physician)
  ('ENFERMEIRO','safety_event.create'),('ENFERMEIRO','safety_event.read'),
  -- TECNICO DE ENFERMAGEM (sem evolução/prescrição — Master §11)
  ('TECNICO_ENFERMAGEM','patient.read'),('TECNICO_ENFERMAGEM','attendance.read'),
  ('TECNICO_ENFERMAGEM','triage.create'),('TECNICO_ENFERMAGEM','vitalsign.create'),
  ('TECNICO_ENFERMAGEM','nursing.note.create'),
  ('TECNICO_ENFERMAGEM','exam.result.read'),('TECNICO_ENFERMAGEM','document.read'),
  ('TECNICO_ENFERMAGEM','outcome.create'),  -- evasão; óbito exige outcome.physician
  ('TECNICO_ENFERMAGEM','safety_event.create'),
  -- FISIOTERAPEUTA / PSICOLOGO / ASSISTENTE_SOCIAL (assistenciais próprios)
  ('FISIOTERAPEUTA','patient.read'),('FISIOTERAPEUTA','attendance.read'),
  ('FISIOTERAPEUTA','document.read'),('FISIOTERAPEUTA','document.create'),
  ('FISIOTERAPEUTA','document.sign'),('FISIOTERAPEUTA','document.print'),
  ('FISIOTERAPEUTA','interconsultation.respond'),('FISIOTERAPEUTA','safety_event.create'),
  ('PSICOLOGO','patient.read'),('PSICOLOGO','attendance.read'),
  ('PSICOLOGO','document.read'),('PSICOLOGO','document.create'),
  ('PSICOLOGO','document.sign'),('PSICOLOGO','document.print'),
  ('PSICOLOGO','interconsultation.respond'),('PSICOLOGO','safety_event.create'),
  ('ASSISTENTE_SOCIAL','patient.read'),('ASSISTENTE_SOCIAL','attendance.read'),
  ('ASSISTENTE_SOCIAL','document.read'),('ASSISTENTE_SOCIAL','document.create'),
  ('ASSISTENTE_SOCIAL','document.sign'),('ASSISTENTE_SOCIAL','document.print'),
  ('ASSISTENTE_SOCIAL','interconsultation.create'),('ASSISTENTE_SOCIAL','interconsultation.respond'),
  ('ASSISTENTE_SOCIAL','safety_event.create'),
  -- FARMACIA (consulta prescrição via attendance.read; dispensa; estoque)
  ('FARMACIA','patient.read'),('FARMACIA','attendance.read'),
  ('FARMACIA','document.read'),('FARMACIA','pharmacy.dispense'),('FARMACIA','inventory.manage'),
  ('FARMACIA','sigtap.read'),
  -- RESPONSAVEL_RESULTADOS (anexa/lê resultado)
  ('RESPONSAVEL_RESULTADOS','patient.read'),('RESPONSAVEL_RESULTADOS','attendance.read'),
  ('RESPONSAVEL_RESULTADOS','exam.result.read'),('RESPONSAVEL_RESULTADOS','exam.result.attach'),
  ('RESPONSAVEL_RESULTADOS','document.read'),
  -- ADMINISTRATIVO (recepção)
  ('ADMINISTRATIVO','patient.read'),('ADMINISTRATIVO','patient.create'),
  ('ADMINISTRATIVO','patient.update_demographic'),('ADMINISTRATIVO','attendance.create'),
  ('ADMINISTRATIVO','attendance.read'),('ADMINISTRATIVO','document.print'),
  -- SAME / AUDITORIA (consulta sem alterar conteúdo clínico)
  ('SAME_AUDITORIA','patient.read'),('SAME_AUDITORIA','attendance.read'),
  ('SAME_AUDITORIA','document.read'),('SAME_AUDITORIA','document.print'),
  ('SAME_AUDITORIA','exam.result.read'),
  ('SAME_AUDITORIA','audit.read'),('SAME_AUDITORIA','audit.manage')
)
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM m JOIN roles r ON r.code = m.role_code
       JOIN permissions p ON p.code = m.perm_code
ON CONFLICT DO NOTHING;
