# Vitaloop UPA — Relatório Final

Data-base: 2026-08-16. PEP greenfield exclusivo da UPA. Este relatório declara
**explicitamente** o que foi implementado, o que não foi, e por quê — conforme
Master §79 e o Comando Mestre §24.

> Leitura honesta do estado: entregou-se uma **fundação de engenharia coesa e
> testada** (arquitetura, banco com integridade/RLS, domínio tipado, API do
> fluxo central) — não um sistema hospitalar completo pronto para produção. A
> maior parte das telas (web), os renderers de PDF, o E2E de interface e a
> homologação operacional ainda são pendentes. Ver "Não implementado".

## 1. Stack

TypeScript strict · PostgreSQL 16 (fonte de verdade, RLS) · Fastify + Zod + `pg`
+ bcrypt · monorepo npm workspaces · `node:test` · CI GitHub Actions. Web
React/Vite prevista (ADR-002).

## 2. Arquitetura

Camadas web → api → aplicação/domínio → banco, dependências para dentro; regra
clínica nunca só na tela; identidade propagada ao RLS por transação; documento
liberado imutável; sem módulo de outra unidade. Detalhes em `docs/ARCHITECTURE.md`
e 12 ADRs em `docs/DECISIONS.md`.

## 3. Banco — implementado

12 migrations greenfield (`V0001`–`V0012`), idempotentes por checksum:

- Identidade/RBAC/sessões/setores; auditoria append-only; `has_permission`,
  `app.current_user_id`, `can_access_attendance`; RLS com `FORCE`.
- Paciente (+contatos/alertas/alergias) com prevenção de duplicidade.
- Atendimento/episódio/eventos + trigger de transição de estado.
- Triagem/sinais vitais.
- Registros clínicos (evoluções médicas e de enfermagem) com **trigger genérico
  de imutabilidade pós-liberação**.
- Prescrições (médica com aprazamento **manual**; de enfermagem), exames,
  procedimentos, interconsultas.
- **Engine de documentos imutáveis** (snapshot, assinaturas, inativações,
  eventos de impressão).
- Leitos com **ocupação única** (índices parciais) + eventos.
- Transferência/regulação/desfechos + `close_attendance()` **atômico**.
- Farmácia/estoque/dispensação, AIH, SIGTAP, produção SUS, hemoterapia.
- Segurança do paciente, comissões, notificações, acesso interunidade.

Tabelas RLS-protegidas: usuários, sessões, auditoria, paciente e derivados,
atendimento e derivados, evoluções, prescrições, exames, documentos, leitos,
transferência/regulação/desfecho, farmácia, segurança/acesso externo.

Seeds (idempotentes): 8 profissões, 47 permissões, 13 funções, 129 vínculos
função→permissão, 7 setores da UPA, catálogo de 6 desfechos, 17 tipos de
documento institucional versionados.

## 4. RBAC + RLS — implementado e testado

Permissões granulares `resource.action`; matriz função→permissão espelhando a
matriz do documento oficial. RLS testado **conectando como a role de aplicação
não-superuser** (não superuser), cobrindo: técnico × médico × enfermeiro ×
farmácia × SAME × usuário inativo × sem-identidade.

## 5. Serviços/API — implementado (fluxo central)

`apps/api` (Fastify): hook de sessão, transação com contexto RLS, erros
estruturados. Rotas: `POST /auth/login` (limite de 2 dispositivos), `/auth/logout`,
`POST /patients` (validação CPF/CNS + duplicidade), `GET /patients`,
`POST /attendances`, `POST /attendances/:id/close`. Smoke E2E in-process
**passa** contra o banco real.

## 6. Domínio tipado — implementado e testado

`packages/domain` (máquinas de estado de atendimento/documento/leito, regras de
desfecho, autorização, erros), `packages/auth` (sessão: 2 dispositivos, timeout,
inativação 6 meses), `packages/validation` (CPF/CNS), `packages/audit`,
`packages/documents` (snapshot + contrato de renderer de PDF).

## 7. Testes executados

| Suíte | Qtde | Resultado |
|---|---|---|
| Unidade (domínio/auth/validação, `node:test`) | 19 | ✅ 19/19 |
| Banco: integridade, imutabilidade, transição, encerramento atômico | 4 | ✅ |
| Banco: RLS como role de aplicação | 3 | ✅ |
| API smoke E2E in-process (login→paciente→atendimento→alta) | 1 | ✅ |

Gate `npm run verify` (typecheck + unit + db:test) verde a partir de banco limpo.
**Cobertura formal não medida** (ferramenta de cobertura não configurada) —
pendência declarada.

## 8. Invariantes críticas garantidas no banco (verificadas)

- Dupla ocupação de leito **bloqueada**; dois leitos no mesmo atendimento
  **bloqueado**.
- Documento liberado **imutável**; inativação preserva o snapshot; dupla
  inativação **bloqueada**.
- Atendimento encerrado **não reabre**; transições inválidas rejeitadas.
- Encerramento libera leito e exige médico quando o desfecho exige.
- Auditoria **append-only** (sem UPDATE/DELETE).
- RLS impede acesso/edição indevidos por perfil e usuário inativo.

## 9. Não implementado (e motivo)

| Item | Estado | Motivo |
|---|---|---|
| Web (telas dos fluxos) | ⬜ | Escopo além de uma sessão; fundação priorizada (banco/domínio/segurança testados). |
| Renderers de PDF institucionais | ⬜ | Contrato/`snapshot` prontos; renderização fiel aos 17 modelos exige trabalho dedicado (MARCO 7). |
| API dos demais domínios (triagem, evolução, prescrição, exames, leitos, transferência, farmácia, AIH/SIGTAP, comissões) | 🟡 | Banco+RLS prontos; faltam rotas/casos de uso e testes de integração por endpoint. |
| E2E de interface (Playwright) | ⬜ | Depende da web. |
| Testes de performance, segurança (SQLi/XSS/IDOR), concorrência multi-conexão | ⬜ | Requerem carga/ferramentas dedicadas. |
| Backup/restore executado e cronometrado (RPO/RTO reais) | ⬜ | Requer ambiente; procedimento documentado em OPERACAO_PRODUCAO. |
| Homologação com evidências e GO/NO-GO | ⬜ | Requer ambiente de homologação e execução assistida. |
| Deploy de produção / monitoramento | ⬜ | Requer infraestrutura provisionada. |
| Assinatura eletrônica avançada; administração eletrônica de medicamentos | ⬜ | Fora do escopo atual por decisão do Master (futuro). |
| SIGTAP/AIH: regras de obrigatoriedade | 🟡 | Depende de carga oficial do SIGTAP (DP-004). |

## 10. Dependências externas / integrações futuras

Carga oficial do SIGTAP por competência; integração SISREG (apenas como
referência/registro); provedor de storage para anexos/PDF em produção; secret
manager; protocolo de classificação de risco (DP-001).

## 11. Pendências assistenciais em aberto

DP-001 protocolo de triagem · DP-002 3º dispositivo · DP-003 CIDs sensíveis ·
DP-004 obrigatoriedades AIH/SIGTAP · DP-005 tipos com impressão integral ·
DP-006 janela de "dia assistencial". Ver `docs/DECISOES_PENDENTES.md`.

## 12. Riscos e limitações

- Escopo de RLS por **setor/interunidade** é permissivo (baseado em permissão +
  existência); o refinamento por setor e o consumo de `external_access_grants`
  em `can_access_attendance` são evolução planejada.
- Sem cobertura de testes medida; sem E2E de UI; sem backup testado — portanto
  **NÃO** atende aos critérios GO/NO-GO de produção ainda (Master §72).
- Legado permanece no repositório em quarentena (ADR-001), pendente de remoção
  por mantenedor com permissão de escrita destrutiva.

## 13. Conclusão

O núcleo de segurança e integridade — o que o Master trata como inegociável
(documento imutável, ocupação única de leito, encerramento consistente, RBAC+RLS,
auditoria) — está **implementado no banco, reforçado no domínio e verificado por
testes automatizados reprodutíveis**, com a API do fluxo central funcionando de
ponta a ponta. O caminho até produção está mapeado em `docs/IMPLEMENTATION_PLAN.md`
e nas pendências acima. **Build/teste verdes não são declarados como "pronto para
produção"** — os critérios GO/NO-GO ainda não estão satisfeitos.
