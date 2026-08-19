-- =====================================================================
-- V0003 — Atendimento, episódio, eventos, triagem (MARCO 2/3).
-- Master §4.2, §13; STATE_MACHINES §1; ADR-003.
-- =====================================================================

CREATE TYPE attendance_status AS ENUM
  ('ABERTO','EM_TRIAGEM','EM_ATENDIMENTO','OBSERVACAO','ENCERRADO');

CREATE TABLE upa_attendance_episodes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  opened_at  timestamptz NOT NULL DEFAULT now(),
  closed_at  timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX episodes_patient_idx ON upa_attendance_episodes (patient_id);

CREATE TABLE attendances (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES patients(id),
  episode_id  uuid REFERENCES upa_attendance_episodes(id),
  sector_id   uuid NOT NULL REFERENCES upa_sectors(id),
  status      attendance_status NOT NULL DEFAULT 'ABERTO',
  type        text,
  reason      text,
  opened_at   timestamptz NOT NULL DEFAULT now(),
  opened_by   uuid NOT NULL REFERENCES users(id),
  closed_at   timestamptz,
  closed_by   uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  -- Coerência de fechamento (Master §6): encerrado ⇔ tem closed_at/closed_by.
  CONSTRAINT attendance_closed_coherent CHECK (
    (status = 'ENCERRADO' AND closed_at IS NOT NULL AND closed_by IS NOT NULL)
    OR (status <> 'ENCERRADO' AND closed_at IS NULL)
  )
);
CREATE INDEX attendances_patient_idx ON attendances (patient_id);
CREATE INDEX attendances_open_idx ON attendances (status) WHERE status <> 'ENCERRADO';
CREATE INDEX attendances_opened_at_idx ON attendances (opened_at);
CREATE TRIGGER attendances_touch BEFORE UPDATE ON attendances
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

-- Transições válidas do atendimento (STATE_MACHINES §1). ENCERRADO é terminal.
CREATE OR REPLACE FUNCTION app.enforce_attendance_transition() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF OLD.status = 'ENCERRADO' THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: atendimento encerrado não reabre'
      USING ERRCODE = 'check_violation';
  END IF;
  IF NOT (
      (OLD.status = 'ABERTO'          AND NEW.status IN ('EM_TRIAGEM','EM_ATENDIMENTO','ENCERRADO'))
   OR (OLD.status = 'EM_TRIAGEM'      AND NEW.status IN ('EM_ATENDIMENTO','ENCERRADO'))
   OR (OLD.status = 'EM_ATENDIMENTO'  AND NEW.status IN ('OBSERVACAO','ENCERRADO'))
   OR (OLD.status = 'OBSERVACAO'      AND NEW.status IN ('EM_ATENDIMENTO','ENCERRADO'))
  ) THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER attendances_transition BEFORE UPDATE OF status ON attendances
  FOR EACH ROW EXECUTE FUNCTION app.enforce_attendance_transition();

-- Eventos assistenciais: append-only (Master §7).
CREATE TABLE attendance_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  event_type    text NOT NULL,       -- OPENED, TRIAGE_DONE, ACTIVE_SEARCH, ...
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES users(id),
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX attendance_events_att_idx ON attendance_events (attendance_id, occurred_at);
CREATE TRIGGER att_events_no_update BEFORE UPDATE ON attendance_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();
CREATE TRIGGER att_events_no_delete BEFORE DELETE ON attendance_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();

-- Acesso contextual a um atendimento (RBAC §14). Base: exige attendance.read e
-- usuário ativo. Escopo por setor/profissão e acesso interunidade são refinados
-- em can_access_attendance (ver external_access_grants em V0010).
CREATE OR REPLACE FUNCTION can_access_attendance(p_user uuid, p_attendance uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT has_permission(p_user, 'attendance.read')
     AND EXISTS (SELECT 1 FROM attendances a WHERE a.id = p_attendance);
$$;
GRANT EXECUTE ON FUNCTION can_access_attendance(uuid, uuid) TO vitaloop_app;

-- ---------------------------------------------------------------------
-- Triagem e sinais vitais (Master §13)
-- ---------------------------------------------------------------------
CREATE TABLE triages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id  uuid NOT NULL REFERENCES attendances(id),
  professional_id uuid NOT NULL REFERENCES users(id),
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  complaint      text,
  classification text,     -- protocolo definido em DP-001 (configurável)
  priority       int,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX triages_att_idx ON triages (attendance_id);

CREATE TABLE vital_signs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id    uuid NOT NULL REFERENCES attendances(id),
  recorded_at      timestamptz NOT NULL DEFAULT now(),
  professional_id  uuid NOT NULL REFERENCES users(id),
  temperature      numeric(4,1),
  heart_rate       int,
  respiratory_rate int,
  systolic_bp      int,
  diastolic_bp     int,
  oxygen_saturation int,
  pain_scale       int CHECK (pain_scale BETWEEN 0 AND 10 OR pain_scale IS NULL),
  weight           numeric(5,2),
  glucose          int
);
CREATE INDEX vital_signs_att_idx ON vital_signs (attendance_id, recorded_at);

GRANT SELECT, INSERT, UPDATE ON attendances, upa_attendance_episodes TO vitaloop_app;
GRANT SELECT, INSERT ON attendance_events, vital_signs TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON triages TO vitaloop_app;

-- RLS
ALTER TABLE attendances       ENABLE ROW LEVEL SECURITY; ALTER TABLE attendances       FORCE ROW LEVEL SECURITY;
ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY; ALTER TABLE attendance_events FORCE ROW LEVEL SECURITY;
ALTER TABLE triages           ENABLE ROW LEVEL SECURITY; ALTER TABLE triages           FORCE ROW LEVEL SECURITY;
ALTER TABLE vital_signs       ENABLE ROW LEVEL SECURITY; ALTER TABLE vital_signs       FORCE ROW LEVEL SECURITY;
ALTER TABLE upa_attendance_episodes ENABLE ROW LEVEL SECURITY; ALTER TABLE upa_attendance_episodes FORCE ROW LEVEL SECURITY;

CREATE POLICY att_read ON attendances FOR SELECT
  USING (can_access_attendance(app.current_user_id(), id));
CREATE POLICY att_create ON attendances FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'attendance.create'));
CREATE POLICY att_update ON attendances FOR UPDATE
  USING (has_permission(app.current_user_id(), 'attendance.update')
         AND can_access_attendance(app.current_user_id(), id));

CREATE POLICY episodes_read ON upa_attendance_episodes FOR SELECT
  USING (has_permission(app.current_user_id(), 'attendance.read'));
CREATE POLICY episodes_write ON upa_attendance_episodes FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'attendance.create'));

CREATE POLICY events_read ON attendance_events FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY events_write ON attendance_events FOR INSERT
  WITH CHECK (can_access_attendance(app.current_user_id(), attendance_id));

CREATE POLICY triage_read ON triages FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY triage_create ON triages FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'triage.create')
             AND can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY triage_update ON triages FOR UPDATE
  USING (has_permission(app.current_user_id(), 'triage.create')
         AND can_access_attendance(app.current_user_id(), attendance_id));

CREATE POLICY vitals_read ON vital_signs FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY vitals_write ON vital_signs FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'vitalsign.create')
             AND can_access_attendance(app.current_user_id(), attendance_id));
