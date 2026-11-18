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

import { InMemoryAutenticacaoRepository } from './repositories/AutenticacaoRepository';
import { AutenticacaoService } from './services/AutenticacaoService';
import { AutenticacaoController } from './controllers/AutenticacaoController';
import { criarAutenticacaoRouter } from './routes/autenticacaoRoutes';

import { InMemoryIsolamentoClienteRepository } from './repositories/IsolamentoClienteRepository';
import { CriptografiaSegurancaService } from './services/CriptografiaSegurancaService';
import { IsolamentoClienteService } from './services/IsolamentoClienteService';
import { IsolamentoClienteController } from './controllers/IsolamentoClienteController';
import { criarIsolamentoClienteRouter } from './routes/isolamentoClienteRoutes';

/**
 * Factory para criar a aplicação Express configurada com os módulos contábeis e de plataforma
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
  authRepo: InMemoryAutenticacaoRepository;
  authService: AutenticacaoService;
  isolamentoRepo: InMemoryIsolamentoClienteRepository;
  criptoService: CriptografiaSegurancaService;
  isolamentoService: IsolamentoClienteService;
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

  // 5. Módulo Autenticação, Senhas, MFA, Perfis, Permissões e Sessões (SPEC-1.4)
  const authRepo = new InMemoryAutenticacaoRepository();
  const authService = new AutenticacaoService(authRepo);
  const authController = new AutenticacaoController(authService);

  // 6. Módulo Isolamento entre Clientes, Menor Privilégio e Criptografia/TLS (SPEC-1.5)
  const isolamentoRepo = new InMemoryIsolamentoClienteRepository();
  const criptoService = new CriptografiaSegurancaService();
  const isolamentoService = new IsolamentoClienteService(
    isolamentoRepo,
    authRepo,
    authService,
    criptoService
  );
  const isolamentoController = new IsolamentoClienteController(isolamentoService, criptoService);

  // Prefixo de rotas da API
  app.use('/api', criarPlanoContasRouter(planoContasController));
  app.use('/api', criarLancamentoContabilRouter(lancamentoController));
  app.use('/api', criarModeloLancamentoRouter(modeloController));
  app.use('/api', criarImportacaoLancamentosRouter(importacaoController));
  app.use('/api', criarAutenticacaoRouter(authController));
  app.use('/api', criarIsolamentoClienteRouter(isolamentoController, authController));

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
    authRepo,
    authService,
    isolamentoRepo,
    criptoService,
    isolamentoService,
  };
}

export const { app } = criarApp();
