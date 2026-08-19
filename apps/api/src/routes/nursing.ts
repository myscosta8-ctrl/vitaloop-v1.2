// Rotas REST do Atendimento de Enfermagem
import type { FastifyInstance } from 'fastify';
import { authorize, DomainError } from '@vitaloop/domain';
import type { Database } from '../db.ts';

export function registerNursingRoutes(app: FastifyInstance, db: Database): void {
  // Lista anotações e evoluções de enfermagem
  app.get('/attendances/:id/nursing-records', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'attendance.read');
    const { id: attendanceId } = req.params as { id: string };
    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const evolutions = await c.query(
        `SELECT ne.*, u.full_name as nurse_name
         FROM nursing_evolutions ne
         JOIN users u ON ne.nurse_id = u.id
         WHERE ne.attendance_id = $1 ORDER BY ne.performed_at DESC`,
        [attendanceId]
      );

      const notes = await c.query(
        `SELECT nn.*, u.full_name as professional_name
         FROM nursing_notes nn
         JOIN users u ON nn.professional_id = u.id
         WHERE nn.attendance_id = $1 ORDER BY nn.recorded_at DESC`,
        [attendanceId]
      );

      return reply.send({ evolutions: evolutions.rows, notes: notes.rows });
    });
  });

  // Criar Evolução de Enfermagem (Privativa do Enfermeiro)
  app.post('/attendances/:id/nursing-evolutions', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'evolution.create');
    const { id: attendanceId } = req.params as { id: string };
    const body = req.body as { content: string };

    if (!body.content?.trim()) {
      throw new DomainError('MISSING_REQUIRED_FIELD', 'Conteúdo da evolução é obrigatório');
    }

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `INSERT INTO nursing_evolutions (attendance_id, nurse_id, content)
         VALUES ($1, $2, $3) RETURNING *`,
        [attendanceId, user.userId, body.content]
      );

      await c.query(
        `INSERT INTO attendance_events (attendance_id, event_type, created_by, metadata)
         VALUES ($1, 'NURSING_EVOLUTION', $2, $3)`,
        [attendanceId, user.userId, JSON.stringify({ evolutionId: res.rows[0].id })]
      );

      return reply.code(201).send(res.rows[0]);
    });
  });

  // Criar Anotação de Enfermagem (Técnico / Enfermeiro - Agrupada por atendimento)
  app.post('/attendances/:id/nursing-notes', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'nursingnote.create');
    const { id: attendanceId } = req.params as { id: string };
    const body = req.body as { note: string; procedure?: string };

    if (!body.note?.trim()) {
      throw new DomainError('MISSING_REQUIRED_FIELD', 'Anotação é obrigatória');
    }

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `INSERT INTO nursing_notes (attendance_id, professional_id, note)
         VALUES ($1, $2, $3) RETURNING *`,
        [attendanceId, user.userId, body.procedure ? `[${body.procedure}] ${body.note}` : body.note]
      );

      await c.query(
        `INSERT INTO attendance_events (attendance_id, event_type, created_by, metadata)
         VALUES ($1, 'NURSING_NOTE', $2, $3)`,
        [attendanceId, user.userId, JSON.stringify({ noteId: res.rows[0].id, procedure: body.procedure })]
      );

      return reply.code(201).send(res.rows[0]);
    });
  });

  // Aprazamento manual de prescrição médica (Privativo da enfermagem - ADR-008)
  app.post('/prescriptions/:id/schedule', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'prescription.schedule');
    const { id: prescriptionId } = req.params as { id: string };
    const body = req.body as {
      itemSchedules: Array<{ itemId: string; scheduledTimes: string[] }>;
    };

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      for (const item of body.itemSchedules) {
        await c.query(
          `UPDATE prescription_items
           SET instructions = COALESCE(instructions, '') || ' [Aprazado: ' || $1 || ']'
           WHERE id = $2 AND prescription_id = $3`,
          [item.scheduledTimes.join(', '), item.itemId, prescriptionId]
        );
      }
      return reply.send({ status: 'scheduled', prescriptionId });
    });
  });
}
