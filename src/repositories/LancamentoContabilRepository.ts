import { LancamentoContabil } from '../models/LancamentoContabil';

/**
 * Interface do repositório para persistência de lançamentos contábeis
 */
export interface ILancamentoContabilRepository {
  criar(lancamento: LancamentoContabil): Promise<LancamentoContabil>;
  buscarPorId(id: string): Promise<LancamentoContabil | null>;
  listarPorEmpresa(empresaId: string): Promise<LancamentoContabil[]>;
  limpar(): Promise<void>;
}

/**
 * Repositório em memória para lançamentos contábeis
 */
export class InMemoryLancamentoContabilRepository implements ILancamentoContabilRepository {
  private lancamentos: Map<string, LancamentoContabil> = new Map();

  async criar(lancamento: LancamentoContabil): Promise<LancamentoContabil> {
    this.lancamentos.set(lancamento.id, lancamento);
    return lancamento;
  }

  async buscarPorId(id: string): Promise<LancamentoContabil | null> {
    const item = this.lancamentos.get(id);
    return item || null;
  }

  async listarPorEmpresa(empresaId: string): Promise<LancamentoContabil[]> {
    const lista: LancamentoContabil[] = [];
    for (const item of this.lancamentos.values()) {
      if (item.empresaId === empresaId) {
        lista.push(item);
      }
    }
    // Ordena decrescente por data e ID
    return lista.sort((a, b) => b.dataLancamento.localeCompare(a.dataLancamento));
  }

  async limpar(): Promise<void> {
    this.lancamentos.clear();
  }
}
