-- Integridade: um leito não pode ter duas ocupações ativas (ADR-007; Teste 015).
-- Executado como migrator; o índice único parcial vale independentemente de RLS.

-- Segunda atendimento (mesmo paciente) para disputar o mesmo leito.
INSERT INTO attendances(id, patient_id, sector_id, status, opened_by)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        (SELECT id FROM upa_sectors WHERE code='TRIAGEM'),
        'EM_ATENDIMENTO','66666666-6666-6666-6666-666666666666');

INSERT INTO bed_assignments(bed_id, attendance_id, assigned_by)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '66666666-6666-6666-6666-666666666666');

DO $$ BEGIN
  BEGIN
    INSERT INTO bed_assignments(bed_id, attendance_id, assigned_by)
    VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc',
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
            '66666666-6666-6666-6666-666666666666');
    RAISE EXCEPTION 'FAIL: dupla ocupação do mesmo leito foi permitida';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'OK: dupla ocupação de leito bloqueada pelo banco';
  END;
END $$;

-- E um atendimento não pode ter dois leitos ativos.
INSERT INTO beds(id, code, state) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc99','LEITO-FIX-99','LIVRE');
DO $$ BEGIN
  BEGIN
    INSERT INTO bed_assignments(bed_id, attendance_id, assigned_by)
    VALUES ('cccccccc-cccc-cccc-cccc-cccccccccc99',
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '66666666-6666-6666-6666-666666666666');
    RAISE EXCEPTION 'FAIL: atendimento recebeu dois leitos ativos';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'OK: segundo leito ativo no mesmo atendimento bloqueado';
  END;
END $$;
