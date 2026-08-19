# Vitaloop UPA — RBAC + RLS (operacional)

Deriva de `VITALOOP_UPA_RBAC_RLS.md`. **RBAC** = o que o usuário pode fazer;
**RLS** = quais registros ele pode acessar. As duas camadas coexistem (ADR-006).

## 1. Modelo RBAC

```
users ──< user_roles >── roles ──< role_permissions >── permissions
users ──1:1─ professional_profiles ── professions
```

- Permissão granular no formato `resource.action` (ex.: `patient.read`,
  `medical.evolution.sign`, `bed.assign`, `document.inactivate`, `audit.read`).
- `has_permission(user_id, perm)` resolve via `user_roles → role_permissions`.
- Profissões e permissões são **configuráveis** (seed inicial em
  `database/seeds/`).

## 2. Perfis (roles) iniciais

`ADMINISTRACAO, DIRECAO, COORDENACAO, MEDICO, ENFERMEIRO, TECNICO_ENFERMAGEM,
FISIOTERAPEUTA, PSICOLOGO, ASSISTENTE_SOCIAL, FARMACIA, RESPONSAVEL_RESULTADOS,
ADMINISTRATIVO, SAME_AUDITORIA`.

## 3. Regras não-negociáveis (do Master/RBAC)

- Técnico **não** cria evolução de enfermagem nem prescrição (só anotação,
  sinais vitais, balanço, registros autorizados).
- Evolução de enfermagem é **privativa do enfermeiro**.
- Enfermeiro **não** assina documento médico nem constata óbito.
- Óbito e alta por melhora: **somente médico**. Evasão: qualquer profissional
  autorizado.
- SAME/Auditoria e Farmácia **consultam sem alterar** conteúdo clínico de
  terceiros.
- Documento `LIBERADO` é somente leitura; `INATIVADO` só leitura/auditoria.
- Usuário inativo não acessa. Sem break glass.

## 4. Propagação de identidade para o RLS

A API abre transação e executa:

```sql
SELECT set_config('app.user_id',    $1, true);   -- true = escopo de transação
SELECT set_config('app.session_id', $2, true);
```

`app.current_user_id()` lê `app.user_id`. Todas as políticas usam essa função,
não `auth.uid()` de um provedor externo. A role de conexão da API é
não-superuser e as tabelas usam `FORCE ROW LEVEL SECURITY`, de modo que o RLS
vale inclusive para o owner.

## 5. Padrão de política

```sql
-- leitura de atendimento: precisa da permissão E de contexto de acesso
CREATE POLICY attendances_select ON attendances FOR SELECT
USING ( has_permission(app.current_user_id(), 'attendance.read')
        AND can_access_attendance(app.current_user_id(), id) );

-- escrita clínica: permissão específica + atendimento acessível + não encerrado
CREATE POLICY medical_evo_insert ON medical_evolutions FOR INSERT
WITH CHECK ( has_permission(app.current_user_id(), 'medical.evolution.create')
             AND can_access_attendance(app.current_user_id(), attendance_id) );
```

`can_access_attendance` avalia contexto real (profissão/função/setor; acesso
interunidade exige registro de justificativa/auditoria).

## 6. Acesso externo à UPA (interunidade)

`identificar profissional → identificar paciente → informar prontuário →
justificar motivo → registrar auditoria → conceder acesso conforme permissão`.
Registrado em `external_access_grants` + `audit_events`. Não é break glass.

## 7. Sessões

Máx. 2 dispositivos; sessões registradas; timeout por inatividade; inativação de
usuário após 6 meses sem atividade (não exclui). Ver DP-002 (3º dispositivo).

## 8. Testes obrigatórios de RLS/segurança (mínimo)

1. médico lê evolução médica; 2. técnico **não** cria evolução médica;
3. enfermeiro cria evolução de enfermagem; 4. enfermeiro **não** constata óbito;
5. documento liberado não é alterável; 6. usuário inativo não entra;
7. externo precisa justificar; 8. sem permissão → negado; 9. RLS impede acesso
indevido; 10. SAME consulta sem alterar; 11. farmácia consulta prescrição sem
alterar; 12. auditoria registra tentativa indevida.
Implementação em `database/tests/*.sql`.
