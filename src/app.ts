import express, { Express } from 'express';
import { InMemoryPlanoContasRepository } from './repositories/PlanoContasRepository';
import { PlanoContasService } from './services/PlanoContasService';
import { PlanoContasController } from './controllers/PlanoContasController';
import { criarPlanoContasRouter } from './routes/planoContasRoutes';

/**
 * Factory para criar a aplicação Express configurada
 */
export function criarApp(): {
  app: Express;
  repository: InMemoryPlanoContasRepository;
  service: PlanoContasService;
} {
  const app = express();

  // Middleware para parser de JSON
  app.use(express.json());

  // Injeção de dependências
  const repository = new InMemoryPlanoContasRepository();
  const service = new PlanoContasService(repository);
  const controller = new PlanoContasController(service);

  // Prefixo de rotas da API
  app.use('/api', criarPlanoContasRouter(controller));

  return { app, repository, service };
}

export const { app } = criarApp();
