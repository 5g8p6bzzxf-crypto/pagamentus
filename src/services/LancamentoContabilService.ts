import { CriarLancamentoDTO, LancamentoContabil, IPartidaContabil } from '../models/LancamentoContabil';
import { ILancamentoContabilRepository } from '../repositories/LancamentoContabilRepository';
import { IPeriodoContabilRepository } from '../repositories/PeriodoContabilRepository';
import { PlanoContasService } from './PlanoContasService';

/**
 * Serviço responsável pelo registro e validação de Lançamentos Contábeis (SPEC-2.2)
 * Atende aos requisitos RF-007, RF-008 e RB-001.
 */
export class LancamentoContabilService {
  constructor(
    private readonly lancamentoRepo: ILancamentoContabilRepository,
    private readonly periodoRepo: IPeriodoContabilRepository,
    private readonly planoContasService: PlanoContasService
  ) {}

  /**
   * Registra um lançamento contábil manual com validações estritas de partidas dobradas
   */
  async criarLancamento(dto: CriarLancamentoDTO): Promise<LancamentoContabil> {
    // 1. Validação de campos obrigatórios do cabeçalho (RF-007)
    if (!dto.empresaId || !dto.dataLancamento || !dto.competencia || !dto.historico || !dto.documentoOrigem) {
      throw new Error('Campos obrigatórios ausentes: empresaId, dataLancamento, competencia, historico e documentoOrigem devem ser informados.');
    }

    if (!dto.partidas || dto.partidas.length < 2) {
      throw new Error('O lançamento contábil deve possuir ao menos duas partidas (uma a débito e uma a crédito).');
    }

    // 2. Validação de período contábil aberto (RF-008 / CA-3)
    const statusPeriodo = await this.periodoRepo.obterStatus(dto.empresaId, dto.competencia);
    if (statusPeriodo === 'ENCERRADO') {
      throw new Error(`O período contábil da competência ${dto.competencia} está encerrado. Lançamentos não são permitidos.`);
    }

    // 3. Validação das contas contábeis e dos valores individuais das partidas (RF-008 / CA-4 / CA-5)
    let totalDebitos = 0;
    let totalCreditos = 0;
    const partidasFormatadas: IPartidaContabil[] = [];

    for (const partida of dto.partidas) {
      // CA-5: Inconsistência de valores (valores <= 0)
      if (partida.valor === undefined || partida.valor === null || partida.valor <= 0) {
        throw new Error('Inconsistência de valores: todas as partidas devem possuir valor monetário positivo maior que zero.');
      }

      if (partida.tipo !== 'DEBITO' && partida.tipo !== 'CREDITO') {
        throw new Error(`Tipo de partida inválido: ${partida.tipo}. Utilize DEBITO ou CREDITO.`);
      }

      // CA-4: Validação de conta ativa e analítica (integrado à SPEC-2.1)
      try {
        await this.planoContasService.validarContaParaLancamento(partida.contaId);
      } catch (error: any) {
        throw new Error(`Validação de conta contábil falhou: ${error.message}`);
      }

      const partidaId = `partida_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      partidasFormatadas.push({
        id: partidaId,
        contaId: partida.contaId,
        tipo: partida.tipo,
        valor: Number(partida.valor.toFixed(2)),
      });

      if (partida.tipo === 'DEBITO') {
        totalDebitos += partida.valor;
      } else {
        totalCreditos += partida.valor;
      }
    }

    // 4. Validação de Partidas Dobradas - Balanço entre Débitos e Créditos (RB-001 / RF-008 / CA-2)
    const diferenca = Math.abs(Number((totalDebitos - totalCreditos).toFixed(2)));
    if (diferenca > 0.0001) {
      throw new Error(
        `Lançamento desbalanceado! A soma dos débitos (R$ ${totalDebitos.toFixed(2)}) é diferente da soma dos créditos (R$ ${totalCreditos.toFixed(2)}). Diferença: R$ ${diferenca.toFixed(2)}.`
      );
    }

    // 5. Persistência atômica do lançamento balanceado (CA-1)
    const lancamentoId = `lanc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const novoLancamento = new LancamentoContabil({
      id: lancamentoId,
      empresaId: dto.empresaId,
      dataLancamento: dto.dataLancamento,
      competencia: dto.competencia,
      historico: dto.historico.trim(),
      documentoOrigem: dto.documentoOrigem.trim(),
      centroCustoId: dto.centroCustoId,
      valorTotal: Number(totalDebitos.toFixed(2)),
      partidas: partidasFormatadas.map((p) => ({ ...p, lancamentoId })),
    });

    return await this.lancamentoRepo.criar(novoLancamento);
  }

  /**
   * Consulta os lançamentos contábeis de uma empresa
   */
  async listarPorEmpresa(empresaId: string): Promise<LancamentoContabil[]> {
    if (!empresaId) {
      throw new Error('O identificador da empresa é obrigatório.');
    }
    return await this.lancamentoRepo.listarPorEmpresa(empresaId);
  }

  /**
   * Busca um lançamento por ID
   */
  async buscarPorId(id: string): Promise<LancamentoContabil> {
    const lancamento = await this.lancamentoRepo.buscarPorId(id);
    if (!lancamento) {
      throw new Error('Lançamento contábil não encontrado.');
    }
    return lancamento;
  }
}
