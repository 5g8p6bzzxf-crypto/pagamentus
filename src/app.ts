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

import { InMemoryLoteImportacaoRepository } from './repositories/LoteImportacaoRepository';
import { ImportacaoLancamentosService } from './services/ImportacaoLancamentosService';
import { ImportacaoLancamentosController } from './controllers/ImportacaoLancamentosController';
import { criarImportacaoLancamentosRouter } from './routes/importacaoLancamentosRoutes';

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
  loteRepo: InMemoryLoteImportacaoRepository;
  importacaoService: ImportacaoLancamentosService;
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

  // 4. Módulo Importação de Lançamentos em Lote (SPEC-2.4)
  const loteRepo = new InMemoryLoteImportacaoRepository();
  const importacaoService = new ImportacaoLancamentosService(
    loteRepo,
    lancamentoRepo,
    lancamentoService,
    planoContasService,
    periodoRepo
  );
  const importacaoController = new ImportacaoLancamentosController(importacaoService);

  // Prefixo de rotas da API
  app.use('/api', criarPlanoContasRouter(planoContasController));
  app.use('/api', criarLancamentoContabilRouter(lancamentoController));
  app.use('/api', criarModeloLancamentoRouter(modeloController));
  app.use('/api', criarImportacaoLancamentosRouter(importacaoController));

  return {
    app,
    planoContasRepo,
    planoContasService,
    lancamentoRepo,
    periodoRepo,
    lancamentoService,
    modeloRepo,
    modeloService,
    loteRepo,
    importacaoService,
  };
}

export const { app } = criarApp();
