import { IPeriodoContabil, StatusPeriodoContabil } from '../models/LancamentoContabil';

/**
 * Interface do repositório para controle de Períodos Contábeis (RF-008, RB-002)
 */
export interface IPeriodoContabilRepository {
  obterStatus(empresaId: string, competencia: string): Promise<StatusPeriodoContabil>;
  definirStatus(empresaId: string, competencia: string, status: StatusPeriodoContabil): Promise<void>;
  limpar(): Promise<void>;
}

/**
 * Implementação em memória de períodos contábeis
 */
export class InMemoryPeriodoContabilRepository implements IPeriodoContabilRepository {
  // Chave: `${empresaId}:${competencia}` -> Status
  private periodos: Map<string, StatusPeriodoContabil> = new Map();

  async obterStatus(empresaId: string, competencia: string): Promise<StatusPeriodoContabil> {
    const chave = `${empresaId}:${competencia}`;
    // Por padrão de negócio contábil, se não estiver expressamente encerrado, está ABERTO
    return this.periodos.get(chave) || 'ABERTO';
  }

  async definirStatus(empresaId: string, competencia: string, status: StatusPeriodoContabil): Promise<void> {
    const chave = `${empresaId}:${competencia}`;
    this.periodos.set(chave, status);
  }

  async limpar(): Promise<void> {
    this.periodos.clear();
  }
}
