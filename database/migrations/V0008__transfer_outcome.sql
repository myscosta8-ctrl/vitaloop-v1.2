-- =====================================================================
-- V0008 — Transferência, regulação, desfechos, SBAR e encerramento atômico.
-- Master §32–38, §59, §61; STATE_MACHINES §5/§6; ADR-005/009.
-- =====================================================================

CREATE TYPE transfer_status AS ENUM ('SOLICITADA','RECUSADA','CANCELADA','ACEITA','PACIENTE_SAIU');

CREATE TABLE transfers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id    uuid NOT NULL REFERENCES attendances(id),
  type             text NOT NULL,        -- HMB | EXTERNA | PORTA_ABERTA | OUTRO_CONFIGURADO
  destination_name text,                 -- destino externo: apenas referência
  destination_type text,
  status           transfer_status NOT NULL DEFAULT 'SOLICITADA',
  reason           text,
  requested_at     timestamptz NOT NULL DEFAULT now(),
  requested_by     uuid NOT NULL REFERENCES users(id),
  accepted_at      timestamptz,
  departed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transfers_att_idx ON transfers (attendance_id);
CREATE TRIGGER transfers_touch BEFORE UPDATE ON transfers
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE regulations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id  uuid NOT NULL REFERENCES attendances(id),
  transfer_id    uuid REFERENCES transfers(id),
  system_name    text,                   -- ex.: SISREG (integração, não módulo)
  request_number text,
  status         text NOT NULL DEFAULT 'SOLICITADA',
  destination    text,
  requested_at   timestamptz NOT NULL DEFAULT now(),
  response_at    timestamptz,
  notes          text
);
CREATE INDEX regulations_att_idx ON regulations (attendance_id);

-- Catálogo de desfechos (Master §36).
CREATE TABLE outcomes (
  code               text PRIMARY KEY,   -- ALTA, TRANSFERENCIA, OBITO, EVASAO, MELHOR_EM_CASA, OUTRO
  name               text NOT NULL,
  requires_physician boolean NOT NULL DEFAULT false,
  active             boolean NOT NULL DEFAULT true
);

CREATE TABLE attendance_outcomes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL UNIQUE REFERENCES attendances(id),  -- um desfecho por atendimento
  outcome_code  text NOT NULL REFERENCES outcomes(code),
  recorded_by   uuid NOT NULL REFERENCES users(id),
  recorded_at   timestamptz NOT NULL DEFAULT now(),
  notes         text
);

CREATE TABLE handover_sbar (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  author_id     uuid NOT NULL REFERENCES users(id),
  situation      text,
  background     text,
  assessment     text,
  recommendation text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sbar_att_idx ON handover_sbar (attendance_id);

-- ---------------------------------------------------------------------
-- Encerramento atômico do atendimento (Master §61, Arquitetura §15).
-- Autoriza -> registra desfecho -> libera leito -> encerra -> audita, tudo em
-- uma transação. SECURITY DEFINER: a função é a "camada única de autorização"
-- (checa permissões explicitamente) e então executa os passos internos.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION close_attendance(
  p_attendance uuid, p_outcome_code text, p_notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_user   uuid := app.current_user_id();
  v_reqmd  boolean;
  v_status attendance_status;
  v_bed    uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED_ACTION'; END IF;

  SELECT requires_physician INTO v_reqmd FROM outcomes WHERE code = p_outcome_code AND active;
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_OUTCOME: %', p_outcome_code; END IF;

  IF NOT has_permission(v_user, 'outcome.create') THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ACTION: sem permissão de desfecho'; END IF;
  IF v_reqmd AND NOT has_permission(v_user, 'outcome.physician') THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ACTION: desfecho % exige médico', p_outcome_code; END IF;
  IF NOT can_access_attendance(v_user, p_attendance) THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ACTION: atendimento inacessível'; END IF;

  SELECT status INTO v_status FROM attendances WHERE id = p_attendance FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ATTENDANCE_NOT_FOUND'; END IF;
  IF v_status = 'ENCERRADO' THEN RAISE EXCEPTION 'ATTENDANCE_ALREADY_CLOSED'; END IF;

  INSERT INTO attendance_outcomes(attendance_id, outcome_code, recorded_by, notes)
    VALUES (p_attendance, p_outcome_code, v_user, p_notes);

  -- Libera o leito ativo, se houver (Master §37: leito imediatamente livre).
  SELECT bed_id INTO v_bed FROM bed_assignments
    WHERE attendance_id = p_attendance AND released_at IS NULL FOR UPDATE;
  IF v_bed IS NOT NULL THEN
    UPDATE bed_assignments SET released_at = now(), released_by = v_user
      WHERE attendance_id = p_attendance AND released_at IS NULL;
    UPDATE beds SET
        state = CASE WHEN is_extra THEN 'LEITO_EXTRA_DISPONIVEL'::bed_state ELSE 'LIVRE'::bed_state END,
        extra_empty_since = CASE WHEN is_extra THEN now() ELSE extra_empty_since END
      WHERE id = v_bed;
    INSERT INTO bed_events(bed_id, event_type, to_state, attendance_id, created_by)
      VALUES (v_bed, 'RELEASE', 'LIVRE', p_attendance, v_user);
  END IF;

  UPDATE attendances
    SET status = 'ENCERRADO', closed_at = now(), closed_by = v_user
    WHERE id = p_attendance;

  INSERT INTO audit_events(actor_id, action, entity_type, entity_id, metadata)
    VALUES (v_user, 'OUTCOME', 'attendance', p_attendance::text,
            jsonb_build_object('outcome', p_outcome_code));
END $$;
GRANT EXECUTE ON FUNCTION close_attendance(uuid, text, text) TO vitaloop_app;

GRANT SELECT ON outcomes TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON transfers, regulations TO vitaloop_app;
GRANT SELECT, INSERT ON attendance_outcomes, handover_sbar TO vitaloop_app;

ALTER TABLE transfers           ENABLE ROW LEVEL SECURITY; ALTER TABLE transfers           FORCE ROW LEVEL SECURITY;
ALTER TABLE regulations         ENABLE ROW LEVEL SECURITY; ALTER TABLE regulations         FORCE ROW LEVEL SECURITY;
ALTER TABLE attendance_outcomes ENABLE ROW LEVEL SECURITY; ALTER TABLE attendance_outcomes FORCE ROW LEVEL SECURITY;
ALTER TABLE handover_sbar       ENABLE ROW LEVEL SECURITY; ALTER TABLE handover_sbar       FORCE ROW LEVEL SECURITY;

CREATE POLICY transfers_read ON transfers FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY transfers_create ON transfers FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'transfer.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY transfers_update ON transfers FOR UPDATE
  USING (has_permission(app.current_user_id(),'transfer.create')
         AND can_access_attendance(app.current_user_id(), attendance_id));

CREATE POLICY regulations_read ON regulations FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY regulations_write ON regulations FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'regulation.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));

CREATE POLICY outcomes_read ON attendance_outcomes FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
-- Escrita de desfecho é feita via close_attendance (SECURITY DEFINER); política
-- de INSERT direto exige a permissão como defesa adicional.
CREATE POLICY outcomes_write ON attendance_outcomes FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'outcome.create'));

CREATE POLICY sbar_read ON handover_sbar FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY sbar_write ON handover_sbar FOR INSERT
  WITH CHECK (can_access_attendance(app.current_user_id(), attendance_id));
