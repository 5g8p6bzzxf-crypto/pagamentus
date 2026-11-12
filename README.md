# Item 4 — Módulo de Folha de Pagamento, Empregados e Atendimento (SPEC-4.1)

Sistema Integrado de Contabilidade, Fiscal e Imposto de Renda  
**Responsável**: Douglas (2º período de GTI)  
**Gestão e Revisão**: 4º período  
**Método**: Spec-Driven Development (SDD)

---

## 📌 Visão Geral do Módulo

Este módulo implementa o núcleo do **Item 4: Folha de Pagamento, Obrigações e RH (SPEC-4.1)** com foco em conformidade com as regras de negócio essenciais e requisitos funcionais estipulados pelo 4º período:

1. **RF-051 (Cadastro de empregados e contratos)**: CRUD completo com dados cadastrais, cargo, remuneração base, jornada, data de admissão, status (`ativo`, `afastado`, `inativo`) e número de dependentes.
2. **RF-052 (Cálculos de folha)**: Cálculo mensal de proventos e descontos com tabelas progressivas (INSS e IRRF), além de simulador de Férias (com 1/3 constitucional) e 13º Salário (1ª e 2ª parcelas) com parâmetros auditáveis.
3. **RF-053 (Eventos variáveis e afastamentos)**: Lançamento de horas extras (50% e 100%), faltas, adicionais e afastamentos/licenças médicas ou parentais vinculadas ao contrato.
4. **RF-054 (Preparação para sistemas oficiais)**: Estruturação e exportação em lote (JSON e TXT) dos eventos oficiais de trabalho (simulando eventos eSocial S-1000, S-2200, S-2230 e S-1200) para conferência contábil prévia (sem transmissão direta desautorizada, conforme RB-010).
5. **RF-055 (Recibos e provisões)**: Emissão e impressão amigável de recibo formal de pagamento (holerite simplificado com bases de INSS/FGTS) e demonstrativo consolidado de provisões mensais (13º e férias + 35,8% de encargos patronais).
6. **RF-056 (Controle de acesso e trilha de aprovação)**: Seletor simulado de perfil no topo ("Perfil RH/Admin" vs "Perfil Consulta/Assistente"). Quando no perfil Consulta, todos os dados salariais e sensíveis são ofuscados tanto na API (`R$ *****,**` e `***.***.***-**`) quanto na UI (LGPD), e ações de aprovação são bloqueadas. Trilha de aprovação registrada em tabela de auditoria.

---

## 🏗️ Arquitetura e Stack

- **Backend**: Node.js (v26+) com framework Express.
- **Banco de Dados**: SQLite embarcado de alta performance via `better-sqlite3` com modo WAL e integridade referencial ativa.
- **Frontend**: Single Page Application (SPA) em HTML5 semântico, Vanilla JavaScript modular e Tailwind CSS via CDN (zero overhead de build).
- **Dados Fictícios**: População automática inicial de 3 colaboradores 100% fictícios para cumprimento rigoroso da LGPD e RNF-002.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ (testado e homologado no Node v26)
- npm

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo para `.env`:
```bash
cp .env.example .env
```

### 3. Iniciar o servidor
```bash
npm start
```
O servidor será iniciado na porta **3000**:
`http://localhost:3000`

### 4. Executar os testes automatizados
```bash
npm test
```
O script executa 18 asserções automáticas cobrindo todos os requisitos funcionais (RF-051 ao RF-056).

---

## 📂 Estrutura do Projeto

```
item-4-folha-atendimento/
├── docs/
│   └── specs/
│       └── item-4-folha-atendimento/
│           └── SPEC-4.1.md          # Especificação SDD formal
├── data/
│   └── payroll.sqlite               # Banco de dados SQLite persistente
├── src/
│   ├── db/
│   │   └── database.js              # Conexão, DDL e carga inicial LGPD
│   ├── routes/
│   │   ├── employeeRoutes.js        # Endpoints de empregados (RF-051)
│   │   ├── eventRoutes.js           # Eventos variáveis e licenças (RF-053)
│   │   ├── payrollRoutes.js         # Cálculos, holerites e aprovações (RF-052/055/056)
│   │   ├── esocialRoutes.js         # Exportação oficial estruturada (RF-054)
│   │   └── parameterRoutes.js       # Parâmetros legais parametrizáveis
│   ├── services/
│   │   ├── payrollService.js        # Motor de cálculos e tabelas progressivas
│   │   ├── maskingService.js        # Mascaramento RBAC / LGPD em duas camadas
│   │   └── esocialService.js        # Estruturação conceitual dos eventos eSocial
│   └── public/
│       ├── index.html               # Interface SPA com Tailwind CDN
│       ├── css/
│       │   └── custom.css           # Estilos e suporte a impressão do holerite
│       └── js/
│           └── app.js               # Lógica cliente, seletor de perfil e abas
├── test/
│   └── test_endpoints.js            # Suíte de testes de integração e conformidade
├── server.js                        # Ponto de entrada Express
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔒 Conformidade LGPD e Auditoria

- **LGPD (RNF-002)**: Todos os nomes, cargos, salários e CPFs no banco são estritamente fictícios.
- **RBAC e Mascaramento (RF-056)**: Usuários no perfil Consulta recebem respostas mascaradas tanto na interface quanto nas chamadas REST da API.
- **Auditoria (RNF-004 / RF-056)**: Cada simulação, alteração cadastral e aprovação de folha é registrada na tabela `payroll_approval_logs` com usuário, data/hora e justificativa.
