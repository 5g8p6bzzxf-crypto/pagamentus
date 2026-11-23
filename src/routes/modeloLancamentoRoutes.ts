import { Router } from 'express';
import { ModeloLancamentoController } from '../controllers/ModeloLancamentoController';

export function criarModeloLancamentoRouter(controller: ModeloLancamentoController): Router {
  const router = Router();

  // Criar modelo de lançamento (CA-1 / CA-3)
  router.post('/empresas/:empresaId/modelos-lancamento', controller.criarModelo);

  // Listar modelos por empresa
  router.get('/empresas/:empresaId/modelos-lancamento', controller.listarPorEmpresa);

  // Gerar lançamento contábil a partir de modelo (CA-1 / CA-3)
  router.post('/empresas/:empresaId/modelos-lancamento/:id/gerar', controller.gerarLancamento);

  return router;
}
