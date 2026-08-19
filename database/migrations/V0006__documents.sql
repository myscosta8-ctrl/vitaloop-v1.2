-- =====================================================================
-- V0006 — Engine de documentos assistenciais imutáveis (MARCO 7).
-- Master §17–18, §45–51; STATE_MACHINES §2; ADR-004/010/011.
-- =====================================================================

CREATE TABLE document_types (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code               text NOT NULL UNIQUE,
  name               text NOT NULL,
  profession_scope   text,               -- ex.: MEDICO, ENFERMEIRO (informativo/RBAC)
  require_full_print boolean NOT NULL DEFAULT true,  -- DP-005
  active             boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE document_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type_id uuid NOT NULL REFERENCES document_types(id),
  version         int NOT NULL,
  template_ref    text,                  -- referência ao modelo institucional/PDF
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_type_id, version)
);

CREATE TABLE clinical_documents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id    uuid NOT NULL REFERENCES attendances(id),
  document_type_id uuid NOT NULL REFERENCES document_types(id),
  version_id       uuid REFERENCES document_versions(id),
  author_id        uuid NOT NULL REFERENCES users(id),
  status           clinical_status NOT NULL DEFAULT 'RASCUNHO',
  snapshot         jsonb,                 -- fotografia imutável ao liberar (ADR-004)
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  finalized_at     timestamptz,
  signed_at        timestamptz,
  signed_by        uuid REFERENCES users(id),
  inactivated_at   timestamptz,
  inactivated_by   uuid REFERENCES users(id),
  inactivation_reason text,
  -- Documento liberado precisa de snapshot (a fotografia).
  CONSTRAINT doc_released_has_snapshot CHECK (
    status NOT IN ('LIBERADO','INATIVADO') OR snapshot IS NOT NULL)
);
CREATE INDEX cdocs_att_idx ON clinical_documents (attendance_id);
CREATE INDEX cdocs_open_idx ON clinical_documents (author_id) WHERE status IN ('RASCUNHO','FINALIZADO');
CREATE TRIGGER cdocs_touch BEFORE UPDATE ON clinical_documents
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER cdocs_immutable BEFORE UPDATE ON clinical_documents
  FOR EACH ROW EXECUTE FUNCTION app.enforce_immutable_after_release();

-- Assinaturas: uma por (documento, profissional) — evita dupla assinatura (Master §62).
CREATE TABLE document_signatures (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id    uuid NOT NULL REFERENCES clinical_documents(id),
  professional_id uuid NOT NULL REFERENCES users(id),
  signed_at      timestamptz NOT NULL DEFAULT now(),
  signature_type text NOT NULL DEFAULT 'ELETRONICA_SIMPLES',
  UNIQUE (document_id, professional_id)
);

-- Inativação: no máximo uma por documento — evita dupla inativação.
CREATE TABLE document_inactivations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL UNIQUE REFERENCES clinical_documents(id),
  reason       text NOT NULL,
  inactivated_by uuid NOT NULL REFERENCES users(id),
  inactivated_at timestamptz NOT NULL DEFAULT now()
);

-- Eventos de impressão: append-only. Reimpressão = novo evento (Master §48).
CREATE TABLE print_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES clinical_documents(id),
  printed_by  uuid NOT NULL REFERENCES users(id),
  printed_at  timestamptz NOT NULL DEFAULT now(),
  print_type  text NOT NULL DEFAULT 'IMPRESSAO'  -- IMPRESSAO | REIMPRESSAO
);
CREATE INDEX print_events_doc_idx ON print_events (document_id, printed_at);
CREATE TRIGGER print_no_update BEFORE UPDATE ON print_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();
CREATE TRIGGER print_no_delete BEFORE DELETE ON print_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();

GRANT SELECT ON document_types, document_versions TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON clinical_documents TO vitaloop_app;
GRANT SELECT, INSERT ON document_signatures, document_inactivations, print_events TO vitaloop_app;

ALTER TABLE clinical_documents ENABLE ROW LEVEL SECURITY; ALTER TABLE clinical_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY; ALTER TABLE document_signatures FORCE ROW LEVEL SECURITY;
ALTER TABLE print_events        ENABLE ROW LEVEL SECURITY; ALTER TABLE print_events        FORCE ROW LEVEL SECURITY;

CREATE POLICY cdocs_read ON clinical_documents FOR SELECT
  USING (has_permission(app.current_user_id(),'document.read')
         AND can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY cdocs_create ON clinical_documents FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'document.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));
-- Edição só pelo autor (e apenas antes de liberar — trigger reforça imutabilidade).
CREATE POLICY cdocs_update ON clinical_documents FOR UPDATE
  USING (author_id = app.current_user_id()
         AND has_permission(app.current_user_id(),'document.create'));

CREATE POLICY docsig_read ON document_signatures FOR SELECT
  USING (has_permission(app.current_user_id(),'document.read'));
CREATE POLICY docsig_write ON document_signatures FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'document.sign'));

CREATE POLICY print_read ON print_events FOR SELECT
  USING (has_permission(app.current_user_id(),'document.read'));
CREATE POLICY print_write ON print_events FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'document.print'));
