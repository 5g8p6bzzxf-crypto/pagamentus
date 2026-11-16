import { Request, Response } from 'express';
import { PlanoContasService } from '../services/PlanoContasService';

/**
 * Controller responsável pelos endpoints de Plano de Contas
 */
export class PlanoContasController {
  constructor(private readonly planoContasService: PlanoContasService) {}

  /**
   * GET /api/empresas/:empresaId/plano-contas
   * Lista o plano de contas da empresa
   */
  listarPorEmpresa = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const contas = await this.planoContasService.listarPorEmpresa(empresaId);
      res.status(200).json({ sucesso: true, dados: contas });
    } catch (error: any) {
      res.status(400).json({ sucesso: false, mensagem: error.message });
    }
  };

  /**
   * POST /api/empresas/:empresaId/plano-contas
   * Cria uma nova conta contábil (Atende CA-1 e CA-4)
   */
  criarConta = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const { codigo, nome, nivel, tipo, natureza, classificacao, ativo } = req.body;

      const novaConta = await this.planoContasService.criarConta({
        empresaId,
        codigo,
        nome,
        nivel: Number(nivel),
        tipo,
        natureza,
        classificacao,
        ativo,
      });

      res.status(201).json({ sucesso: true, dados: novaConta });
    } catch (error: any) {
      res.status(400).json({ sucesso: false, mensagem: error.message });
    }
  };

  /**
   * GET /api/empresas/:empresaId/plano-contas/:id
   * Obtém detalhes de uma conta
   */
  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const conta = await this.planoContasService.buscarPorId(id);
      res.status(200).json({ sucesso: true, dados: conta });
    } catch (error: any) {
      res.status(404).json({ sucesso: false, mensagem: error.message });
    }
  };

  /**
   * PUT /api/empresas/:empresaId/plano-contas/:id
   * Atualiza conta contábil
   */
  atualizarConta = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const contaAtualizada = await this.planoContasService.atualizarConta(id, req.body);
      res.status(200).json({ sucesso: true, dados: contaAtualizada });
    } catch (error: any) {
      res.status(400).json({ sucesso: false, mensagem: error.message });
    }
  };

  /**
   * DELETE /api/empresas/:empresaId/plano-contas/:id
   * Inativação lógica da conta
   */
  inativarConta = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const contaInativada = await this.planoContasService.inativarConta(id);
      res.status(200).json({ sucesso: true, dados: contaInativada, mensagem: 'Conta inativada com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ sucesso: false, mensagem: error.message });
    }
  };

  /**
   * POST /api/empresas/:empresaId/plano-contas/:id/validar-lancamento
   * Endpoint de validação para lançamento contábil (Atende CA-2 e CA-3)
   */
  validarLancamento = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const resultado = await this.planoContasService.validarContaParaLancamento(id);
      res.status(200).json({
        sucesso: true,
        mensagem: 'Conta analítica válida para receber lançamento.',
        dados: resultado.conta,
      });
    } catch (error: any) {
      res.status(422).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };
}
