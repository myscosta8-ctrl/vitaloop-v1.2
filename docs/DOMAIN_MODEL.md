# Vitaloop UPA — Modelo de Domínio e Glossário

Estrutura conceitual (Master §4): **Paciente → Atendimento → Eventos
assistenciais → Documentos → Desfecho**.

## 1. Glossário

- **Paciente** — pessoa permanente na base; nunca recriada por novo atendimento.
- **Atendimento (attendance)** — episódio na UPA, da abertura ao desfecho.
- **Episódio (episode)** — agrupador de trajetória do usuário na UPA.
- **Evento assistencial** — fato histórico do atendimento (triagem, admissão,
  busca ativa, transferência...); imutável.
- **Documento clínico** — entidade própria com estados e snapshot imutável.
- **Desfecho (outcome)** — encerramento: alta, transferência, óbito, evasão,
  Melhor em Casa, outro.
- **Leito (bed)** — recurso físico com estado; ocupação única por atendimento.
- **Transferência** — saída/destino da UPA. **Regulação** — processo de obtenção
  do destino. São conceitos distintos.
- **Setor** — subdivisão **da UPA** (nunca de outra unidade).
- **Profissão / Função / Permissão** — base do RBAC.

## 2. Agregados e invariantes

### Paciente (`patients` + contacts/alerts/allergies)
- Identificadores: `medical_record_number` (único), CPF, CNS.
- Invariante: não duplicar; dados demográficos versionáveis, mas documentos
  liberados guardam snapshot (não mudam retroativamente).

### Atendimento (`attendances` + `attendance_events`)
- 1 paciente → N atendimentos. FK obrigatória a paciente e setor da UPA.
- Estados: `ABERTO → EM_TRIAGEM → EM_ATENDIMENTO → OBSERVACAO → ENCERRADO`
  (transições em STATE_MACHINES). Fechado não volta a aberto.
- Desfecho coerente com fechamento; leito liberado ao encerrar.

### Eventos (`attendance_events`)
- Append-only. Nunca sobrescritos. `metadata JSONB` para contexto.

### Triagem (`triages`, `vital_signs`)
- Queixa, classificação, prioridade, profissional, data/hora. Não substitui a
  avaliação médica; não encerra o atendimento.

### Registros clínicos (`medical_evolutions`, `nursing_*`)
- Autoria, data de realização, estado (rascunho→finalizado→liberado→inativado).
- Evolução de enfermagem é **privativa do enfermeiro**; anotação é do técnico.
- Após evolução diária finalizada, nova ocorrência = nota de intercorrência.

### Prescrição médica (`medical_prescriptions` + `prescription_items`)
- Sem horários pelo médico; aprazamento manual pelo enfermeiro (ADR-008).

### Prescrição de enfermagem (`nursing_prescriptions` + itens)
- Itens configuráveis (sinais vitais, balanço, curativos, sondas, dietas,
  contenção...); qualquer item pode repetir.

### Exames (`exams`, `exam_items`, `exam_results`, `exam_attachments`)
- Estados: `SOLICITADO → COLETADO → RESULTADO_DISPONIVEL → (INATIVADO)`.
- Resultado por PDF (lab) ou foto (imagem/RX). Não registrar horário de
  visualização como requisito assistencial.

### Documentos (`clinical_documents`, `document_types`, `document_versions`,
`document_signatures`, `document_inactivations`, `print_events`)
- Máquina de estados própria + snapshot imutável (ADR-004). Um evento pode gerar
  vários documentos; não acoplar documento a toda regra de negócio.

### Leitos (`beds`, `bed_assignments`, `bed_events`)
- Ocupação única garantida por índice parcial (ADR-007). Histórico permanente.

### Transferência/Regulação (`transfers`, `regulations`)
- Registra solicitação, tentativa, recusa, cancelamento, aceite, destino, saída.
- Destino externo **não** tem prontuário operacional na base da UPA.

### Desfecho (`outcomes` catálogo, `attendance_outcomes`)
- Regras: alta por melhora e óbito → médico; evasão → qualquer profissional
  autorizado; Melhor em Casa → médico + aceite do programa.

### Segurança do paciente / Comissões / SUS / Farmácia
- Segurança do paciente: notificar→analisar→classificar→conduta→plano→encerrar.
- Comissões (CCIH, Óbito, Prontuários...): membros, reuniões, atas, planos.
- AIH estruturada (não texto livre); SIGTAP versionado; produção SUS da UPA.
- Farmácia da UPA: prescrição ≠ dispensação ≠ administração; estoque rastreável.

## 3. Serviços por domínio (aplicação)

`patientService, attendanceService, triageService, medicalService,
nursingService, prescriptionService, examService, documentService, bedService,
transferService, regulationService, outcomeService, pharmacyService,
inventoryService, aihService, sigtapService, auditService, notificationService,
patientSafetyService, commissionService`.

Cada serviço: validação · autorização · transação · tratamento de erro ·
auditoria · testes.

## 4. Erros de domínio (contrato)

`PATIENT_NOT_FOUND, DUPLICATE_PATIENT, ATTENDANCE_NOT_FOUND,
ATTENDANCE_ALREADY_CLOSED, BED_ALREADY_OCCUPIED, ATTENDANCE_ALREADY_HAS_BED,
INVALID_OUTCOME, DOCUMENT_IMMUTABLE, DOCUMENT_ALREADY_INACTIVATED,
UNAUTHORIZED_ACTION, INVALID_STATE_TRANSITION, MISSING_REQUIRED_FIELD`.
