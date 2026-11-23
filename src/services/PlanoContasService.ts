import { ContaContabil, CriarContaDTO, AtualizarContaDTO } from '../models/ContaContabil';
import { IPlanoContasRepository } from '../repositories/PlanoContasRepository';

/**
 * Serviço responsável pelas regras de negócio de Plano de Contas (SPEC-2.1)
 */
export class PlanoContasService {
  constructor(private readonly planoContasRepo: IPlanoContasRepository) {}

  /**
   * Cadastra uma nova conta contábil vinculada a uma empresa (Atende CA-1 e CA-4)
   */
  async criarConta(dto: CriarContaDTO): Promise<ContaContabil> {
    // 1. Validação de campos obrigatórios
    if (!dto.empresaId || !dto.codigo || !dto.nome || dto.nivel === undefined || !dto.tipo || !dto.natureza || !dto.classificacao) {
      throw new Error('Todos os campos obrigatórios devem ser preenchidos (empresaId, codigo, nome, nivel, tipo, natureza, classificacao).');
    }

    if (dto.nivel <= 0) {
      throw new Error('O nível da conta deve ser um número inteiro positivo maior que zero.');
    }

    // 2. Validação de duplicidade de código para a mesma empresa (CA-4)
    const contaExistente = await this.planoContasRepo.buscarPorCodigo(dto.empresaId, dto.codigo.trim());
    if (contaExistente) {
      throw new Error(`Já existe uma conta com o código "${dto.codigo}" cadastrada para esta empresa.`);
    }

    // 3. Criação da entidade
    const id = `conta_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const novaConta = new ContaContabil({
      id,
      empresaId: dto.empresaId,
      codigo: dto.codigo.trim(),
      nome: dto.nome.trim(),
      nivel: dto.nivel,
      tipo: dto.tipo,
      natureza: dto.natureza,
      classificacao: dto.classificacao,
      ativo: dto.ativo !== undefined ? dto.ativo : true,
    });

    return await this.planoContasRepo.criar(novaConta);
  }

  /**
   * Lista todas as contas de uma empresa ordenadas por código
   */
  async listarPorEmpresa(empresaId: string): Promise<ContaContabil[]> {
    if (!empresaId) {
      throw new Error('O identificador da empresa é obrigatório.');
    }
    return await this.planoContasRepo.listarPorEmpresa(empresaId);
  }

  /**
   * Busca conta contábil por ID
   */
  async buscarPorId(id: string): Promise<ContaContabil> {
    const conta = await this.planoContasRepo.buscarPorId(id);
    if (!conta) {
      throw new Error('Conta contábil não encontrada.');
    }
    return conta;
  }

  /**
   * Atualiza dados de uma conta contábil
   */
  async atualizarConta(id: string, dto: AtualizarContaDTO): Promise<ContaContabil> {
    const conta = await this.buscarPorId(id);

    if (dto.nome !== undefined) conta.nome = dto.nome.trim();
    if (dto.nivel !== undefined) {
      if (dto.nivel <= 0) throw new Error('O nível da conta deve ser maior que zero.');
      conta.nivel = dto.nivel;
    }
    if (dto.tipo !== undefined) conta.tipo = dto.tipo;
    if (dto.natureza !== undefined) conta.natureza = dto.natureza;
    if (dto.classificacao !== undefined) conta.classificacao = dto.classificacao;
    if (dto.ativo !== undefined) conta.ativo = dto.ativo;

    return await this.planoContasRepo.atualizar(conta);
  }

  /**
   * Inativação lógica da conta contábil
   */
  async inativarConta(id: string): Promise<ContaContabil> {
    const conta = await this.buscarPorId(id);
    conta.ativo = false;
    return await this.planoContasRepo.atualizar(conta);
  }

  /**
   * Valida se uma conta está apta a receber lançamentos contábeis (Atende CA-2 e CA-3)
   */
  async validarContaParaLancamento(contaId: string): Promise<{ valida: boolean; conta: ContaContabil }> {
    const conta = await this.buscarPorId(contaId);

    if (!conta.ativo) {
      throw new Error(`A conta contábil "${conta.codigo} - ${conta.nome}" está inativa e não pode receber lançamentos.`);
    }

    if (!conta.permiteLancamento()) {
      throw new Error(
        `A conta "${conta.codigo} - ${conta.nome}" é do tipo sintética. Apenas contas analíticas recebem lançamentos.`
      );
    }

    return { valida: true, conta };
  }
}
