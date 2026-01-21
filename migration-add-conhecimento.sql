-- ============================================
-- Migration: Adicionar coluna conhecimento
-- ============================================
-- Execute este script no Supabase SQL Editor para adicionar
-- a coluna conhecimento à tabela characters

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS conhecimento INTEGER DEFAULT 0;

-- Comentário na coluna
COMMENT ON COLUMN characters.conhecimento IS 'Nível de conhecimento do personagem';
