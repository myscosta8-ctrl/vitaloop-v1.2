-- Atendimento encerrado não reabre; transições inválidas são rejeitadas
-- (STATE_MACHINES §1). Executado como migrator.

-- Encerrar a partir de EM_ATENDIMENTO (válido).
UPDATE attendances
   SET status='ENCERRADO', closed_at=now(),
       closed_by='11111111-1111-1111-1111-111111111111'
 WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

DO $$ BEGIN
  BEGIN
    UPDATE attendances SET status='ABERTO', closed_at=NULL, closed_by=NULL
     WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    RAISE EXCEPTION 'FAIL: atendimento encerrado foi reaberto';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: reabertura de atendimento encerrado bloqueada';
  END;
END $$;

-- Transição inválida a partir de estado ativo (EM_TRIAGEM -> OBSERVACAO).
INSERT INTO attendances(id, patient_id, sector_id, status, opened_by)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        (SELECT id FROM upa_sectors WHERE code='TRIAGEM'),
        'EM_TRIAGEM','66666666-6666-6666-6666-666666666666');
DO $$ BEGIN
  BEGIN
    UPDATE attendances SET status='OBSERVACAO'
     WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03';
    RAISE EXCEPTION 'FAIL: transição inválida EM_TRIAGEM->OBSERVACAO permitida';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: transição inválida bloqueada';
  END;
END $$;
