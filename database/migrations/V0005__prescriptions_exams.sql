-- =====================================================================
-- V0005 — Prescrição (médica/enfermagem), exames, procedimentos, interconsulta.
-- Master §20–27; ADR-008 (sem aprazamento automático).
-- =====================================================================

CREATE TYPE exam_status AS ENUM ('SOLICITADO','COLETADO','RESULTADO_DISPONIVEL','INATIVADO');
CREATE TYPE prescription_status AS ENUM ('RASCUNHO','LIBERADA','SUSPENSA','ENCERRADA');

CREATE TABLE medication_catalog (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text UNIQUE,
  name          text NOT NULL,
  presentation  text,
  concentration text,
  unit          text,
  active        boolean NOT NULL DEFAULT true
);

CREATE TABLE medical_prescriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  prescriber_id uuid NOT NULL REFERENCES users(id),
  started_at    timestamptz NOT NULL DEFAULT now(),
  valid_until   timestamptz,
  status        prescription_status NOT NULL DEFAULT 'RASCUNHO',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  signed_at     timestamptz,
  signed_by     uuid REFERENCES users(id)
);
CREATE INDEX medrx_att_idx ON medical_prescriptions (attendance_id);
CREATE TRIGGER medrx_touch BEFORE UPDATE ON medical_prescriptions
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE prescription_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES medical_prescriptions(id),
  medication_id   uuid REFERENCES medication_catalog(id),
  free_text       text,                 -- quando fora do catálogo
  dose            text,
  unit            text,
  route           text,
  dilution        text,
  frequency       text,                 -- ex.: 6/6h — o médico NÃO informa horários
  duration        text,
  condition_type  text,                 -- SN | ACM | SE_DOR | CRITERIO_MAIOR_IGUAL | ...
  condition_value text,
  instructions    text,
  CONSTRAINT rx_item_has_med CHECK (medication_id IS NOT NULL OR free_text IS NOT NULL)
);
CREATE INDEX rx_items_rx_idx ON prescription_items (prescription_id);

-- Aprazamento MANUAL feito pelo enfermeiro (ADR-008). Nunca automático.
CREATE TABLE prescription_item_schedules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid NOT NULL REFERENCES prescription_items(id),
  scheduled_at timestamptz NOT NULL,
  created_by   uuid NOT NULL REFERENCES users(id),   -- enfermeiro
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rx_sched_item_idx ON prescription_item_schedules (item_id);

CREATE TABLE nursing_prescriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  prescriber_id uuid NOT NULL REFERENCES users(id),   -- enfermeiro
  status        prescription_status NOT NULL DEFAULT 'RASCUNHO',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  signed_at     timestamptz,
  signed_by     uuid REFERENCES users(id)
);
CREATE INDEX nrx_att_idx ON nursing_prescriptions (attendance_id);
CREATE TRIGGER nrx_touch BEFORE UPDATE ON nursing_prescriptions
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE nursing_prescription_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES nursing_prescriptions(id),
  item_type       text NOT NULL,   -- sinais_vitais | balanco | curativo | sonda | dieta | contencao ...
  description     text,
  frequency       text,
  repeatable      boolean NOT NULL DEFAULT true
);
CREATE INDEX nrx_items_idx ON nursing_prescription_items (prescription_id);

-- Procedimentos (catálogo + registros; podem repetir — Master §12/§22).
CREATE TABLE procedures (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code   text UNIQUE,
  name   text NOT NULL,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE procedure_records (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id  uuid NOT NULL REFERENCES attendances(id),
  procedure_id   uuid REFERENCES procedures(id),
  procedure_text text,
  professional_id uuid NOT NULL REFERENCES users(id),
  performed_at   timestamptz NOT NULL DEFAULT now(),
  notes          text
);
CREATE INDEX proc_rec_att_idx ON procedure_records (attendance_id);

-- Exames (Master §24–26).
CREATE TABLE exams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendances(id),
  requested_by  uuid NOT NULL REFERENCES users(id),
  requested_at  timestamptz NOT NULL DEFAULT now(),
  type          text NOT NULL,     -- LABORATORIO | IMAGEM
  status        exam_status NOT NULL DEFAULT 'SOLICITADO',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exams_att_idx ON exams (attendance_id);
CREATE TRIGGER exams_touch BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE exam_items (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id),
  code    text,
  name    text NOT NULL
);
CREATE INDEX exam_items_exam_idx ON exam_items (exam_id);

CREATE TABLE exam_results (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id      uuid NOT NULL REFERENCES exams(id),
  available_at timestamptz NOT NULL DEFAULT now(),
  result_text  text,
  file_id      uuid,
  entered_by   uuid REFERENCES users(id),
  is_critical  boolean NOT NULL DEFAULT false,
  status       text NOT NULL DEFAULT 'DISPONIVEL',
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exam_results_exam_idx ON exam_results (exam_id);

CREATE TABLE exam_attachments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id      uuid NOT NULL REFERENCES exams(id),
  file_name    text NOT NULL,
  mime_type    text,
  byte_size    bigint,
  sha256       text,
  storage_key  text NOT NULL,
  uploaded_by  uuid REFERENCES users(id),
  uploaded_at  timestamptz NOT NULL DEFAULT now(),
  active       boolean NOT NULL DEFAULT true
);
CREATE INDEX exam_attach_exam_idx ON exam_attachments (exam_id);

CREATE TABLE interconsultations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id        uuid NOT NULL REFERENCES attendances(id),
  requested_by         uuid NOT NULL REFERENCES users(id),
  requested_at         timestamptz NOT NULL DEFAULT now(),
  requested_profession text,
  reason               text,
  response_document_id uuid,
  status               text NOT NULL DEFAULT 'SOLICITADA',
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interconsult_att_idx ON interconsultations (attendance_id);

GRANT SELECT ON medication_catalog, procedures TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON medical_prescriptions, prescription_items,
  prescription_item_schedules, nursing_prescriptions, nursing_prescription_items,
  procedure_records, exams, exam_items, exam_results, exam_attachments,
  interconsultations TO vitaloop_app;

-- RLS (catálogos são leitura pública para autenticados; clínicos por atendimento).
ALTER TABLE medical_prescriptions ENABLE ROW LEVEL SECURITY; ALTER TABLE medical_prescriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE prescription_items    ENABLE ROW LEVEL SECURITY; ALTER TABLE prescription_items    FORCE ROW LEVEL SECURITY;
ALTER TABLE nursing_prescriptions ENABLE ROW LEVEL SECURITY; ALTER TABLE nursing_prescriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE exams                 ENABLE ROW LEVEL SECURITY; ALTER TABLE exams                 FORCE ROW LEVEL SECURITY;
ALTER TABLE exam_results          ENABLE ROW LEVEL SECURITY; ALTER TABLE exam_results          FORCE ROW LEVEL SECURITY;
ALTER TABLE interconsultations    ENABLE ROW LEVEL SECURITY; ALTER TABLE interconsultations    FORCE ROW LEVEL SECURITY;

CREATE POLICY medrx_read ON medical_prescriptions FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY medrx_create ON medical_prescriptions FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'medical.prescription.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY medrx_update ON medical_prescriptions FOR UPDATE
  USING (has_permission(app.current_user_id(),'medical.prescription.create')
         AND can_access_attendance(app.current_user_id(), attendance_id));

CREATE POLICY rxitems_read ON prescription_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM medical_prescriptions p
                 WHERE p.id = prescription_id
                 AND can_access_attendance(app.current_user_id(), p.attendance_id)));
CREATE POLICY rxitems_write ON prescription_items FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'medical.prescription.create'));

CREATE POLICY nrx_read ON nursing_prescriptions FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY nrx_create ON nursing_prescriptions FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'nursing.prescription.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));

CREATE POLICY exams_read ON exams FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY exams_create ON exams FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'exam.request.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY exams_update ON exams FOR UPDATE
  USING (can_access_attendance(app.current_user_id(), attendance_id));

CREATE POLICY examres_read ON exam_results FOR SELECT
  USING (has_permission(app.current_user_id(),'exam.result.read')
         AND EXISTS (SELECT 1 FROM exams e WHERE e.id = exam_id
                     AND can_access_attendance(app.current_user_id(), e.attendance_id)));
CREATE POLICY examres_write ON exam_results FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'exam.result.attach'));

CREATE POLICY interconsult_read ON interconsultations FOR SELECT
  USING (can_access_attendance(app.current_user_id(), attendance_id));
CREATE POLICY interconsult_create ON interconsultations FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(),'interconsultation.create')
              AND can_access_attendance(app.current_user_id(), attendance_id));
