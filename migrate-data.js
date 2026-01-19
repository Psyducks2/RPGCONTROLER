/**
 * Script para migrar dados JSON para Supabase
 * Execute: node migrate-data.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_ANON_KEY devem estar configurados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const readJSON = async (filename) => {
  const filePath = path.join(__dirname, 'server', 'data', filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

async function migrateData() {
  console.log('🚀 Iniciando migração de dados para Supabase...\n');

  try {
    // Migrar Origens
    console.log('📋 Migrando origens...');
    const origens = await readJSON('origens.json');
    const { error: origensError } = await supabase
      .from('origens')
      .upsert(origens, { onConflict: 'id' });
    if (origensError) throw origensError;
    console.log(`✅ ${origens.length} origens migradas`);

    // Migrar Perícias
    console.log('📋 Migrando perícias...');
    const pericias = await readJSON('pericias.json');
    const { error: periciasError } = await supabase
      .from('pericias')
      .upsert(pericias, { onConflict: 'nome' });
    if (periciasError) throw periciasError;
    console.log(`✅ ${pericias.length} perícias migradas`);

    // Migrar Armas
    console.log('⚔️  Migrando armas...');
    const armas = await readJSON('armas.json');
    const { error: armasError } = await supabase
      .from('armas')
      .insert(armas);
    if (armasError && armasError.code !== '23505') throw armasError;
    console.log(`✅ ${armas.length} armas migradas`);

    // Migrar Munições
    console.log('🔫 Migrando munições...');
    const municoes = await readJSON('municoes.json');
    const { error: municoesError } = await supabase
      .from('municoes')
      .insert(municoes);
    if (municoesError && municoesError.code !== '23505') throw municoesError;
    console.log(`✅ ${municoes.length} munições migradas`);

    // Migrar Proteções
    console.log('🛡️  Migrando proteções...');
    const protecoes = await readJSON('protecoes.json');
    const { error: protecoesError } = await supabase
      .from('protecoes')
      .insert(protecoes);
    if (protecoesError && protecoesError.code !== '23505') throw protecoesError;
    console.log(`✅ ${protecoes.length} proteções migradas`);

    // Migrar Equipamentos
    console.log('🎒 Migrando equipamentos...');
    const equipamentos = await readJSON('equipamentos.json');
    const { error: equipamentosError } = await supabase
      .from('equipamentos')
      .insert(equipamentos);
    if (equipamentosError && equipamentosError.code !== '23505') throw equipamentosError;
    console.log(`✅ ${equipamentos.length} equipamentos migrados`);

    // Migrar Rituais
    console.log('🔮 Migrando rituais...');
    const rituais = await readJSON('rituais.json');
    const { error: rituaisError } = await supabase
      .from('rituais')
      .insert(rituais);
    if (rituaisError && rituaisError.code !== '23505') throw rituaisError;
    console.log(`✅ ${rituais.length} rituais migrados`);

    // Migrar Habilidades
    console.log('⭐ Migrando habilidades...');
    const habilidades = await readJSON('habilidades.json');
    const { error: habilidadesError } = await supabase
      .from('habilidades')
      .insert(habilidades);
    if (habilidadesError && habilidadesError.code !== '23505') throw habilidadesError;
    console.log(`✅ ${habilidades.length} habilidades migradas`);

    // Migrar Insanidade
    console.log('😱 Migrando efeitos de insanidade...');
    const insanidade = await readJSON('insanidade.json');
    const { error: insanidadeError } = await supabase
      .from('insanidade')
      .insert(insanidade);
    if (insanidadeError && insanidadeError.code !== '23505') throw insanidadeError;
    console.log(`✅ ${insanidade.length} efeitos de insanidade migrados`);

    // Migrar Dificuldades
    console.log('📊 Migrando dificuldades...');
    const dificuldades = await readJSON('dificuldades.json');
    const { error: dificuldadesError } = await supabase
      .from('dificuldades')
      .insert(dificuldades);
    if (dificuldadesError && dificuldadesError.code !== '23505') throw dificuldadesError;
    console.log(`✅ ${dificuldades.length} dificuldades migradas`);

    // Migrar Personagens (se houver)
    console.log('👥 Migrando personagens...');
    const characters = await readJSON('characters.json');
    if (characters.length > 0) {
      // Remover campo 'id' para deixar o Supabase gerar UUID
      const charactersWithoutId = characters.map(({ id, ...char }) => char);
      const { error: charactersError } = await supabase
        .from('characters')
        .insert(charactersWithoutId);
      if (charactersError) throw charactersError;
      console.log(`✅ ${characters.length} personagens migrados`);
    } else {
      console.log('⚠️  Nenhum personagem para migrar');
    }

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('✨ Todos os dados foram transferidos para o Supabase\n');

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

migrateData();
