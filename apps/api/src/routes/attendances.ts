// Rotas de atendimento: abrir e encerrar (via close_attendance atômico).
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authorize } from '@vitaloop/domain';
import type { Database } from '../db.ts';

const OpenAttendance = z.object({
  patientId: z.string().uuid(),
  sectorId: z.string().uuid(),
  reason: z.string().optional(),
  type: z.string().optional(),
});

const CloseAttendance = z.object({
  outcomeCode: z.enum(['ALTA', 'TRANSFERENCIA', 'OBITO', 'EVASAO', 'MELHOR_EM_CASA', 'OUTRO']),
  notes: z.string().optional(),
});

export function registerAttendanceRoutes(app: FastifyInstance, db: Database): void {
  app.post('/attendances', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'attendance.create');
    const body = OpenAttendance.parse(req.body);
    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const ins = await c.query(
        `INSERT INTO attendances(patient_id, sector_id, reason, type, opened_by)
         VALUES ($1,$2,$3,$4,$5) RETURNING id, status`,
        [body.patientId, body.sectorId, body.reason ?? null, body.type ?? null, user.userId],
      );
      await c.query(
        `INSERT INTO attendance_events(attendance_id, event_type, created_by)
         VALUES ($1,'OPENED',$2)`,
        [ins.rows[0].id, user.userId],
      );
      await c.query(
        `INSERT INTO audit_events(actor_id, action, entity_type, entity_id)
         VALUES ($1,'CREATE','attendance',$2)`,
        [user.userId, ins.rows[0].id],
      );
      return reply.code(201).send(ins.rows[0]);
    });
  });

  // Encerramento atômico: a função close_attendance autoriza, registra desfecho,
  // libera leito, encerra e audita — tudo em uma transação (Master §61).
  app.post('/attendances/:id/close', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'outcome.create');
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = CloseAttendance.parse(req.body);
    await db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      await c.query('SELECT close_attendance($1,$2,$3)', [id, body.outcomeCode, body.notes ?? null]);
    });
    return reply.send({ ok: true, attendanceId: id, outcome: body.outcomeCode });
  });
}
