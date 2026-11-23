import {
  CriarModeloLancamentoDTO,
  GerarLancamentoDeModeloDTO,
  ModeloLancamento,
  IModeloPartida,
} from '../models/ModeloLancamento';
import { IModeloLancamentoRepository } from '../repositories/ModeloLancamentoRepository';
import { LancamentoContabilService } from './LancamentoContabilService';
import { LancamentoContabil, CriarPartidaDTO } from '../models/LancamentoContabil';
import { PlanoContasService } from './PlanoContasService';

/**
 * Serviço responsável por Modelos de Lançamento (Recorrentes, Rateios, Provisões) - SPEC-2.3 (RF-009)
 */
export class ModeloLancamentoService {
  constructor(
    private readonly modeloRepo: IModeloLancamentoRepository,
    private readonly lancamentoService: LancamentoContabilService,
    private readonly planoContasService: PlanoContasService
  ) {}

  /**
   * Cadastra um novo modelo de lançamento pré-configurado
   */
  async criarModelo(dto: CriarModeloLancamentoDTO): Promise<ModeloLancamento> {
    if (!dto.empresaId || !dto.descricao || !dto.tipo || !dto.historicoPadrao) {
      throw new Error('Campos obrigatórios ausentes: empresaId, descricao, tipo e historicoPadrao.');
    }

    if (!dto.partidas || dto.partidas.length < 2) {
      throw new Error('O modelo deve conter ao menos duas partidas.');
    }

    // Validação das contas informadas no modelo
    for (const partida of dto.partidas) {
      await this.planoContasService.validarContaParaLancamento(partida.contaId);
    }

    const id = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const partidasFormatadas: IModeloPartida[] = dto.partidas.map((p) => ({
      id: `mod_partida_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      contaId: p.contaId,
      tipo: p.tipo,
      percentual: p.percentual,
      valorFixo: p.valorFixo,
      centroCustoId: p.centroCustoId,
    }));

    const novoModelo = new ModeloLancamento({
      id,
      empresaId: dto.empresaId,
      descricao: dto.descricao.trim(),
      tipo: dto.tipo,
      historicoPadrao: dto.historicoPadrao.trim(),
      ativo: dto.ativo !== undefined ? dto.ativo : true,
      partidas: partidasFormatadas,
    });

    return await this.modeloRepo.criar(novoModelo);
  }

  /**
   * Gera um lançamento contábil efetivo a partir de um modelo recorrente ou rateio (CA-1 e CA-3)
   */
  async gerarLancamentoDeModelo(
    modeloId: string,
    dto: GerarLancamentoDeModeloDTO
  ): Promise<LancamentoContabil> {
    const modelo = await this.modeloRepo.buscarPorId(modeloId);
    if (!modelo) {
      throw new Error('Modelo de lançamento não encontrado.');
    }

    if (!modelo.ativo) {
      throw new Error('Não é possível gerar lançamentos de um modelo inativo.');
    }

    const partidasLancamento: CriarPartidaDTO[] = [];

    for (const p of modelo.partidas) {
      let valorFinal = 0;

      if (p.percentual !== undefined) {
        if (!dto.valorBase || dto.valorBase <= 0) {
          throw new Error('Para modelos configurados com percentual/rateio, é obrigatório informar um valorBase positivo.');
        }
        valorFinal = Number(((dto.valorBase * p.percentual) / 100).toFixed(2));
      } else if (p.valorFixo !== undefined) {
        valorFinal = p.valorFixo;
      } else {
        throw new Error('Cada partida do modelo deve conter percentual ou valorFixo definido.');
      }

      partidasLancamento.push({
        contaId: p.contaId,
        tipo: p.tipo,
        valor: valorFinal,
        centroCustoId: p.centroCustoId,
      });
    }

    const historico = dto.historicoComplementar
      ? `${modelo.historicoPadrao} - ${dto.historicoComplementar}`
      : modelo.historicoPadrao;

    return await this.lancamentoService.criarLancamento({
      empresaId: modelo.empresaId,
      dataLancamento: dto.dataLancamento,
      competencia: dto.competencia,
      historico,
      documentoOrigem: dto.documentoOrigem,
      tipoLancamento: 'RECORRENTE',
      partidas: partidasLancamento,
    });
  }

  async listarPorEmpresa(empresaId: string): Promise<ModeloLancamento[]> {
    return await this.modeloRepo.listarPorEmpresa(empresaId);
  }

  async buscarPorId(id: string): Promise<ModeloLancamento> {
    const modelo = await this.modeloRepo.buscarPorId(id);
    if (!modelo) {
      throw new Error('Modelo de lançamento não encontrado.');
    }
    return modelo;
  }
}
