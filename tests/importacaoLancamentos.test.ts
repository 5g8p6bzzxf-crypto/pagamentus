import request from 'supertest';
import { criarApp } from '../src/app';

describe('SPEC-2.4: Importação de Lançamentos com Pré-Validação e Desfazer Lote (RF-010)', () => {
  let app: any;
  let planoContasService: any;
  let periodoRepo: any;
  let lancamentoRepo: any;

  const empresaId = 'empresa_teste_001';

  beforeEach(async () => {
    const instancia = criarApp();
    app = instancia.app;
    planoContasService = instancia.planoContasService;
    periodoRepo = instancia.periodoRepo;
    lancamentoRepo = instancia.lancamentoRepo;

    // Configuração de contas contábeis para testes de importação
    // 1. Conta Analítica Ativa
    await planoContasService.criarConta({
      empresaId,
      codigo: '1.1.01.001',
      nome: 'Caixa Geral',
      nivel: 4,
      tipo: 'ANALITICA',
      natureza: 'DEVEDORA',
      classificacao: 'ATIVO',
    });

    // 2. Conta Analítica Ativa
    await planoContasService.criarConta({
      empresaId,
      codigo: '2.1.01.001',
      nome: 'Fornecedores Diversos',
      nivel: 4,
      tipo: 'ANALITICA',
      natureza: 'CREDORA',
      classificacao: 'PASSIVO',
    });

    // 3. Conta Sintética
    await planoContasService.criarConta({
      empresaId,
      codigo: '1.1',
      nome: 'Ativo Circulante',
      nivel: 2,
      tipo: 'SINTETICA',
      natureza: 'DEVEDORA',
      classificacao: 'ATIVO',
    });

    // 4. Conta Inativa
    await planoContasService.criarConta({
      empresaId,
      codigo: '1.1.01.099',
      nome: 'Conta Bloqueada Teste',
      nivel: 4,
      tipo: 'ANALITICA',
      natureza: 'DEVEDORA',
      classificacao: 'ATIVO',
      ativo: false,
    });
  });

  /**
   * CA-1: Dado um arquivo/planilha com formato válido e todos os lançamentos consistentes,
   * quando for acionada a pré-validação, então o sistema retorna status de aprovação
   * sem erros com o total de registros e valores computados.
   */
  describe('CA-1: Pré-validação com sucesso de lote consistente', () => {
    it('deve pré-validar lote sem erros e retornar totalizadores', async () => {
      const linhasPlanilha = [
        {
          documentoOrigem: 'DOC-IMP-01',
          dataLancamento: '2026-11-15',
          competencia: '2026-11',
          historico: 'Compra de material de escritório',
          codigoConta: '1.1.01.001',
          tipoPartida: 'DEBITO',
          valor: 850.0,
        },
        {
          documentoOrigem: 'DOC-IMP-01',
          dataLancamento: '2026-11-15',
          competencia: '2026-11',
          historico: 'Compra de material de escritório',
          codigoConta: '2.1.01.001',
          tipoPartida: 'CREDITO',
          valor: 850.0,
        },
      ];

      const res = await request(app)
        .post(`/api/empresas/${empresaId}/importacoes/pre-validar`)
        .send({ linhas: linhasPlanilha });

      expect(res.status).toBe(200);
      expect(res.body.sucesso).toBe(true);
      expect(res.body.dados.valido).toBe(true);
      expect(res.body.dados.totalLancamentos).toBe(1);
      expect(res.body.dados.valorTotal).toBe(850.0);
      expect(res.body.dados.erros).toHaveLength(0);
    });
  });

  /**
   * CA-2: Dado um arquivo/planilha contendo inconsistências (conta inexistente, período fechado,
   * partidas desbalanceadas ou valor zerado), quando a pré-validação for executada,
   * então o sistema deve rejeitar o lote e emitir um relatório de erros indicando a linha e o motivo de cada falha.
   */
  describe('CA-2: Emissão de relatório de erros em planilha com inconsistências', () => {
    it('deve apontar erros por linha ao encontrar conta inexistente, sintética e desbalanceamento', async () => {
      // Competência 2026-08 fechada
      await periodoRepo.definirStatus(empresaId, '2026-08', 'ENCERRADO');

      const linhasComErros = [
        // Linha 1 e 2: Lançamento com conta inexistente na linha 1
        {
          documentoOrigem: 'DOC-ERR-01',
          dataLancamento: '2026-11-15',
          competencia: '2026-11',
          historico: 'Lançamento com conta que não existe',
          codigoConta: '9.9.99.999',
          tipoPartida: 'DEBITO',
          valor: 100.0,
        },
        {
          documentoOrigem: 'DOC-ERR-01',
          dataLancamento: '2026-11-15',
          competencia: '2026-11',
          historico: 'Contrapartida',
          codigoConta: '2.1.01.001',
          tipoPartida: 'CREDITO',
          valor: 100.0,
        },
        // Linha 3: Período contábil fechado
        {
          documentoOrigem: 'DOC-ERR-02',
          dataLancamento: '2026-08-10',
          competencia: '2026-08',
          historico: 'Lançamento em mês fechado',
          codigoConta: '1.1.01.001',
          tipoPartida: 'DEBITO',
          valor: 200.0,
        },
        {
          documentoOrigem: 'DOC-ERR-02',
          dataLancamento: '2026-08-10',
          competencia: '2026-08',
          historico: 'Lançamento em mês fechado',
          codigoConta: '2.1.01.001',
          tipoPartida: 'CREDITO',
          valor: 200.0,
        },
        // Linha 5 e 6: Desbalanceado
        {
          documentoOrigem: 'DOC-ERR-03',
          dataLancamento: '2026-11-16',
          competencia: '2026-11',
          historico: 'Desbalanceado',
          codigoConta: '1.1.01.001',
          tipoPartida: 'DEBITO',
          valor: 500.0,
        },
        {
          documentoOrigem: 'DOC-ERR-03',
          dataLancamento: '2026-11-16',
          competencia: '2026-11',
          historico: 'Desbalanceado',
          codigoConta: '2.1.01.001',
          tipoPartida: 'CREDITO',
          valor: 400.0,
        },
      ];

      const res = await request(app)
        .post(`/api/empresas/${empresaId}/importacoes/pre-validar`)
        .send({ linhas: linhasComErros });

      expect(res.status).toBe(422);
      expect(res.body.sucesso).toBe(false);
      expect(res.body.dados.valido).toBe(false);
      expect(res.body.dados.erros.length).toBeGreaterThanOrEqual(3);

      const erros = res.body.dados.erros;
      expect(erros.some((e: any) => e.linha === 1 && e.erro.includes('não foi encontrada'))).toBe(true);
      expect(erros.some((e: any) => e.linha === 3 && e.erro.includes('está encerrado'))).toBe(true);
      expect(erros.some((e: any) => e.documentoOrigem === 'DOC-ERR-03' && e.erro.includes('desbalanceado'))).toBe(true);
    });
  });

  /**
   * CA-3: Dado que um lote pré-validado com sucesso foi confirmado para gravação,
   * quando a importação for concluída, então todos os lançamentos do arquivo
   * são persistidos no banco de dados vinculados ao identificador do lote (lote_id).
   */
  describe('CA-3: Confirmação e persistência do lote com lote_id', () => {
    it('deve importar e persistir lançamentos associados ao lote_id', async () => {
      const linhas = [
        {
          documentoOrigem: 'DOC-LOTE-01',
          dataLancamento: '2026-11-17',
          competencia: '2026-11',
          historico: 'Lançamento 1 do lote',
          codigoConta: '1.1.01.001',
          tipoPartida: 'DEBITO',
          valor: 1500.0,
        },
        {
          documentoOrigem: 'DOC-LOTE-01',
          dataLancamento: '2026-11-17',
          competencia: '2026-11',
          historico: 'Lançamento 1 do lote',
          codigoConta: '2.1.01.001',
          tipoPartida: 'CREDITO',
          valor: 1500.0,
        },
        {
          documentoOrigem: 'DOC-LOTE-02',
          dataLancamento: '2026-11-17',
          competencia: '2026-11',
          historico: 'Lançamento 2 do lote',
          codigoConta: '1.1.01.001',
          tipoPartida: 'DEBITO',
          valor: 2500.0,
        },
        {
          documentoOrigem: 'DOC-LOTE-02',
          dataLancamento: '2026-11-17',
          competencia: '2026-11',
          historico: 'Lançamento 2 do lote',
          codigoConta: '2.1.01.001',
          tipoPartida: 'CREDITO',
          valor: 2500.0,
        },
      ];

      const res = await request(app)
        .post(`/api/empresas/${empresaId}/importacoes/confirmar`)
        .send({
          nomeArquivo: 'extrato_novembro.csv',
          linhas,
        });

      expect(res.status).toBe(201);
      expect(res.body.sucesso).toBe(true);
      const loteId = res.body.dados.lote.id;
      expect(res.body.dados.lote.quantidadeLancamentos).toBe(2);
      expect(res.body.dados.lote.valorTotal).toBe(4000.0);
      expect(res.body.dados.lote.status).toBe('PROCESSADO');

      // Verifica no repositório de lançamentos contábeis se todos os lançamentos possuem o loteId
      const lancamentosLote = await lancamentoRepo.listarPorLoteId(loteId);
      expect(lancamentosLote).toHaveLength(2);
      expect(lancamentosLote[0].loteId).toBe(loteId);
      expect(lancamentosLote[1].loteId).toBe(loteId);
    });
  });

  /**
   * CA-4: Dado um lote de lançamentos previamente importado no sistema,
   * quando o usuário solicitar o desfazimento do lote informando seu identificador (lote_id),
   * então todos os lançamentos contábeis daquele lote são excluídos/desfeitos do sistema.
   */
  describe('CA-4: Opção de desfazer lote de importação', () => {
    it('deve remover todos os lançamentos atrelados ao lote desfeito', async () => {
      // 1. Importa um lote
      const linhas = [
        {
          documentoOrigem: 'DOC-REV-01',
          dataLancamento: '2026-11-17',
          competencia: '2026-11',
          historico: 'Lote para teste de desfazimento',
          codigoConta: '1.1.01.001',
          tipoPartida: 'DEBITO',
          valor: 3000.0,
        },
        {
          documentoOrigem: 'DOC-REV-01',
          dataLancamento: '2026-11-17',
          competencia: '2026-11',
          historico: 'Lote para teste de desfazimento',
          codigoConta: '2.1.01.001',
          tipoPartida: 'CREDITO',
          valor: 3000.0,
        },
      ];

      const resImport = await request(app)
        .post(`/api/empresas/${empresaId}/importacoes/confirmar`)
        .send({
          nomeArquivo: 'lote_erroneo.csv',
          linhas,
        });

      const loteId = resImport.body.dados.lote.id;

      // Confirma que o lançamento existe
      let lancamentos = await lancamentoRepo.listarPorLoteId(loteId);
      expect(lancamentos).toHaveLength(1);

      // 2. Aciona o desfazimento do lote
      const resDesfazer = await request(app)
        .post(`/api/empresas/${empresaId}/importacoes/${loteId}/desfazer`)
        .send();

      expect(resDesfazer.status).toBe(200);
      expect(resDesfazer.body.sucesso).toBe(true);
      expect(resDesfazer.body.dados.lote.status).toBe('DESFEITO');
      expect(resDesfazer.body.dados.lancamentosRemovidos).toBe(1);

      // 3. Verifica que nenhum lançamento com o loteId permaneceu no sistema
      lancamentos = await lancamentoRepo.listarPorLoteId(loteId);
      expect(lancamentos).toHaveLength(0);

      // 4. Tentar desfazer o mesmo lote novamente deve ser rejeitado
      const resSegundaTentativa = await request(app)
        .post(`/api/empresas/${empresaId}/importacoes/${loteId}/desfazer`)
        .send();

      expect(resSegundaTentativa.status).toBe(400);
      expect(resSegundaTentativa.body.mensagem).toContain('já foi desfeito anteriormente');
    });
  });
});
