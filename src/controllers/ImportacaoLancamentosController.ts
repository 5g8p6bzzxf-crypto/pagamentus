import { Request, Response } from 'express';
import { ImportacaoLancamentosService } from '../services/ImportacaoLancamentosService';

/**
 * Controller responsável pelos endpoints de Importação de Lançamentos
 */
export class ImportacaoLancamentosController {
  constructor(private readonly importacaoService: ImportacaoLancamentosService) {}

  /**
   * POST /api/empresas/:empresaId/importacoes/pre-validar
   * Pré-valida as linhas da planilha e emite relatório de erros (CA-1 e CA-2)
   */
  preValidar = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const { linhas } = req.body;

      const relatorio = await this.importacaoService.preValidar(empresaId, linhas);

      if (relatorio.valido) {
        res.status(200).json({
          sucesso: true,
          mensagem: 'Planilha pré-validada com sucesso sem erros.',
          dados: relatorio,
        });
      } else {
        res.status(422).json({
          sucesso: false,
          mensagem: 'Inconsistências encontradas na pré-validação da planilha.',
          dados: relatorio,
        });
      }
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };

  /**
   * POST /api/empresas/:empresaId/importacoes/confirmar
   * Grava os lançamentos do lote validado (CA-3)
   */
  confirmarImportacao = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const { nomeArquivo, linhas } = req.body;

      const resultado = await this.importacaoService.confirmarImportacao(
        empresaId,
        nomeArquivo || 'importacao.csv',
        linhas
      );

      res.status(201).json({
        sucesso: true,
        mensagem: 'Lote de lançamentos importado com sucesso.',
        dados: resultado,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };

  /**
   * POST /api/empresas/:empresaId/importacoes/:loteId/desfazer
   * Desfaz todos os lançamentos do lote (CA-4)
   */
  desfazerLote = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const loteId = req.params.loteId as string;

      const resultado = await this.importacaoService.desfazerLote(empresaId, loteId);

      res.status(200).json({
        sucesso: true,
        mensagem: 'Lote de lançamentos desfeito com sucesso.',
        dados: resultado,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };

  /**
   * GET /api/empresas/:empresaId/importacoes
   * Lista os lotes de importação da empresa
   */
  listarLotes = async (req: Request, res: Response): Promise<void> => {
    try {
      const empresaId = req.params.empresaId as string;
      const lotes = await this.importacaoService.listarLotesPorEmpresa(empresaId);
      res.status(200).json({
        sucesso: true,
        dados: lotes,
      });
    } catch (error: any) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message,
      });
    }
  };
}
