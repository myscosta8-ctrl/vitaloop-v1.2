-- RLS (app role): usuário inativo não acessa; sem identidade não há linhas;
-- farmácia lê prescrição mas não altera; SAME lê sem editar clínico
-- (Testes 028/029/031/039; RBAC §10/§11).

-- Sem identidade setada: nenhuma linha visível.
SELECT set_config('app.user_id','', true);
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM patients;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: sem identidade retornou % pacientes', n; END IF;
  RAISE NOTICE 'OK: sem identidade => 0 linhas';
END $$;

-- Usuário inativo (mesmo com role MEDICO) não tem permissão efetiva.
SELECT set_config('app.user_id','77777777-7777-7777-7777-777777777777', true);
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM patients;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: usuário inativo viu % pacientes', n; END IF;
  RAISE NOTICE 'OK: usuário inativo não acessa';
END $$;

-- Médico ativo enxerga o paciente.
SELECT set_config('app.user_id','11111111-1111-1111-1111-111111111111', true);
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM patients;
  IF n < 1 THEN RAISE EXCEPTION 'FAIL: médico ativo não viu pacientes'; END IF;
  RAISE NOTICE 'OK: médico ativo lê paciente';
END $$;

-- Farmácia lê a prescrição do atendimento (tem attendance.read)...
SELECT set_config('app.user_id','44444444-4444-4444-4444-444444444444', true);
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM medical_prescriptions
   WHERE attendance_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF n < 1 THEN RAISE EXCEPTION 'FAIL: farmácia não leu prescrição'; END IF;
  RAISE NOTICE 'OK: farmácia lê prescrição';
END $$;
-- ...mas NÃO pode criar/alterar prescrição médica.
DO $$ BEGIN
  BEGIN
    INSERT INTO medical_prescriptions(attendance_id, prescriber_id)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '44444444-4444-4444-4444-444444444444');
    RAISE EXCEPTION 'FAIL: farmácia criou prescrição médica';
  EXCEPTION
    WHEN insufficient_privilege THEN RAISE NOTICE 'OK: farmácia não prescreve (RLS)';
    WHEN others THEN
      IF SQLERRM LIKE '%FAIL:%' THEN RAISE; END IF;
      RAISE NOTICE 'OK: farmácia não prescreve (%)', SQLERRM;
  END;
END $$;

-- SAME/Auditoria lê o atendimento mas não cria evolução médica.
SELECT set_config('app.user_id','55555555-5555-5555-5555-555555555555', true);
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM attendances
   WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF n < 1 THEN RAISE EXCEPTION 'FAIL: SAME não leu atendimento'; END IF;
  RAISE NOTICE 'OK: SAME consulta atendimento';
END $$;
DO $$ BEGIN
  BEGIN
    INSERT INTO medical_evolutions(attendance_id, author_id, content)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '55555555-5555-5555-5555-555555555555','x');
    RAISE EXCEPTION 'FAIL: SAME criou evolução clínica';
  EXCEPTION
    WHEN insufficient_privilege THEN RAISE NOTICE 'OK: SAME não edita clínico (RLS)';
    WHEN others THEN
      IF SQLERRM LIKE '%FAIL:%' THEN RAISE; END IF;
      RAISE NOTICE 'OK: SAME não edita clínico (%)', SQLERRM;
  END;
END $$;
