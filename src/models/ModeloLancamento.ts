import { TipoPartida } from './LancamentoContabil';

/**
 * Modelos de Domínio para Modelos de Lançamento (RF-009 / SPEC-2.3)
 * Recorrentes, rateios, provisões e apropriações.
 */

export type TipoModeloLancamento = 'RECORRENTE' | 'RATEIO' | 'PROVISAO' | 'APROPRIACAO';

export interface IModeloPartida {
  id: string;
  contaId: string;
  tipo: TipoPartida;
  percentual?: number; // Ex: 60 para 60%
  valorFixo?: number;  // Ex: 1000.00
  centroCustoId?: string;
}

export interface IModeloLancamento {
  id: string;
  empresaId: string;
  descricao: string;
  tipo: TipoModeloLancamento;
  historicoPadrao: string;
  ativo: boolean;
  partidas: IModeloPartida[];
}

export interface CriarModeloPartidaDTO {
  contaId: string;
  tipo: TipoPartida;
  percentual?: number;
  valorFixo?: number;
  centroCustoId?: string;
}

export interface CriarModeloLancamentoDTO {
  empresaId: string;
  descricao: string;
  tipo: TipoModeloLancamento;
  historicoPadrao: string;
  ativo?: boolean;
  partidas: CriarModeloPartidaDTO[];
}

export interface GerarLancamentoDeModeloDTO {
  dataLancamento: string;
  competencia: string;
  documentoOrigem: string;
  valorBase?: number; // Necessário caso o modelo utilize percentual/rateio
  historicoComplementar?: string;
}

export class ModeloLancamento implements IModeloLancamento {
  public id: string;
  public empresaId: string;
  public descricao: string;
  public tipo: TipoModeloLancamento;
  public historicoPadrao: string;
  public ativo: boolean;
  public partidas: IModeloPartida[];

  constructor(dados: IModeloLancamento) {
    this.id = dados.id;
    this.empresaId = dados.empresaId;
    this.descricao = dados.descricao;
    this.tipo = dados.tipo;
    this.historicoPadrao = dados.historicoPadrao;
    this.ativo = dados.ativo !== undefined ? dados.ativo : true;
    this.partidas = dados.partidas;
  }
}
