import { Request, Response } from 'express';
import { ModeloLancamentoService } from '../services/ModeloLancamentoService';

/**
 * Controller responsável pelos endpoints de Modelos de Lançamento
 */
export class ModeloLancamentoController {
  constructor(private readonly modeloService: ModeloLancamentoService) {}

  criarModelo = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const { descricao, tipo, historicoPadrao, ativo, partidas } = req.body;

      const modelo = await this.modeloService.criarModelo({
        empresaId,
        descricao,
        tipo,
        historicoPadrao,
        ativo,
        partidas,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Modelo de lançamento criado com sucesso.',
        dados: modelo,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };

  gerarLancamento = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { dataLancamento, competencia, documentoOrigem, valorBase, historicoComplementar } = req.body;

      const lancamento = await this.modeloService.gerarLancamentoDeModelo(id, {
        dataLancamento,
        competencia,
        documentoOrigem,
        valorBase: valorBase !== undefined ? Number(valorBase) : undefined,
        historicoComplementar,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Lançamento gerado a partir do modelo com sucesso.',
        dados: lancamento,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };

  listarPorEmpresa = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const modelos = await this.modeloService.listarPorEmpresa(empresaId);
      res.status(200).json({
        sucesso: true,
        dados: modelos,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };
}
