import express, { Express } from 'express';
import { InMemoryPlanoContasRepository } from './repositories/PlanoContasRepository';
import { PlanoContasService } from './services/PlanoContasService';
import { PlanoContasController } from './controllers/PlanoContasController';
import { criarPlanoContasRouter } from './routes/planoContasRoutes';

import { InMemoryLancamentoContabilRepository } from './repositories/LancamentoContabilRepository';
import { InMemoryPeriodoContabilRepository } from './repositories/PeriodoContabilRepository';
import { LancamentoContabilService } from './services/LancamentoContabilService';
import { LancamentoContabilController } from './controllers/LancamentoContabilController';
import { criarLancamentoContabilRouter } from './routes/lancamentoContabilRoutes';

import { InMemoryModeloLancamentoRepository } from './repositories/ModeloLancamentoRepository';
import { ModeloLancamentoService } from './services/ModeloLancamentoService';
import { ModeloLancamentoController } from './controllers/ModeloLancamentoController';
import { criarModeloLancamentoRouter } from './routes/modeloLancamentoRoutes';

/**
 * Factory para criar a aplicação Express configurada com os módulos contábeis
 */
export function criarApp(): {
  app: Express;
  planoContasRepo: InMemoryPlanoContasRepository;
  planoContasService: PlanoContasService;
  lancamentoRepo: InMemoryLancamentoContabilRepository;
  periodoRepo: InMemoryPeriodoContabilRepository;
  lancamentoService: LancamentoContabilService;
  modeloRepo: InMemoryModeloLancamentoRepository;
  modeloService: ModeloLancamentoService;
} {
  const app = express();

  // Middleware para parser de JSON
  app.use(express.json());

  // 1. Módulo Plano de Contas (SPEC-2.1)
  const planoContasRepo = new InMemoryPlanoContasRepository();
  const planoContasService = new PlanoContasService(planoContasRepo);
  const planoContasController = new PlanoContasController(planoContasService);

  // 2. Módulo Lançamentos Contábeis (SPEC-2.2 / SPEC-2.3)
  const lancamentoRepo = new InMemoryLancamentoContabilRepository();
  const periodoRepo = new InMemoryPeriodoContabilRepository();
  const lancamentoService = new LancamentoContabilService(lancamentoRepo, periodoRepo, planoContasService);
  const lancamentoController = new LancamentoContabilController(lancamentoService);

  // 3. Módulo Modelos de Lançamento e Recorrentes (SPEC-2.3)
  const modeloRepo = new InMemoryModeloLancamentoRepository();
  const modeloService = new ModeloLancamentoService(modeloRepo, lancamentoService, planoContasService);
  const modeloController = new ModeloLancamentoController(modeloService);

  // Prefixo de rotas da API
  app.use('/api', criarPlanoContasRouter(planoContasController));
  app.use('/api', criarLancamentoContabilRouter(lancamentoController));
  app.use('/api', criarModeloLancamentoRouter(modeloController));

  return {
    app,
    planoContasRepo,
    planoContasService,
    lancamentoRepo,
    periodoRepo,
    lancamentoService,
    modeloRepo,
    modeloService,
  };
}

export const { app } = criarApp();
