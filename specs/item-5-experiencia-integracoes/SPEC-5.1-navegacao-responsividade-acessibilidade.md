# SPEC-5.1 – Navegação, responsividade e acessibilidade

| Item | Responsável | Revisor (4º período) | Trello | Status |
|---|---|---|---|---|
| Item 5 – Experiência, integrações e qualidade | Pablo | A definir pelo grupo | Cartão SPEC-5.1 – Navegação, responsividade e acessibilidade | Fazendo |

## 1. Contexto e objetivo

Esta especificação define os requisitos de usabilidade, acessibilidade, responsividade e compatibilidade da interface do sistema Pagamentus. O objetivo é permitir que as telas sejam utilizadas em computadores, tablets e celulares, com linguagem clara, navegação consistente e funcionamento nos navegadores modernos definidos para validação.

Esta SPEC descreve o comportamento esperado e como ele será verificado. Ela não determina, por si só, uma tecnologia, biblioteca visual ou redesign completo do sistema.

## 2. Requisitos relacionados

- **RNF-009 — Usabilidade e acessibilidade:** interface responsiva em computador, tablet e celular, linguagem clara, navegação consistente e acessibilidade compatível com boas práticas.
- **RNF-010 — Compatibilidade:** suportar navegadores modernos e exportações em formatos abertos; documentar requisitos de integração.

**Critério de aceite principal informado no Trello:** telas usáveis em celular, tablet e computador, em navegadores modernos.

## 3. Escopo

### Dentro do escopo

- Verificar e adequar a apresentação das telas existentes para computador, tablet e celular.
- Manter conteúdo, menus, formulários, tabelas, botões e ações acessíveis e utilizáveis em diferentes larguras de tela.
- Padronizar elementos de navegação e manter orientação consistente entre as telas.
- Utilizar linguagem clara em títulos, rótulos, instruções, mensagens de validação e mensagens de erro.
- Aplicar boas práticas de acessibilidade compatíveis com a interface, incluindo uso por teclado, foco visível, identificação de campos e alternativas textuais para conteúdo não textual quando aplicável.
- Verificar o funcionamento da interface nos navegadores modernos selecionados para homologação e registrar os navegadores e versões testados.
- Registrar limitações conhecidas de compatibilidade e requisitos necessários para integrações relacionadas à interface, quando existirem.

### Fora do escopo

- Criar novos módulos ou funcionalidades de negócio não previstos nos requisitos relacionados.
- Alterar regras contábeis, fiscais, trabalhistas ou de Imposto de Renda.
- Implementar ou alterar APIs, autenticação ou integrações de terceiros, exceto ajustes de apresentação necessários para exibir seus estados e mensagens na interface.
- Garantir compatibilidade com navegadores obsoletos ou sem suporte, salvo decisão posterior do grupo.
- Declarar conformidade formal com uma norma de acessibilidade sem avaliação específica e evidências apropriadas.
- Redesenhar integralmente a identidade visual do produto sem aprovação do grupo.

## 4. Comportamento esperado

### 4.1 Uso em computador

- A pessoa usuária consegue visualizar e utilizar menus, conteúdo, formulários, tabelas e ações sem sobreposição ou cortes indevidos.
- A navegação mantém organização consistente entre as telas.
- Os elementos interativos apresentam identificação e estados compreensíveis.

### 4.2 Uso em tablet

- A interface reorganiza seus elementos para a largura disponível.
- Menus, campos, botões e conteúdo continuam acessíveis e utilizáveis.
- Não deve ser necessário recorrer a zoom manual para executar as ações essenciais da tela.

### 4.3 Uso em celular

- O conteúdo se ajusta à largura da tela, evitando rolagem horizontal da página como um todo, exceto em componentes cujo conteúdo tabular exija rolagem própria e controlada.
- Botões, links, campos e menus permanecem identificáveis e operáveis por toque.
- Formulários mantêm rótulos e mensagens próximos aos campos correspondentes.
- Informações e ações essenciais não desaparecem em razão da redução da largura.

### 4.4 Navegação e acessibilidade

- Os caminhos de navegação e os nomes dos itens de menu permanecem consistentes entre telas equivalentes.
- A ordem de navegação por teclado acompanha uma sequência lógica.
- O foco do teclado fica visualmente perceptível nos elementos interativos.
- Campos de formulário possuem identificação compreensível e mensagens de erro associadas ao campo correspondente.
- Imagens informativas possuem alternativa textual adequada; imagens meramente decorativas não devem gerar leitura redundante.
- Cores não são o único meio de comunicar status, erro ou informação importante.
- Textos, instruções e mensagens utilizam linguagem direta e compreensível.

### 4.5 Compatibilidade

- As telas e suas ações essenciais funcionam nos navegadores modernos selecionados para homologação.
- Diferenças visuais entre navegadores não podem impedir a leitura, a navegação ou a conclusão dos fluxos essenciais.
- A equipe registra os navegadores, versões, dispositivos ou emuladores e limitações encontrados durante a validação.
- Requisitos de integração necessários ao funcionamento da interface são documentados, sem presumir disponibilidade de serviços externos não confirmados.

## 5. Critérios de aceite

- **CA-1 — Responsividade em computador:** Dado que a pessoa usuária acesse uma tela em um computador, quando utilizar os principais elementos da página, então menus, conteúdo, formulários e ações devem permanecer visíveis e utilizáveis, sem sobreposição ou corte que impeça o uso.
- **CA-2 — Responsividade em tablet:** Dado que a pessoa usuária acesse uma tela em um tablet, quando a interface for exibida na largura disponível, então os elementos devem se reorganizar sem perda de acesso às informações e ações essenciais.
- **CA-3 — Responsividade em celular:** Dado que a pessoa usuária acesse uma tela em um celular, quando visualizar e utilizar seus recursos, então o conteúdo deve se adaptar à largura disponível e as ações essenciais devem continuar utilizáveis, sem exigir zoom manual.
- **CA-4 — Navegação consistente:** Dado que a pessoa usuária navegue entre telas do sistema, quando utilizar menus, links e controles de navegação, então os nomes, a organização e o comportamento dos elementos equivalentes devem ser consistentes.
- **CA-5 — Linguagem clara:** Dado que a pessoa usuária visualize títulos, rótulos, instruções ou mensagens, quando precisar identificar uma ação ou compreender um erro, então o texto deve ser direto, compreensível e relacionado ao contexto apresentado.
- **CA-6 — Uso por teclado e foco:** Dado que a pessoa usuária utilize a interface sem mouse, quando navegar pelos elementos interativos usando teclado, então deve conseguir alcançar e operar os controles aplicáveis em sequência lógica e identificar visualmente o foco atual.
- **CA-7 — Identificação de campos e erros:** Dado que um formulário apresente campos obrigatórios ou inválidos, quando a pessoa usuária interagir com ele ou tentar enviá-lo, então os campos devem possuir identificação compreensível e as mensagens de validação devem indicar o problema de forma clara e associada ao campo correspondente.
- **CA-8 — Informação não dependente apenas de cor:** Dado que a interface apresente estados, alertas ou erros, quando a informação for comunicada visualmente, então deve existir também identificação textual, ícone acompanhado de texto ou outro recurso que não dependa exclusivamente da cor.
- **CA-9 — Compatibilidade com navegadores modernos:** Dado que a pessoa usuária acesse o sistema por cada navegador moderno incluído na matriz de homologação, quando executar os fluxos essenciais selecionados, então as telas e ações devem funcionar sem falhas que impeçam sua utilização.
- **CA-10 — Registro de compatibilidade:** Dado que a validação de navegadores seja concluída, quando as evidências forem registradas, então o documento deve informar navegadores e versões testados, ambiente utilizado, resultado e limitações encontradas.
- **CA-11 — Requisitos de integração documentados:** Dado que uma tela dependa de serviço ou integração externa para apresentar informações ou executar uma ação, quando essa dependência fizer parte do escopo validado, então seus requisitos conhecidos, dados necessários, comportamento esperado em caso de indisponibilidade e limitações devem estar documentados.
- **CA-12 — Critério principal do Trello:** Dado que as telas previstas para validação sejam acessadas em computador, tablet e celular, quando os fluxos essenciais forem executados nos navegadores modernos selecionados, então as telas devem permanecer usáveis nos três tipos de dispositivo e nos navegadores testados.

## 6. Plano técnico

- Inspecionar as telas existentes e identificar problemas de layout, navegação, legibilidade e operação por teclado.
- Utilizar os recursos responsivos já adotados pelo projeto, respeitando a stack e os padrões definidos na documentação de arquitetura.
- Priorizar layouts fluidos e adaptação dos componentes ao espaço disponível, evitando dimensões rígidas que provoquem cortes.
- Revisar menus, formulários, tabelas, botões, mensagens, estados de foco e elementos não textuais.
- Definir, junto ao grupo, a matriz de navegadores modernos e os fluxos essenciais usados na homologação.
- Registrar os resultados em uma matriz de testes com dispositivo ou viewport, navegador e versão, cenário, resultado e evidência.
- Não introduzir dependências ou bibliotecas novas sem justificativa e alinhamento com a arquitetura do projeto.

## 7. Tarefas de implementação

- [ ] Levantar as telas e os componentes de navegação existentes.
- [ ] Identificar problemas de responsividade em computador, tablet e celular.
- [ ] Identificar problemas de linguagem, consistência e acessibilidade nos componentes existentes.
- [ ] Adequar os layouts e componentes necessários conforme a arquitetura definida.
- [ ] Revisar navegação por teclado, foco visível e identificação de campos.
- [ ] Revisar mensagens de validação, erro e status para que não dependam apenas de cor.
- [ ] Definir com o grupo a matriz de navegadores e versões para homologação.
- [ ] Executar os testes previstos para os três tipos de dispositivo.
- [ ] Executar os testes nos navegadores selecionados.
- [ ] Registrar resultados, limitações e evidências por critério de aceite.
- [ ] Atualizar a documentação de compatibilidade e requisitos de integração aplicáveis.

## 8. Dependências

- **SPEC-1.2 — Decisão de arquitetura, stack e ambientes:** necessária para orientar as soluções técnicas e evitar adoção de tecnologias incompatíveis com o projeto.
- **SPEC-1.4 — Usuários, perfis e permissões:** necessária para validar a navegação e os elementos exibidos conforme os perfis, quando essas telas estiverem disponíveis.
- Telas e componentes dos módulos que serão incluídos na homologação.
- Definição, pelo grupo ou pelo revisor, da lista de navegadores modernos e versões que serão considerados no aceite.
- Disponibilidade de ambiente de teste e dados fictícios para executar os fluxos.

## 9. Como validar

1. Preparar ambiente de teste com dados exclusivamente fictícios.
2. Selecionar as telas e os fluxos essenciais que serão avaliados.
3. Registrar a matriz de dispositivos ou larguras de viewport utilizada, contemplando computador, tablet e celular.
4. Abrir cada tela nas larguras selecionadas e verificar cortes, sobreposições, legibilidade, rolagem e acesso às ações.
5. Repetir os fluxos essenciais nos navegadores e versões definidos na matriz de homologação.
6. Navegar pelos elementos interativos usando teclado, verificando sequência, operação e foco visível.
7. Preencher formulários com dados válidos e inválidos para verificar rótulos e mensagens de validação.
8. Verificar se alertas e estados possuem identificação que não dependa exclusivamente de cor.
9. Conferir se os requisitos conhecidos de integração e as limitações de compatibilidade estão documentados.
10. Registrar o resultado de cada critério como aprovado, reprovado ou bloqueado, anexando evidência e descrição do ambiente utilizado.
11. Corrigir os problemas identificados e repetir os testes relacionados antes de solicitar aprovação.

### Matriz mínima de validação

| Ambiente | Verificações principais |
|---|---|
| Computador | Layout, menus, formulários, tabelas, navegação e ações |
| Tablet | Reorganização dos componentes, legibilidade e operação |
| Celular | Adaptação à largura, acesso às ações e formulários |
| Navegadores homologados | Abertura das telas e execução dos fluxos essenciais |
| Teclado | Ordem de navegação, operação dos controles e foco visível |

As larguras exatas de viewport e a lista de navegadores e versões devem ser registradas na execução dos testes, após alinhamento com o grupo. Esta especificação não presume uma lista de versões já aprovada.

## 10. Evidências (preencher ao concluir)

- Link do Pull Request: a preencher após abertura.
- Prints das telas nos ambientes de computador, tablet e celular.
- Matriz preenchida com navegadores, versões, ambientes e resultados.
- Evidências de navegação por teclado e foco visível.
- Evidências de formulários e mensagens de validação.
- Registro de limitações encontradas e respectivas correções.
- Resultado dos testes relacionado a cada critério de aceite.

Nenhum critério deve ser marcado como aprovado antes da execução e do registro da respectiva validação.

## 11. Histórico de revisão

| Revisão | Responsável | Observação | Situação |
|---|---|---|---|
| 0.1 | Pablo | Elaboração inicial da especificação com base nos RNF-009 e RNF-010 e no critério principal informado no Trello. | Em revisão |
| — | Revisor do 4º período | A preencher após análise. | Pendente |
