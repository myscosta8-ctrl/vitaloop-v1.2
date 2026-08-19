-- =====================================================================
-- V0012 — Correção: política SELECT/UPDATE da própria tabela attendances.
--
-- `can_access_attendance(uid, id)` faz EXISTS na tabela attendances. Quando
-- usada como política SELECT da PRÓPRIA tabela, um `INSERT ... RETURNING`
-- avalia a política sobre a linha recém-inserida, que ainda não está visível a
-- uma subconsulta dentro do mesmo comando → EXISTS falso → falha indevida.
-- Para a própria tabela, a verificação de existência é redundante: basta a
-- permissão. can_access_attendance continua válido nas tabelas-filhas, onde o
-- atendimento referenciado já existe.
-- =====================================================================

DROP POLICY IF EXISTS att_read ON attendances;
CREATE POLICY att_read ON attendances FOR SELECT
  USING (has_permission(app.current_user_id(), 'attendance.read'));

DROP POLICY IF EXISTS att_update ON attendances;
CREATE POLICY att_update ON attendances FOR UPDATE
  USING (has_permission(app.current_user_id(), 'attendance.update'));
