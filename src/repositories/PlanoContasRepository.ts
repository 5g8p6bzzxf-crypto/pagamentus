import { ContaContabil, IContaContabil } from '../models/ContaContabil';

/**
 * Interface do repositório para persistência de Plano de Contas
 */
export interface IPlanoContasRepository {
  criar(conta: ContaContabil): Promise<ContaContabil>;
  buscarPorId(id: string): Promise<ContaContabil | null>;
  buscarPorCodigo(empresaId: string, codigo: string): Promise<ContaContabil | null>;
  listarPorEmpresa(empresaId: string): Promise<ContaContabil[]>;
  atualizar(conta: ContaContabil): Promise<ContaContabil>;
  limpar(): Promise<void>; // Útil para ambientes de teste (RF-079)
}

/**
 * Repositório em memória para persistência desacoplada, ideal para testes
 * e ambiente de desenvolvimento rápido mantendo conformidade com as interfaces.
 */
export class InMemoryPlanoContasRepository implements IPlanoContasRepository {
  private contas: Map<string, ContaContabil> = new Map();

  async criar(conta: ContaContabil): Promise<ContaContabil> {
    this.contas.set(conta.id, conta);
    return conta;
  }

  async buscarPorId(id: string): Promise<ContaContabil | null> {
    const conta = this.contas.get(id);
    return conta || null;
  }

  async buscarPorCodigo(empresaId: string, codigo: string): Promise<ContaContabil | null> {
    for (const conta of this.contas.values()) {
      if (conta.empresaId === empresaId && conta.codigo === codigo) {
        return conta;
      }
    }
    return null;
  }

  async listarPorEmpresa(empresaId: string): Promise<ContaContabil[]> {
    const lista: ContaContabil[] = [];
    for (const conta of this.contas.values()) {
      if (conta.empresaId === empresaId) {
        lista.push(conta);
      }
    }
    // Ordena pelo código contábil estruturado
    return lista.sort((a, b) => a.codigo.localeCompare(b.codigo));
  }

  async atualizar(conta: ContaContabil): Promise<ContaContabil> {
    this.contas.set(conta.id, conta);
    return conta;
  }

  async limpar(): Promise<void> {
    this.contas.clear();
  }
}
