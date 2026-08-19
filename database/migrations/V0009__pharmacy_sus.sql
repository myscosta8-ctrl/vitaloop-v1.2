-- =====================================================================
-- V0009 — Farmácia/estoque da UPA, hemoterapia, AIH, SIGTAP, produção SUS.
-- Master §39–44; ADR-009 (sem PDV/ERP; destino externo não vira módulo).
-- =====================================================================

-- Farmácia/estoque DA UPA (prescrição ≠ dispensação ≠ administração).
CREATE TABLE pharmacy_items (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code     text UNIQUE,
  name     text NOT NULL,
  unit     text,
  active   boolean NOT NULL DEFAULT true
);

CREATE TABLE stock_movements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid NOT NULL REFERENCES pharmacy_items(id),
  movement_type text NOT NULL CHECK (movement_type IN ('ENTRADA','SAIDA','AJUSTE','PERDA','DISPENSACAO')),
  quantity     numeric(14,3) NOT NULL,
  lot          text,
  expires_at   date,
  reason       text,
  moved_by     uuid REFERENCES users(id),
  moved_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stock_mov_item_idx ON stock_movements (item_id, moved_at);

CREATE TABLE dispensations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendances(id),
  prescription_item_id uuid REFERENCES prescription_items(id),
  item_id       uuid NOT NULL REFERENCES pharmacy_items(id),
  quantity      numeric(14,3) NOT NULL,
  lot           text,
  dispensed_by  uuid NOT NULL REFERENCES users(id),
  dispensed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dispensations_att_idx ON dispensations (attendance_id);

CREATE TABLE hemotherapy_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  requested_by  uuid NOT NULL REFERENCES users(id),
  component     text NOT NULL,
  status        text NOT NULL DEFAULT 'SOLICITADO',
  requested_at  timestamptz NOT NULL DEFAULT now(),
  notes         text
);
CREATE INDEX hemo_att_idx ON hemotherapy_requests (attendance_id);

-- SIGTAP versionado por competência (Master §43).
CREATE TABLE sigtap_catalog (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competence   text NOT NULL,          -- AAAAMM
  code         text NOT NULL,
  name         text NOT NULL,
  attributes   jsonb NOT NULL DEFAULT '{}'::jsonb,
  active       boolean NOT NULL DEFAULT true,
  UNIQUE (competence, code)
);
CREATE INDEX sigtap_code_idx ON sigtap_catalog (code);

-- AIH estruturada (Master §42) — não é formulário de texto livre.
CREATE TABLE aihs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  main_procedure_code text,
  status        text NOT NULL DEFAULT 'RASCUNHO',  -- RASCUNHO | LIBERADA
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by    uuid REFERENCES users(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  released_at   timestamptz
);
CREATE INDEX aihs_att_idx ON aihs (attendance_id);
CREATE TRIGGER aihs_touch BEFORE UPDATE ON aihs
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE sus_production (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendances(id),
  competence    text,
  procedure_code text,
  quantity      integer NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON pharmacy_items, sigtap_catalog TO vitaloop_app;
GRANT SELECT, INSERT ON stock_movements, dispensations, hemotherapy_requests,
  sus_production TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON aihs TO vitaloop_app;

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY; ALTER TABLE stock_movements FORCE ROW LEVEL SECURITY;
ALTER TABLE dispensations   ENABLE ROW LEVEL SECURITY; ALTER TABLE dispensations   FORCE ROW LEVEL SECURITY;
ALTER TABLE aihs            ENABLE ROW LEVEL SECURITY; ALTER TABLE aihs            FORCE ROW LEVEL SECURITY;

CREATE POLICY stock_read ON stock_movements FOR SELECT
  USING (has_permission(app.current_user_id(),'inventory.manage'));
CREATE POLICY stock_write ON stock_movements FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'inventory.manage'));

CREATE POLICY disp_read ON dispensations FOR SELECT
  USING (has_permission(app.current_user_id(),'pharmacy.dispense')
         OR has_permission(app.current_user_id(),'inventory.manage'));
CREATE POLICY disp_write ON dispensations FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'pharmacy.dispense'));

CREATE POLICY aih_read ON aihs FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY aih_write ON aihs FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'aih.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY aih_update ON aihs FOR UPDATE
  USING (has_permission(app.current_user_id(),'aih.create')
         AND can_access_attendance(app.current_user_id(), attendance_id));
