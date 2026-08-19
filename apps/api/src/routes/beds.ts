// Rotas REST de Leitos da UPA, Alocação, Leitos Extras e Encerramento Automático (30min)
import type { FastifyInstance } from 'fastify';
import { authorize, DomainError } from '@vitaloop/domain';
import type { Database } from '../db.ts';

export function registerBedRoutes(app: FastifyInstance, db: Database): void {
  // Lista mapa de leitos com ocupante ativo e executa auto-cleanup de leitos extras ociosos
  app.get('/beds', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'bed.read');
    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      await c.query(`SELECT app.cleanup_idle_extra_beds()`);

      const res = await c.query(
        `SELECT b.id, b.code, b.name, b.state, b.is_extra, b.isolation_reason, b.active,
                ba.id as assignment_id, ba.assigned_at,
                a.id as attendance_id, p.full_name as patient_name, p.medical_record_number
         FROM beds b
         LEFT JOIN bed_assignments ba ON b.id = ba.bed_id AND ba.released_at IS NULL
         LEFT JOIN attendances a ON ba.attendance_id = a.id
         LEFT JOIN patients p ON a.patient_id = p.id
         WHERE b.active = true
         ORDER BY b.code ASC`
      );
      return reply.send(res.rows);
    });
  });

  // Abrir Leito Extra em qualquer setor da UPA
  app.post('/beds/extra', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'bed.manage');
    const body = req.body as { sectorCode?: string; name?: string };

    const code = `EXTRA_${body.sectorCode || 'GERAL'}_${Date.now().toString().slice(-4)}`;
    const bedName = body.name || `Leito Extra (${body.sectorCode || 'Geral'})`;

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `INSERT INTO beds (code, name, state, is_extra, extra_empty_since)
         VALUES ($1, $2, 'LEITO_EXTRA_DISPONIVEL', true, now())
         RETURNING *`,
        [code, bedName]
      );
      return reply.code(201).send(res.rows[0]);
    });
  });

  // Alocar atendimento em leito
  app.post('/beds/:id/assign', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'bed.assign');
    const { id: bedId } = req.params as { id: string };
    const body = req.body as { attendanceId: string };

    if (!body.attendanceId) {
      throw new DomainError('MISSING_REQUIRED_FIELD', 'Nº de Atendimento é obrigatório');
    }

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const assignRes = await c.query(
        `INSERT INTO bed_assignments (bed_id, attendance_id, assigned_by)
         VALUES ($1, $2, $3) RETURNING *`,
        [bedId, body.attendanceId, user.userId]
      );

      await c.query(
        `UPDATE beds SET state = 'OCUPADO', extra_empty_since = NULL, updated_at = now() WHERE id = $1`,
        [bedId]
      );

      await c.query(
        `UPDATE attendances SET status = 'OBSERVACAO', updated_at = now() WHERE id = $1 AND status <> 'ENCERRADO'`,
        [body.attendanceId]
      );

      await c.query(
        `INSERT INTO bed_events (bed_id, event_type, to_state, attendance_id, created_by)
         VALUES ($1, 'ASSIGN', 'OCUPADO', $2, $3)`,
        [bedId, body.attendanceId, user.userId]
      );

      return reply.code(201).send(assignRes.rows[0]);
    });
  });

  // Liberar leito
  app.post('/beds/:id/release', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'bed.release');
    const { id: bedId } = req.params as { id: string };

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const activeAssign = await c.query(
        `SELECT id, attendance_id FROM bed_assignments WHERE bed_id = $1 AND released_at IS NULL`,
        [bedId]
      );

      if (activeAssign.rows.length === 0) {
        throw new DomainError('INVALID_STATE_TRANSITION', 'Leito já está livre');
      }

      const assignmentId = activeAssign.rows[0].id;
      const attendanceId = activeAssign.rows[0].attendance_id;

      await c.query(
        `UPDATE bed_assignments SET released_at = now(), released_by = $1 WHERE id = $2`,
        [user.userId, assignmentId]
      );

      await c.query(
        `UPDATE beds SET state = 'LIVRE', extra_empty_since = CASE WHEN is_extra = true THEN now() ELSE NULL END, updated_at = now() WHERE id = $1`,
        [bedId]
      );

      await c.query(
        `INSERT INTO bed_events (bed_id, event_type, from_state, to_state, attendance_id, created_by)
         VALUES ($1, 'RELEASE', 'OCUPADO', 'LIVRE', $2, $3)`,
        [bedId, attendanceId, user.userId]
      );

      return reply.send({ status: 'released', bedId, assignmentId });
    });
  });
}
