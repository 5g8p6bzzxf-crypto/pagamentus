import { ModeloLancamento } from '../models/ModeloLancamento';

/**
 * Interface do repositório para Modelos de Lançamento
 */
export interface IModeloLancamentoRepository {
  criar(modelo: ModeloLancamento): Promise<ModeloLancamento>;
  buscarPorId(id: string): Promise<ModeloLancamento | null>;
  listarPorEmpresa(empresaId: string): Promise<ModeloLancamento[]>;
  limpar(): Promise<void>;
}

/**
 * Implementação em memória de repositório de modelos
 */
export class InMemoryModeloLancamentoRepository implements IModeloLancamentoRepository {
  private modelos: Map<string, ModeloLancamento> = new Map();

  async criar(modelo: ModeloLancamento): Promise<ModeloLancamento> {
    this.modelos.set(modelo.id, modelo);
    return modelo;
  }

  async buscarPorId(id: string): Promise<ModeloLancamento | null> {
    const item = this.modelos.get(id);
    return item || null;
  }

  async listarPorEmpresa(empresaId: string): Promise<ModeloLancamento[]> {
    const lista: ModeloLancamento[] = [];
    for (const item of this.modelos.values()) {
      if (item.empresaId === empresaId) {
        lista.push(item);
      }
    }
    return lista;
  }

  async limpar(): Promise<void> {
    this.modelos.clear();
  }
}
