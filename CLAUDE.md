# CLAUDE.md — guia para agentes neste repositório

Vitaloop UPA: PEP **greenfield exclusivo da UPA**. Leia `docs/` antes de mudar
código. Ordem de autoridade: regra assistencial do Master > operacional > normas
> segurança/integridade > documento técnico > framework.

## Faça
- Sequência por funcionalidade: domínio → banco/migration → RBAC → RLS → serviço
  → API → frontend → auditoria → testes → doc (Definition of Done, Master §68).
- Toda mudança estrutural = nova migration `database/migrations/V####__nome.sql`
  (idempotente; nunca alterar produção manualmente).
- Estados por enum/tabela de domínio; nunca texto livre.
- Operação crítica em transação, com auditoria na mesma transação e contexto RLS
  (`app.user_id`) setado.
- Registre decisão técnica em ADR (`docs/DECISIONS.md`); regra assistencial
  ausente/conflitante em `docs/DECISOES_PENDENTES.md` (não invente regra clínica).

## Nunca
- Editar documento `LIBERADO`; `DELETE` de registro assistencial (use inativação).
- Confiar só no frontend para segurança; desabilitar RLS.
- Criar módulo operacional de outra unidade (HMB/UBS/HRPM/estadual); PDV/ERP.
- Aprazamento automático como rotina (ADR-008).
- Capturar exceção em silêncio; usar `any` indiscriminado; criar estado inexistente.

## Comandos
```
npm run db:start | db:migrate | db:seed | db:test | db:reset
npm test          # domínio/auth
npm run verify    # typecheck + testes + db:test
```

## Após qualquer mudança
`npm run verify`. Se regredir, pare e corrija a causa — não desabilite teste.
