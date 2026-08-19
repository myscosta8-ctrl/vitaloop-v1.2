-- =====================================================================
-- V0002 — Paciente permanente (MARCO 2). Master §4.1, §12; ADR-003.
-- =====================================================================

CREATE TABLE patients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_number text NOT NULL UNIQUE,
  cpf                   text,
  cns                   text,
  full_name             text NOT NULL,
  social_name           text,
  mother_name           text,
  birth_date            date,
  sex                   text CHECK (sex IN ('F','M','I','O')),  -- fem/masc/ignorado/outro
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid REFERENCES users(id),
  updated_by            uuid REFERENCES users(id),
  CONSTRAINT patients_cpf_format CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$'),
  CONSTRAINT patients_cns_format CHECK (cns IS NULL OR cns ~ '^[0-9]{15}$')
);
-- Prevenção de duplicidade determinística (ADR-003): CPF/CNS únicos quando
-- presentes. Similaridade fuzzy é responsabilidade da recepção (camada de app).
CREATE UNIQUE INDEX patients_cpf_uq ON patients (cpf) WHERE cpf IS NOT NULL;
CREATE UNIQUE INDEX patients_cns_uq ON patients (cns) WHERE cns IS NOT NULL;
CREATE INDEX patients_name_idx ON patients (lower(full_name));
CREATE TRIGGER patients_touch BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE patient_contacts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  type       text NOT NULL,     -- phone | email | address | emergency
  value      text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patient_contacts_patient_idx ON patient_contacts (patient_id);
CREATE TRIGGER patient_contacts_touch BEFORE UPDATE ON patient_contacts
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

CREATE TABLE patient_alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid NOT NULL REFERENCES patients(id),
  type            text NOT NULL,
  description     text NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES users(id),
  inactivated_at  timestamptz,
  inactivated_by  uuid REFERENCES users(id)
);
CREATE INDEX patient_alerts_patient_idx ON patient_alerts (patient_id) WHERE active;

CREATE TABLE patient_allergies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  substance  text NOT NULL,
  reaction   text,
  severity   text CHECK (severity IN ('LEVE','MODERADA','GRAVE') OR severity IS NULL),
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id)
);
CREATE INDEX patient_allergies_patient_idx ON patient_allergies (patient_id) WHERE active;

-- Grants (sem DELETE — inativação lógica).
GRANT SELECT, INSERT, UPDATE ON patients, patient_contacts, patient_alerts,
  patient_allergies TO vitaloop_app;

-- RLS: leitura exige patient.read; escrita exige permissões específicas.
ALTER TABLE patients          ENABLE ROW LEVEL SECURITY; ALTER TABLE patients          FORCE ROW LEVEL SECURITY;
ALTER TABLE patient_contacts  ENABLE ROW LEVEL SECURITY; ALTER TABLE patient_contacts  FORCE ROW LEVEL SECURITY;
ALTER TABLE patient_alerts    ENABLE ROW LEVEL SECURITY; ALTER TABLE patient_alerts    FORCE ROW LEVEL SECURITY;
ALTER TABLE patient_allergies ENABLE ROW LEVEL SECURITY; ALTER TABLE patient_allergies FORCE ROW LEVEL SECURITY;

CREATE POLICY patients_read ON patients FOR SELECT
  USING (has_permission(app.current_user_id(), 'patient.read'));
CREATE POLICY patients_create ON patients FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'patient.create'));
CREATE POLICY patients_update ON patients FOR UPDATE
  USING (has_permission(app.current_user_id(), 'patient.update_demographic'));

CREATE POLICY pcontacts_read ON patient_contacts FOR SELECT
  USING (has_permission(app.current_user_id(), 'patient.read'));
CREATE POLICY pcontacts_write ON patient_contacts FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'patient.update_demographic'));
CREATE POLICY pcontacts_update ON patient_contacts FOR UPDATE
  USING (has_permission(app.current_user_id(), 'patient.update_demographic'));

CREATE POLICY palerts_read ON patient_alerts FOR SELECT
  USING (has_permission(app.current_user_id(), 'patient.read'));
CREATE POLICY palerts_write ON patient_alerts FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'patient.update_demographic'));
CREATE POLICY palerts_update ON patient_alerts FOR UPDATE
  USING (has_permission(app.current_user_id(), 'patient.update_demographic'));

CREATE POLICY pallergies_read ON patient_allergies FOR SELECT
  USING (has_permission(app.current_user_id(), 'patient.read'));
CREATE POLICY pallergies_write ON patient_allergies FOR INSERT
  WITH CHECK (has_permission(app.current_user_id(), 'patient.update_demographic'));
CREATE POLICY pallergies_update ON patient_allergies FOR UPDATE
  USING (has_permission(app.current_user_id(), 'patient.update_demographic'));
