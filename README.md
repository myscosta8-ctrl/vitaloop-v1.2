# Vitaloop UPA

PEP (Prontuário Eletrônico do Paciente) **exclusivo para a Unidade de Pronto
Atendimento**. Projeto **greenfield** — ver `docs/DECISIONS.md` (ADR-001).

> Escopo: apenas a UPA. HMB, HRPM, UBS, hospital estadual, SISREG e Melhor em
> Casa aparecem somente como destino/integração/desfecho registrados pela UPA.
> Não é PDV, ERP nem sistema municipal genérico.

## Documentação

- `docs/ARCHITECTURE.md` — arquitetura e camadas
- `docs/DOMAIN_MODEL.md` — domínio e glossário
- `docs/STATE_MACHINES.md` — máquinas de estado
- `docs/DECISIONS.md` — ADRs
- `docs/RBAC_RLS.md` — segurança (RBAC + RLS)
- `docs/IMPLEMENTATION_PLAN.md` — plano e estado por marco
- `docs/DECISOES_PENDENTES.md` — decisões assistenciais em aberto
- `docs/OPERACAO_PRODUCAO.md` — deploy, backup/restore, runbook
- `docs/HOMOLOGACAO.md` — roteiro/evidências de homologação
- `docs/RELATORIO_FINAL_PRODUCAO.md` — relatório de entrega
- `docs/reference/institutional-forms/` — modelos institucionais de PDF (fonte)

## Stack

TypeScript (strict) · PostgreSQL 16 (RLS) · Fastify + Zod · React/Vite ·
`node:test`. Monorepo npm workspaces. Ver ADR-002.

## Estrutura

```
apps/{api,web}   packages/{domain,auth,validation,audit,documents}
database/{migrations,seeds,policies,tests}   docs/   scripts/db/
```

## Desenvolvimento local

Pré-requisitos: Node ≥ 20 e PostgreSQL 16 (cliente + servidor).

```bash
npm install
npm run db:start          # sobe um cluster Postgres local em .localdb (dev)
npm run db:migrate        # aplica database/migrations/V*__*.sql
npm run db:seed           # aplica database/seeds/S*__*.sql
npm run db:test           # testes SQL (integridade, imutabilidade, RLS)
npm test                  # testes de domínio/auth (node:test)
npm run verify            # typecheck + testes de domínio + testes de banco
```

Sem instalar servidor local, aponte `DATABASE_URL`/`DATABASE_MIGRATOR_URL` para
um Postgres existente e rode `db:migrate`/`db:seed`/`db:test`.

## Legado

Arquivos do sistema anterior permanecem no repositório em **quarentena** (ADR-001)
e não fazem parte do build/CI. Devem ser removidos por um mantenedor com
permissão de escrita destrutiva; o histórico Git os preserva.

## Regras de ouro

Não editar documento liberado · não apagar registro assistencial · não confiar
no frontend para segurança · não inventar regra clínica · não criar módulo de
outra unidade · o banco impede estados inválidos.
