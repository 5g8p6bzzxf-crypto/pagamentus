import { CriarLancamentoDTO } from './LancamentoContabil';

/**
 * Modelos de Domínio para Lote de Importação de Lançamentos (RF-010 / SPEC-2.4)
 */

export type StatusLoteImportacao = 'PROCESSADO' | 'DESFEITO';

export interface ILoteImportacao {
  id: string;
  empresaId: string;
  nomeArquivo: string;
  dataImportacao: string;
  quantidadeLancamentos: number;
  valorTotal: number;
  status: StatusLoteImportacao;
}

export interface ErroImportacaoLinha {
  linha: number;
  documentoOrigem?: string;
  campo?: string;
  erro: string;
}

export interface RelatorioPreValidacao {
  valido: boolean;
  totalLancamentos: number;
  valorTotal: number;
  erros: ErroImportacaoLinha[];
  lancamentosValidados?: CriarLancamentoDTO[];
}

export class LoteImportacao implements ILoteImportacao {
  public id: string;
  public empresaId: string;
  public nomeArquivo: string;
  public dataImportacao: string;
  public quantidadeLancamentos: number;
  public valorTotal: number;
  public status: StatusLoteImportacao;

  constructor(dados: ILoteImportacao) {
    this.id = dados.id;
    this.empresaId = dados.empresaId;
    this.nomeArquivo = dados.nomeArquivo;
    this.dataImportacao = dados.dataImportacao;
    this.quantidadeLancamentos = dados.quantidadeLancamentos;
    this.valorTotal = dados.valorTotal;
    this.status = dados.status;
  }
}
