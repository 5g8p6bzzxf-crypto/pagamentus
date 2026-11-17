# SPEC-2.4 – Importação de lançamentos

| Item | Responsável | Revisor (4º período) | Trello | Status |
|---|---|---|---|---|
| 2 – Contabilidade | Ítalo | A definir | https://trello.com/c/piZHXcEu | Fazendo |

## 1. Contexto e objetivo
Permitir a importação em lote de lançamentos contábeis a partir de arquivos/planilhas estruturadas, fornecendo rotina de pré-validação antes da gravação definitiva, emissão de relatório detalhado de erros por linha/registro e capacidade de desfazimento (rollback/exclusão) integral de um lote importado.

## 2. Requisitos relacionados
- **RF-010**: Importar lançamentos por planilha/arquivo com pré-validação, relatório de erros e opção de desfazer lote.

## 3. Escopo
- **Dentro do escopo:**
  - Leitura e processamento de arquivos/planilhas (ex.: CSV ou formato tabular estruturado) contendo linhas de lançamentos e partidas.
  - Pré-validação do lote sem persistência imediata, checando: preenchimento de campos obrigatórios, códigos de contas válidos e ativos, balanceamento de partidas dobradas e período contábil aberto.
  - Emissão de relatório de inconsistências/erros discriminando a linha e o motivo da rejeição.
  - Gravação dos lançamentos em lote atrelados a um identificador exclusivo do lote (`lote_id`).
  - Funcionalidade de desfazimento (estorno/exclusão) de todos os lançamentos pertencentes a um determinado lote importado.
- **Fora do escopo:**
  - Conciliação contábil e bancária dos registros importados (RF-011).
  - Reconhecimento óptico de caracteres (OCR) de documentos digitalizados.
  - Conversão de arquivos de sistemas legados com layouts customizados proprietários.

## 4. Comportamento esperado
- **Fluxo normal (Pré-validação e Importação):** O usuário submete uma planilha de lançamentos contábeis. O sistema executa a pré-validação em memória verificando todas as linhas; se não houver erros, retorna o resumo prévio (quantidade de lançamentos válidos e valor total). Ao confirmar a importação, os lançamentos são persistidos associados a um `lote_id`.
- **Fluxo com inconsistências (Relatório de Erros):** Caso o arquivo contenha contas inexistentes, inativas, período contábil fechado ou partidas desbalanceadas, o sistema rejeita a importação e devolve um relatório detalhado contendo número da linha, dados da operação e mensagem explicativa de cada erro.
- **Fluxo normal (Desfazer Lote):** O usuário solicita o desfazimento de uma importação informando o `lote_id`. O sistema remove ou inativa todos os lançamentos gerados exclusivamente por aquele lote, restaurando o estado contábil anterior.

## 5. Critérios de aceite
- **CA-1:** Dado um arquivo/planilha com formato válido e todos os lançamentos consistentes (balanceados, período aberto e contas válidas), quando for acionada a pré-validação, então o sistema retorna status de aprovação sem erros com o total de registros e valores computados.
- **CA-2:** Dado um arquivo/planilha contendo inconsistências (ex.: conta inexistente, período fechado, partidas desbalanceadas ou valor zerado), quando a pré-validação for executada, então o sistema deve rejeitar o lote e emitir um relatório de erros indicando a linha e o motivo de cada falha.
- **CA-3:** Dado que um lote pré-validado com sucesso foi confirmado para gravação, quando a importação for concluída, então todos os lançamentos do arquivo são persistidos no banco de dados vinculados ao identificador do lote (`lote_id`).
- **CA-4:** Dado um lote de lançamentos previamente importado no sistema, quando o usuário solicitar o desfazimento do lote informando seu identificador (`lote_id`), então todos os lançamentos contábeis daquele lote são excluídos/desfeitos do sistema.

## 6. Plano técnico
- **Modelo de Dados:**
  - Tabela `lote_importacao`:
    - `id`: Identificador único do lote (UUID).
    - `empresa_id`: Chave da empresa titular.
    - `nome_arquivo`: Nome original do arquivo importado.
    - `data_importacao`: Data/hora do processamento.
    - `quantidade_lancamentos`: Total de lançamentos importados.
    - `valor_total`: Valor monetário consolidado do lote.
    - `status`: Enum (`PROCESSADO`, `DESFEITO`).
  - Campo no `lancamento_contabil`:
    - `lote_id`: FK opcional para `lote_importacao` indicando a origem do lote.
- **Serviços e Regras de Negócio:**
  - `ImportacaoLancamentosService`:
    - `preValidarArquivo(empresaId, conteudoArquivo)`: Faz o parser das linhas, agrupa partidas por lançamento e aplica as validações de `LancamentoContabilService` e `PlanoContasService`, devolvendo `{ valido: boolean, erros: Array<{ linha: number, erro: string }> }`.
    - `importarLote(empresaId, nomeArquivo, lancamentosValidados)`: Registra o cabeçalho do lote e persiste todos os lançamentos associados.
    - `desfazerLote(empresaId, loteId)`: Localiza e remove todos os lançamentos vinculados àquele `lote_id`, atualizando o status do lote para `DESFEITO`.
- **Endpoints / Rotas:**
  - `POST /api/empresas/{empresaId}/importacoes/pre-validar`: Valida arquivo e emite relatório de erros.
  - `POST /api/empresas/{empresaId}/importacoes/confirmar`: Confirma e grava o lote pré-validado.
  - `POST /api/empresas/{empresaId}/importacoes/{loteId}/desfazer`: Desfaz todos os lançamentos do lote.

## 7. Tarefas de implementação
- [ ] Criar modelos e interfaces para `LoteImportacao` e DTOs de importação/relatório de erros.
- [ ] Implementar parser para processamento de arquivos CSV/estruturados de lançamentos.
- [ ] Implementar serviço de pré-validação com relatório detalhado de erros por linha.
- [ ] Implementar serviço de persistência de lote e desfazimento (rollback/exclusão de lançamentos por `loteId`).
- [ ] Criar controladores e rotas REST para pré-validação, importação e desfazimento.
- [ ] Escrever suíte de testes automatizados com Jest cobrindo CA-1 a CA-4.

## 8. Dependências
- `SPEC-2.1` (Plano de contas: validação de contas).
- `SPEC-2.2` (Regras de lançamentos com partidas dobradas e período aberto).

## 9. Como validar
1. **Pré-validação bem-sucedida (CA-1):** Enviar arquivo CSV com dados válidos e verificar relatório limpo (sem erros) com contagem e totalizador.
2. **Relatório de erros (CA-2):** Enviar arquivo com erro na linha 2 (conta inexistente) e linha 3 (desbalanceado) e verificar array de erros detalhados.
3. **Gravação do lote (CA-3):** Confirmar importação e verificar existência dos lançamentos com `loteId` associado.
4. **Desfazer lote (CA-4):** Chamar rota de desfazimento e comprovar que nenhum lançamento daquele `loteId` permaneceu na listagem da empresa.

## 10. Evidências (preencher ao concluir)
*(A preencher após implementação: links de PR, prints e saída de execução dos testes).*

## 11. Histórico de revisão
*(Nenhuma ressalva registrada até o momento).*
