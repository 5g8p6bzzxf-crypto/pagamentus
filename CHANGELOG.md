# Changelog
Uma linha por spec concluída, no estilo Keep a Changelog.

## [Não lançado]
### Adicionado
- SPEC-1.1: Estrutura base de documentação, modelos de especificação e regras de proteção da branch main.
- SPEC-1.2: Definição da stack tecnológica oficial, diretrizes de escalabilidade (ADR-001) e segregação de ambientes de teste e produção.
- SPEC-1.3: Modelo de dados inicial com chaves, restrições e controle transacional atômico com rollback (RNF-013).
- [SPEC-1.4] Autenticação, senhas e MFA (PR #14, João Vitor): Política de senhas fortes, MFA para perfis privilegiados, bloqueio de tentativas e encerramento de sessões (RF-075, RNF-003).
- [SPEC-1.5] Perfis, permissões e isolamento entre clientes (PR #15, João Vitor): Segregação entre clientes com autorização expressa, menor privilégio, criptografia de dados sensíveis e TLS (RB-008, RNF-001).
- [SPEC-1.6] Cadastro de pessoas e empresas (PR #17, João Vitor): Cadastro de PF/PJ com validação de CPF/CNPJ, inscrições, contatos, endereços, responsáveis e dados fiscais com vigência (RF-001, RF-002).
- [SPEC-1.7] Estabelecimentos, filiais, sócios e responsáveis (PR #18, João Vitor): Múltiplos estabelecimentos, filiais, sócios e responsáveis técnicos vinculados à mesma organização (RF-005).
- [SPEC-1.8] Anexos cadastrais com validade (PR #19, João Vitor): Anexação de contrato social, procurações, certificados e documentos cadastrais com controle e alerta de validade (RF-003).
- [SPEC-1.9] Auditoria e histórico cadastral (PR #20, João Vitor): Trilha de auditoria imutável para inclusão, alteração, exclusão lógica, estorno e aprovação com histórico cadastral rastreável (RF-015, RF-004, RNF-004, RB-007).
- [SPEC-1.10] Credenciais e tokens de integração (PR #21, João Vitor): Armazenamento protegido de credenciais, emissão de tokens com escopo mínimo e rotação/revogação (RF-076).
- [SPEC-1.11] Privacidade e LGPD (PR #22, João Vitor): Política LGPD (finalidade, base legal, minimização, operadores, retenção e descarte), fluxo de pedidos de titulares e registro de incidentes (RNF-002).
- [SPEC-1.12] Backup, recuperação e continuidade (PR #23, João Vitor): Backups automáticos criptografados, testes periódicos de restauração registrados, RPO/RTO e plano de continuidade/incidentes (RNF-008, RNF-016).
- SPEC-2.1: Estrutura e manutenção de plano de contas contábil configurável por empresa com validação de lançamentos em contas analíticas.
- SPEC-2.2: Lançamentos manuais estruturados com partidas dobradas, validação de período aberto, contas ativas e consistência de valores.
- SPEC-2.3: Modelos de lançamentos recorrentes, rateios proporcionais e estornos com rastreabilidade ao lançamento de origem.
- SPEC-2.4: Importação de lançamentos em lote por planilha com pré-validação, relatório de erros por linha e opção de desfazer lote.
- SPEC-5.1: Especificação em revisão de navegação, responsividade, acessibilidade, compatibilidade com navegadores, exportações em formatos abertos e documentação de requisitos de integração.

### Alterado

### Corrigido
