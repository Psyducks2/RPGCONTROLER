import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// ============ ROTAS DE DADOS ESTÁTICOS ============

app.get('/api/origens', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('origens')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar origens' });
  }
});

app.get('/api/pericias', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pericias')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar perícias' });
  }
});

app.get('/api/armas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('armas')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar armas' });
  }
});

app.get('/api/municoes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('municoes')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar munições' });
  }
});

app.get('/api/protecoes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('protecoes')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar proteções' });
  }
});

app.get('/api/equipamentos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('equipamentos')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar equipamentos' });
  }
});

app.get('/api/rituais', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rituais')
      .select('*')
      .order('circulo', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar rituais' });
  }
});

app.get('/api/insanidade', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insanidade')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar efeitos de insanidade' });
  }
});

app.get('/api/dificuldades', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dificuldades')
      .select('*')
      .order('dt');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dificuldades' });
  }
});

app.get('/api/habilidades', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('habilidades')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar habilidades' });
  }
});

// ============ ROTAS DE PERSONAGENS ============

app.get('/api/characters', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data.map(convertCharacterFromDB));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar personagens' });
  }
});

app.get('/api/characters/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Personagem não encontrado' });
      }
      throw error;
    }
    
    res.json(convertCharacterFromDB(data));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar personagem' });
  }
});

// Helper para converter camelCase para snake_case
const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const convertCharacterToDB = (char) => {
  return {
    nome: char.nome,
    jogador: char.jogador,
    origem: char.origem,
    trilha: char.trilha,
    classe: char.classe,
    patente: char.patente,
    nex: char.nex,
    atributos: char.atributos,
    pericias: char.pericias,
    pericias_trainadas: char.periciasTrainadas || char.pericias_trainadas || [],
    descricao: char.descricao,
    historia: char.historia,
    idade: char.idade,
    aniversario: char.aniversario,
    local: char.local,
    peso: char.peso,
    deslocamento: char.deslocamento,
    defesa: char.defesa,
    poderes_origem: char.poderesOrigem || char.poderes_origem || [],
    habilidades_classe: char.habilidadesClasse || char.habilidades_classe || [],
    inventario: char.inventario,
    rituais_conhecidos: char.rituaisConhecidos || char.rituais_conhecidos || [],
    anotacoes: char.anotacoes,
    pv_max: char.pvMax || char.pv_max,
    pv_atual: char.pvAtual || char.pv_atual,
    san_max: char.sanMax || char.san_max,
    san_atual: char.sanAtual || char.san_atual,
    pe_max: char.peMax || char.pe_max,
    pe_atual: char.peAtual || char.pe_atual,
    prestigio: char.prestigio || char.prestigio || 0,
    espaco_usado: char.espacoUsado || char.espaco_usado || 0,
    espaco_total: char.espacoTotal || char.espaco_total || 10,
    conhecimento: char.conhecimento || char.conhecimento || 0
  };
};

const convertCharacterFromDB = (char) => {
  return {
    id: char.id,
    nome: char.nome,
    jogador: char.jogador,
    origem: char.origem,
    trilha: char.trilha,
    classe: char.classe,
    patente: char.patente,
    nex: char.nex,
    atributos: char.atributos,
    pericias: char.pericias,
    periciasTrainadas: char.pericias_trainadas || [],
    descricao: char.descricao,
    historia: char.historia,
    idade: char.idade,
    aniversario: char.aniversario,
    local: char.local,
    peso: char.peso,
    deslocamento: char.deslocamento,
    defesa: char.defesa,
    poderesOrigem: char.poderes_origem || [],
    habilidadesClasse: char.habilidades_classe || [],
    inventario: char.inventario,
    rituaisConhecidos: char.rituais_conhecidos || [],
    anotacoes: char.anotacoes,
    pvMax: char.pv_max,
    pvAtual: char.pv_atual,
    sanMax: char.san_max,
    sanAtual: char.san_atual,
    peMax: char.pe_max,
    peAtual: char.pe_atual,
    prestigio: char.prestigio || 0,
    espacoUsado: char.espaco_usado || 0,
    espacoTotal: char.espaco_total || 10,
    conhecimento: char.conhecimento || 0,
    createdAt: char.created_at,
    updatedAt: char.updated_at
  };
};

app.post('/api/characters', async (req, res) => {
  try {
    const dbChar = convertCharacterToDB(req.body);
    const { data, error} = await supabase
      .from('characters')
      .insert([dbChar])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(convertCharacterFromDB(data));
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    res.status(500).json({ error: 'Erro ao criar personagem' });
  }
});

app.put('/api/characters/:id', async (req, res) => {
  try {
    const dbChar = convertCharacterToDB(req.body);
    const { data, error } = await supabase
      .from('characters')
      .update(dbChar)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Personagem não encontrado' });
      }
      throw error;
    }
    
    res.json(convertCharacterFromDB(data));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar personagem' });
  }
});

app.delete('/api/characters/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Personagem deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar personagem' });
  }
});

// ============ AUTENTICAÇÃO DO MESTRE ============

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error || !admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    res.json({ 
      success: true, 
      token: admin.token,
      message: 'Login bem-sucedido' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
});

// ============ ROTAS ADMIN - CRUD DE HABILIDADES ============

app.post('/api/admin/habilidades', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('habilidades')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar habilidade' });
  }
});

app.put('/api/admin/habilidades/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('habilidades')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar habilidade' });
  }
});

app.delete('/api/admin/habilidades/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('habilidades')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Habilidade removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover habilidade' });
  }
});

// ============ ROTAS ADMIN - CRUD GENÉRICO ============

// Helper para CRUD de itens (sem autenticação)
const createItemRoutes = (tableName, itemName) => {
  app.post(`/api/admin/${tableName}`, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: `Erro ao adicionar ${itemName}` });
    }
  });

  app.put(`/api/admin/${tableName}/:id`, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: `Erro ao atualizar ${itemName}` });
    }
  });

  app.delete(`/api/admin/${tableName}/:id`, async (req, res) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', req.params.id);
      
      if (error) throw error;
      res.json({ message: `${itemName} removido com sucesso` });
    } catch (error) {
      res.status(500).json({ error: `Erro ao remover ${itemName}` });
    }
  });
};

// Criar rotas para cada tipo de item
createItemRoutes('armas', 'Arma');
createItemRoutes('rituais', 'Ritual');
createItemRoutes('equipamentos', 'Equipamento');
createItemRoutes('municoes', 'Munição');
createItemRoutes('protecoes', 'Proteção');

// ============ ROTA DE ROLAGEM DE DADOS ============

app.post('/api/roll', (req, res) => {
  const { quantity, sides, modifier = 0 } = req.body;
  
  if (!quantity || !sides) {
    return res.status(400).json({ error: 'Quantidade e lados são obrigatórios' });
  }
  
  const rolls = [];
  for (let i = 0; i < quantity; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  
  res.json({
    rolls,
    modifier,
    total,
    formula: `${quantity}d${sides}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`
  });
});

export default app;
