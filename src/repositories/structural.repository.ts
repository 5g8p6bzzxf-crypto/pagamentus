import { PoolClient } from 'pg';
import { IDatabaseClient } from '../database/connection';

/**
 * Interface para Organização
 */
export interface IOrganizacao {
  id: string;
  nome: string;
  documento: string;
  criado_em?: Date;
}

/**
 * Interface para Usuário
 */
export interface IUsuario {
  id: string;
  organizacao_id: string;
  perfil_id: string;
  nome: string;
  email: string;
  senha_hash: string;
  ativo?: boolean;
  criado_em?: Date;
}

/**
 * Repositório para operações de entidades estruturais
 * Suporta transações injetando PoolClient ou cliente comum
 */
export class StructuralRepository {
  /**
   * Insere uma nova organização
   */
  public static async criarOrganizacao(
    client: IDatabaseClient,
    org: IOrganizacao
  ): Promise<IOrganizacao> {
    const query = `
      INSERT INTO organizacoes (id, nome, documento)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await client.query(query, [org.id, org.nome, org.documento]);
    return result.rows[0];
  }

  /**
   * Insere um perfil
   */
  public static async criarPerfil(
    client: IDatabaseClient,
    perfil: { id: string; nome: string; descricao?: string }
  ): Promise<any> {
    const query = `
      INSERT INTO perfis (id, nome, descricao)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await client.query(query, [perfil.id, perfil.nome, perfil.descricao || null]);
    return result.rows[0];
  }

  /**
   * Insere um usuário vinculado a organização e perfil
   */
  public static async criarUsuario(
    client: IDatabaseClient,
    usuario: IUsuario
  ): Promise<IUsuario> {
    const query = `
      INSERT INTO usuarios (id, organizacao_id, perfil_id, nome, email, senha_hash, ativo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const result = await client.query(query, [
      usuario.id,
      usuario.organizacao_id,
      usuario.perfil_id,
      usuario.nome,
      usuario.email,
      usuario.senha_hash,
      usuario.ativo ?? true,
    ]);
    return result.rows[0];
  }

  /**
   * Busca usuário por ID
   */
  public static async buscarUsuarioPorId(
    client: IDatabaseClient,
    id: string
  ): Promise<IUsuario | null> {
    const query = 'SELECT * FROM usuarios WHERE id = $1;';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca organização por ID
   */
  public static async buscarOrganizacaoPorId(
    client: IDatabaseClient,
    id: string
  ): Promise<IOrganizacao | null> {
    const query = 'SELECT * FROM organizacoes WHERE id = $1;';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  }
}
