# Referência de estrutura — documentos removidos por conterem dado real de paciente

Esses 10 PDFs foram removidos do repositório do Vitaloop (pasta `pdfs_exemplo`) por conterem nome, CPF, CNS, endereço e telefone de pacientes reais (dois pacientes diferentes: um do Hospital Regional do Marajó, outro sem instituição clara). Este documento preserva **apenas a estrutura** (campos, seções, ordem, tabelas) de cada um, sem nenhum dado real — pronta pra servir de base na criação dos modelos oficiais da UPA Breves, com a marca certa (Prefeitura Municipal de Breves / SEMSA / UPA 24h) e logos próprias.

Todos vieram de um sistema chamado "Salutem" — o rodapé de geração e a numeração de página são específicos daquele sistema, não precisam ser replicados.

---

## 1. LAUDO PARA AUTORIZAÇÃO DE INTERNAÇÃO HOSPITALAR (AIH)
*(Já temos o original correto da UPA Breves enviado por você — esse aqui serve só de comparação de campos extras)*

Campos observados: nome do paciente, data de nascimento, sexo, raça/cor, nome da mãe, endereço completo, município + UF + CEP, história da doença atual (texto longo), estado geral na admissão (texto clínico), diagnóstico com CID-10, procedimento solicitado + código, clínica/especialidade, caráter da internação, nome e CRM do médico solicitante, data da solicitação, número de autorização.

---

## 2. PRESCRIÇÃO MÉDICA (documento interno de internação — diferente do Receituário simples)

**Cabeçalho:** Nº prontuário, Nº registro, recepção, data de internação/alta, nome do paciente, caráter (urgência/eletivo), convênio, nome da mãe, sexo, nacionalidade, raça, RG, CPF, CNS, data de nascimento, idade, endereço, telefone, Nº da prescrição, data/hora do documento, início/fim da validade, centro de custo, médico responsável + CRM + especialidade, alergia, peso, leito/quarto/unidade.

**Corpo — 3 blocos de tabela:**
- **Dieta:** item numerado
- **Medicamentos:** tabela com colunas — nome do medicamento, quantidade/unidade, se é "se necessário", via de aplicação, frequência, horário de aplicação (itens podem ter sub-itens, ex: "4" e "4,1" pro diluente)
- **Orientação enfermagem:** itens numerados com frequência
- **Avaliação multidisciplinar** e **Hemocomponente:** seções livres

**Rodapé:** 5 linhas de assinatura (Técnico Tarde / Técnico Noite / Técnico Manhã / Enfermeiro / Médico + CRM)

---

## 3. BALANÇO HÍDRICO
*(Já temos o original da UPA Breves — esse mostra uma variação mais detalhada, com o cálculo já feito)*

Estrutura em tabela: cabeçalho com registro/prontuário/paciente/nascimento/idade/mãe/quarto/leito/clínica, número do balanço, situação (aberto/fechado parcial/fechado), data de referência. Tabela principal com **item do lançamento** nas linhas (soro, medicamentos, dieta — cada um por nome específico) e **horários** nas colunas (de hora em hora), separado em **Ganho** e **Perda**, com subtotais por período (06h, 12h) e total geral. Rodapé com fechamento por dia e fechamento geral.

---

## 4. EVOLUÇÃO DO ENFERMEIRO — SAE (Sistematização da Assistência de Enfermagem)

**Cabeçalho:** igual padrão (prontuário, registro, datas, paciente, mãe, sexo, nascimento, idade, raça, RG, CPF, CNS, telefone, endereço, recepção, caráter, leito/quarto/unidade)

**Corpo, seção por seção:**
- Tempo de internação
- Mecanismo de trauma (quando aplicável)
- Hipótese diagnóstica médica
- AMP (antecedentes médicos pessoais)
- Peso
- AMF (antecedentes médicos familiares)
- Breve histórico (texto longo)
- Evolução/exame físico diária (texto longo, bem detalhado — dispositivos, monitorização, sistemas)
- Dispositivos invasivos (checkbox + local + data, ex: AVP, TOT)
- Intercorrências
- Mudanças significativas da terapêutica
- Procedimentos realizados (lista)

**Segunda página:** Nota, Plano terapêutico de enfermagem (problemas ativos, diagnósticos de enfermagem, metas/resultados esperados, meta clínica)

**Assinatura:** nome + COREN

---

## 5. EVOLUÇÃO MÉDICA DIÁRIA DE ENFERMARIA CLÍNICA

**Cabeçalho:** mesmo padrão + classificação de risco (cor)

**Corpo:**
- Diagnósticos (numerado, principal na primeira linha)
- História da doença atual (copiar da ficha de urgência + parecer de interconsulta)
- Comorbidades (sim/não + especificar)
- Reconciliação medicamentosa (sim/não + especificar)
- Alergias (sim/não + especificar)
- Risco para TEV (estratificado)
- Critérios de sepse (sim/não)
- Antibioticoterapia atual (nome, data início, duração)
- Evolução do dia
- Exame físico
- Plano terapêutico (copiado da admissão, atualizado)

**Segunda página:**
- Laboratório/cultura/exames de imagem
- Aguarda exames (sim/não + especificar)
- Data prevista de alta (reavaliar diariamente)
- Conduta médica (texto longo, decisões passo a passo)

**Assinatura:** nome + CRM

---

## 6. NOTA DE INTERCORRÊNCIA (mesma estrutura pra médica e enfermagem)

**Cabeçalho:** padrão completo
**Corpo:** um único campo "Notas" (texto livre, registro cronológico do que aconteceu)
**Assinatura:** nome + COREN (enfermagem) ou CRM (médica)

---

## 7. PLANO TERAPÊUTICO

**Cabeçalho:** padrão completo + classificação

**Corpo, numerado:**
1. Diagnósticos (principal na primeira linha)
2. Motivo da internação (causa base)
3. Objetivos da terapêutica (linha a linha, com tempo previsto por meta)
4. Elegível para protocolo institucional — **lista de checkboxes**: Antibioticoprofilaxia cirúrgica, Cirurgia segura, Controle da dor, Identificação segura, Jejum, Prevenção de LPP, Prevenção de queda, TCE, TEV
5. Tempo de internação previsto (dias)
6. Equipe multidisciplinar (checkboxes: enfermagem obrigatório, fisioterapia, etc.)

**Assinatura:** nome + CRM

---

## 8. TRANSFERÊNCIA INTERNA DE PACIENTES — SBAR

**Cabeçalho:** padrão completo + classificação

**Corpo (formato SBAR):**
- Setor de origem / Setor de destino
- Data e hora
- Impressão diagnóstica
- Alergia (sim/não)
- Nível de consciência (checkbox: alerta, sedado, etc.)
- Suporte ventilatório (checkbox)
- **Sinais vitais em grade:** Temperatura, FC, FR, SpO2, PA
- Swab de vigilância (sim/não)
- Exames pendentes (sim/não)
- Dieta
- Eliminações

**Segunda página:**
- Higiene corporal (sim/não)
- Curativo (sim/não + local)
- Isolamento (sim/não)
- Dispositivos (checkbox + local)
- Recomendações
- Intercorrência no transporte (sim/não)
- Observações
- **Enfermeiro responsável pelo transporte** e **enfermeiro responsável pelo recebimento** (dois nomes — quem entrega e quem recebe, útil pra rastreabilidade)

**Assinatura:** nome + COREN

---

## 9. HISTÓRICO DE ENFERMAGEM

**Cabeçalho:** prontuário, registro, data internação/alta, paciente, mãe, nacionalidade, convênio, sexo, nascimento, idade, raça, RG, CPF, CNS, telefone, endereço, recepção, caráter

**Corpo:** texto clínico livre e extenso, cobrindo admissão, monitorização, dispositivos, sistemas orgânicos, dieta, eliminações — semelhante em estilo à Evolução do Enfermeiro, mas mais como um relato único de admissão

**Assinatura:** nome + COREN

---

## Padrão comum a quase todos (vale replicar como cabeçalho único)

Nº prontuário · Nº registro · data/hora de internação · data/hora de alta · nome do paciente · classificação de risco (cor) · nome da mãe · nacionalidade · convênio · sexo · data de nascimento · idade · raça/cor · RG · CPF · CNS · telefone · endereço completo · tipo de recepção · caráter do atendimento · leito · quarto · unidade/setor

Isso bate quase campo a campo com os **13 campos do cabeçalho padrão** que já definimos pro Vitaloop lá no início do planejamento — é uma boa confirmação de que aquela decisão estava alinhada com o que sistemas hospitalares reais usam.
