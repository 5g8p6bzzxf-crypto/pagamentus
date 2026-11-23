/**
 * Tipos e enumerações para o Plano de Contas (RF-006 / SPEC-2.1)
 */

// Tipo de conta contábil: Sintética (agrupadora) ou Analítica (escritural)
export type TipoConta = 'SINTETICA' | 'ANALITICA';

// Natureza do saldo da conta
export type NaturezaConta = 'DEVEDORA' | 'CREDORA';

// Classificação contábil da conta
export type ClassificacaoConta =
  | 'ATIVO'
  | 'PASSIVO'
  | 'PATRIMONIO_LIQUIDO'
  | 'RECEITA'
  | 'DESPESA'
  | 'OUTRAS';

// Interface que representa uma Conta Contábil no domínio
export interface IContaContabil {
  id: string;
  empresaId: string;
  codigo: string;
  nome: string;
  nivel: number;
  tipo: TipoConta;
  natureza: NaturezaConta;
  classificacao: ClassificacaoConta;
  ativo: boolean;
}

// DTO para criação de uma nova conta contábil
export interface CriarContaDTO {
  empresaId: string;
  codigo: string;
  nome: string;
  nivel: number;
  tipo: TipoConta;
  natureza: NaturezaConta;
  classificacao: ClassificacaoConta;
  ativo?: boolean;
}

// DTO para atualização de conta contábil
export interface AtualizarContaDTO {
  nome?: string;
  nivel?: number;
  tipo?: TipoConta;
  natureza?: NaturezaConta;
  classificacao?: ClassificacaoConta;
  ativo?: boolean;
}

// Entidade de domínio para Conta Contábil com métodos de regra de negócio
export class ContaContabil implements IContaContabil {
  public id: string;
  public empresaId: string;
  public codigo: string;
  public nome: string;
  public nivel: number;
  public tipo: TipoConta;
  public natureza: NaturezaConta;
  public classificacao: ClassificacaoConta;
  public ativo: boolean;

  constructor(dados: IContaContabil) {
    this.id = dados.id;
    this.empresaId = dados.empresaId;
    this.codigo = dados.codigo;
    this.nome = dados.nome;
    this.nivel = dados.nivel;
    this.tipo = dados.tipo;
    this.natureza = dados.natureza;
    this.classificacao = dados.classificacao;
    this.ativo = dados.ativo;
  }

  /**
   * Regra central da SPEC-2.1:
   * Apenas contas analíticas e ativas estão aptas a receber lançamentos contábeis.
   */
  public permiteLancamento(): boolean {
    return this.tipo === 'ANALITICA' && this.ativo;
  }
}
