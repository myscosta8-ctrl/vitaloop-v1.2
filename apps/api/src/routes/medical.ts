// Rotas REST do Atendimento Médico (Evolução Médica, Prescrição, Formulários)
import type { FastifyInstance } from 'fastify';
import { authorize, DomainError } from '@vitaloop/domain';
import type { Database } from '../db.ts';

export function registerMedicalRoutes(app: FastifyInstance, db: Database): void {
  // Lista evoluções médicas do atendimento
  app.get('/attendances/:id/medical-evolutions', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'attendance.read');
    const { id: attendanceId } = req.params as { id: string };
    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `SELECT me.*, u.full_name as physician_name
         FROM medical_evolutions me
         JOIN users u ON me.physician_id = u.id
         WHERE me.attendance_id = $1
         ORDER BY me.performed_at DESC`,
        [attendanceId]
      );
      return reply.send(res.rows);
    });
  });

  // Criar evolução médica diária / intercorrência
  app.post('/attendances/:id/medical-evolutions', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'evolution.create');
    const { id: attendanceId } = req.params as { id: string };
    const body = req.body as {
      subjective?: string;
      objective?: string;
      assessment?: string;
      plan?: string;
      isIntercurrence?: boolean;
    };

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `INSERT INTO medical_evolutions (
           attendance_id, physician_id, subjective, objective, assessment, plan, is_intercurrence
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          attendanceId,
          user.userId,
          body.subjective ?? null,
          body.objective ?? null,
          body.assessment ?? null,
          body.plan ?? null,
          body.isIntercurrence ?? false,
        ]
      );

      await c.query(
        `INSERT INTO attendance_events (attendance_id, event_type, created_by, metadata)
         VALUES ($1, 'MEDICAL_EVOLUTION', $2, $3)`,
        [attendanceId, user.userId, JSON.stringify({ evolutionId: res.rows[0].id })]
      );

      return reply.code(201).send(res.rows[0]);
    });
  });

  // Criar Prescrição Médica
  app.post('/attendances/:id/medical-prescriptions', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'prescription.create');
    const { id: attendanceId } = req.params as { id: string };
    const body = req.body as {
      items: Array<{
        medicationName: string;
        dosage: string;
        route: string;
        frequency: string;
        instructions?: string;
      }>;
    };

    if (!body.items || body.items.length === 0) {
      throw new DomainError('MISSING_REQUIRED_FIELD', 'Prescrição médica deve possuir ao menos 1 item');
    }

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const presRes = await c.query(
        `INSERT INTO medical_prescriptions (attendance_id, physician_id)
         VALUES ($1, $2) RETURNING *`,
        [attendanceId, user.userId]
      );

      const prescriptionId = presRes.rows[0].id;
      for (const item of body.items) {
        await c.query(
          `INSERT INTO prescription_items (
             prescription_id, medication_name, dosage, route, frequency, instructions
           ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [prescriptionId, item.medicationName, item.dosage, item.route, item.frequency, item.instructions ?? null]
        );
      }

      await c.query(
        `INSERT INTO attendance_events (attendance_id, event_type, created_by, metadata)
         VALUES ($1, 'MEDICAL_PRESCRIPTION', $2, $3)`,
        [attendanceId, user.userId, JSON.stringify({ prescriptionId, itemCount: body.items.length })]
      );

      return reply.code(201).send(presRes.rows[0]);
    });
  });
}
