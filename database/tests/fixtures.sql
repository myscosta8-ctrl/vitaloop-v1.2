-- Deterministic test fixtures (idempotent). Applied as migrator, committed.
-- Only for DEV/test databases — never production (uses synthetic accounts).
-- Requires seeds S0001/S0002 to have run.

-- Users (one per role under test) + one inactive user.
INSERT INTO users(id, username, full_name, password_hash, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111','fix_medico','Fixture Médico','x', true),
  ('22222222-2222-2222-2222-222222222222','fix_enfermeiro','Fixture Enfermeiro','x', true),
  ('33333333-3333-3333-3333-333333333333','fix_tecnico','Fixture Técnico','x', true),
  ('44444444-4444-4444-4444-444444444444','fix_farmacia','Fixture Farmácia','x', true),
  ('55555555-5555-5555-5555-555555555555','fix_same','Fixture SAME','x', true),
  ('66666666-6666-6666-6666-666666666666','fix_admin','Fixture Admin','x', true),
  ('77777777-7777-7777-7777-777777777777','fix_inativo','Fixture Inativo','x', false),
  ('88888888-8888-8888-8888-888888888888','fix_administrativo','Fixture Recepção','x', true)
ON CONFLICT (id) DO NOTHING;

-- Role assignments.
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id FROM (VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid,'MEDICO'),
  ('22222222-2222-2222-2222-222222222222'::uuid,'ENFERMEIRO'),
  ('33333333-3333-3333-3333-333333333333'::uuid,'TECNICO_ENFERMAGEM'),
  ('44444444-4444-4444-4444-444444444444'::uuid,'FARMACIA'),
  ('55555555-5555-5555-5555-555555555555'::uuid,'SAME_AUDITORIA'),
  ('66666666-6666-6666-6666-666666666666'::uuid,'ADMINISTRACAO'),
  ('77777777-7777-7777-7777-777777777777'::uuid,'MEDICO'),
  ('88888888-8888-8888-8888-888888888888'::uuid,'ADMINISTRATIVO')
) v(uid, rc) JOIN users u ON u.id = v.uid JOIN roles r ON r.code = v.rc
ON CONFLICT DO NOTHING;

-- Patient, attendance, prescription, bed.
INSERT INTO patients(id, medical_record_number, full_name, created_by) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','MRN-FIX-0001','Fixture Paciente',
   '66666666-6666-6666-6666-666666666666')
ON CONFLICT (id) DO NOTHING;

INSERT INTO attendances(id, patient_id, sector_id, status, opened_by) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   (SELECT id FROM upa_sectors WHERE code='TRIAGEM'),
   'EM_ATENDIMENTO',
   '88888888-8888-8888-8888-888888888888')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_prescriptions(id, attendance_id, prescriber_id, status) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '11111111-1111-1111-1111-111111111111','LIBERADA')
ON CONFLICT (id) DO NOTHING;

INSERT INTO beds(id, code, state) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','LEITO-FIX-01','LIVRE')
ON CONFLICT (id) DO NOTHING;
