-- Documento liberado é imutável; correção só por inativação (ADR-004;
-- Testes 009/010/032). Executado como migrator (o trigger vale para qualquer role).

INSERT INTO clinical_documents(id, attendance_id, document_type_id, author_id, status)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        (SELECT id FROM document_types WHERE code='EVOLUCAO_MEDICA'),
        '11111111-1111-1111-1111-111111111111','RASCUNHO');

-- Liberar grava snapshot (fotografia).
UPDATE clinical_documents
   SET status='LIBERADO', snapshot='{"texto":"evolução original"}'::jsonb,
       signed_at=now(), signed_by='11111111-1111-1111-1111-111111111111'
 WHERE id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

-- Tentar editar o conteúdo de um documento liberado.
DO $$ BEGIN
  BEGIN
    UPDATE clinical_documents SET snapshot='{"texto":"ADULTERADO"}'::jsonb
     WHERE id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    RAISE EXCEPTION 'FAIL: documento liberado foi editado';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: edição de documento liberado bloqueada (DOCUMENT_IMMUTABLE)';
  END;
END $$;

-- Tentar voltar para RASCUNHO.
DO $$ BEGIN
  BEGIN
    UPDATE clinical_documents SET status='RASCUNHO'
     WHERE id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    RAISE EXCEPTION 'FAIL: documento liberado voltou a rascunho';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: transição LIBERADO->RASCUNHO bloqueada';
  END;
END $$;

-- Inativação é permitida (preserva conteúdo).
UPDATE clinical_documents
   SET status='INATIVADO', inactivated_at=now(),
       inactivated_by='11111111-1111-1111-1111-111111111111',
       inactivation_reason='erro de digitação'
 WHERE id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

DO $$ DECLARE snap jsonb; BEGIN
  SELECT snapshot INTO snap FROM clinical_documents
   WHERE id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  IF snap->>'texto' <> 'evolução original' THEN
    RAISE EXCEPTION 'FAIL: snapshot mudou após inativação';
  END IF;
  RAISE NOTICE 'OK: inativação preservou o conteúdo original';
END $$;

-- Dupla inativação é rejeitada.
DO $$ BEGIN
  BEGIN
    UPDATE clinical_documents SET inactivation_reason='outra'
     WHERE id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    RAISE EXCEPTION 'FAIL: documento inativado foi alterado novamente';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: alteração de documento inativado bloqueada';
  END;
END $$;
