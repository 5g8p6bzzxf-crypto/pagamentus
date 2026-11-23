import {
  ErroImportacaoLinha,
  LoteImportacao,
  RelatorioPreValidacao,
} from '../models/LoteImportacao';
import { CriarLancamentoDTO, CriarPartidaDTO, TipoPartida } from '../models/LancamentoContabil';
import { ILoteImportacaoRepository } from '../repositories/LoteImportacaoRepository';
import { ILancamentoContabilRepository } from '../repositories/LancamentoContabilRepository';
import { LancamentoContabilService } from './LancamentoContabilService';
import { PlanoContasService } from './PlanoContasService';
import { IPeriodoContabilRepository } from '../repositories/PeriodoContabilRepository';

/**
 * Estrutura de uma linha de arquivo/planilha para importação
 * Formato esperado de cada linha (CSV ou JSON tabular):
 * documentoOrigem, dataLancamento, competencia, historico, codigoConta, tipoPartida, valor, centroCustoId
 */
export interface LinhaPlanilhaImportacao {
  documentoOrigem: string;
  dataLancamento: string;
  competencia: string;
  historico: string;
  codigoConta: string;
  tipoPartida: TipoPartida;
  valor: number;
  centroCustoId?: string;
}

/**
 * Serviço responsável por importação, pré-validação e desfazimento de lotes (RF-010 / SPEC-2.4)
 */
export class ImportacaoLancamentosService {
  constructor(
    private readonly loteRepo: ILoteImportacaoRepository,
    private readonly lancamentoRepo: ILancamentoContabilRepository,
    private readonly lancamentoService: LancamentoContabilService,
    private readonly planoContasService: PlanoContasService,
    private readonly periodoRepo: IPeriodoContabilRepository
  ) {}

  /**
   * Executa a pré-validação do conteúdo da planilha sem gravar no banco de dados (CA-1 e CA-2)
   */
  async preValidar(empresaId: string, linhas: LinhaPlanilhaImportacao[]): Promise<RelatorioPreValidacao> {
    const erros: ErroImportacaoLinha[] = [];

    if (!linhas || linhas.length === 0) {
      return {
        valido: false,
        totalLancamentos: 0,
        valorTotal: 0,
        erros: [{ linha: 0, erro: 'O arquivo/planilha está vazio.' }],
      };
    }

    // Busca todas as contas da empresa para validação rápida em memória
    const contasEmpresa = await this.planoContasService.listarPorEmpresa(empresaId);
    const contasPorCodigo = new Map(contasEmpresa.map((c) => [c.codigo, c]));

    // Agrupa as partidas pelo documentoOrigem para checar partidas dobradas por lançamento
    const lancamentosAgrupados = new Map<string, {
      cabecalho: {
        documentoOrigem: string;
        dataLancamento: string;
        competencia: string;
        historico: string;
      };
      linhasIndice: number[];
      partidas: CriarPartidaDTO[];
    }>();

    for (let i = 0; i < linhas.length; i++) {
      const numLinha = i + 1;
      const l = linhas[i];

      // 1. Validações de campos obrigatórios da linha
      if (!l.documentoOrigem || !l.dataLancamento || !l.competencia || !l.codigoConta || !l.tipoPartida) {
        erros.push({
          linha: numLinha,
          documentoOrigem: l.documentoOrigem,
          erro: 'Campos obrigatórios ausentes na linha (documentoOrigem, dataLancamento, competencia, codigoConta, tipoPartida).',
        });
        continue;
      }

      // 2. Validação de período aberto
      const statusPeriodo = await this.periodoRepo.obterStatus(empresaId, l.competencia);
      if (statusPeriodo === 'ENCERRADO') {
        erros.push({
          linha: numLinha,
          documentoOrigem: l.documentoOrigem,
          campo: 'competencia',
          erro: `O período contábil ${l.competencia} está encerrado.`,
        });
      }

      // 3. Validação de valor positivo (CA-5 / RF-008)
      if (l.valor === undefined || l.valor === null || l.valor <= 0) {
        erros.push({
          linha: numLinha,
          documentoOrigem: l.documentoOrigem,
          campo: 'valor',
          erro: 'O valor da partida deve ser positivo maior que zero.',
        });
      }

      // 4. Validação da conta (existência, analítica e ativa - SPEC-2.1)
      const conta = contasPorCodigo.get(l.codigoConta.trim());
      if (!conta) {
        erros.push({
          linha: numLinha,
          documentoOrigem: l.documentoOrigem,
          campo: 'codigoConta',
          erro: `Conta contábil com código "${l.codigoConta}" não foi encontrada nesta empresa.`,
        });
      } else {
        if (!conta.ativo) {
          erros.push({
            linha: numLinha,
            documentoOrigem: l.documentoOrigem,
            campo: 'codigoConta',
            erro: `A conta "${conta.codigo} - ${conta.nome}" está inativa.`,
          });
        }
        if (!conta.permiteLancamento()) {
          erros.push({
            linha: numLinha,
            documentoOrigem: l.documentoOrigem,
            campo: 'codigoConta',
            erro: `A conta "${conta.codigo} - ${conta.nome}" é sintética. Apenas contas analíticas recebem lançamentos.`,
          });
        }
      }

      // Agrupamento por documento de origem
      if (!lancamentosAgrupados.has(l.documentoOrigem)) {
        lancamentosAgrupados.set(l.documentoOrigem, {
          cabecalho: {
            documentoOrigem: l.documentoOrigem,
            dataLancamento: l.dataLancamento,
            competencia: l.competencia,
            historico: l.historico || `Importação lote doc ${l.documentoOrigem}`,
          },
          linhasIndice: [numLinha],
          partidas: [],
        });
      } else {
        lancamentosAgrupados.get(l.documentoOrigem)!.linhasIndice.push(numLinha);
      }

      if (conta) {
        lancamentosAgrupados.get(l.documentoOrigem)!.partidas.push({
          contaId: conta.id,
          tipo: l.tipoPartida,
          valor: Number(l.valor) || 0,
          centroCustoId: l.centroCustoId,
        });
      }
    }

    // 5. Validação de Partidas Dobradas para cada lançamento agrupado (RB-001)
    const lancamentosValidados: CriarLancamentoDTO[] = [];
    let valorTotalLote = 0;

    for (const [doc, grupo] of lancamentosAgrupados.entries()) {
      if (grupo.partidas.length < 2) {
        erros.push({
          linha: grupo.linhasIndice[0],
          documentoOrigem: doc,
          erro: `O lançamento ${doc} possui menos de 2 partidas válidas para compor partidas dobradas.`,
        });
        continue;
      }

      let deb = 0;
      let cred = 0;
      for (const p of grupo.partidas) {
        if (p.tipo === 'DEBITO') deb += p.valor;
        if (p.tipo === 'CREDITO') cred += p.valor;
      }

      const diff = Math.abs(Number((deb - cred).toFixed(2)));
      if (diff > 0.0001) {
        erros.push({
          linha: grupo.linhasIndice[0],
          documentoOrigem: doc,
          erro: `Lançamento ${doc} desbalanceado: soma de débitos (R$ ${deb.toFixed(2)}) diferente de créditos (R$ ${cred.toFixed(2)}). Diferença: R$ ${diff.toFixed(2)}.`,
        });
      } else {
        valorTotalLote += deb;
        lancamentosValidados.push({
          empresaId,
          dataLancamento: grupo.cabecalho.dataLancamento,
          competencia: grupo.cabecalho.competencia,
          historico: grupo.cabecalho.historico,
          documentoOrigem: grupo.cabecalho.documentoOrigem,
          tipoLancamento: 'IMPORTADO',
          partidas: grupo.partidas,
        });
      }
    }

    const valido = erros.length === 0;

    return {
      valido,
      totalLancamentos: valido ? lancamentosValidados.length : 0,
      valorTotal: valido ? Number(valorTotalLote.toFixed(2)) : 0,
      erros,
      lancamentosValidados: valido ? lancamentosValidados : undefined,
    };
  }

  /**
   * Confirma e persiste o lote de importação com identificador loteId (CA-3)
   */
  async confirmarImportacao(
    empresaId: string,
    nomeArquivo: string,
    linhas: LinhaPlanilhaImportacao[]
  ): Promise<{ lote: LoteImportacao; totalLancamentos: number }> {
    // Executa pré-validação estrita antes de gravar
    const preValidacao = await this.preValidar(empresaId, linhas);

    if (!preValidacao.valido || !preValidacao.lancamentosValidados) {
      throw new Error(
        `O arquivo contém ${preValidacao.erros.length} inconsistência(s) e não pode ser importado. Consulte o relatório de erros.`
      );
    }

    const loteId = `lote_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Persiste cada lançamento associando o loteId
    for (const lancamentoDto of preValidacao.lancamentosValidados) {
      await this.lancamentoService.criarLancamento({
        ...lancamentoDto,
        loteId,
      });
    }

    // Registra o cabeçalho do lote
    const lote = new LoteImportacao({
      id: loteId,
      empresaId,
      nomeArquivo,
      dataImportacao: new Date().toISOString(),
      quantidadeLancamentos: preValidacao.totalLancamentos,
      valorTotal: preValidacao.valorTotal,
      status: 'PROCESSADO',
    });

    await this.loteRepo.criar(lote);

    return { lote, totalLancamentos: preValidacao.totalLancamentos };
  }

  /**
   * Desfaz integralmente um lote de importação, removendo todos os lançamentos vinculados (CA-4)
   */
  async desfazerLote(empresaId: string, loteId: string): Promise<{ lote: LoteImportacao; lancamentosRemovidos: number }> {
    const lote = await this.loteRepo.buscarPorId(loteId);

    if (!lote || lote.empresaId !== empresaId) {
      throw new Error(`Lote de importação "${loteId}" não encontrado para esta empresa.`);
    }

    if (lote.status === 'DESFEITO') {
      throw new Error(`O lote "${loteId}" já foi desfeito anteriormente.`);
    }

    // Remove todos os lançamentos atrelados ao loteId
    const removidos = await this.lancamentoRepo.removerPorLoteId(loteId);

    // Atualiza status do lote
    lote.status = 'DESFEITO';
    await this.loteRepo.atualizar(lote);

    return { lote, lancamentosRemovidos: removidos };
  }

  async listarLotesPorEmpresa(empresaId: string): Promise<LoteImportacao[]> {
    return await this.loteRepo.listarPorEmpresa(empresaId);
  }
}
