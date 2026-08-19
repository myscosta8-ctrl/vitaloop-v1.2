-- =====================================================================
-- V0001 — Fundação: identidade, RBAC, sessões, setores, auditoria, RLS base
-- MARCO 1. Master §7–10, §52; Arquitetura §8–11; ADR-002/006/011.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE SCHEMA IF NOT EXISTS app;

-- ---------------------------------------------------------------------
-- Contexto de identidade para RLS (setado por transação pela API).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_session_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.session_id', true), '')::uuid
$$;

-- Trigger genérico de updated_at.
CREATE OR REPLACE FUNCTION app.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

-- ---------------------------------------------------------------------
-- Usuários (identidade de autenticação)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username       text NOT NULL UNIQUE,
  email          text UNIQUE,
  full_name      text NOT NULL,
  password_hash  text NOT NULL,
  is_active      boolean NOT NULL DEFAULT true,
  last_activity_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id)
);
CREATE TRIGGER users_touch BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

-- ---------------------------------------------------------------------
-- Profissões / perfis profissionais
-- ---------------------------------------------------------------------
CREATE TABLE professions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE,
  name       text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE professional_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id),
  profession_id       uuid NOT NULL REFERENCES professions(id),
  registration_number text,                       -- COREN/CRM/etc.
  active              boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, profession_id)
);
CREATE TRIGGER prof_profiles_touch BEFORE UPDATE ON professional_profiles
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

-- ---------------------------------------------------------------------
-- RBAC: roles, permissions, mapeamentos
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,               -- resource.action
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
  role_id       uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

-- has_permission: SECURITY DEFINER para avaliar o RBAC dentro das políticas RLS
-- sem exigir SELECT direto do app nas tabelas de RBAC. Usuário precisa estar ativo.
CREATE OR REPLACE FUNCTION has_permission(p_user uuid, p_perm text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p       ON p.id = rp.permission_id
    JOIN roles r             ON r.id = ur.role_id AND r.active
    JOIN users u             ON u.id = ur.user_id AND u.is_active
    WHERE ur.user_id = p_user AND p.code = p_perm
  );
$$;

-- ---------------------------------------------------------------------
-- Setores DA UPA (nunca de outra unidade — ADR-009)
-- ---------------------------------------------------------------------
CREATE TABLE upa_sectors (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE,
  name       text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER sectors_touch BEFORE UPDATE ON upa_sectors
  FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();

-- ---------------------------------------------------------------------
-- Sessões: máximo de 2 dispositivos, timeout, inativação (Master §9)
-- ---------------------------------------------------------------------
CREATE TABLE sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      text NOT NULL UNIQUE,
  device_label    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz,
  revoked_at      timestamptz,
  revoked_reason  text
);
CREATE INDEX sessions_user_active_idx ON sessions (user_id)
  WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------
-- Auditoria: append-only (Master §52, ADR-011)
-- ---------------------------------------------------------------------
CREATE TABLE audit_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    uuid REFERENCES users(id),
  action      text NOT NULL,
  entity_type text,
  entity_id   text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  request_id  text,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX audit_events_entity_idx ON audit_events (entity_type, entity_id);
CREATE INDEX audit_events_actor_idx  ON audit_events (actor_id, occurred_at);

-- Bloqueia UPDATE/DELETE em audit_events (imutável).
CREATE OR REPLACE FUNCTION app.block_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'APPEND_ONLY: % not allowed on %', TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'check_violation';
END $$;
CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();
CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION app.block_mutation();

-- ---------------------------------------------------------------------
-- Grants para a role de aplicação.
-- Nunca DELETE em nada (registros não são apagados fisicamente — Master §3.3).
-- Sessões e auditoria são escritos pela API; auditoria não recebe UPDATE.
-- ---------------------------------------------------------------------
GRANT USAGE ON SCHEMA public, app TO vitaloop_app;
GRANT EXECUTE ON FUNCTION has_permission(uuid, text) TO vitaloop_app;
GRANT EXECUTE ON FUNCTION app.current_user_id() TO vitaloop_app;
GRANT EXECUTE ON FUNCTION app.current_session_id() TO vitaloop_app;

GRANT SELECT ON users, professions, professional_profiles, roles, permissions,
  role_permissions, user_roles, upa_sectors TO vitaloop_app;
GRANT INSERT, UPDATE ON users, professional_profiles TO vitaloop_app;
GRANT SELECT, INSERT, UPDATE ON sessions TO vitaloop_app;
GRANT SELECT, INSERT ON audit_events TO vitaloop_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vitaloop_app;

-- ---------------------------------------------------------------------
-- RLS base. FORCE para valer inclusive ao owner (defesa em profundidade).
-- ---------------------------------------------------------------------
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events     FORCE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         FORCE ROW LEVEL SECURITY;

-- Um usuário lê o próprio registro; quem tem admin.users.read lê todos.
CREATE POLICY users_self_or_admin ON users FOR SELECT
  USING (id = app.current_user_id()
         OR has_permission(app.current_user_id(), 'admin.users.read'));

-- Auditoria: quem tem audit.read lê tudo; qualquer usuário lê o próprio acesso.
CREATE POLICY audit_read ON audit_events FOR SELECT
  USING (has_permission(app.current_user_id(), 'audit.read')
         OR actor_id = app.current_user_id());
-- Qualquer usuário autenticado pode gravar evento de auditoria (append-only).
CREATE POLICY audit_insert ON audit_events FOR INSERT
  WITH CHECK (app.current_user_id() IS NOT NULL);

-- Sessão pertence ao usuário; admin de sessão gerencia todas.
CREATE POLICY sessions_owner ON sessions FOR SELECT
  USING (user_id = app.current_user_id()
         OR has_permission(app.current_user_id(), 'admin.sessions.manage'));
CREATE POLICY sessions_write ON sessions FOR INSERT
  WITH CHECK (user_id = app.current_user_id()
         OR has_permission(app.current_user_id(), 'admin.sessions.manage'));
CREATE POLICY sessions_update ON sessions FOR UPDATE
  USING (user_id = app.current_user_id()
         OR has_permission(app.current_user_id(), 'admin.sessions.manage'));
