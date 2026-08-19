-- RLS (app role): evolução de enfermagem é privativa do enfermeiro; a anotação
-- é do técnico (Master §11/§16; Teste 008).

-- Técnico: anotação (nursing_notes) permitida.
SELECT set_config('app.user_id','33333333-3333-3333-3333-333333333333', true);
INSERT INTO nursing_notes(attendance_id, author_id, content)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '33333333-3333-3333-3333-333333333333','anotação do técnico');
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM nursing_notes
   WHERE author_id='33333333-3333-3333-3333-333333333333';
  IF n < 1 THEN RAISE EXCEPTION 'FAIL: técnico não conseguiu anotar'; END IF;
  RAISE NOTICE 'OK: técnico registrou anotação';
END $$;

-- Técnico: evolução de enfermagem NEGADA.
DO $$ BEGIN
  BEGIN
    INSERT INTO nursing_evolutions(attendance_id, author_id, content)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '33333333-3333-3333-3333-333333333333','tentativa');
    RAISE EXCEPTION 'FAIL: técnico criou evolução de enfermagem';
  EXCEPTION
    WHEN insufficient_privilege THEN RAISE NOTICE 'OK: técnico negado em evolução de enfermagem';
    WHEN others THEN
      IF SQLERRM LIKE '%FAIL:%' THEN RAISE; END IF;
      RAISE NOTICE 'OK: técnico negado (%)', SQLERRM;
  END;
END $$;

-- Enfermeiro: evolução de enfermagem permitida.
SELECT set_config('app.user_id','22222222-2222-2222-2222-222222222222', true);
INSERT INTO nursing_evolutions(attendance_id, author_id, content)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222','evolução do enfermeiro');
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM nursing_evolutions
   WHERE author_id='22222222-2222-2222-2222-222222222222';
  IF n < 1 THEN RAISE EXCEPTION 'FAIL: enfermeiro não conseguiu evoluir'; END IF;
  RAISE NOTICE 'OK: enfermeiro registrou evolução de enfermagem';
END $$;
