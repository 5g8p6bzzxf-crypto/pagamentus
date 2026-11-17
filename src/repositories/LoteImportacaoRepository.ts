import { LoteImportacao } from '../models/LoteImportacao';

/**
 * Interface do repositório para Lotes de Importação
 */
export interface ILoteImportacaoRepository {
  criar(lote: LoteImportacao): Promise<LoteImportacao>;
  buscarPorId(id: string): Promise<LoteImportacao | null>;
  atualizar(lote: LoteImportacao): Promise<LoteImportacao>;
  listarPorEmpresa(empresaId: string): Promise<LoteImportacao[]>;
  limpar(): Promise<void>;
}

export class InMemoryLoteImportacaoRepository implements ILoteImportacaoRepository {
  private lotes: Map<string, LoteImportacao> = new Map();

  async criar(lote: LoteImportacao): Promise<LoteImportacao> {
    this.lotes.set(lote.id, lote);
    return lote;
  }

  async buscarPorId(id: string): Promise<LoteImportacao | null> {
    const item = this.lotes.get(id);
    return item || null;
  }

  async atualizar(lote: LoteImportacao): Promise<LoteImportacao> {
    this.lotes.set(lote.id, lote);
    return lote;
  }

  async listarPorEmpresa(empresaId: string): Promise<LoteImportacao[]> {
    const lista: LoteImportacao[] = [];
    for (const item of this.lotes.values()) {
      if (item.empresaId === empresaId) {
        lista.push(item);
      }
    }
    return lista;
  }

  async limpar(): Promise<void> {
    this.lotes.clear();
  }
}
