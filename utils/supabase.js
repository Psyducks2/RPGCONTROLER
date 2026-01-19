import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  SUPABASE_URL ou SUPABASE_ANON_KEY não configurados!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para verificar se há erro
export const handleSupabaseError = (error, customMessage = 'Erro no banco de dados') => {
  if (error) {
    console.error('Supabase Error:', error);
    throw new Error(customMessage);
  }
};
