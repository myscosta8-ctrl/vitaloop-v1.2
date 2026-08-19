-- =====================================================================
-- V0013 — Leitos Reais da UPA, Protocolo Manchester e Atualizações
-- Baseado nas definições institucionais validadas pela UPA.
-- =====================================================================

-- 1. Garantir setores específicos da UPA
INSERT INTO upa_sectors(code, name) VALUES
  ('INTERNACAO_ADULTO', 'Internação Adulto'),
  ('PEDIATRIA', 'Pediatria'),
  ('SUTURA', 'Sala de Sutura')
ON CONFLICT (code) DO NOTHING;

-- 2. Tabela do Protocolo Manchester e Tempos Alvo
CREATE TABLE IF NOT EXISTS triage_classifications (
  code text PRIMARY KEY,
  name text NOT NULL,
  priority int NOT NULL,
  target_minutes int NOT NULL,
  color_hex text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

INSERT INTO triage_classifications(code, name, priority, target_minutes, color_hex) VALUES
  ('VERMELHO', 'Emergência', 1, 0, '#DC2626'),
  ('LARANJA', 'Muito Urgente', 2, 10, '#EA580C'),
  ('AMARELO', 'Urgente', 3, 60, '#D97706'),
  ('VERDE', 'Pouco Urgente', 4, 120, '#16A34A'),
  ('AZUL', 'Não Urgente', 5, 240, '#2563EB')
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      priority = EXCLUDED.priority,
      target_minutes = EXCLUDED.target_minutes,
      color_hex = EXCLUDED.color_hex;

GRANT SELECT ON triage_classifications TO vitaloop_app;
ALTER TABLE triage_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_classifications FORCE ROW LEVEL SECURITY;
CREATE POLICY triage_classifications_read ON triage_classifications FOR SELECT USING (true);

-- 3. Carga dos Leitos Físicos Reais da UPA
-- Sala Vermelha (4 leitos)
INSERT INTO beds(code, name, state, is_extra) VALUES
  ('EMERG_01', 'Leito Emergência 01', 'LIVRE', false),
  ('EMERG_02', 'Leito Emergência 02', 'LIVRE', false),
  ('EMERG_03', 'Leito Emergência 03', 'LIVRE', false),
  ('EMERG_04', 'Leito Emergência 04', 'LIVRE', false)
ON CONFLICT (code) DO NOTHING;

-- Internação Adulto (17 leitos, sendo 1 isolamento)
INSERT INTO beds(code, name, state, is_extra, isolation_reason) VALUES
  ('INT_ADULT_01', 'Leito Internação Adulto 01', 'LIVRE', false, NULL),
  ('INT_ADULT_02', 'Leito Internação Adulto 02', 'LIVRE', false, NULL),
  ('INT_ADULT_03', 'Leito Internação Adulto 03', 'LIVRE', false, NULL),
  ('INT_ADULT_04', 'Leito Internação Adulto 04', 'LIVRE', false, NULL),
  ('INT_ADULT_05', 'Leito Internação Adulto 05', 'LIVRE', false, NULL),
  ('INT_ADULT_06', 'Leito Internação Adulto 06', 'LIVRE', false, NULL),
  ('INT_ADULT_07', 'Leito Internação Adulto 07', 'LIVRE', false, NULL),
  ('INT_ADULT_08', 'Leito Internação Adulto 08', 'LIVRE', false, NULL),
  ('INT_ADULT_09', 'Leito Internação Adulto 09', 'LIVRE', false, NULL),
  ('INT_ADULT_10', 'Leito Internação Adulto 10', 'LIVRE', false, NULL),
  ('INT_ADULT_11', 'Leito Internação Adulto 11', 'LIVRE', false, NULL),
  ('INT_ADULT_12', 'Leito Internação Adulto 12', 'LIVRE', false, NULL),
  ('INT_ADULT_13', 'Leito Internação Adulto 13', 'LIVRE', false, NULL),
  ('INT_ADULT_14', 'Leito Internação Adulto 14', 'LIVRE', false, NULL),
  ('INT_ADULT_15', 'Leito Internação Adulto 15', 'LIVRE', false, NULL),
  ('INT_ADULT_16', 'Leito Internação Adulto 16', 'LIVRE', false, NULL),
  ('INT_ADULT_ISO', 'Leito Isolamento Internação Adulto', 'LIVRE', false, 'Isolamento Respiratório/Contacto')
ON CONFLICT (code) DO NOTHING;

-- Pediatria (6 leitos, sendo 1 isolamento)
INSERT INTO beds(code, name, state, is_extra, isolation_reason) VALUES
  ('PED_01', 'Leito Pediatria 01', 'LIVRE', false, NULL),
  ('PED_02', 'Leito Pediatria 02', 'LIVRE', false, NULL),
  ('PED_03', 'Leito Pediatria 03', 'LIVRE', false, NULL),
  ('PED_04', 'Leito Pediatria 04', 'LIVRE', false, NULL),
  ('PED_05', 'Leito Pediatria 05', 'LIVRE', false, NULL),
  ('PED_ISO', 'Leito Isolamento Pediatria', 'LIVRE', false, 'Isolamento Pediatria')
ON CONFLICT (code) DO NOTHING;

-- Observação (9 leitos, sendo 1 isolamento)
INSERT INTO beds(code, name, state, is_extra, isolation_reason) VALUES
  ('OBS_01', 'Leito Observação 01', 'LIVRE', false, NULL),
  ('OBS_02', 'Leito Observação 02', 'LIVRE', false, NULL),
  ('OBS_03', 'Leito Observação 03', 'LIVRE', false, NULL),
  ('OBS_04', 'Leito Observação 04', 'LIVRE', false, NULL),
  ('OBS_05', 'Leito Observação 05', 'LIVRE', false, NULL),
  ('OBS_06', 'Leito Observação 06', 'LIVRE', false, NULL),
  ('OBS_07', 'Leito Observação 07', 'LIVRE', false, NULL),
  ('OBS_08', 'Leito Observação 08', 'LIVRE', false, NULL),
  ('OBS_ISO', 'Leito Isolamento Observação', 'LIVRE', false, 'Isolamento Observação')
ON CONFLICT (code) DO NOTHING;

-- Sala de Sutura (1 leito)
INSERT INTO beds(code, name, state, is_extra) VALUES
  ('SUTURA_01', 'Leito Procedimento / Sutura 01', 'LIVRE', false)
ON CONFLICT (code) DO NOTHING;

-- 4. Função para auto-fechar leito extra inativo por mais de 30 minutos sem atendimento alocado
CREATE OR REPLACE FUNCTION app.cleanup_idle_extra_beds() RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_closed_count int := 0;
BEGIN
  -- Atualizar leitos extras desocupados que excederam 30 minutos
  WITH idle_extras AS (
    SELECT b.id FROM beds b
    WHERE b.is_extra = true
      AND b.state IN ('LIVRE', 'LEITO_EXTRA_DISPONIVEL')
      AND NOT EXISTS (
        SELECT 1 FROM bed_assignments ba
        WHERE ba.bed_id = b.id AND ba.released_at IS NULL
      )
      AND (
        (b.extra_empty_since IS NOT NULL AND b.extra_empty_since <= now() - INTERVAL '30 minutes')
        OR (b.extra_empty_since IS NULL AND b.updated_at <= now() - INTERVAL '30 minutes')
      )
  )
  UPDATE beds
  SET state = 'DESATIVADO', active = false, updated_at = now()
  WHERE id IN (SELECT id FROM idle_extras);

  GET DIAGNOSTICS v_closed_count = ROW_COUNT;
  RETURN v_closed_count;
END $$;

GRANT EXECUTE ON FUNCTION app.cleanup_idle_extra_beds() TO vitaloop_app;
