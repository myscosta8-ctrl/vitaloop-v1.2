-- Encerramento atômico: registra desfecho, libera leito, encerra; regra de
-- desfecho médico; bloqueio de duplo encerramento (Testes 018/019/034; §61).
-- Executado como migrator; a identidade é simulada via app.user_id.

-- Aloca leito ao atendimento fixture e marca o leito OCUPADO.
INSERT INTO bed_assignments(bed_id, attendance_id, assigned_by)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '66666666-6666-6666-6666-666666666666');
UPDATE beds SET state='OCUPADO' WHERE id='cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Médico dá ALTA (desfecho que exige médico).
SELECT set_config('app.user_id','11111111-1111-1111-1111-111111111111', true);
SELECT close_attendance('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','ALTA','melhora clínica');

DO $$
DECLARE v_status text; v_released timestamptz; v_bed text;
BEGIN
  SELECT status::text INTO v_status FROM attendances
    WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF v_status <> 'ENCERRADO' THEN RAISE EXCEPTION 'FAIL: atendimento não encerrou (%)', v_status; END IF;

  SELECT released_at INTO v_released FROM bed_assignments
    WHERE attendance_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF v_released IS NULL THEN RAISE EXCEPTION 'FAIL: leito não foi liberado'; END IF;

  SELECT state::text INTO v_bed FROM beds WHERE id='cccccccc-cccc-cccc-cccc-cccccccccccc';
  IF v_bed <> 'LIVRE' THEN RAISE EXCEPTION 'FAIL: leito não voltou a LIVRE (%)', v_bed; END IF;
  RAISE NOTICE 'OK: encerramento liberou leito e registrou desfecho';
END $$;

-- Segundo encerramento é rejeitado.
DO $$ BEGIN
  BEGIN
    PERFORM close_attendance('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','ALTA',NULL);
    RAISE EXCEPTION 'FAIL: atendimento encerrado foi encerrado de novo';
  EXCEPTION WHEN others THEN
    IF SQLERRM LIKE '%FAIL:%' THEN RAISE; END IF;
    RAISE NOTICE 'OK: duplo encerramento bloqueado (%)', SQLERRM;
  END;
END $$;

-- Regra de desfecho médico: enfermeiro NÃO pode registrar óbito, mas pode evasão.
INSERT INTO attendances(id, patient_id, sector_id, status, opened_by)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        (SELECT id FROM upa_sectors WHERE code='OBSERVACAO'),
        'EM_ATENDIMENTO','66666666-6666-6666-6666-666666666666');

SELECT set_config('app.user_id','22222222-2222-2222-2222-222222222222', true); -- enfermeiro
DO $$ BEGIN
  BEGIN
    PERFORM close_attendance('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04','OBITO',NULL);
    RAISE EXCEPTION 'FAIL: enfermeiro registrou óbito';
  EXCEPTION WHEN others THEN
    IF SQLERRM LIKE '%FAIL:%' THEN RAISE; END IF;
    RAISE NOTICE 'OK: óbito por não-médico bloqueado (%)', SQLERRM;
  END;
END $$;

-- Enfermeiro registra evasão (permitido).
SELECT close_attendance('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04','EVASAO','saiu sem alta');
DO $$ DECLARE s text; BEGIN
  SELECT status::text INTO s FROM attendances WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04';
  IF s <> 'ENCERRADO' THEN RAISE EXCEPTION 'FAIL: evasão não encerrou atendimento'; END IF;
  RAISE NOTICE 'OK: evasão por enfermeiro encerrou o atendimento';
END $$;
