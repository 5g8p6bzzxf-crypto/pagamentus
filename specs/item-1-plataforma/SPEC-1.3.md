# SPEC-1.3 – Modelo de dados e integridade

| Item | Responsável | Revisor (4º período) | Trello | Status |
|---|---|---|---|---|
| 1 – Plataforma | @joaovitor-webdev | A definir | A definir | Fazendo |

## 1. Contexto e objetivo
Estabelecer o esquema inicial do banco de dados relacional e as regras de integridade estruturais, garantindo a prevenção contra duplicidade, perda de dados e inconsistências em lançamentos. A especificação assegura que todas as operações no banco utilizem transações atômicas (ACID), chaves primárias/estrangeiras e restrições de unicidade/checagem para que falhas parciais não deixem dados corrompidos ou incompletos.

## 2. Requisitos relacionados
- **RNF-013 — Integridade**: Usar transações, chaves e validações para impedir duplicidade, perda de dados e lançamentos inconsistentes.

## 3. Escopo
- **Dentro do escopo:**
  - Definição do esquema inicial do banco relacional com chaves primárias (PK), chaves estrangeiras (FK) e restrições de unicidade (UNIQUE) e não-nulidade (NOT NULL).
  - Configuração de transações atômicas no mecanismo de banco/migração, garantindo rollback automático caso qualquer etapa da operação falhe.
  - Implementação de validações e restrições de integridade estruturais para impedir lançamentos parciais, duplicados ou inconsistentes.
- **Fora do escopo:**
  - Telas ou interfaces de usuário para cadastros (pertencentes a specs de UI/Frontend).
  - Regras de negócio contábeis detalhadas de partidas dobradas e planos de contas específicos (pertencentes ao Item 2).
  - Regras fiscais e cálculo de tributos (pertencentes ao Item 3).

## 4. Comportamento esperado
- **Fluxo normal:** Operações de escrita e persistência de dados ocorrem dentro de blocos transacionais controlados. As chaves e restrições validam os dados e todos os registros relacionados são gravados com sucesso (commit).
- **Fluxo de erro/exceção:** Caso ocorra qualquer falha, violação de restrição ou erro no meio de uma transação com múltiplas operações, todo o processo é abortado (rollback) e o banco de dados retorna ao estado original, sem deixar registros órfãos ou dados pela metade.
- **Fluxo de integridade/duplicidade:** Tentativas de reinserir registros duplicados em campos com restrição de unicidade são bloqueadas pelo banco de dados, retornando erro de violação de chave/restrição.

## 5. Critérios de aceite
- **CA-1:** Dado o esquema inicial do banco de dados, quando inspecionada a estrutura das tabelas, então todas as tabelas devem possuir chaves primárias definidas, chaves estrangeiras com integridade referencial e restrições de unicidade/validação para impedir duplicidade de registros.
- **CA-2:** Dado um processo transacional contendo múltiplas operações de inserção/atualização, quando ocorrer uma falha ou exceção no meio da execução, então a transação deve sofrer rollback completo, não deixando dados persistidos pela metade nem registros inconsistentes.
- **CA-3:** Dado um registro persistido com restrição de unicidade, quando for submetida uma nova operação com dados duplicados para a mesma chave, então a operação deve ser rejeitada pelo banco de dados, mantendo a integridade dos dados existentes.

## 6. Plano técnico
- **Banco de Dados & Transações:**
  - Utilização do PostgreSQL (conforme definido na stack da arquitetura) com motor transacional estrito (ACID).
  - Gerenciamento de migrações estruturadas para criação do esquema base com chaves (PK, FK) e constraints (UNIQUE, CHECK, NOT NULL).
- **Controle Transacional:**
  - Encapsulamento de operações atômicas por meio de transações (`BEGIN`, `COMMIT`, `ROLLBACK`), assegurando que falhas intermediárias revertam completamente a operação.
- **Validações Estruturais:**
  - Restrições de unicidade e integridade referencial ativas diretamente no catálogo do banco de dados para proteção contra race conditions e duplicidades em nível de persistência.

## 7. Tarefas de implementação
- [x] Criar branch de trabalho `spec/1.3-modelo-dados-integridade` a partir da `main`
- [x] Criar arquivo de migração/esquema inicial definindo tabelas base com PK, FK e restrições UNIQUE/NOT NULL
- [x] Implementar mecanismo/helper de execução sob transação atômica com rollback automático em caso de erro
- [x] Implementar testes automatizados para validação de unicidade e integridade referencial (CA-1 e CA-3)
- [x] Implementar testes automatizados de rollback transacional em caso de falha no meio da operação (CA-2)
- [x] Atualizar `CHANGELOG.md` na seção `[Não lançado]`

## 8. Dependências
- `SPEC-1.1` (Repositório, documentação e padrões de contribuição).
- `SPEC-1.2` (Arquitetura, stack e ambientes).

## 9. Como validar
1. **Validação do Esquema e Restrições (CA-1 e CA-3):**
   - Executar as migrações/scripts do esquema inicial no banco de dados de teste.
   - Inspecionar a presença de chaves primárias, chaves estrangeiras e índices únicos.
   - Tentar inserir registro com chave única duplicada e verificar a rejeição com erro de violação de restrição.
2. **Validação de Atomicidade e Rollback (CA-2):**
   - Executar teste de transação composta que insere o primeiro registro e simula uma falha proposital no segundo.
   - Consultar o banco de dados e verificar que o primeiro registro não foi gravado (rollback efetuado com sucesso, sem dados pela metade).

## 10. Evidências (preencher ao concluir)
*A ser preenchido ao concluir a implementação e testes.*

## 11. Histórico de revisão
*Nenhuma ressalva registrada até o momento.*
