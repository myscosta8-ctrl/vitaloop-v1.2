// Rotas de paciente: criação com geração automática de Prontuário Único,
// CPF opcional (para pacientes desacordados / emergência) e busca por nome/CPF/Prontuário.
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authorize, DomainError } from '@vitaloop/domain';
import { isValidCPF, isValidCNS, onlyDigits } from '@vitaloop/validation';
import type { Database } from '../db.ts';

const CreatePatient = z.object({
  medicalRecordNumber: z.string().optional(),
  fullName: z.string().min(1),
  cpf: z.string().optional(),
  cns: z.string().optional(),
  socialName: z.string().optional(),
  motherName: z.string().optional(),
  birthDate: z.string().optional(),
  sex: z.enum(['F', 'M', 'I', 'O']).optional(),
  cityOfOrigin: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  insurance: z.string().optional(),
});

export function registerPatientRoutes(app: FastifyInstance, db: Database): void {
  app.post('/patients', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'patient.create');

    const body = CreatePatient.parse(req.body);
    const cpf = body.cpf && body.cpf.trim() !== '' ? onlyDigits(body.cpf) : null;
    const cns = body.cns && body.cns.trim() !== '' ? onlyDigits(body.cns) : null;

    if (cpf && !isValidCPF(cpf)) throw new DomainError('MISSING_REQUIRED_FIELD', 'CPF inválido');
    if (cns && !isValidCNS(cns)) throw new DomainError('MISSING_REQUIRED_FIELD', 'CNS inválido');

    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      // 1. Verificação de duplicidade de CPF/CNS (quando fornecido)
      if (cpf || cns) {
        const dup = await c.query(
          'SELECT id FROM patients WHERE (cpf IS NOT NULL AND cpf=$1) OR (cns IS NOT NULL AND cns=$2) LIMIT 1',
          [cpf, cns],
        );
        if (dup.rows[0]) throw new DomainError('DUPLICATE_PATIENT', 'Paciente já cadastrado', {
          patientId: dup.rows[0].id,
        });
      }

      // 2. Geração Automática de Prontuário Único se não fornecido
      let medicalRecordNumber = body.medicalRecordNumber?.trim();
      if (!medicalRecordNumber) {
        let isUnique = false;
        while (!isUnique) {
          const randomSuffix = Math.floor(100000 + Math.random() * 900000);
          medicalRecordNumber = `PRONT-2026-${randomSuffix}`;
          const check = await c.query(
            'SELECT 1 FROM patients WHERE medical_record_number = $1',
            [medicalRecordNumber]
          );
          if (check.rows.length === 0) isUnique = true;
        }
      } else {
        // Garantir que Prontuário fornecido manualmente é único
        const check = await c.query(
          'SELECT 1 FROM patients WHERE medical_record_number = $1',
          [medicalRecordNumber]
        );
        if (check.rows.length > 0) {
          throw new DomainError('DUPLICATE_PATIENT', `Número de Prontuário ${medicalRecordNumber} já pertence a outro paciente`);
        }
      }

      const ins = await c.query(
        `INSERT INTO patients(medical_record_number, full_name, cpf, cns, social_name,
            mother_name, birth_date, sex, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, medical_record_number`,
        [
          medicalRecordNumber,
          body.fullName,
          cpf,
          cns,
          body.socialName ?? null,
          body.motherName ?? null,
          body.birthDate ?? null,
          body.sex ?? 'M',
          user.userId,
        ],
      );

      await c.query(
        `INSERT INTO audit_events(actor_id, action, entity_type, entity_id)
         VALUES ($1,'CREATE','patient',$2)`,
        [user.userId, ins.rows[0].id],
      );

      return reply.code(201).send({
        id: ins.rows[0].id,
        medicalRecordNumber: ins.rows[0].medical_record_number,
      });
    });
  });

  app.get('/patients', async (req, reply) => {
    const user = req.user;
    if (!user) return reply.code(401).send({ error: 'UNAUTHENTICATED' });
    authorize(user, 'patient.read');
    const q = z.object({ q: z.string().optional() }).parse(req.query);
    return db.withUserTx({ userId: user.userId, sessionId: user.sessionId }, async (c) => {
      const rows = await c.query(
        `SELECT id, medical_record_number, full_name, cpf, cns, mother_name, birth_date, sex
         FROM patients
         WHERE ($1::text IS NULL OR lower(full_name) LIKE '%'||lower($1)||'%'
                OR medical_record_number = $1 OR cpf = $1)
         ORDER BY full_name LIMIT 50`,
        [q.q ?? null],
      );
      return reply.send({ patients: rows.rows });
    });
  });
}
