-- =====================================================================
-- V0004 — Registros clínicos: evoluções médicas e de enfermagem (MARCO 4/5).
-- Master §14–17; STATE_MACHINES §2; ADR-004 (imutabilidade).
-- =====================================================================

CREATE TYPE clinical_status AS ENUM ('RASCUNHO','FINALIZADO','LIBERADO','INATIVADO');

-- Imutabilidade genérica após liberação (reutilizada por documentos em V0006).
-- Depende de a tabela ter a coluna `status clinical_status`/`document_status`.
CREATE OR REPLACE FUNCTION app.enforce_immutable_after_release() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  allowed text[] := ARRAY['status','finalized_at','signed_at','signed_by',
                          'inactivated_at','inactivated_by','inactivation_reason','updated_at'];
  o jsonb := to_jsonb(OLD);
  n jsonb := to_jsonb(NEW);
  k text;
BEGIN
  IF OLD.status::text = 'INATIVADO' THEN
    RAISE EXCEPTION 'DOCUMENT_ALREADY_INACTIVATED' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status::text = 'LIBERADO' THEN
    IF NEW.status::text <> 'INATIVADO' THEN
      RAISE EXCEPTION 'DOCUMENT_IMMUTABLE: registro liberado é imutável'
        USING ERRCODE = 'check_violation';
    END IF;
    FOR k IN SELECT jsonb_object_keys(o) LOOP
      IF NOT (k = ANY(allowed)) AND (o->k) IS DISTINCT FROM (n->k) THEN
        RAISE EXCEPTION 'DOCUMENT_IMMUTABLE: campo % não pode mudar após liberação', k
          USING ERRCODE = 'check_violation';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

-- Fábrica de tabela de registro clínico com autoria, data de realização e estado.
-- (Escrito explicitamente por tabela para clareza de constraints/índices.)
CREATE TABLE medical_evolutions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id  uuid NOT NULL REFERENCES attendances(id),
  author_id      uuid NOT NULL REFERENCES users(id),
  content        text,
  clinical_date  date NOT NULL DEFAULT current_date,   -- data de realização (Master §57)
  status         clinical_status NOT NULL DEFAULT 'RASCUNHO',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  finalized_at   timestamptz,
  signed_at      timestamptz,
  signed_by      uuid REFERENCES users(id),
  inactivated_at timestamptz,
  inactivated_by uuid REFERENCES users(id),
  inactivation_reason text
);
CREATE INDEX medevo_att_idx ON medical_evolutions (attendance_id);
CREATE INDEX medevo_open_idx ON medical_evolutions (author_id) WHERE status IN ('RASCUNHO','FINALIZADO');
CREATE TRIGGER medevo_touch BEFORE UPDATE ON medical_evolutions
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER medevo_immutable BEFORE UPDATE ON medical_evolutions
  FOR EACH ROW EXECUTE FUNCTION app.enforce_immutable_after_release();

CREATE TABLE nursing_admissions (LIKE medical_evolutions INCLUDING ALL);
CREATE TABLE nursing_histories  (LIKE medical_evolutions INCLUDING ALL);
CREATE TABLE nursing_evolutions (LIKE medical_evolutions INCLUDING ALL);
CREATE TABLE nursing_notes      (LIKE medical_evolutions INCLUDING ALL);

-- LIKE não copia FKs nem triggers; recria-os por tabela.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['nursing_admissions','nursing_histories',
                               'nursing_evolutions','nursing_notes']) LOOP
    EXECUTE format('ALTER TABLE %I ADD FOREIGN KEY (attendance_id) REFERENCES attendances(id)', t);
    EXECUTE format('ALTER TABLE %I ADD FOREIGN KEY (author_id) REFERENCES users(id)', t);
    EXECUTE format('ALTER TABLE %I ADD FOREIGN KEY (signed_by) REFERENCES users(id)', t);
    EXECUTE format('ALTER TABLE %I ADD FOREIGN KEY (inactivated_by) REFERENCES users(id)', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at()', t||'_touch', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.enforce_immutable_after_release()', t||'_immutable', t);
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON medical_evolutions, nursing_admissions,
  nursing_histories, nursing_evolutions, nursing_notes TO vitaloop_app;

-- RLS: leitura por acesso ao atendimento; criação/edição por permissão da profissão.
-- Regras do Master §11/§16: evolução de enfermagem é privativa do enfermeiro;
-- anotação (nursing_notes) é do técnico.
ALTER TABLE medical_evolutions ENABLE ROW LEVEL SECURITY; ALTER TABLE medical_evolutions FORCE ROW LEVEL SECURITY;
ALTER TABLE nursing_admissions ENABLE ROW LEVEL SECURITY; ALTER TABLE nursing_admissions FORCE ROW LEVEL SECURITY;
ALTER TABLE nursing_histories  ENABLE ROW LEVEL SECURITY; ALTER TABLE nursing_histories  FORCE ROW LEVEL SECURITY;
ALTER TABLE nursing_evolutions ENABLE ROW LEVEL SECURITY; ALTER TABLE nursing_evolutions FORCE ROW LEVEL SECURITY;
ALTER TABLE nursing_notes      ENABLE ROW LEVEL SECURITY; ALTER TABLE nursing_notes      FORCE ROW LEVEL SECURITY;

-- Helper de política para registro clínico: read + create + update(autor).
CREATE OR REPLACE FUNCTION app.rls_clinical(tbl text, create_perm text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format($f$CREATE POLICY %1$s_read ON %1$s FOR SELECT
      USING (can_access_attendance(app.current_user_id(), attendance_id))$f$, tbl);
  EXECUTE format($f$CREATE POLICY %1$s_create ON %1$s FOR INSERT
      WITH CHECK (has_permission(app.current_user_id(), %2$L)
                  AND can_access_attendance(app.current_user_id(), attendance_id))$f$, tbl, create_perm);
  -- Só o autor edita (e apenas enquanto não liberado — garantido pelo trigger).
  EXECUTE format($f$CREATE POLICY %1$s_update ON %1$s FOR UPDATE
      USING (author_id = app.current_user_id()
             AND has_permission(app.current_user_id(), %2$L))$f$, tbl, create_perm);
END $$;

SELECT app.rls_clinical('medical_evolutions', 'medical.evolution.create');
SELECT app.rls_clinical('nursing_admissions', 'nursing.admission.create');
SELECT app.rls_clinical('nursing_histories',  'nursing.history.create');
SELECT app.rls_clinical('nursing_evolutions', 'nursing.evolution.create');
SELECT app.rls_clinical('nursing_notes',      'nursing.note.create');
