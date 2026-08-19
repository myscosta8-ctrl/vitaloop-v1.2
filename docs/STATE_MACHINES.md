# Vitaloop UPA — Máquinas de Estado

Estados são domínio fechado (enum/tabela). Transições inválidas são rejeitadas no
backend **e** no banco. As transições abaixo são implementadas em
`packages/domain/src/state-machines/` e cobertas por testes unitários; as
invariantes de banco correspondentes estão nas migrations.

## 1. Atendimento (`attendance_status`)

```
ABERTO ──► EM_TRIAGEM ──► EM_ATENDIMENTO ──► OBSERVACAO ──► ENCERRADO
   │            │                │                             ▲
   │            └────────────────┴─────────────────────────────┘
   └──► ENCERRADO   (evasão pode encerrar a partir de qualquer estado ativo)
```

- Estados ativos: `ABERTO, EM_TRIAGEM, EM_ATENDIMENTO, OBSERVACAO`.
- `ENCERRADO` é terminal; **não** retorna a estado ativo (constraint + trigger).
- Encerrar exige desfecho registrado e libera o leito na mesma transação.
- `OBSERVACAO ↔ EM_ATENDIMENTO` permitido (reavaliação).

## 2. Documento clínico (`document_status`)

```
RASCUNHO ──► FINALIZADO ──► LIBERADO ──► INATIVADO
   ▲             │
   └─────────────┘   (volta a RASCUNHO só antes de LIBERADO, pelo autor)
```

- `RASCUNHO`: apenas o autor edita.
- `FINALIZADO`: conforme workflow do tipo de documento.
- `LIBERADO`: **imutável**. Grava `snapshot`, `signed_at`, `signed_by`.
  Qualquer UPDATE de conteúdo é rejeitado por trigger (`DOCUMENT_IMMUTABLE`).
- `INATIVADO`: só a partir de `LIBERADO` (ou `FINALIZADO`, conforme regra), com
  motivo/autor/data; conteúdo preservado. Reinativação é rejeitada
  (`DOCUMENT_ALREADY_INACTIVATED`). Correção = novo documento.

## 3. Leito (`bed_state`)

```
LIVRE ──► OCUPADO ──► LIVRE
  │                     ▲
  ├──► INTERDITADO ─────┤
  ├──► MANUTENCAO ──────┤
  ├──► LEITO_EXTRA_DISPONIVEL ──► LEITO_EXTRA_OCUPADO ──► (fecha após 30min vazio)
  └──► DESATIVADO
```

- Sem `RESERVADO`/`HIGIENIZACAO`.
- Ocupação: `LIVRE→OCUPADO` cria `bed_assignment` ativo; liberar preenche
  `released_at`. Índices parciais garantem 1 alocação ativa por leito e por
  atendimento.
- Leito extra sem paciente por 30 min → fechamento por job idempotente.

## 4. Exame (`exam_status`)

```
SOLICITADO ──► COLETADO ──► RESULTADO_DISPONIVEL ──► INATIVADO
```

- Saída do paciente (transferência/óbito/evasão) com exame pendente registra a
  pendência; se amostra coletada, resultado pode ser anexado depois.

## 5. Transferência (`transfer_status`)

```
SOLICITADA ──► (RECUSADA | CANCELADA)
     │
     └──► ACEITA ──► PACIENTE_SAIU (concluída)
```

- Registra tentativa/recusa/cancelamento/aceite/destino/saída. Destino externo
  não gera prontuário na UPA.

## 6. Desfecho (`outcome_type`)

`ALTA · TRANSFERENCIA · OBITO · EVASAO · MELHOR_EM_CASA · OUTRO`.

- `ALTA`/`OBITO`: exigem médico. `EVASAO`: qualquer profissional autorizado.
- `MELHOR_EM_CASA`: médico + aceite do programa. Registrar desfecho encerra o
  atendimento (transação do §1).

## 7. Segurança do paciente (`safety_event_status`)

```
NOTIFICADO ──► EM_ANALISE ──► COM_CONDUTA ──► ENCERRADO
```
