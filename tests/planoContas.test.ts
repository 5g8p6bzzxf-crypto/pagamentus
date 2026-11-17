import request from 'supertest';
import { criarApp } from '../src/app';

describe('SPEC-2.1: Plano de Contas Contábil (RF-006)', () => {
  let app: any;
  let repository: any;
  const empresaExemploId = 'empresa_teste_001';

  beforeEach(async () => {
    const instancia = criarApp();
    app = instancia.app;
    repository = instancia.repository;
    await repository.limpar();
  });

  /**
   * CA-1: Dado que o usuário deseja cadastrar uma conta contábil para uma empresa,
   * quando informar código estruturado, nível hierárquico, natureza (devedora/credora),
   * classificação e tipo (sintética ou analítica),
   * então a conta é registrada com sucesso vinculada à respectiva empresa.
   */
  describe('CA-1: Cadastro de conta contábil com código, nível, natureza, classificação e tipo', () => {
    it('deve registrar com sucesso uma conta sintética vinculada à empresa', async () => {
      const novaContaSintetica = {
        codigo: '1',
        nome: 'ATIVO',
        nivel: 1,
        tipo: 'SINTETICA',
        natureza: 'DEVEDORA',
        classificacao: 'ATIVO',
      };

      const response = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas`)
        .send(novaContaSintetica);

      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.dados).toHaveProperty('id');
      expect(response.body.dados.empresaId).toBe(empresaExemploId);
      expect(response.body.dados.codigo).toBe('1');
      expect(response.body.dados.nome).toBe('ATIVO');
      expect(response.body.dados.nivel).toBe(1);
      expect(response.body.dados.tipo).toBe('SINTETICA');
      expect(response.body.dados.natureza).toBe('DEVEDORA');
      expect(response.body.dados.classificacao).toBe('ATIVO');
      expect(response.body.dados.ativo).toBe(true);
    });

    it('deve registrar com sucesso uma conta analítica vinculada à empresa', async () => {
      const novaContaAnalitica = {
        codigo: '1.1.01.001',
        nome: 'Caixa Geral',
        nivel: 4,
        tipo: 'ANALITICA',
        natureza: 'DEVEDORA',
        classificacao: 'ATIVO',
      };

      const response = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas`)
        .send(novaContaAnalitica);

      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.dados.codigo).toBe('1.1.01.001');
      expect(response.body.dados.tipo).toBe('ANALITICA');
      expect(response.body.dados.empresaId).toBe(empresaExemploId);
    });
  });

  /**
   * CA-2: Dado que uma conta contábil está cadastrada com o tipo "sintética",
   * quando houver uma tentativa de vinculá-la a um lançamento contábil,
   * então o sistema deve bloquear o registro e exibir uma mensagem informando que apenas contas analíticas recebem lançamentos.
   */
  describe('CA-2: Bloqueio de lançamento em contas sintéticas', () => {
    it('deve rejeitar tentativa de validar conta sintética para lançamento contábil', async () => {
      // Cadastra conta sintética
      const resCadastro = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas`)
        .send({
          codigo: '1.1',
          nome: 'Ativo Circulante',
          nivel: 2,
          tipo: 'SINTETICA',
          natureza: 'DEVEDORA',
          classificacao: 'ATIVO',
        });

      const contaId = resCadastro.body.dados.id;

      // Tenta validar lançamento na conta sintética
      const response = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas/${contaId}/validar-lancamento`)
        .send();

      expect(response.status).toBe(422);
      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('Apenas contas analíticas recebem lançamentos');
    });
  });

  /**
   * CA-3: Dado que uma conta contábil está cadastrada com o tipo "analítica",
   * quando houver uma tentativa de vinculá-la a um lançamento contábil válido,
   * então o sistema deve permitir a vinculação da conta ao lançamento.
   */
  describe('CA-3: Permissão de lançamento em contas analíticas', () => {
    it('deve autorizar com sucesso conta analítica ativa para receber lançamento', async () => {
      // Cadastra conta analítica
      const resCadastro = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas`)
        .send({
          codigo: '1.1.01.002',
          nome: 'Banco Conta Movimento',
          nivel: 4,
          tipo: 'ANALITICA',
          natureza: 'DEVEDORA',
          classificacao: 'ATIVO',
        });

      const contaId = resCadastro.body.dados.id;

      // Tenta validar lançamento na conta analítica
      const response = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas/${contaId}/validar-lancamento`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.mensagem).toContain('Conta analítica válida para receber lançamento.');
      expect(response.body.dados.id).toBe(contaId);
      expect(response.body.dados.tipo).toBe('ANALITICA');
    });
  });

  /**
   * CA-4: Dado que já existe uma conta com determinado código cadastrada para uma empresa,
   * quando o usuário tentar cadastrar outra conta com o mesmo código para essa mesma empresa,
   * então o sistema deve rejeitar o cadastro informando duplicidade de código.
   */
  describe('CA-4: Rejeição de código contábil duplicado por empresa', () => {
    it('deve bloquear cadastro com mesmo código na mesma empresa', async () => {
      const contaOriginal = {
        codigo: '2.1.01.001',
        nome: 'Fornecedores Nacionais',
        nivel: 4,
        tipo: 'ANALITICA',
        natureza: 'CREDORA',
        classificacao: 'PASSIVO',
      };

      // Primeiro cadastro: sucesso
      const res1 = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas`)
        .send(contaOriginal);
      expect(res1.status).toBe(201);

      // Segundo cadastro com mesmo código: erro de duplicidade
      const res2 = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas`)
        .send(contaOriginal);

      expect(res2.status).toBe(400);
      expect(res2.body.sucesso).toBe(false);
      expect(res2.body.mensagem).toContain('Já existe uma conta com o código "2.1.01.001" cadastrada para esta empresa.');
    });

    it('deve permitir o mesmo código para empresas distintas (isolamento multi-tenant)', async () => {
      const outraEmpresaId = 'empresa_teste_002';
      const conta = {
        codigo: '1.1.01.001',
        nome: 'Caixa Geral',
        nivel: 4,
        tipo: 'ANALITICA',
        natureza: 'DEVEDORA',
        classificacao: 'ATIVO',
      };

      const resEmpresa1 = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas`)
        .send(conta);
      expect(resEmpresa1.status).toBe(201);

      const resEmpresa2 = await request(app)
        .post(`/api/empresas/${outraEmpresaId}/plano-contas`)
        .send(conta);
      expect(resEmpresa2.status).toBe(201);
    });
  });

  describe('Consultas e Manutenção de Contas', () => {
    it('deve listar as contas da empresa ordenadas pelo código', async () => {
      await request(app).post(`/api/empresas/${empresaExemploId}/plano-contas`).send({
        codigo: '2',
        nome: 'PASSIVO',
        nivel: 1,
        tipo: 'SINTETICA',
        natureza: 'CREDORA',
        classificacao: 'PASSIVO',
      });

      await request(app).post(`/api/empresas/${empresaExemploId}/plano-contas`).send({
        codigo: '1',
        nome: 'ATIVO',
        nivel: 1,
        tipo: 'SINTETICA',
        natureza: 'DEVEDORA',
        classificacao: 'ATIVO',
      });

      const response = await request(app).get(`/api/empresas/${empresaExemploId}/plano-contas`);
      expect(response.status).toBe(200);
      expect(response.body.dados).toHaveLength(2);
      expect(response.body.dados[0].codigo).toBe('1');
      expect(response.body.dados[1].codigo).toBe('2');
    });

    it('deve inativar logicamente uma conta', async () => {
      const res = await request(app).post(`/api/empresas/${empresaExemploId}/plano-contas`).send({
        codigo: '1.1.01.005',
        nome: 'Conta Temporária',
        nivel: 4,
        tipo: 'ANALITICA',
        natureza: 'DEVEDORA',
        classificacao: 'ATIVO',
      });

      const contaId = res.body.dados.id;

      const deleteRes = await request(app).delete(`/api/empresas/${empresaExemploId}/plano-contas/${contaId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.dados.ativo).toBe(false);

      // Tentar validar lançamento em conta inativa deve ser bloqueado
      const validacaoRes = await request(app)
        .post(`/api/empresas/${empresaExemploId}/plano-contas/${contaId}/validar-lancamento`);
      expect(validacaoRes.status).toBe(422);
      expect(validacaoRes.body.mensagem).toContain('está inativa e não pode receber lançamentos');
    });
  });
});
