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
-- Tabela: Modificações para Armas/Munições
-- ============================================
CREATE TABLE IF NOT EXISTS modificacoes (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  aplicacao TEXT,
  efeito TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices para melhor performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_characters_nome ON characters(nome);
CREATE INDEX IF NOT EXISTS idx_characters_jogador ON characters(jogador);
CREATE INDEX IF NOT EXISTS idx_armas_categoria ON armas(categoria);
CREATE INDEX IF NOT EXISTS idx_rituais_circulo ON rituais(circulo);
CREATE INDEX IF NOT EXISTS idx_habilidades_tipo ON habilidades(tipo);
CREATE INDEX IF NOT EXISTS idx_modificacoes_nome ON modificacoes(nome);
CREATE INDEX IF NOT EXISTS idx_modificacoes_tipo ON modificacoes(tipo);

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
-- Trigger para updated_at em characters e modificacoes
-- ============================================
DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
CREATE TRIGGER update_characters_updated_at 
  BEFORE UPDATE ON characters 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modificacoes_updated_at ON modificacoes;
CREATE TRIGGER update_modificacoes_updated_at 
  BEFORE UPDATE ON modificacoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) - Opcional
-- ============================================
-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes antes de recriar (evita erro se já existirem)
DROP POLICY IF EXISTS "Enable read access for all users" ON characters;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON characters;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON characters;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON characters;

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
-- Inserir dados iniciais (Modificações para Armas/Munições)
-- ============================================
INSERT INTO modificacoes (nome, tipo, aplicacao, efeito, descricao) VALUES
('Alongada', 'arma', 'Armas de fogo', '+2 em testes de ataque', 'Com um cano mais longo, que aumenta a precisão dos disparos, a arma fornece +2 em testes de ataque.'),
('Calibre Grosso', 'arma', 'Armas de fogo', 'Aumenta o dano em mais um dado do mesmo tipo', 'A arma é modificada para disparar munição de maior calibre, aumentando seu dano em mais um dado do mesmo tipo. Por exemplo, um revólver de calibre grosso causa 3d6 pontos de dano, enquanto um fuzil de precisão causa 3d10. Armas com esta modificação precisam usar munição específica de calibre grosso. Munição de calibre grosso possui o mesmo custo em categoria de munição normal, mas não pode ser usada em armas normais.'),
('Certeira', 'arma', 'Corpo a corpo e de disparo', '+2 em testes de ataque', 'Fabricada para ser mais precisa e balanceada, a arma fornece +2 em testes de ataque.'),
('Compensador', 'arma', 'Apenas para armas automáticas', 'Anula penalidade por rajadas', 'Apenas para armas automáticas. Um sistema de amortecimento reduz o coice da arma, anulando a penalidade em testes de ataque por disparar rajadas.'),
('Cruel', 'arma', 'Corpo a corpo e de disparo', '+2 em rolagens de dano', 'A arma possui lâmina especialmente afiada ou foi fabricada com materiais mais densos. Fornece um bônus de +2 em rolagens de dano.'),
('Discreta', 'arma', 'Corpo a corpo e de disparo', 'Reduz espaço em 1, +5 em testes de Crime para ocultar, permite teste destreinado', 'A arma possui modificações para ocupar menos espaço e chamar menos atenção. Se for uma arma de fogo, pode ser desmontável, se for um bastão pode ser retrátil, se for uma espada, pode ter a lâmina dobrável e assim por diante. Reduz o número de espaços ocupados em 1, fornece +5 em testes de Crime para ser ocultada e permite que você faça esse teste mesmo que não seja treinado na perícia.'),
('Dum Dum', 'municao', 'Balas curtas e longas', '+1 em multiplicador de crítico', 'Estas balas são feitas para se expandir durante o impacto, produzindo ferimentos terríveis. Esta modificação só pode ser aplicada em balas curtas e longas e aumenta o multiplicador de crítico em +1.'),
('Explosiva', 'municao', 'Balas curtas e longas', '+2d6 de dano', 'Estas munições possuem uma gota de mercúrio ou glicerina, que fazem a bala explodir ao atingir o alvo. Esta modificação só pode ser aplicada em balas curtas e longas e aumenta o dano causado em +2d6.'),
('Ferrolho Automático', 'arma', 'Armas de fogo', 'A arma se torna automática', 'O mecanismo de ação da arma é modificado para disparar várias vezes em sequência. A arma se torna automática (veja a página 59).'),
('Mira Laser', 'arma', 'Armas de fogo', '+2 em margem de ameaça', 'Um laser interno cria um reflexo vermelho num retículo luminoso, que é visto pelo atirador e ajuda-o a realizar disparos mais letais. Aumenta a margem de ameaça em +2.'),
('Mira Telescópica', 'arma', 'Armas de fogo', 'Aumenta alcance da arma e da habilidade Ataque Furtivo', 'A arma possui uma luneta com marcações de medidas, ideal para disparos precisos de longa distância. Aumenta o alcance da arma em uma categoria (de curto para médio, de médio para longo, de longo para extremo) e permite que a habilidade Ataque Furtivo seja usada em qualquer alcance.'),
('Perigosa', 'arma', 'Corpo a corpo e de disparo', '+2 em margem de ameaça', 'A arma possui lâmina afiada como uma navalha ou foi fabricada com materiais maciços. Seja como for, seus golpes possuem impacto terrível. Aumenta a margem de ameaça em +2.'),
('Silenciador', 'arma', 'Armas de fogo', 'Reduz em -10 a penalidade em Furtividade para se esconder após atacar', 'Um silenciador reduz em -10 a penalidade em Furtividade para se esconder no mesmo turno em que atacou com a arma de fogo.'),
('Tática', 'arma', 'Corpo a corpo e de disparo', 'Pode sacar como ação livre', 'A arma possui cabo texturizado, bandoleira e outros acessórios que facilitam seu manuseio. Você pode sacar a arma como uma ação livre.'),
('Visão de Calor', 'arma', 'Armas de fogo', 'Ignora camuflagem', 'A mira tem um sistema eletrônico que sobrepõe imagens visíveis e imagens em infravermelho, criando um contraste entre zonas frias e quentes. Ao disparar com a arma, você ignora qualquer camuflagem do alvo.')
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- PRONTO! Execute este script no Supabase SQL Editor
-- ============================================
