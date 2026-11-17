-- ==============================================================================
-- Migração Inicial: Esquema de Dados e Integridade (SPEC-1.3 / RNF-013)
-- Objetivo: Criar as tabelas estruturais mínimas com PK, FK, restrições UNIQUE e NOT NULL
-- ==============================================================================

-- 1. Tabela: organizacoes
-- Entidade base para multi-inquilino (RB-008 e ADR-001)
CREATE TABLE IF NOT EXISTS organizacoes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE, -- CNPJ ou identificador único da organização
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tabela: perfis
-- Perfis de acesso do sistema (ex.: Administrador, Contador, Cliente)
CREATE TABLE IF NOT EXISTS perfis (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Tabela: permissoes
-- Permissões granulares de acesso a funcionalidades
CREATE TABLE IF NOT EXISTS permissoes (
    id VARCHAR(36) PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE, -- Identificador da permissão (ex.: 'contabil:lancamento:criar')
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Tabela associativa: perfis_permissoes (Muitos para Muitos)
-- Integridade referencial com chaves estrangeiras e chave primária composta
CREATE TABLE IF NOT EXISTS perfis_permissoes (
    perfil_id VARCHAR(36) NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    permissao_id VARCHAR(36) NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
    atribuido_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (perfil_id, permissao_id)
);

-- 5. Tabela: usuarios
-- Usuários vinculados obrigatoriamente a uma organização e a um perfil
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    organizacao_id VARCHAR(36) NOT NULL REFERENCES organizacoes(id) ON DELETE RESTRICT,
    perfil_id VARCHAR(36) NOT NULL REFERENCES perfis(id) ON DELETE RESTRICT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Garante unicidade global de login/e-mail
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Tabela: empresas
-- Empresas/Estabelecimentos contábeis geridos dentro de uma organização
CREATE TABLE IF NOT EXISTS empresas (
    id VARCHAR(36) PRIMARY KEY,
    organizacao_id VARCHAR(36) NOT NULL REFERENCES organizacoes(id) ON DELETE RESTRICT,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- Impede o cadastro de empresas com o mesmo CNPJ na mesma organização
    CONSTRAINT uq_empresas_organizacao_cnpj UNIQUE (organizacao_id, cnpj)
);
