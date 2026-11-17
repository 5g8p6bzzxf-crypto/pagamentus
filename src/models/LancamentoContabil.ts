/**
 * Modelos de Domínio para Lançamentos Contábeis (RF-007, RF-008, RF-009, RB-001 / SPEC-2.2 / SPEC-2.3)
 */

export type TipoPartida = 'DEBITO' | 'CREDITO';
export type TipoLancamento = 'NORMAL' | 'ESTORNO' | 'RECORRENTE';

export interface IPartidaContabil {
  id: string;
  lancamentoId?: string;
  contaId: string;
  tipo: TipoPartida;
  valor: number;
  centroCustoId?: string;
}

export interface ILancamentoContabil {
  id: string;
  empresaId: string;
  dataLancamento: string; // Formato YYYY-MM-DD
  competencia: string;    // Formato YYYY-MM
  historico: string;
  documentoOrigem: string;
  centroCustoId?: string;
  valorTotal: number;
  tipoLancamento?: TipoLancamento;
  lancamentoOrigemId?: string; // Vínculo ao lançamento original no caso de estorno (RF-009 / CA-2)
  partidas: IPartidaContabil[];
}

export type StatusPeriodoContabil = 'ABERTO' | 'ENCERRADO';

export interface IPeriodoContabil {
  id: string;
  empresaId: string;
  competencia: string; // YYYY-MM
  status: StatusPeriodoContabil;
}

export interface CriarPartidaDTO {
  contaId: string;
  tipo: TipoPartida;
  valor: number;
  centroCustoId?: string;
}

export interface CriarLancamentoDTO {
  empresaId: string;
  dataLancamento: string;
  competencia: string;
  historico: string;
  documentoOrigem: string;
  centroCustoId?: string;
  tipoLancamento?: TipoLancamento;
  lancamentoOrigemId?: string;
  partidas: CriarPartidaDTO[];
}

export class LancamentoContabil implements ILancamentoContabil {
  public id: string;
  public empresaId: string;
  public dataLancamento: string;
  public competencia: string;
  public historico: string;
  public documentoOrigem: string;
  public centroCustoId?: string;
  public valorTotal: number;
  public tipoLancamento: TipoLancamento;
  public lancamentoOrigemId?: string;
  public partidas: IPartidaContabil[];

  constructor(dados: ILancamentoContabil) {
    this.id = dados.id;
    this.empresaId = dados.empresaId;
    this.dataLancamento = dados.dataLancamento;
    this.competencia = dados.competencia;
    this.historico = dados.historico;
    this.documentoOrigem = dados.documentoOrigem;
    this.centroCustoId = dados.centroCustoId;
    this.valorTotal = dados.valorTotal;
    this.tipoLancamento = dados.tipoLancamento || 'NORMAL';
    this.lancamentoOrigemId = dados.lancamentoOrigemId;
    this.partidas = dados.partidas;
  }
}
