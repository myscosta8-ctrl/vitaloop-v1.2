-- =====================================================================
-- V0007 — Leitos e ocupação única (MARCO 8). Master §22, §28–31; ADR-007.
-- =====================================================================

CREATE TYPE bed_state AS ENUM
  ('LIVRE','OCUPADO','INTERDITADO','MANUTENCAO',
   'LEITO_EXTRA_DISPONIVEL','LEITO_EXTRA_OCUPADO','DESATIVADO');

CREATE TABLE beds (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text NOT NULL UNIQUE,
  name              text,
  state             bed_state NOT NULL DEFAULT 'LIVRE',
  is_extra          boolean NOT NULL DEFAULT false,
  isolation_reason  text,               -- isolamento identificado por motivo (§28)
  description       text,               -- característica dinâmica (ex.: obstétrico)
  active            boolean NOT NULL DEFAULT true,
  extra_empty_since timestamptz,        -- p/ fechamento de extra após 30min (§28)
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER beds_touch BEFORE UPDATE ON beds
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE bed_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id        uuid NOT NULL REFERENCES beds(id),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  assigned_by   uuid NOT NULL REFERENCES users(id),
  released_at   timestamptz,
  released_by   uuid REFERENCES users(id)
);
-- Invariantes de concorrência garantidas no banco (ADR-007):
--   um leito tem no máximo UMA alocação ativa;
--   um atendimento tem no máximo UM leito ativo.
CREATE UNIQUE INDEX bed_single_active_occupant
  ON bed_assignments (bed_id) WHERE released_at IS NULL;
CREATE UNIQUE INDEX attendance_single_active_bed
  ON bed_assignments (attendance_id) WHERE released_at IS NULL;
CREATE INDEX bed_assign_att_idx ON bed_assignments (attendance_id);

CREATE TABLE bed_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id     uuid NOT NULL REFERENCES beds(id),
  event_type text NOT NULL,       -- ASSIGN | RELEASE | STATE_CHANGE
  from_state bed_state,
  to_state   bed_state,
  attendance_id uuid REFERENCES attendances(id),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by  uuid REFERENCES users(id),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX bed_events_bed_idx ON bed_events (bed_id, occurred_at);
CREATE TRIGGER bed_events_no_update BEFORE UPDATE ON bed_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();
CREATE TRIGGER bed_events_no_delete BEFORE DELETE ON bed_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();

GRANT SELECT, INSERT, UPDATE ON beds, bed_assignments TO vitaloop_app;
GRANT SELECT, INSERT ON bed_events TO vitaloop_app;

ALTER TABLE beds            ENABLE ROW LEVEL SECURITY; ALTER TABLE beds            FORCE ROW LEVEL SECURITY;
ALTER TABLE bed_assignments ENABLE ROW LEVEL SECURITY; ALTER TABLE bed_assignments FORCE ROW LEVEL SECURITY;

CREATE POLICY beds_read ON beds FOR SELECT
  USING (has_permission(app.current_user_id(),'bed.read'));
CREATE POLICY beds_update ON beds FOR UPDATE
  USING (has_permission(app.current_user_id(),'bed.manage'));
CREATE POLICY beds_insert ON beds FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'bed.manage'));

CREATE POLICY bedassign_read ON bed_assignments FOR SELECT
  USING (has_permission(app.current_user_id(),'bed.read'));
CREATE POLICY bedassign_create ON bed_assignments FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'bed.assign')
              AND can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY bedassign_release ON bed_assignments FOR UPDATE
  USING (has_permission(app.current_user_id(),'bed.release'));
