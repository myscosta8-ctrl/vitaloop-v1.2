# Vitaloop UPA — Operação e Produção

Runbook de ambientes, migrations, backup/restore, deploy, GO/NO-GO e resposta a
incidentes. Deriva do Master §68–72 e da Arquitetura §20–23.

## 1. Ambientes

`DEV | HOMOLOGACAO | PRODUCAO`. Cada um com **banco e secrets próprios**.
Segredos só em secret manager/variáveis seguras — nunca no repositório. Ver
`.env.example`. Nunca testar dados fictícios em produção.

Roles de banco:
- `postgres`/migrador — aplica migrations e manutenção. **Não** é a conexão da API.
- `vitaloop_app` — conexão da aplicação, **não-superuser**, sujeita a RLS. É a
  única credencial usada pela API em runtime.

## 2. Migrations

```bash
DATABASE_MIGRATOR_URL=... npm run db:migrate     # aplica V####__*.sql pendentes
DATABASE_MIGRATOR_URL=... npm run db:seed        # catálogos idempotentes
```

- Série greenfield `V####__*.sql`, rastreada em `schema_migrations` (checksum).
- Migration aplicada é **imutável**: mudança estrutural = nova migration.
- Nunca alterar produção manualmente. Validar schema após aplicar.

## 3. Backup e restore (backup não testado ≠ backup)

- **Backup**: `pg_dump -Fc` diário + WAL archiving (PITR). Definir retenção
  (ex.: 30 dias) e destino off-site.
- **RPO alvo**: ≤ 15 min (com WAL). **RTO alvo**: ≤ 1 h.
- **Restore** (obrigatório testar periodicamente, Master §69):
  ```bash
  createdb vitaloop_restore
  pg_restore -d vitaloop_restore --clean --if-exists backup.dump
  ```
  Depois comparar contagens de pacientes, atendimentos, documentos e auditoria
  com o esperado (Teste 044). Registrar evidência em `docs/HOMOLOGACAO.md`.
- Um backup só é considerado válido **após** um restore bem-sucedido verificado.

## 4. Pipeline de deploy (CI/CD)

```
commit → lint → typecheck → unit → migration check → integration/RLS →
security → build → e2e → deploy homologação → smoke → produção
```
Falha crítica **bloqueia** o deploy (`.github/workflows/ci.yml`).

Deploy de produção:
1. criar release + tag; 2. gerar backup; 3. aplicar migrations;
4. validar schema; 5. deploy da API/web; 6. smoke test (§6);
7. verificar logs/banco/auth/PDF/auditoria; 8. registrar versão no CHANGELOG.

## 5. Critérios GO / NO-GO (Master §72, Testes §54)

**NO-GO** se existir: perda de dado · edição de documento liberado · bypass de
RLS · duplicidade grave de paciente · dupla ocupação de leito · encerramento
inconsistente · falha crítica de auditoria · PDF institucional incorreto ·
desfecho sem documentação obrigatória · backup não restaurável · dado fictício
como real.

**GO** somente com: testes críticos 100% verdes · sem vulnerabilidade crítica ·
backup e restore validados · RLS validado · PDFs homologados · usuários/
profissões configurados · fluxo principal aprovado.

## 6. Smoke test de produção (Teste 050)

`login → busca paciente → abrir atendimento de teste controlado → consultar →
verificar leito → verificar documento → verificar auditoria`. Nunca usar paciente
real de forma insegura.

## 7. Observabilidade

Monitorar erro, latência, disponibilidade, banco, storage, PDF, jobs, filas,
falhas de autenticação. **Nunca** registrar dado clínico sensível desnecessário
em log técnico (LGPD §63).

## 8. Jobs

Idempotentes. Inclui fechamento de leito extra vazio ≥ 30 min
(`shouldAutoCloseExtraBed`), alertas/notificações e tarefas de integração.

## 9. Resposta a incidentes (resumo)

1. Conter (revogar sessão/role se comprometida — `sessions`, RBAC).
2. Preservar auditoria (`audit_events` é append-only).
3. Nunca apagar registro assistencial para "corrigir" — inativar com motivo.
4. Se suspeita de bypass de RLS: tratar como NO-GO até reprodução em teste.
5. Rollback: promover release anterior; migrations são forward-only — reverter
   estrutura exige nova migration compensatória, nunca edição manual.
