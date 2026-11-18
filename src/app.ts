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

import { InMemoryPessoaEmpresaRepository } from './repositories/PessoaEmpresaRepository';
import { PessoaEmpresaService } from './services/PessoaEmpresaService';
import { PessoaEmpresaController } from './controllers/PessoaEmpresaController';
import { criarPessoaEmpresaRouter } from './routes/pessoaEmpresaRoutes';

import { InMemoryEstabelecimentoSocioResponsavelRepository } from './repositories/EstabelecimentoSocioResponsavelRepository';
import { EstabelecimentoSocioResponsavelService } from './services/EstabelecimentoSocioResponsavelService';
import { EstabelecimentoSocioResponsavelController } from './controllers/EstabelecimentoSocioResponsavelController';
import { criarEstabelecimentoSocioResponsavelRouter } from './routes/estabelecimentoSocioResponsavelRoutes';

import { InMemoryAnexoCadastralRepository } from './repositories/AnexoCadastralRepository';
import { AnexoCadastralService } from './services/AnexoCadastralService';
import { AnexoCadastralController } from './controllers/AnexoCadastralController';
import { criarAnexoCadastralRouter } from './routes/anexoCadastralRoutes';

import { InMemoryAuditoriaHistoricoRepository } from './repositories/AuditoriaHistoricoRepository';
import { AuditoriaHistoricoService } from './services/AuditoriaHistoricoService';
import { AuditoriaHistoricoController } from './controllers/AuditoriaHistoricoController';
import { criarAuditoriaHistoricoRouter } from './routes/auditoriaHistoricoRoutes';

import { InMemoryCredencialTokenIntegracaoRepository } from './repositories/CredencialTokenIntegracaoRepository';
import { CredencialTokenIntegracaoService } from './services/CredencialTokenIntegracaoService';
import { CredencialTokenIntegracaoController } from './controllers/CredencialTokenIntegracaoController';
import { criarCredencialTokenIntegracaoRouter } from './routes/credencialTokenIntegracaoRoutes';

import { InMemoryLgpdPrivacidadeRepository } from './repositories/LgpdPrivacidadeRepository';
import { LgpdPrivacidadeService } from './services/LgpdPrivacidadeService';
import { LgpdPrivacidadeController } from './controllers/LgpdPrivacidadeController';
import { criarLgpdPrivacidadeRouter } from './routes/lgpdPrivacidadeRoutes';

import { InMemoryBackupRecuperacaoRepository } from './repositories/BackupRecuperacaoRepository';
import { BackupRecuperacaoService } from './services/BackupRecuperacaoService';
import { BackupRecuperacaoController } from './controllers/BackupRecuperacaoController';
import { criarBackupRecuperacaoRouter } from './routes/backupRecuperacaoRoutes';

import { PeriodoContabilService } from './services/PeriodoContabilService';
import { PeriodoContabilController } from './controllers/PeriodoContabilController';
import { criarPeriodoContabilRouter } from './routes/periodoContabilRoutes';

import { InMemoryCentroCustoRepository } from './repositories/CentroCustoRepository';
import { CentroCustoComparativoService } from './services/CentroCustoComparativoService';
import { CentroCustoComparativoController } from './controllers/CentroCustoComparativoController';
import { criarCentroCustoComparativoRouter } from './routes/centroCustoComparativoRoutes';
import { RelatorioContabilService } from './services/RelatorioContabilService';
import { RelatorioContabilController } from './controllers/RelatorioContabilController';
import { criarRelatorioContabilRouter } from './routes/relatorioContabilRoutes';
import { DemonstracaoContabilService } from './services/DemonstracaoContabilService';
import { DemonstracaoContabilController } from './controllers/DemonstracaoContabilController';
import { criarDemonstracaoContabilRouter } from './routes/demonstracaoContabilRoutes';
import { InMemoryTituloFinanceiroRepository } from './repositories/TituloFinanceiroRepository';
import { TituloFinanceiroService } from './services/TituloFinanceiroService';
import { TituloFinanceiroController } from './controllers/TituloFinanceiroController';
import { criarTituloFinanceiroRouter } from './routes/tituloFinanceiroRoutes';

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
  pessoaEmpresaRepo: InMemoryPessoaEmpresaRepository;
  pessoaEmpresaService: PessoaEmpresaService;
  estabelecimentoSocioRepo: InMemoryEstabelecimentoSocioResponsavelRepository;
  estabelecimentoSocioService: EstabelecimentoSocioResponsavelService;
  anexoCadastralRepo: InMemoryAnexoCadastralRepository;
  anexoCadastralService: AnexoCadastralService;
  auditoriaRepo: InMemoryAuditoriaHistoricoRepository;
  auditoriaService: AuditoriaHistoricoService;
  credencialTokenRepo: InMemoryCredencialTokenIntegracaoRepository;
  credencialTokenService: CredencialTokenIntegracaoService;
  lgpdRepo: InMemoryLgpdPrivacidadeRepository;
  lgpdService: LgpdPrivacidadeService;
  backupRepo: InMemoryBackupRecuperacaoRepository;
  backupService: BackupRecuperacaoService;
  periodoContabilService: PeriodoContabilService;
  centroCustoRepo: InMemoryCentroCustoRepository;
  centroCustoService: CentroCustoComparativoService;
  relatorioContabilService: RelatorioContabilService;
  demonstracaoContabilService: DemonstracaoContabilService;
  tituloFinanceiroRepo: InMemoryTituloFinanceiroRepository;
  tituloFinanceiroService: TituloFinanceiroService;
} {
  const app = express();

  // Middleware para parser de JSON
  app.use(express.json());

  // 1. Módulo Plano de Contas (SPEC-2.1)
  const planoContasRepo = new InMemoryPlanoContasRepository();
  const planoContasService = new PlanoContasService(planoContasRepo);
  const planoContasController = new PlanoContasController(planoContasService);

  // 2. Módulo Lançamentos Contábeis (SPEC-2.2 / SPEC-2.3 / SPEC-2.6)
  const lancamentoRepo = new InMemoryLancamentoContabilRepository();
  const periodoRepo = new InMemoryPeriodoContabilRepository();
  const centroCustoRepo = new InMemoryCentroCustoRepository();
  const lancamentoService = new LancamentoContabilService(
    lancamentoRepo,
    periodoRepo,
    planoContasService,
    centroCustoRepo
  );
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

  // 7. Módulo Cadastro de Pessoas (PF), Empresas (PJ) e Dados Fiscais com Vigência (SPEC-1.6)
  const pessoaEmpresaRepo = new InMemoryPessoaEmpresaRepository();
  const pessoaEmpresaService = new PessoaEmpresaService(pessoaEmpresaRepo);
  const pessoaEmpresaController = new PessoaEmpresaController(pessoaEmpresaService);

  // 8. Módulo Estabelecimentos (Matriz e Filiais), Sócios e Responsáveis Técnicos (SPEC-1.7)
  const estabelecimentoSocioRepo = new InMemoryEstabelecimentoSocioResponsavelRepository();
  const estabelecimentoSocioService = new EstabelecimentoSocioResponsavelService(
    estabelecimentoSocioRepo
  );
  const estabelecimentoSocioController = new EstabelecimentoSocioResponsavelController(
    estabelecimentoSocioService
  );

  // 9. Módulo Anexos Cadastrais com Controle de Validade e Alertas (SPEC-1.8)
  const anexoCadastralRepo = new InMemoryAnexoCadastralRepository();
  const anexoCadastralService = new AnexoCadastralService(anexoCadastralRepo);
  const anexoCadastralController = new AnexoCadastralController(anexoCadastralService);

  // 10. Módulo Auditoria e Histórico Cadastral Imutável (SPEC-1.9)
  const auditoriaRepo = new InMemoryAuditoriaHistoricoRepository();
  const auditoriaService = new AuditoriaHistoricoService(auditoriaRepo);
  const auditoriaController = new AuditoriaHistoricoController(auditoriaService);

  // 11. Módulo Credenciais Protegidas e Tokens de Integração com Escopo Mínimo (SPEC-1.10)
  const credencialTokenRepo = new InMemoryCredencialTokenIntegracaoRepository();
  const credencialTokenService = new CredencialTokenIntegracaoService(
    credencialTokenRepo,
    criptoService
  );
  const credencialTokenController = new CredencialTokenIntegracaoController(
    credencialTokenService
  );

  // 12. Módulo Privacidade e LGPD (SPEC-1.11)
  const lgpdRepo = new InMemoryLgpdPrivacidadeRepository();
  const lgpdService = new LgpdPrivacidadeService(lgpdRepo);
  const lgpdController = new LgpdPrivacidadeController(lgpdService);

  // 13. Módulo Backup Criptografado, Restauração e Continuidade (SPEC-1.12)
  const backupRepo = new InMemoryBackupRecuperacaoRepository();
  const backupService = new BackupRecuperacaoService(backupRepo, criptoService);
  const backupController = new BackupRecuperacaoController(backupService);

  // 14. Módulo Períodos Contábeis (SPEC-2.5)
  const periodoContabilService = new PeriodoContabilService(
    periodoRepo,
    authService,
    auditoriaService
  );
  const periodoContabilController = new PeriodoContabilController(periodoContabilService);

  // 15. Módulo Centros de Custo, Dimensões Gerenciais e Comparativos (SPEC-2.6)
  const centroCustoService = new CentroCustoComparativoService(
    centroCustoRepo,
    lancamentoRepo
  );
  const centroCustoController = new CentroCustoComparativoController(centroCustoService);

  // 16. Módulo Balancete, Razão, Diário e Relatório Auxiliar (SPEC-2.7)
  const relatorioContabilService = new RelatorioContabilService(
    lancamentoRepo,
    planoContasRepo
  );
  const relatorioContabilController = new RelatorioContabilController(
    relatorioContabilService
  );

  // 17. Módulo Balanço, DRE, DFC e DMPL/DLPA (SPEC-2.8)
  const demonstracaoContabilService = new DemonstracaoContabilService(
    lancamentoRepo,
    planoContasRepo
  );
  const demonstracaoContabilController = new DemonstracaoContabilController(
    demonstracaoContabilService
  );

  // 18. Módulo Títulos a Pagar e a Receber e Vínculos (SPEC-2.9)
  const tituloFinanceiroRepo = new InMemoryTituloFinanceiroRepository();
  const tituloFinanceiroService = new TituloFinanceiroService(
    tituloFinanceiroRepo,
    lancamentoRepo
  );
  const tituloFinanceiroController = new TituloFinanceiroController(
    tituloFinanceiroService
  );

  // Prefixo de rotas da API
  app.use('/api', criarPlanoContasRouter(planoContasController));
  app.use('/api', criarLancamentoContabilRouter(lancamentoController));
  app.use('/api', criarModeloLancamentoRouter(modeloController));
  app.use('/api', criarImportacaoLancamentosRouter(importacaoController));
  app.use('/api', criarAutenticacaoRouter(authController));
  app.use('/api', criarIsolamentoClienteRouter(isolamentoController, authController));
  app.use('/api', criarPessoaEmpresaRouter(pessoaEmpresaController));
  app.use('/api', criarEstabelecimentoSocioResponsavelRouter(estabelecimentoSocioController));
  app.use('/api', criarAnexoCadastralRouter(anexoCadastralController));
  app.use('/api', criarAuditoriaHistoricoRouter(auditoriaController));
  app.use('/api', criarCredencialTokenIntegracaoRouter(credencialTokenController));
  app.use('/api', criarLgpdPrivacidadeRouter(lgpdController));
  app.use('/api', criarBackupRecuperacaoRouter(backupController));
  app.use('/api', criarPeriodoContabilRouter(periodoContabilController));
  app.use('/api', criarCentroCustoComparativoRouter(centroCustoController));
  app.use('/api', criarRelatorioContabilRouter(relatorioContabilController));
  app.use('/api', criarDemonstracaoContabilRouter(demonstracaoContabilController));
  app.use('/api', criarTituloFinanceiroRouter(tituloFinanceiroController));

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
    pessoaEmpresaRepo,
    pessoaEmpresaService,
    estabelecimentoSocioRepo,
    estabelecimentoSocioService,
    anexoCadastralRepo,
    anexoCadastralService,
    auditoriaRepo,
    auditoriaService,
    credencialTokenRepo,
    credencialTokenService,
    lgpdRepo,
    lgpdService,
    backupRepo,
    backupService,
    periodoContabilService,
    centroCustoRepo,
    centroCustoService,
    relatorioContabilService,
    demonstracaoContabilService,
    tituloFinanceiroRepo,
    tituloFinanceiroService,
  };
}

export const { app } = criarApp();
