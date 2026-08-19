# Vitaloop UPA — Relatório de Homologação e Prontidão para Piloto

Ambiente de homologação preparado e validado para início dos testes operacionais na UPA.

## Evidência das Decisões Institucionais Aplicadas

1. **Protocolo de Triagem Manchester (DP-001)**:
   - ✅ Implantado via migration `V0013__upa_real_beds_manchester.sql` e integrado à interface da Triagem.
   - Níveis: Vermelho (0m), Laranja (10m), Amarelo (60m), Verde (120m), Azul (240m).

2. **Política de Dispositivos (DP-002)**:
   - ✅ Bloqueio conservador do 3º login ativo por usuário (`packages/auth/test/session-policy.test.ts`).

3. **Renovação Diária de Evolução Médica (DP-006)**:
   - ✅ Regra de 24h zera às 00:00 (dia civil) para Médicos e Enfermeiros.
   - Anotações de Enfermagem dos Técnicos agrupadas em um único documento diário por atendimento.

4. **Leitos Físicos Reais da UPA e Leitos Extras**:
   - ✅ Carga completa dos leitos: Sala Vermelha (4), Internação Adulto (17 c/ 1 iso), Pediatria (6 c/ 1 iso), Observação (9 c/ 1 iso), Sala de Sutura (1).
   - ✅ Abertura de Leito Extra funcional com encerramento automático após 30 minutos sem alocação (`app.cleanup_idle_extra_beds()`).

## Rastreabilidade de Testes Automatizados (20/20 Testes Passando)

```
✔ limite de 2 dispositivos: terceiro é negado (política padrão)
✔ segundo dispositivo é permitido
✔ estratégia revoke-oldest encerra a sessão mais antiga
✔ timeout por inatividade
✔ inativação de usuário após 6 meses sem atividade
✔ pdfRenderer: gera HTML/PDF completo a partir de snapshot imutável
✔ desfecho: óbito exige médico
✔ desfecho: evasão pode ser registrada por não-médico autorizado
✔ desfecho: sem permissão de desfecho é negado
✔ desfecho: código inválido
✔ authorize: usuário inativo nunca autoriza
✔ atendimento: transições válidas e inválidas
✔ atendimento: encerrado nunca reabre
✔ documento: liberado é imutável
✔ documento: única saída de LIBERADO é INATIVADO
✔ documento: liberação exige snapshot
✔ leito: transições e fechamento automático de extra
✔ CPF: aceita válido e rejeita inválido (mod 11)
✔ CNS: valida regra mod 11
✔ onlyDigits remove pontuação
```

## Como Executar Localmente na UPA (Acesso via Navegador Web)

1. **Subir com Docker Compose (Servidor da UPA)**:
   ```bash
   docker-compose up -d --build
   ```
2. **Acessar a Aplicação Web**:
   Abrir o navegador Chrome em `http://<IP_DO_SERVIDOR>:3000`.

3. **Backup & Restore**:
   - Backup: `./scripts/db/backup.sh`
   - Restauração: `./scripts/db/restore.sh <arquivo.sql.gz>`
