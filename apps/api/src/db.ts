// Acesso a dados com propagação de identidade para o RLS (ADR-006).
// Toda operação da API roda em transação com `app.user_id`/`app.session_id`
// setados via SET LOCAL, de modo que as políticas RLS avaliem o usuário real.
import pg from 'pg';

export interface RlsIdentity {
  userId: string | null;
  sessionId?: string | null;
}

export class Database {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString, max: 10 });
  }

  /** Executa `fn` dentro de uma transação, com o contexto RLS aplicado. */
  async withUserTx<T>(identity: RlsIdentity, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // set_config(..., true) = escopo de transação (SET LOCAL).
      await client.query('SELECT set_config($1, $2, true)', [
        'app.user_id',
        identity.userId ?? '',
      ]);
      await client.query('SELECT set_config($1, $2, true)', [
        'app.session_id',
        identity.sessionId ?? '',
      ]);
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /** Transação sem identidade — apenas para autenticação (login), que precisa
   *  ler `users` antes de haver sessão. As políticas de `users` permitem o
   *  self-read; o login usa uma consulta específica e parametrizada. */
  async loginTx<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    return this.withUserTx({ userId: null }, fn);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
