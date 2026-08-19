// Composição do servidor Fastify: CORS, hook de autenticação por sessão,
// tratamento de erros estruturado (DomainError + erros de banco → HTTP), rotas.
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { DEFAULT_SESSION_POLICY } from '@vitaloop/auth';
import { DomainError, type DomainErrorCode } from '@vitaloop/domain';
import type { ApiConfig } from './config.ts';
import { Database } from './db.ts';
import { authenticate, type RequestUser } from './context.ts';
import { registerAuthRoutes } from './routes/auth.ts';
import { registerPatientRoutes } from './routes/patients.ts';
import { registerAttendanceRoutes } from './routes/attendances.ts';
import { registerTriageRoutes } from './routes/triages.ts';
import { registerMedicalRoutes } from './routes/medical.ts';
import { registerNursingRoutes } from './routes/nursing.ts';
import { registerBedRoutes } from './routes/beds.ts';
import { registerDocumentRoutes } from './routes/documents.ts';
import { registerOutcomeRoutes } from './routes/outcomes.ts';

declare module 'fastify' {
  interface FastifyRequest {
    user: RequestUser | null;
  }
}

// Mapeia erros de banco (mensagens dos triggers) para códigos de domínio.
function mapPgError(message: string): { status: number; code: DomainErrorCode } | null {
  const table: Array<[string, number, DomainErrorCode]> = [
    ['DOCUMENT_IMMUTABLE', 409, 'DOCUMENT_IMMUTABLE'],
    ['DOCUMENT_ALREADY_INACTIVATED', 409, 'DOCUMENT_ALREADY_INACTIVATED'],
    ['INVALID_STATE_TRANSITION', 409, 'INVALID_STATE_TRANSITION'],
    ['ATTENDANCE_ALREADY_CLOSED', 409, 'ATTENDANCE_ALREADY_CLOSED'],
    ['ATTENDANCE_NOT_FOUND', 404, 'ATTENDANCE_NOT_FOUND'],
    ['INVALID_OUTCOME', 422, 'INVALID_OUTCOME'],
    ['UNAUTHORIZED_ACTION', 403, 'UNAUTHORIZED_ACTION'],
  ];
  for (const [needle, status, code] of table) {
    if (message.includes(needle)) return { status, code };
  }
  return null;
}

export function buildServer(config: ApiConfig, db = new Database(config.databaseUrl)): FastifyInstance {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });
  void app.register(cors, { origin: config.corsOrigin, credentials: true });

  // Hook de autenticação: extrai o token Bearer e resolve o usuário.
  app.decorateRequest('user', null);
  app.addHook('preHandler', async (req) => {
    const auth = req.headers['authorization'];
    if (auth?.startsWith('Bearer ')) {
      req.user = await authenticate(db, auth.slice(7), DEFAULT_SESSION_POLICY);
    }
  });

  // Tratamento de erros estruturado.
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof DomainError) {
      const status =
        err.code === 'UNAUTHORIZED_ACTION' ? 403 :
        err.code === 'DUPLICATE_PATIENT' ? 409 :
        err.code.endsWith('NOT_FOUND') ? 404 : 422;
      return reply.code(status).send({ error: err.code, message: err.message, details: err.details });
    }
    // ZodError → 400.
    if ((err as { name?: string }).name === 'ZodError') {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', details: (err as { issues?: unknown }).issues });
    }
    const message = (err as { message?: string }).message ?? '';
    const mapped = mapPgError(message);
    if (mapped) return reply.code(mapped.status).send({ error: mapped.code, message });
    // RLS/privilégio negado.
    if ((err as { code?: string }).code === '42501') {
      return reply.code(403).send({ error: 'UNAUTHORIZED_ACTION', message: 'RLS/permissão negada' });
    }
    reply.log.error(err);
    return reply.code(500).send({ error: 'INTERNAL_ERROR' });
  });

  app.get('/health', async () => ({ status: 'ok', env: config.env }));

  registerAuthRoutes(app, db);
  registerPatientRoutes(app, db);
  registerAttendanceRoutes(app, db);
  registerTriageRoutes(app, db);
  registerMedicalRoutes(app, db);
  registerNursingRoutes(app, db);
  registerBedRoutes(app, db);
  registerDocumentRoutes(app, db);
  registerOutcomeRoutes(app, db);

  return app;
}

