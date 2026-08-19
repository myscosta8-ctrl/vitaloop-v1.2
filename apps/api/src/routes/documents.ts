// Rotas REST de Documentos Clínicos e Geração de PDF Institucional
import type { FastifyInstance } from 'fastify';
import { freezeSnapshot, renderDocumentHtml } from '@vitaloop/documents';
import { authorize, DomainError } from '@vitaloop/domain';
import type { Database } from '../db.ts';

export function registerDocumentRoutes(app: FastifyInstance, db: Database): void {
  // Busca lista de tipos de documentos disponíveis
  app.get('/documents/types', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    const res = await db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      return c.query(
        `SELECT dt.*, dv.id as version_id, dv.version
         FROM document_types dt
         JOIN document_versions dv ON dt.id = dv.document_type_id AND dv.active = true
         ORDER BY dt.name ASC`
      );
    });
    return reply.send(res.rows);
  });

  // Lista documentos clínicos de um atendimento
  app.get('/attendances/:id/documents', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'document.read');
    const { id: attendanceId } = req.params as { id: string };
    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `SELECT cd.id, cd.status, cd.released_at, cd.snapshot, dt.code as type_code, dt.name as type_name,
                u.full_name as author_name
         FROM clinical_documents cd
         JOIN document_versions dv ON cd.document_version_id = dv.id
         JOIN document_types dt ON dv.document_type_id = dt.id
         LEFT JOIN users u ON cd.author_id = u.id
         WHERE cd.attendance_id = $1
         ORDER BY cd.created_at DESC`,
        [attendanceId]
      );
      return reply.send(res.rows);
    });
  });

  // Criar e Liberar documento clínico imutável (com Snapshot e PDF)
  app.post('/attendances/:id/documents', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'document.create');
    const { id: attendanceId } = req.params as { id: string };
    const body = req.body as {
      typeCode: string;
      content: Record<string, unknown>;
    };

    if (!body.typeCode || !body.content) {
      throw new DomainError('MISSING_REQUIRED_FIELD', 'Tipo de documento e conteúdo são obrigatórios');
    }

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const typeRes = await c.query(
        `SELECT dt.id as type_id, dt.code, dt.name, dt.require_full_print, dv.id as version_id, dv.version
         FROM document_types dt
         JOIN document_versions dv ON dt.id = dv.document_type_id AND dv.active = true
         WHERE dt.code = $1`,
        [body.typeCode]
      );

      if (typeRes.rows.length === 0) {
        throw new DomainError('ATTENDANCE_NOT_FOUND', `Tipo de documento não encontrado: ${body.typeCode}`);
      }

      const docType = typeRes.rows[0];

      const patientRes = await c.query(
        `SELECT p.full_name, p.medical_record_number
         FROM attendances a JOIN patients p ON a.patient_id = p.id
         WHERE a.id = $1`,
        [attendanceId]
      );

      const patientData = patientRes.rows[0] ?? { full_name: 'Paciente Desconhecido', medical_record_number: 'N/A' };

      const snapshot = freezeSnapshot({
        documentType: docType.code,
        version: docType.version,
        patient: { medicalRecordNumber: patientData.medical_record_number, fullName: patientData.full_name },
        attendanceId,
        author: { id: user.userId, name: 'Profissional UPA' },
        body: body.content,
      });

      const docRes = await c.query(
        `INSERT INTO clinical_documents (
           document_version_id, attendance_id, author_id, status, released_at, snapshot
         ) VALUES ($1, $2, $3, 'LIBERADO', now(), $4)
         RETURNING *`,
        [docType.version_id, attendanceId, user.userId, JSON.stringify(snapshot)]
      );

      return reply.code(201).send(docRes.rows[0]);
    });
  });

  // Download do PDF institucional a partir do Snapshot imutável
  app.get('/documents/:id/pdf', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'document.read');
    const { id: docId } = req.params as { id: string };

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const res = await c.query(
        `SELECT cd.snapshot, dt.code, dt.name, dt.require_full_print
         FROM clinical_documents cd
         JOIN document_versions dv ON cd.document_version_id = dv.id
         JOIN document_types dt ON dv.document_type_id = dt.id
         WHERE cd.id = $1`,
        [docId]
      );

      if (res.rows.length === 0) {
        throw new DomainError('ATTENDANCE_NOT_FOUND', 'Documento não encontrado');
      }

      const row = res.rows[0];
      const snapshot = row.snapshot;
      const html = renderDocumentHtml(snapshot, {
        code: row.code,
        name: row.name,
        professionScope: 'MULTI',
        requireFullPrint: row.require_full_print,
      });

      return reply
        .header('Content-Type', 'text/html; charset=utf-8')
        .header('Content-Disposition', `inline; filename="${row.code}_${docId}.html"`)
        .send(html);
    });
  });
}
