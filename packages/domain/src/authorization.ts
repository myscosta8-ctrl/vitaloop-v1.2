// Camada única de autorização (Implementação §35). Função pura: recebe o
// conjunto de permissões efetivas do usuário e o contexto, decide.
// A verdade final ainda é reforçada por RLS no banco (defesa em profundidade).
import { DomainError } from './errors.ts';

export interface AuthContext {
  userId: string;
  isActive: boolean;
  permissions: ReadonlySet<string>;
}

export function can(ctx: AuthContext, permission: string): boolean {
  if (!ctx.isActive) return false;
  return ctx.permissions.has(permission);
}

/** Autoriza ou lança UNAUTHORIZED_ACTION. */
export function authorize(ctx: AuthContext, permission: string): void {
  if (!can(ctx, permission)) {
    throw new DomainError('UNAUTHORIZED_ACTION', `Ação não autorizada: ${permission}`, {
      userId: ctx.userId,
      permission,
    });
  }
}
