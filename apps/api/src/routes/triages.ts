// Rotas REST de Triagem e Sinais Vitais (Manchester)
import type { FastifyInstance } from 'fastify';
import { authorize, DomainError } from '@vitaloop/domain';
import type { Database } from '../db.ts';

export function registerTriageRoutes(app: FastifyInstance, db: Database): void {
  // Lista classificações Manchester
  app.get('/triage/classifications', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    const res = await db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      return c.query(
        `SELECT code, name, priority, target_minutes, color_hex FROM triage_classifications WHERE active = true ORDER BY priority ASC`
      );
    });
    return reply.send(res.rows);
  });

  // Fila de triagem / classificação
  app.get('/triage/queue', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'attendance.read');
    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `SELECT a.id as attendance_id, a.opened_at, p.id as patient_id, p.full_name, p.medical_record_number,
                t.classification, t.priority, tc.color_hex, tc.target_minutes
         FROM attendances a
         JOIN patients p ON a.patient_id = p.id
         LEFT JOIN triages t ON t.attendance_id = a.id
         LEFT JOIN triage_classifications tc ON t.classification = tc.code
         WHERE a.status IN ('ABERTO', 'EM_TRIAGEM')
         ORDER BY COALESCE(t.priority, 99) ASC, a.opened_at ASC`
      );
      return reply.send(res.rows);
    });
  });

  // Salvar triagem Manchester
  app.post('/attendances/:id/triage', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'triage.create');
    const { id: attendanceId } = req.params as { id: string };
    const body = req.body as {
      complaint: string;
      classification: string;
      notes?: string;
      vitals?: {
        temperature?: number;
        heartRate?: number;
        respiratoryRate?: number;
        systolicBp?: number;
        diastolicBp?: number;
        oxygenSaturation?: number;
        painScale?: number;
        weight?: number;
        glucose?: number;
      };
    };

    if (!body.classification) {
      throw new DomainError('MISSING_REQUIRED_FIELD', 'Classificação de risco é obrigatória');
    }

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const classRes = await c.query(
        `SELECT priority FROM triage_classifications WHERE code = $1`,
        [body.classification]
      );
      const priority = classRes.rows[0]?.priority ?? 3;

      const triageRes = await c.query(
        `INSERT INTO triages (attendance_id, professional_id, complaint, classification, priority, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [attendanceId, user.userId, body.complaint, body.classification, priority, body.notes ?? null]
      );

      if (body.vitals) {
        await c.query(
          `INSERT INTO vital_signs (
             attendance_id, professional_id, temperature, heart_rate, respiratory_rate,
             systolic_bp, diastolic_bp, oxygen_saturation, pain_scale, weight, glucose
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            attendanceId,
            user.userId,
            body.vitals.temperature ?? null,
            body.vitals.heartRate ?? null,
            body.vitals.respiratoryRate ?? null,
            body.vitals.systolicBp ?? null,
            body.vitals.diastolicBp ?? null,
            body.vitals.oxygenSaturation ?? null,
            body.vitals.painScale ?? null,
            body.vitals.weight ?? null,
            body.vitals.glucose ?? null,
          ]
        );
      }

      await c.query(
        `UPDATE attendances SET status = 'EM_ATENDIMENTO', updated_at = now() WHERE id = $1 AND status = 'EM_TRIAGEM'`,
        [attendanceId]
      );

      await c.query(
        `INSERT INTO attendance_events (attendance_id, event_type, created_by, metadata)
         VALUES ($1, 'TRIAGE_DONE', $2, $3)`,
        [attendanceId, user.userId, JSON.stringify({ classification: body.classification, priority })]
      );

      return reply.code(201).send(triageRes.rows[0]);
    });
  });
}
