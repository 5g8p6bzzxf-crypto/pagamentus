# SPEC-3.1 – Importação de documentos fiscais

| Item | Responsável | Revisor (4º período) | Trello | Status |
|---|---|---|---|---|
| 3 – Fiscal e IR | @matheusbdsousa-lgtm | A definir | A definir | Fazendo |

## 1. Contexto e objetivo
Esta especificação define a **importação de documentos fiscais eletrônicos e arquivos disponibilizados por sistemas autorizados**, garantindo a **preservação do arquivo original e de sua integridade** por meio de hash criptográfico (`SHA-256`).

## 2. Requisitos relacionados
- **RF-016:** Importar documentos fiscais eletrônicos e arquivos disponibilizados pelos sistemas autorizados, preservando o arquivo original e sua integridade.

## 3. Escopo
- **Dentro do escopo:**
  - Importação de documentos fiscais eletrônicos (ex.: `NFE`, `NFSE`, `CTE`, `NFCE`, `ARQUIVO_FISCAL`) provenientes de sistemas autorizados, vinculados à empresa (`empresaId`).
  - Preservação integral do conteúdo original do arquivo importado sem modificações.
  - Cálculo e persistência do hash `SHA-256` do conteúdo original no ato da importação.
  - Listagem, consulta do arquivo original e verificação de integridade (recalculando e comparando o hash `SHA-256`).
- **Fora do escopo:**
  - Comunicação direta com SEFAZ/prefeituras ou emissão/cancelamento de documentos fiscais.
  - Leitura/escrituração fiscal automática, apuração de impostos ou contabilização.
  - Validação de certificado digital ICP-Brasil.

## 4. Comportamento esperado
- **Fluxo normal:**
  - O usuário envia o arquivo/documento fiscal informando tipo, sistema autorizado de origem, nome do arquivo e conteúdo original.
  - O sistema calcula o hash `SHA-256` do conteúdo original, armazena o conteúdo intacto e retorna os metadados e o hash gerado.
  - Ao consultar o documento ou solicitar verificação de integridade, o sistema confirma que o conteúdo armazenado corresponde ao hash `SHA-256` original.
- **Fluxo de erro/exceção:**
  - Se faltarem `empresaId`, nome do arquivo, tipo de documento, sistema autorizado ou se o conteúdo estiver vazio, o sistema recusa a importação (HTTP 400).
  - Se um hash esperado informado na verificação não coincidir com o hash do conteúdo preservado, o sistema sinaliza falha de integridade (`integro: false`).

## 5. Critérios de aceite
- **CA-1 (Importação com preservação do original e hash):** Dada uma empresa existente, quando for importado um documento fiscal eletrônico ou arquivo de sistema autorizado com nome, tipo, origem e conteúdo original, então o sistema deve preservar o conteúdo original intacto, calcular e persistir o hash `SHA-256` e retornar o registro vinculado à empresa (RF-016).
- **CA-2 (Consulta do original e comprovação de integridade):** Dado um documento fiscal importado, quando for consultado o documento ou verificada sua integridade, então o conteúdo original retornado deve ser idêntico ao importado e o hash recalculado deve coincidir com o armazenado (`integro: true`) (RF-016).
- **CA-3 (Detecção de divergência de integridade):** Dado um documento fiscal importado, quando for verificada a integridade contra um hash divergente ou conteúdo corrompido, então o sistema deve identificar e retornar `integro: false` (RF-016).
- **CA-4 (Validações de entrada obrigatória):** Dada a tentativa de importação, quando faltarem dados obrigatórios (nome do arquivo, tipo de documento, origem autorizada ou conteúdo vazio), então o sistema deve recusar a operação com erro de validação (RF-016).

## 6. Plano técnico
- **Modelos (`src/models/DocumentoFiscalImportadoModel.ts`):** Tipos para `TipoDocumentoFiscal`, `DocumentoFiscalImportado` e `ResultadoVerificacaoIntegridade`.
- **Repositório (`src/repositories/DocumentoFiscalImportadoRepository.ts`):** Interface `IDocumentoFiscalImportadoRepository` e `InMemoryDocumentoFiscalImportadoRepository`.
- **Serviço (`src/services/DocumentoFiscalImportadoService.ts`):** Importação com cálculo de `SHA-256`, preservação do conteúdo original, consulta e verificação de integridade.
- **Controller e Rotas (`src/controllers/DocumentoFiscalImportadoController.ts` e `src/routes/documentoFiscalImportadoRoutes.ts`):**
  - `POST /api/empresas/:empresaId/fiscal/documentos/importar`
  - `GET /api/empresas/:empresaId/fiscal/documentos`
  - `GET /api/empresas/:empresaId/fiscal/documentos/:id`
  - `GET /api/empresas/:empresaId/fiscal/documentos/:id/integridade`
- **Integração (`src/app.ts`):** Registro do repositório, serviço, controller e rotas no `criarApp()`.
- **Testes (`tests/importacaoDocumentosFiscais.test.ts`):** Cenários de integração com `supertest` cobrindo CA-1 a CA-4.

## 7. Tarefas de implementação
- [ ] Criar modelos em `src/models/DocumentoFiscalImportadoModel.ts`.
- [ ] Criar repositório em `src/repositories/DocumentoFiscalImportadoRepository.ts`.
- [ ] Implementar `DocumentoFiscalImportadoService` em `src/services/DocumentoFiscalImportadoService.ts`.
- [ ] Implementar `DocumentoFiscalImportadoController` e `documentoFiscalImportadoRoutes` e registrar em `src/app.ts`.
- [ ] Criar testes automatizados em `tests/importacaoDocumentosFiscais.test.ts` cobrindo CA-1 a CA-4.
- [ ] Executar testes e build TypeScript e registrar evidências na spec.

## 8. Dependências
- Módulo base Express/TypeScript e estrutura multi-tenant por `empresaId`.

## 9. Como validar
1. Executar `npx jest tests/importacaoDocumentosFiscais.test.ts` e confirmar que todos os cenários (CA-1 a CA-4) passam.
2. Executar `npm run build` para garantir ausência de erros de compilação TypeScript.

## 10. Evidências (preencher ao concluir)
- A preencher após implementação e execução dos testes.

## 11. Histórico de revisão
- Ainda sem revisões registradas.
