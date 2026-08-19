-- =====================================================================
-- V0011 — Suporte de autenticação: acessores SECURITY DEFINER para o login e a
-- resolução de sessão (a API é role não-superuser sob RLS e precisa ler
-- users/sessions ANTES de haver identidade). Mantém o RLS intacto.
-- =====================================================================

-- Credenciais para verificação de senha (mínimo necessário).
CREATE OR REPLACE FUNCTION app.get_login(p_username text)
RETURNS TABLE(id uuid, password_hash text, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT id, password_hash, is_active FROM users WHERE username = p_username;
$$;
GRANT EXECUTE ON FUNCTION app.get_login(text) TO vitaloop_app;

-- Permissões efetivas de um usuário ativo (para montar o AuthContext).
CREATE OR REPLACE FUNCTION app.user_permissions(p_user uuid)
RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT p.code
  FROM user_roles ur
  JOIN role_permissions rp ON rp.role_id = ur.role_id
  JOIN permissions p ON p.id = rp.permission_id
  JOIN roles r ON r.id = ur.role_id AND r.active
  JOIN users u ON u.id = ur.user_id AND u.is_active
  WHERE ur.user_id = p_user;
$$;
GRANT EXECUTE ON FUNCTION app.user_permissions(uuid) TO vitaloop_app;

-- Resolve uma sessão por hash do token (para o hook de autenticação).
CREATE OR REPLACE FUNCTION app.resolve_session(p_token_hash text)
RETURNS TABLE(session_id uuid, user_id uuid, last_seen_at timestamptz,
              revoked_at timestamptz, expires_at timestamptz, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT s.id, s.user_id, s.last_seen_at, s.revoked_at, s.expires_at, u.is_active
  FROM sessions s JOIN users u ON u.id = s.user_id
  WHERE s.token_hash = p_token_hash;
$$;
GRANT EXECUTE ON FUNCTION app.resolve_session(text) TO vitaloop_app;

-- Política de UPDATE de users (faltava): self ou admin. Permite atualizar
-- last_activity_at no login e o próprio perfil.
CREATE POLICY users_update_self ON users FOR UPDATE
  USING (id = app.current_user_id()
         OR has_permission(app.current_user_id(), 'admin.users.read'));
