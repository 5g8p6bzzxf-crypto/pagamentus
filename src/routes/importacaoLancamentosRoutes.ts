import { Router } from 'express';
import { ImportacaoLancamentosController } from '../controllers/ImportacaoLancamentosController';

export function criarImportacaoLancamentosRouter(controller: ImportacaoLancamentosController): Router {
  const router = Router();

  // Pré-validação com relatório de erros (CA-1 e CA-2)
  router.post('/empresas/:empresaId/importacoes/pre-validar', controller.preValidar);

  // Confirmação de gravação do lote (CA-3)
  router.post('/empresas/:empresaId/importacoes/confirmar', controller.confirmarImportacao);

  // Desfazer lote importado (CA-4)
  router.post('/empresas/:empresaId/importacoes/:loteId/desfazer', controller.desfazerLote);

  // Listar lotes de importação
  router.get('/empresas/:empresaId/importacoes', controller.listarLotes);

  return router;
}
