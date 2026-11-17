import { Router } from 'express';
import { LancamentoContabilController } from '../controllers/LancamentoContabilController';

/**
 * Cria e configura as rotas de Lançamentos Contábeis
 */
export function criarLancamentoContabilRouter(controller: LancamentoContabilController): Router {
  const router = Router();

  // Registrar lançamento contábil (CA-1 a CA-5 da SPEC-2.2)
  router.post('/empresas/:empresaId/lancamentos', controller.criarLancamento);

  // Estornar lançamento contábil vinculado ao original (CA-2 e CA-4 da SPEC-2.3)
  router.post('/empresas/:empresaId/lancamentos/:id/estornar', controller.estornarLancamento);

  // Listar lançamentos contábeis da empresa
  router.get('/empresas/:empresaId/lancamentos', controller.listarPorEmpresa);

  // Buscar lançamento contábil por ID
  router.get('/empresas/:empresaId/lancamentos/:id', controller.buscarPorId);

  return router;
}
