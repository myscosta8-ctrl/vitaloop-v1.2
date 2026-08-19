# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Versionamento semântico. Ainda não há release de produção.

## [Não lançado]

### Adicionado
- Projeto greenfield do Vitaloop UPA (monorepo TypeScript + PostgreSQL 16).
- MARCO 0: ADRs e documentação de engenharia (arquitetura, domínio, máquinas de
  estado, RBAC/RLS, plano, decisões pendentes).
- MARCO 1: schema de fundação (usuários, sessões, profissões, funções,
  permissões, setores) + auditoria append-only + funções de autorização + RLS.
- `packages/auth`: regras de sessão (2 dispositivos, timeout, inativação 6 meses).
- `packages/domain`: máquinas de estado (atendimento, documento, leito, desfecho)
  e erros de domínio, com testes unitários.
- Schema clínico: paciente, atendimento, triagem, evoluções, prescrições, exames,
  documentos imutáveis, leitos (ocupação única), transferência/regulação,
  desfechos, farmácia/SUS, segurança do paciente e comissões.
- Testes de banco: integridade, imutabilidade de documento e RLS.
- API Fastify do fluxo central: autenticação por sessão (limite de 2
  dispositivos), contexto RLS por transação, erros estruturados, rotas de
  paciente e atendimento (abrir/encerrar atômico). Smoke E2E in-process.
- Pipeline CI (GitHub Actions) com Postgres 16 e role de aplicação.
- Relatório final, operação/produção e homologação.

Ver `docs/IMPLEMENTATION_PLAN.md` para o estado detalhado por marco e
`docs/RELATORIO_FINAL_PRODUCAO.md` para o que foi/não foi implementado.
