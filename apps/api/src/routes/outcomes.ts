// Rotas REST de Desfecho e Encerramento Atômico de Atendimento com Liberação de Leito
import type { FastifyInstance } from 'fastify';
import { authorize, DomainError } from '@vitaloop/domain';
import type { Database } from '../db.ts';

export function registerOutcomeRoutes(app: FastifyInstance, db: Database): void {
  // Busca opções de desfecho do catálogo
  app.get('/outcomes', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    const res = await db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      return c.query(`SELECT code, name, requires_physician FROM outcomes ORDER BY name ASC`);
    });
    return reply.send(res.rows);
  });

  // Registrar Desfecho e Encerrar Atendimento (Atômico + Liberação de Leito + Auditoria)
  app.post('/attendances/:id/outcome', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'outcome.create');
    const { id: attendanceId } = req.params as { id: string };
    const body = req.body as {
      outcomeCode: string;
      notes?: string;
      destinationUnit?: string;
    };

    if (!body.outcomeCode) {
      throw new DomainError('MISSING_REQUIRED_FIELD', 'Código do desfecho é obrigatório');
    }

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const outcomeCheck = await c.query(
        `SELECT code, name, requires_physician FROM outcomes WHERE code = $1`,
        [body.outcomeCode]
      );

      if (outcomeCheck.rows.length === 0) {
        throw new DomainError('INVALID_OUTCOME', `Código de desfecho inválido: ${body.outcomeCode}`);
      }

      await c.query(
        `INSERT INTO attendance_outcomes (attendance_id, outcome_id, recorded_by, notes)
         SELECT $1, o.id, $2, $3
         FROM outcomes o WHERE o.code = $4`,
        [attendanceId, user.userId, body.notes ?? null, body.outcomeCode]
      );

      if (body.outcomeCode === 'TRANSFERENCIA' && body.destinationUnit) {
        await c.query(
          `INSERT INTO transfers (attendance_id, requested_by, destination_unit, status)
           VALUES ($1, $2, $3, 'SOLICITADA')`,
          [attendanceId, user.userId, body.destinationUnit]
        );
      }

      const activeBed = await c.query(
        `SELECT id, bed_id FROM bed_assignments WHERE attendance_id = $1 AND released_at IS NULL`,
        [attendanceId]
      );

      if (activeBed.rows.length > 0) {
        const assignId = activeBed.rows[0].id;
        const bedId = activeBed.rows[0].bed_id;

        await c.query(
          `UPDATE bed_assignments SET released_at = now(), released_by = $1 WHERE id = $2`,
          [user.userId, assignId]
        );

        await c.query(
          `UPDATE beds SET state = 'LIVRE', extra_empty_since = CASE WHEN is_extra = true THEN now() ELSE NULL END, updated_at = now() WHERE id = $1`,
          [bedId]
        );
      }

      await c.query(
        `UPDATE attendances
         SET status = 'ENCERRADO', closed_at = now(), closed_by = $1, updated_at = now()
         WHERE id = $2`,
        [user.userId, attendanceId]
      );

      await c.query(
        `INSERT INTO attendance_events (attendance_id, event_type, created_by, metadata)
         VALUES ($1, 'ATTENDANCE_CLOSED', $2, $3)`,
        [attendanceId, user.userId, JSON.stringify({ outcomeCode: body.outcomeCode, notes: body.notes })]
      );

      return reply.send({
        status: 'closed',
        attendanceId,
        outcome: body.outcomeCode,
        closedAt: new Date().toISOString(),
      });
    });
  });
}
