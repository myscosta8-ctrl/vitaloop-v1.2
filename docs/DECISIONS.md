# Vitaloop UPA — Architecture Decision Records (ADRs)

Registro das decisões estruturais do projeto. Cada ADR é imutável depois de
`Aceita`; mudanças geram um novo ADR que supersede o anterior.

Ordem de autoridade (Master §0): regra assistencial do Master > regra
operacional da UPA > legislação/normas > requisitos de segurança/integridade >
documento técnico > convenção de framework. Nenhum ADR pode contrariar uma
regra assistencial do Master.

---

## ADR-001 — Greenfield e quarentena do sistema legado

**Status:** Aceita · 2026-08-16

**Contexto.** O repositório continha um sistema anterior (React/Vite + Supabase,
dezenas de migrations `supabase/migrations/*`, `src/`, scripts `.mjs` com
connection strings). O Master Definitivo (§0, §66) exige projeto greenfield: novo
domínio, novo modelo de dados, novas migrations, sem depender de arquitetura
legada.

**Decisão.** O novo sistema nasce limpo em layout monorepo. O código legado
**não é dependência** de nada novo. Como o ambiente de execução bloqueia remoção
de arquivos, o legado permanece fisicamente no diretório porém **em quarentena**:
não é workspace npm, não é referenciado por build/CI, e o migration runner novo
só reconhece a série `database/migrations/V####__*.sql`. A remoção física do
legado (`src/`, `supabase/`, `database/legacy_schema.sql`,
`database/migrations/DEPLOY_COMPLETO_SUPABASE.sql`, scripts `.mjs/.js/.sql` da
raiz) é uma tarefa de manutenção a ser executada por quem tiver permissão de
escrita destrutiva. O histórico Git preserva tudo.

**Consequências.** Onboarding lê apenas `apps/`, `packages/`, `database/migrations/V*`,
`docs/`. Nenhuma migration legada é necessária para subir o banco novo.

---

## ADR-002 — Stack

**Status:** Aceita · 2026-08-16

**Contexto.** O Master/Arquitetura (§4, §6) exige: web responsivo, backend
tipado, PostgreSQL como fonte de verdade, autenticação, storage, PDF, testes,
CI/CD. A stack deve ser madura e permanecer consistente.

**Decisão.**
- **Linguagem:** TypeScript `strict` em todo o monorepo.
- **Monorepo:** npm workspaces (`packages/*`, `apps/*`) — zero ferramenta extra.
- **Banco:** PostgreSQL 16, **fonte de verdade**. Schema 100% por migrations SQL
  versionadas e idempotentes na aplicação. RLS nativo do Postgres.
- **Acesso a dados:** driver `pg` + SQL parametrizado explícito (repositórios).
  Sem ORM que esconda a semântica de RLS/transação. `SET LOCAL` por transação
  para propagar identidade ao RLS.
- **API:** Fastify (tipado, rápido, maduro) + Zod para validação de entrada.
- **Web:** React + Vite (SPA responsiva).
- **PDF:** renderer server-side por documento a partir de um snapshot validado
  (ver ADR-010).
- **Testes:** `node:test` para unidade/domínio; SQL executado via `psql`/`pg`
  para integridade e RLS; Playwright para E2E (planejado).
- **Auth:** sessão própria server-side (tokens opacos + tabela `sessions`),
  bcrypt/argon2 para senha, para atender às regras do Master (2 dispositivos,
  timeout, inativação em 6 meses) sem depender de provedor externo.

**Alternativas descartadas.** Next.js full-stack (acopla web+api, dificulta a
separação de camadas exigida); Prisma/ORM (abstrai RLS e transações, risco em
regra clínica); Supabase Auth (legado; regra dos 2 dispositivos e inativação
exige controle próprio da sessão).

**Consequências.** Backend é a autoridade de negócio; RLS é camada adicional.
Cada operação crítica roda em transação com identidade propagada.

---

## ADR-003 — Paciente × Atendimento

**Status:** Aceita · 2026-08-16

**Decisão.** `patients` é entidade **permanente** e nunca é recriada por novo
atendimento (Master §4.1, §12). `attendances` é **episódico**; 1 paciente → N
atendimentos. Recepção sempre busca/reidentifica antes de criar. Duplicidade é
tratada **antes** da criação (checagem determinística por CPF/CNS + índices +
detecção de similaridade). O banco impede atendimento sem paciente (FK NOT NULL).

---

## ADR-004 — Documento assistencial imutável (snapshot)

**Status:** Aceita · 2026-08-16

**Decisão.** Documento é entidade própria com máquina de estados
`RASCUNHO → FINALIZADO → LIBERADO → (INATIVADO)`. Ao liberar, grava-se um
`snapshot JSONB` — fotografia dos dados naquele instante. Depois de `LIBERADO`:
- proibida qualquer edição de conteúdo (bloqueio em trigger de banco **e** na
  camada de serviço);
- correção só por **inativação** (com motivo/autor/data, conteúdo preservado) +
  **novo documento**;
- alteração cadastral posterior do paciente **não** altera o snapshot.
Nunca há `DELETE` físico de registro assistencial (Master §3.3, §51).

---

## ADR-005 — Papel + PEP

**Status:** Aceita · 2026-08-16

**Decisão.** O PEP é a fonte eletrônica oficial; o papel é suporte da rotina
(Master §2). Fluxo: registrar no PEP → finalizar → liberar → PDF institucional →
imprimir → compor prontuário físico quando a rotina exigir. Reimpressão não
altera o documento; gera novo `print_event` com data/hora.

---

## ADR-006 — RBAC + RLS

**Status:** Aceita · 2026-08-16

**Decisão.** Duas camadas coexistentes. **RBAC**: permissões granulares
`resource.action` → `role_permissions` → `user_roles`. **RLS**: toda tabela
sensível tem política que combina `has_permission(uid,'perm')` com contexto
(`can_access_attendance`, profissão, setor, estado do registro). A identidade é
propagada por `SET LOCAL app.user_id`/`app.session_id` no início de cada
transação da API. Testes de RLS rodam **conectados como role de aplicação**, não
como superuser. Sem break glass; acesso interunidade é excepcional e auditado
(Master §9, RBAC §13).

---

## ADR-007 — Leitos e ocupação única

**Status:** Aceita · 2026-08-16

**Decisão.** Estados de leito exatamente: `LIVRE, OCUPADO, INTERDITADO,
MANUTENCAO, LEITO_EXTRA_DISPONIVEL, LEITO_EXTRA_OCUPADO, DESATIVADO`
(sem `RESERVADO`/`HIGIENIZACAO`). Invariantes garantidas **no banco**:
- um leito tem no máximo uma alocação ativa — índice único parcial em
  `bed_assignments (bed_id) WHERE released_at IS NULL`;
- um atendimento tem no máximo um leito ativo — índice único parcial em
  `bed_assignments (attendance_id) WHERE released_at IS NULL`.
Concorrência resolvida por constraint + transação (Master §22, §28, §62).
Leito extra sem paciente por 30 min → fechamento por job idempotente.

---

## ADR-008 — Prescrição sem aprazamento automático

**Status:** Aceita · 2026-08-16

**Decisão.** Médico prescreve (medicamento, dose, via, frequência, condição,
SN/ACM, critérios ≥/≤). O médico **não** informa horários; o enfermeiro faz o
**aprazamento manual**. O PEP **não** faz aprazamento automático como rotina
(Master §20, §21). Administração eletrônica é arquitetura futura, não obrigatória.

---

## ADR-009 — Escopo exclusivo da UPA

**Status:** Aceita · 2026-08-16

**Decisão.** O sistema é PEP **apenas da UPA**. HMB, HRPM, UBS, hospital
estadual, SISREG, Melhor em Casa aparecem **somente** como destino, regulação,
transferência, integração ou desfecho registrados pela UPA. Proibido criar
módulo operacional (admissão/enfermagem/leitos/farmácia internos) dessas
unidades (Master §1, §3, §34). Nada de PDV/ERP/caixa.

---

## ADR-010 — PDF institucional a partir de snapshot

**Status:** Aceita · 2026-08-16

**Decisão.** Cada tipo de documento tem um renderer próprio e versionado. O PDF
é gerado a partir do `snapshot` validado do documento liberado — nunca a partir
de dados cadastrais mutáveis. A interface de tela pode divergir visualmente do
PDF, mas o **PDF final** obedece ao modelo institucional aprovado
(`docs/reference/institutional-forms/`). Impressão parcial é proibida quando a
regra institucional exigir documento íntegro (Master §47, §48).

---

## ADR-011 — Auditoria com autoridade no banco

**Status:** Aceita · 2026-08-16

**Decisão.** `audit_events` é append-only (sem UPDATE/DELETE, garantido por
trigger). Eventos críticos (login/acesso/criação/alteração/assinatura/impressão/
reimpressão/inativação/mudança de permissão/desfecho/transferência) são gravados
na **mesma transação** da operação. Para não depender de o frontend "lembrar",
mudanças estruturais sensíveis (ex.: mudança de estado de atendimento, liberação
de documento) também disparam auditoria via trigger de banco. Logs técnicos não
recebem dado clínico desnecessário (Master §52, LGPD §63).
