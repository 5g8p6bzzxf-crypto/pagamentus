import { Router } from 'express';
import { PlanoContasController } from '../controllers/PlanoContasController';

/**
 * Cria e configura as rotas de Plano de Contas
 */
export function criarPlanoContasRouter(controller: PlanoContasController): Router {
  const router = Router();

  // Listar contas por empresa
  router.get('/empresas/:empresaId/plano-contas', controller.listarPorEmpresa);

  // Criar nova conta contábil (CA-1 e CA-4)
  router.post('/empresas/:empresaId/plano-contas', controller.criarConta);

  // Buscar conta por ID
  router.get('/empresas/:empresaId/plano-contas/:id', controller.buscarPorId);

  // Atualizar conta contábil
  router.put('/empresas/:empresaId/plano-contas/:id', controller.atualizarConta);

  // Inativar conta contábil
  router.delete('/empresas/:empresaId/plano-contas/:id', controller.inativarConta);

  // Validar conta contábil para lançamento (CA-2 e CA-3)
  router.post('/empresas/:empresaId/plano-contas/:id/validar-lancamento', controller.validarLancamento);

  return router;
}
