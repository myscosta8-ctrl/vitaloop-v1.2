// Configuração da API a partir do ambiente (nunca segredos hardcoded).
export interface ApiConfig {
  env: string;
  host: string;
  port: number;
  corsOrigin: string;
  databaseUrl: string;
  sessionIdleTimeoutMinutes: number;
  sessionMaxDevices: number;
}

export function loadConfig(): ApiConfig {
  const {
    ENVIRONMENT = 'development',
    API_HOST = '0.0.0.0',
    API_PORT = '3333',
    CORS_ORIGIN = 'http://localhost:5173',
    // A API usa a role de aplicação (não-superuser), sujeita a RLS.
    DATABASE_APP_URL = process.env.DATABASE_URL ??
      'postgres://vitaloop_app:devpass@127.0.0.1:55432/vitaloop_upa',
    SESSION_IDLE_TIMEOUT_MINUTES = '30',
    SESSION_MAX_DEVICES = '2',
  } = process.env;

  return {
    env: ENVIRONMENT,
    host: API_HOST,
    port: Number(API_PORT),
    corsOrigin: CORS_ORIGIN,
    databaseUrl: DATABASE_APP_URL,
    sessionIdleTimeoutMinutes: Number(SESSION_IDLE_TIMEOUT_MINUTES),
    sessionMaxDevices: Number(SESSION_MAX_DEVICES),
  };
}
