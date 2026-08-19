-- RLS (app role): técnico NÃO cria evolução médica; médico cria (Testes 001/008/028).
-- Conectado como vitaloop_app — o RLS é efetivamente aplicado.

-- Técnico tenta criar evolução médica -> negado pela política de INSERT.
SELECT set_config('app.user_id','33333333-3333-3333-3333-333333333333', true);
DO $$ BEGIN
  BEGIN
    INSERT INTO medical_evolutions(attendance_id, author_id, content)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '33333333-3333-3333-3333-333333333333','tentativa');
    RAISE EXCEPTION 'FAIL: técnico criou evolução médica';
  EXCEPTION
    WHEN insufficient_privilege THEN RAISE NOTICE 'OK: técnico negado (RLS)';
    WHEN others THEN
      IF SQLERRM LIKE '%FAIL:%' THEN RAISE; END IF;
      RAISE NOTICE 'OK: técnico negado (%)', SQLERRM;
  END;
END $$;

-- Médico cria evolução médica -> permitido.
SELECT set_config('app.user_id','11111111-1111-1111-1111-111111111111', true);
INSERT INTO medical_evolutions(attendance_id, author_id, content)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111','evolução do médico');
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM medical_evolutions
   WHERE attendance_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     AND author_id='11111111-1111-1111-1111-111111111111';
  IF n < 1 THEN RAISE EXCEPTION 'FAIL: médico não conseguiu criar evolução'; END IF;
  RAISE NOTICE 'OK: médico criou evolução médica';
END $$;
