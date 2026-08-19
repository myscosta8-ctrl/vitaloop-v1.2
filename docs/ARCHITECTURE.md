# Vitaloop UPA — Arquitetura

PEP **exclusivo da UPA**. Este documento operacionaliza o Master Definitivo, o
documento de Implementação de Código e a Arquitetura Técnica Definitiva. Onde
houver conflito, vale a ordem de autoridade do Master §0.

## 1. Camadas (dependências apontam para dentro)

```
apps/web  (React/Vite)          apenas o que o usuário pode ver/fazer
   │ HTTPS (JSON)
apps/api  (Fastify)             auth · validação (Zod) · autorização · rotas
   │
packages/* (aplicação+domínio)  casos de uso · regras puras · máquinas de estado
   │
database/ (PostgreSQL 16)       fonte de verdade · constraints · RLS · triggers
```

Regra dura: **nenhuma regra clínica relevante existe só na tela**. Toda operação
crítica é validada no backend e, quando aplicável, reforçada por constraint/RLS.

## 2. Monorepo

```
apps/
  api/          Fastify: rotas por domínio, plugin de auth/sessão, contexto RLS
  web/          React/Vite: telas por fluxo (recepção, triagem, médico, ...)
packages/
  domain/       regras puras + máquinas de estado + erros de domínio (sem I/O)
  auth/         hashing, sessão, limite de dispositivos, timeout, inatividade
  validation/   schemas Zod compartilhados (contratos de API)
  audit/        modelo e helpers de evento de auditoria
  documents/    catálogo, snapshot, renderers de PDF por documento
database/
  migrations/   V####__*.sql  (série greenfield, idempotente por checksum)
  seeds/        S####__*.sql  (profissões, permissões, setores, catálogos)
  policies/     documentação das políticas RLS (as políticas vivem nas migrations)
  tests/        *.sql testados conectando como role de aplicação
docs/           ARCHITECTURE, DOMAIN_MODEL, STATE_MACHINES, DECISIONS, ...
scripts/        db/ (local-pg, migrate, seed, run-sql-tests)
```

## 3. Fluxo de uma requisição crítica na API

```
HTTPS → autenticação (sessão) → validação Zod → autorização RBAC (has_permission)
  → BEGIN
      SET LOCAL app.user_id / app.session_id / app.roles   (contexto para RLS)
      caso de uso (domínio) → repositórios (SQL parametrizado)
      auditoria na mesma transação
  → COMMIT   (rollback em qualquer falha crítica)
→ resposta com erro estruturado quando aplicável
```

O contexto de RLS é sempre setado por transação; a role de conexão da API é
**não-superuser** e sujeita a `FORCE ROW LEVEL SECURITY`.

## 4. Segurança em profundidade

```
HTTPS → autenticação → sessão (2 dispositivos, timeout, inativação 6 meses)
  → RBAC (permissão granular) → autorização contextual → RLS → constraints → auditoria
```

Cada camada é independente; nenhuma sozinha é suficiente. Ver `docs/RBAC_RLS.md`.

## 5. Banco como fonte de verdade

- UUID (`gen_random_uuid`) em entidades críticas; `created_at/updated_at`,
  `created_by/updated_by` quando aplicável.
- Estados por **enum**/tabela de domínio, nunca texto livre.
- Integridade por PK/FK/UNIQUE/CHECK/índice parcial; triggers só quando agregam
  integridade/auditoria (imutabilidade de documento, append-only de auditoria,
  ocupação única de leito, proteção de transição de atendimento).
- Migrations versionadas; **nunca** alteração estrutural manual em produção.

## 6. Documentos e PDF

Pipeline: `dados → validação → snapshot → documento → assinatura/liberação →
imutabilidade → PDF → impressão`. Documento liberado é imutável (ADR-004);
PDF fiel ao modelo institucional a partir do snapshot (ADR-010).

## 7. Transações e concorrência

Encerramento de atendimento é atômico: validar permissões → validar desfecho →
registrar desfecho → liberar leito → encerrar → auditar → commit. Concorrência
(dupla ocupação de leito, dupla assinatura/inativação, duplicação de paciente)
é barrada por constraints + transações (ADR-007).

## 8. Ambientes, backup, observabilidade, CI/CD

- Ambientes `DEV | HOMOLOGACAO | PRODUCAO`, cada um com banco e secrets próprios.
- Backup com retenção, RPO/RTO e **teste de restore** (backup não testado não
  conta) — ver `docs/OPERACAO_PRODUCAO.md`.
- Observabilidade: erro, latência, banco, storage, PDF, jobs, auth; sem dado
  clínico desnecessário no log.
- CI/CD: `lint → typecheck → unit → integration → build → migration check →
  security → e2e → homologação → smoke → produção`. Falha crítica bloqueia deploy.

## 9. O que a arquitetura proíbe

Módulos operacionais de outras unidades; PDV/ERP; edição de documento liberado;
`DELETE` de registro assistencial; confiar no frontend para segurança;
aprazamento automático como rotina; estados inexistentes na UPA; regra clínica
inventada pela implementação.
