import { Request, Response } from 'express';
import { LancamentoContabilService } from '../services/LancamentoContabilService';

/**
 * Controller responsável pelos endpoints de Lançamentos Contábeis
 */
export class LancamentoContabilController {
  constructor(private readonly lancamentoService: LancamentoContabilService) {}

  /**
   * POST /api/empresas/:empresaId/lancamentos
   * Criação de novo lançamento contábil manual
   */
  criarLancamento = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const { dataLancamento, competencia, historico, documentoOrigem, centroCustoId, partidas } = req.body;

      const lancamento = await this.lancamentoService.criarLancamento({
        empresaId,
        dataLancamento,
        competencia,
        historico,
        documentoOrigem,
        centroCustoId,
        partidas,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Lançamento contábil registrado com sucesso.',
        dados: lancamento,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };

  /**
   * GET /api/empresas/:empresaId/lancamentos
   * Lista lançamentos contábeis da empresa
   */
  listarPorEmpresa = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const lancamentos = await this.lancamentoService.listarPorEmpresa(empresaId);
      res.status(200).json({
        sucesso: true,
        dados: lancamentos,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };

  /**
   * GET /api/empresas/:empresaId/lancamentos/:id
   * Obtém detalhes de um lançamento por ID
   */
  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const lancamento = await this.lancamentoService.buscarPorId(id);
      res.status(200).json({
        sucesso: true,
        dados: lancamento,
      });
    } catch (error: any) {
      res.status(404).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };
}
