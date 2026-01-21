-- ============================================
-- RPG Ordem Paranormal - Supabase Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabela: Admin
-- ============================================
CREATE TABLE IF NOT EXISTS admin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabela: Characters (Personagens)
-- ============================================
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  jogador TEXT,
  origem JSONB NOT NULL,
  trilha TEXT NOT NULL,
  classe TEXT,
  patente TEXT DEFAULT 'Recruta',
  nex INTEGER DEFAULT 5,
  atributos JSONB NOT NULL,
  pericias JSONB DEFAULT '{}'::jsonb,
  pericias_trainadas TEXT[] DEFAULT ARRAY[]::TEXT[],
  descricao TEXT,
  historia TEXT,
  idade TEXT,
  aniversario TEXT,
  local TEXT,
  peso TEXT,
  deslocamento INTEGER DEFAULT 9,
  defesa INTEGER DEFAULT 10,
  poderes_origem TEXT[] DEFAULT ARRAY[]::TEXT[],
  habilidades_classe TEXT[] DEFAULT ARRAY[]::TEXT[],
  inventario JSONB DEFAULT '[]'::jsonb,
  rituais_conhecidos JSONB DEFAULT '[]'::jsonb,
  anotacoes TEXT,
  pv_max INTEGER NOT NULL,
  pv_atual INTEGER NOT NULL,
  san_max INTEGER NOT NULL,
  san_atual INTEGER NOT NULL,
  pe_max INTEGER NOT NULL,
  pe_atual INTEGER NOT NULL,
  prestigio INTEGER DEFAULT 0,
  espaco_usado INTEGER DEFAULT 0,
  espaco_total INTEGER DEFAULT 10,
  conhecimento INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabela: Origens
-- ============================================
CREATE TABLE IF NOT EXISTS origens (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  pericias TEXT[] NOT NULL,
  poderes TEXT[] NOT NULL,
  descricao TEXT
);

-- ============================================
-- Tabela: Perícias
-- ============================================
CREATE TABLE IF NOT EXISTS pericias (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  atributo TEXT NOT NULL,
  descricao TEXT
);

-- ============================================
-- Tabela: Armas
-- ============================================
CREATE TABLE IF NOT EXISTS armas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  dano TEXT NOT NULL,
  critico TEXT NOT NULL,
  alcance TEXT NOT NULL,
  espaco INTEGER NOT NULL,
  municao TEXT,
  descricao TEXT
);

-- ============================================
-- Tabela: Munições
-- ============================================
CREATE TABLE IF NOT EXISTS municoes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  espaco INTEGER NOT NULL,
  descricao TEXT
);

-- ============================================
-- Tabela: Proteções
-- ============================================
CREATE TABLE IF NOT EXISTS protecoes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  defesa INTEGER NOT NULL,
  espaco INTEGER NOT NULL,
  descricao TEXT
);

-- ============================================
-- Tabela: Equipamentos
-- ============================================
CREATE TABLE IF NOT EXISTS equipamentos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  espaco INTEGER NOT NULL,
  descricao TEXT
);

-- ============================================
-- Tabela: Rituais
-- ============================================
CREATE TABLE IF NOT EXISTS rituais (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  circulo INTEGER NOT NULL,
  elemento TEXT NOT NULL,
  execucao TEXT NOT NULL,
  alcance TEXT NOT NULL,
  alvo TEXT NOT NULL,
  duracao TEXT NOT NULL,
  resistencia TEXT,
  descricao TEXT NOT NULL
);

-- ============================================
-- Tabela: Habilidades
-- ============================================
CREATE TABLE IF NOT EXISTS habilidades (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nex INTEGER,
  custo TEXT,
  prerequisito TEXT,
  descricao TEXT NOT NULL,
  progressao TEXT
);

-- ============================================
-- Tabela: Efeitos de Insanidade
-- ============================================
CREATE TABLE IF NOT EXISTS insanidade (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL
);

-- ============================================
-- Tabela: Dificuldades
-- ============================================
CREATE TABLE IF NOT EXISTS dificuldades (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  dt INTEGER NOT NULL,
  descricao TEXT
);

-- ============================================
-- Índices para melhor performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_characters_nome ON characters(nome);
CREATE INDEX IF NOT EXISTS idx_characters_jogador ON characters(jogador);
CREATE INDEX IF NOT EXISTS idx_armas_categoria ON armas(categoria);
CREATE INDEX IF NOT EXISTS idx_rituais_circulo ON rituais(circulo);
CREATE INDEX IF NOT EXISTS idx_habilidades_tipo ON habilidades(tipo);

-- ============================================
-- Função para atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Trigger para updated_at em characters
-- ============================================
CREATE TRIGGER update_characters_updated_at 
  BEFORE UPDATE ON characters 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) - Opcional
-- ============================================
-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler characters
CREATE POLICY "Enable read access for all users" ON characters
  FOR SELECT USING (true);

-- Política: Apenas admin autenticado pode modificar
CREATE POLICY "Enable insert for authenticated users" ON characters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON characters
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON characters
  FOR DELETE USING (true);

-- ============================================
-- Inserir dados iniciais (Admin)
-- ============================================
INSERT INTO admin (username, password, token) 
VALUES ('mestre', 'ordem2024', 'mestre_token_secret_123')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- PRONTO! Execute este script no Supabase SQL Editor
-- ============================================
