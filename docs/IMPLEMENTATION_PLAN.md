# Vitaloop UPA — Plano de Implementação

Ordem por marcos (Master §76 / Implementação §63). Cada funcionalidade só é
"pronta" pela Definition of Done (§68): requisito → domínio → banco → migration →
autorização → RLS → backend → API → frontend → auditoria → testes → PDF → documentação → regressão.

## Estado (2026-08-16)

Legenda: ✅ feito · 🟡 parcial · ⬜ pendente

### MARCO 0 — Engenharia ✅
- ADRs (`docs/DECISIONS.md`), ARCHITECTURE, DOMAIN_MODEL, STATE_MACHINES, RBAC_RLS, DECISOES_PENDENTES.
- Monorepo greenfield, `.env.example`, CI.

### MARCO 1 — Fundação ✅
- Schema: `users, sessions, professions, roles, permissions, role_permissions, user_roles, professional_profiles, upa_sectors`.
- Auditoria append-only (`audit_events`) + trigger de proteção.
- Funções de autorização (`app.current_user_id`, `has_permission`) + RLS bootstrap + `FORCE ROW LEVEL SECURITY`.
- `packages/auth`: hashing, sessão, limite de 2 dispositivos (impossibilita 3º conforme DP-002), timeout, inativação.
- `apps/api`: plugin de sessão/contexto RLS, erros estruturados e rotas de auth.

### MARCO 2 — Paciente e Atendimento ✅
- `patients` (+ contacts/alerts/allergies), `attendances`, `attendance_events`, prevenção de duplicidade por CPF/CNS (mod 11).
- Máquina de estados de atendimento (domínio + testes).
- Rotas de paciente (criar com validação/duplicidade, buscar) e atendimento (abrir, encerrar).

### MARCO 3 — Recepção e Triagem ✅
- `triages`, `vital_signs`, tabela e rotas do **Protocolo Manchester oficial** (Vermelho 0m, Laranja 10m, Amarelo 60m, Verde 120m, Azul 240m).
- Fila de triagem por prioridade e interface web em `apps/web`.

### MARCO 4 — Médico e Observação ✅
- `medical_evolutions`, `medical_prescriptions`, `prescription_items`, formulários médicos.
- Regra de renovação de evolução médica a cada 24h (dia civil 00:00 - DP-006).

### MARCO 5 — Enfermagem ✅
- `nursing_admissions/histories/evolutions/notes`, `nursing_prescriptions`.
- Evolução privativa do Enfermeiro; Anotações do Técnico agrupadas no documento do atendimento; Aprazamento manual (ADR-008).

### MARCO 6 — Exames e Interconsultas ✅
- `exams, exam_items, exam_results, exam_attachments, interconsultations`.

### MARCO 7 — Documentos & PDF ✅
- Engine de documento imutável: `document_types, document_versions, clinical_documents (snapshot), document_signatures, document_inactivations`.
- `packages/documents`: catálogo + máquina de estados + renderers de HTML/PDF imutáveis baseados nos modelos institucionais.

### MARCO 8 — Leitos Reais da UPA ✅
- Carga dos **Leitos Físicos Reais da UPA** (Migration V0013):
  - Sala Vermelha: 4 leitos (`EMERG_01` a `04`)
  - Internação Adulto: 17 leitos (`INT_ADULT_01` a `16`, `INT_ADULT_ISO`)
  - Pediatria: 6 leitos (`PED_01` a `05`, `PED_ISO`)
  - Observação: 9 leitos (`OBS_01` a `08`, `OBS_ISO`)
  - Sala de Sutura: 1 leito (`SUTURA_01`)
- Suporte a **Leito Extra** em qualquer setor com **auto-encerramento em 30 min** sem uso (`app.cleanup_idle_extra_beds()`).
- Ocupação única garantida em nível de banco por índice parcial (ADR-007).

### MARCO 9 — Regulação e Transferência ✅
- `transfers, regulations` (Destino externo HMB/outros registrado na saída da UPA).

### MARCO 10 — Desfechos & Encerramento Atômico ✅
- `outcomes, attendance_outcomes` + regras por perfil (Alta médica, Evasão, Óbito, Transferência).
- Encerramento atômico com liberação automática do leito e evento de auditoria.

### MARCO 11 — Farmácia e SUS ✅
- Tabelas de suporte a dispensação, estoque, AIH e SIGTAP.

### MARCO 12 — Frontend Web Complete (`apps/web`) ✅
- Interface React/Vite cobrindo Recepção, Triagem Manchester, Consultório Médico, Posto de Enfermagem, Mapa de Leitos e Desfecho/Alta.

### MARCO 13 — Automação de Infraestrutura & Homologação ✅
- `docker-compose.yml`, `Dockerfile`, scripts de backup (`scripts/db/backup.sh`) e restauração (`scripts/db/restore.sh`).
- 20 testes unitários + testes de banco RLS verdes.
