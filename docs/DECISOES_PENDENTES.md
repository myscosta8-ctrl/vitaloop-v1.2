# Vitaloop UPA — Decisões Pendentes (assistenciais)

Registro de contradições reais ou lacunas de **regra assistencial** que alteram
comportamento clínico. Conforme o Comando Mestre e o Master §78, o agente **não
inventa regra clínica**: registra aqui e prossegue apenas nas partes que não
dependem da decisão. Questões puramente técnicas são resolvidas via ADR, não aqui.

Status: 🟠 aberta · 🟢 resolvida

---

## DP-001 🟠 Classificação de risco: protocolo oficial

**Contexto.** O Master exige triagem com "classificação/prioridade" mas não fixa
o protocolo (Manchester, ACCR/Humaniza-SUS, cores). A escala concreta muda a
tabela de domínio de prioridade e as regras de reavaliação.

**Impacto.** `triages.classification`/`priority` e regras de fila.

**Provisório.** Modelado como tabela de domínio configurável
(`triage_classifications`) sem fixar protocolo; seed vazio até decisão.

**Precisa de:** definição institucional do protocolo e tempos-alvo por nível.

---

## DP-002 🟠 Política de 3º dispositivo (sessão)

**Contexto.** Master §9 / RBAC §16: "máximo de 2 dispositivos". Ao tentar um 3º,
o sistema deve **impedir** o novo login ou **encerrar a sessão mais antiga**?
Teste 030 aceita "impede OU encerra conforme política definida".

**Impacto.** `packages/auth` (regra de admissão de sessão).

**Provisório.** Implementado como **impedir o 3º** (mais seguro/conservador),
com ponto de configuração para alternar. Requer confirmação institucional.

---

## DP-003 🟠 CIDs sensíveis: lista e efeito

**Contexto.** Master §55 / RBAC §12: CIDs "classificados como sensíveis" acionam
restrição adicional. A lista de CIDs e o efeito exato (ocultar do não-médico?
exigir permissão específica?) não estão definidos.

**Impacto.** RLS de dados clínicos sensíveis.

**Provisório.** Estrutura `sensitive_cid` + hook de RLS previstos; sem lista
seed. Acesso clínico ampliado default para médico/enfermeiro.

---

## DP-004 🟠 AIH/SIGTAP: campos obrigatórios por competência

**Contexto.** Master §42–44 exige AIH estruturada e bloqueio de liberação quando
campo obrigatório do SIGTAP faltar. O conjunto exato de obrigatoriedades depende
da competência SIGTAP vigente e do rol de procedimentos da UPA.

**Impacto.** Validações de `aihs`/`sigtap_catalog` e bloqueio de liberação.

**Provisório.** Catálogo versionado por competência modelado; regras de
obrigatoriedade ficam como configuração até carga oficial do SIGTAP.

---

## DP-005 🟠 "Documento íntegro": quais tipos proíbem impressão parcial

**Contexto.** Master §48 proíbe impressão parcial "quando a regra institucional
exigir documento integral". Falta a lista de tipos com essa exigência.

**Impacto.** `document_types.require_full_print`.

**Provisório.** Flag por tipo de documento (default `true` para documentos
assistenciais liberados). Requer validação institucional da lista.

---

## DP-006 🟠 Evolução diária: janela e fuso de "dia assistencial"

**Contexto.** Master §17 distingue evolução diária de nota de intercorrência
("após evolução diária finalizada"). Não está definido se "dia" é calendário
local, plantão (12h) ou 24h corridas — o que altera quando o sistema passa a
exigir nota de intercorrência.

**Impacto.** Regra de criação de `medical_evolutions`/`nursing_evolutions`.

**Provisório.** Dia = calendário no fuso da unidade; ponto de configuração
previsto. Requer confirmação.
