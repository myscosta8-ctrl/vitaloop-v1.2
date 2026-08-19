-- =====================================================================
-- V0010 — Segurança do paciente, comissões, notificações, acesso externo.
-- Master §9 (acesso interunidade), §53–54, §58; STATE_MACHINES §7.
-- =====================================================================

CREATE TYPE safety_event_status AS ENUM ('NOTIFICADO','EM_ANALISE','COM_CONDUTA','ENCERRADO');

CREATE TABLE patient_safety_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendances(id),   -- pode ser nulo
  type          text NOT NULL,           -- queda | erro_medicacao | identificacao | ...
  severity      text,
  description   text NOT NULL,
  reported_by   uuid NOT NULL REFERENCES users(id),
  reported_at   timestamptz NOT NULL DEFAULT now(),
  action        text,
  status        safety_event_status NOT NULL DEFAULT 'NOTIFICADO',
  closed_at     timestamptz
);
CREATE INDEX safety_att_idx ON patient_safety_events (attendance_id);

CREATE TABLE commissions (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code    text UNIQUE,
  name    text NOT NULL,              -- CCIH | Nucleo Seguranca | Comissao Obito ...
  active  boolean NOT NULL DEFAULT true
);
CREATE TABLE commission_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id uuid NOT NULL REFERENCES commissions(id),
  user_id      uuid NOT NULL REFERENCES users(id),
  role_in_commission text,
  active       boolean NOT NULL DEFAULT true,
  UNIQUE (commission_id, user_id)
);
CREATE TABLE commission_meetings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id uuid NOT NULL REFERENCES commissions(id),
  held_at      timestamptz NOT NULL,
  minutes      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE commission_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id uuid NOT NULL REFERENCES commissions(id),
  title        text NOT NULL,
  storage_key  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE commission_action_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id uuid NOT NULL REFERENCES commissions(id),
  description  text NOT NULL,
  status       text NOT NULL DEFAULT 'ABERTO',
  due_date     date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id),
  type       text NOT NULL,
  title      text NOT NULL,
  message    text,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata   jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX notifications_user_idx ON notifications (user_id) WHERE read_at IS NULL;

-- Acesso excepcional interunidade (Master §9; RBAC §13). Não é break glass:
-- exige justificativa e é auditado. can_access_attendance pode consultá-lo no futuro.
CREATE TABLE external_access_grants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id),
  patient_id     uuid NOT NULL REFERENCES patients(id),
  attendance_id  uuid REFERENCES attendances(id),
  justification  text NOT NULL,
  granted_at     timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz,
  revoked_at     timestamptz
);
CREATE INDEX ext_access_user_idx ON external_access_grants (user_id);

GRANT SELECT, INSERT, UPDATE ON patient_safety_events TO vitaloop_app;
GRANT SELECT ON commissions, commission_members TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON commission_meetings, commission_documents,
  commission_action_plans, notifications TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON external_access_grants TO vitaloop_app;

ALTER TABLE patient_safety_events  ENABLE ROW LEVEL SECURITY; ALTER TABLE patient_safety_events  FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY; ALTER TABLE notifications          FORCE ROW LEVEL SECURITY;
ALTER TABLE external_access_grants ENABLE ROW LEVEL SECURITY; ALTER TABLE external_access_grants FORCE ROW LEVEL SECURITY;

CREATE POLICY safety_read ON patient_safety_events FOR SELECT
  USING (has_permission(app.current_user_id(),'safety_event.read')
         OR reported_by = app.current_user_id());
CREATE POLICY safety_write ON patient_safety_events FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'safety_event.create'));
CREATE POLICY safety_update ON patient_safety_events FOR UPDATE
  USING (has_permission(app.current_user_id(),'safety_event.create'));

-- Notificação pertence ao usuário.
CREATE POLICY notif_owner ON notifications FOR SELECT
  USING (user_id = app.current_user_id());
CREATE POLICY notif_update ON notifications FOR UPDATE
  USING (user_id = app.current_user_id());

CREATE POLICY extaccess_read ON external_access_grants FOR SELECT
  USING (user_id = app.current_user_id()
         OR has_permission(app.current_user_id(),'audit.read'));
CREATE POLICY extaccess_write ON external_access_grants FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'admin.external_access.grant'));
