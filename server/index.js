import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n⚠️  ATENÇÃO: SUPABASE_URL ou SUPABASE_ANON_KEY não configurados!');
  console.error('Por favor, crie um arquivo .env com as credenciais do Supabase.\n');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============ ROTAS DE DADOS ESTÁTICOS ============

// Origens
app.get('/api/origens', async (req, res) => {
  try {
    const origens = await readJSON('origens.json');
    res.json(origens);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar origens' });
  }
});

// Perícias
app.get('/api/pericias', async (req, res) => {
  try {
    const pericias = await readJSON('pericias.json');
    res.json(pericias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar perícias' });
  }
});

// Armas
app.get('/api/armas', async (req, res) => {
  try {
    const armas = await readJSON('armas.json');
    res.json(armas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar armas' });
  }
});

// Munições
app.get('/api/municoes', async (req, res) => {
  try {
    const municoes = await readJSON('municoes.json');
    res.json(municoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar munições' });
  }
});

// Proteções
app.get('/api/protecoes', async (req, res) => {
  try {
    const protecoes = await readJSON('protecoes.json');
    res.json(protecoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar proteções' });
  }
});

// Equipamentos
app.get('/api/equipamentos', async (req, res) => {
  try {
    const equipamentos = await readJSON('equipamentos.json');
    res.json(equipamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar equipamentos' });
  }
});

// Rituais
app.get('/api/rituais', async (req, res) => {
  try {
    const rituais = await readJSON('rituais.json');
    res.json(rituais);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar rituais' });
  }
});

// Efeitos de Insanidade
app.get('/api/insanidade', async (req, res) => {
  try {
    const insanidade = await readJSON('insanidade.json');
    res.json(insanidade);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar efeitos de insanidade' });
  }
});

// Dificuldades
app.get('/api/dificuldades', async (req, res) => {
  try {
    const dificuldades = await readJSON('dificuldades.json');
    res.json(dificuldades);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dificuldades' });
  }
});

// Habilidades
app.get('/api/habilidades', async (req, res) => {
  try {
    const habilidades = await readJSON('habilidades.json');
    res.json(habilidades);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar habilidades' });
  }
});

// ============ ROTAS DE PERSONAGENS ============

// Listar todos os personagens
app.get('/api/characters', async (req, res) => {
  try {
    const characters = await readJSON('characters.json');
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar personagens' });
  }
});

// Buscar personagem por ID
app.get('/api/characters/:id', async (req, res) => {
  try {
    const characters = await readJSON('characters.json');
    const character = characters.find(c => c.id === req.params.id);
    
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }
    
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar personagem' });
  }
});

// Criar novo personagem
app.post('/api/characters', async (req, res) => {
  try {
    const characters = await readJSON('characters.json');
    const newCharacter = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    characters.push(newCharacter);
    await writeJSON('characters.json', characters);
    
    res.status(201).json(newCharacter);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar personagem' });
  }
});

// Atualizar personagem
app.put('/api/characters/:id', async (req, res) => {
  try {
    const characters = await readJSON('characters.json');
    const index = characters.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }
    
    characters[index] = {
      ...characters[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSON('characters.json', characters);
    res.json(characters[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar personagem' });
  }
});

// Deletar personagem
app.delete('/api/characters/:id', async (req, res) => {
  try {
    const characters = await readJSON('characters.json');
    const filteredCharacters = characters.filter(c => c.id !== req.params.id);
    
    if (characters.length === filteredCharacters.length) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }
    
    await writeJSON('characters.json', filteredCharacters);
    res.json({ message: 'Personagem deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar personagem' });
  }
});

// ============ AUTENTICAÇÃO DO MESTRE ============

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await readJSON('admin.json');
    
    if (username === admin.username && password === admin.password) {
      res.json({ 
        success: true, 
        token: admin.token,
        message: 'Login bem-sucedido' 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
});

// Middleware de autenticação
const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  try {
    const admin = await readJSON('admin.json');
    if (token === admin.token) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso negado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro de autenticação' });
  }
};

// ============ ROTAS ADMIN - CRUD DE HABILIDADES ============

app.post('/api/admin/habilidades', authenticateAdmin, async (req, res) => {
  try {
    const habilidades = await readJSON('habilidades.json');
    habilidades.push(req.body);
    await writeJSON('habilidades.json', habilidades);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar habilidade' });
  }
});

app.put('/api/admin/habilidades/:index', authenticateAdmin, async (req, res) => {
  try {
    const habilidades = await readJSON('habilidades.json');
    const index = parseInt(req.params.index);
    habilidades[index] = req.body;
    await writeJSON('habilidades.json', habilidades);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar habilidade' });
  }
});

app.delete('/api/admin/habilidades/:index', authenticateAdmin, async (req, res) => {
  try {
    const habilidades = await readJSON('habilidades.json');
    const index = parseInt(req.params.index);
    habilidades.splice(index, 1);
    await writeJSON('habilidades.json', habilidades);
    res.json({ message: 'Habilidade removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover habilidade' });
  }
});

// ============ ROTAS ADMIN - CRUD DE ARMAS ============

app.post('/api/admin/armas', authenticateAdmin, async (req, res) => {
  try {
    const armas = await readJSON('armas.json');
    armas.push(req.body);
    await writeJSON('armas.json', armas);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar arma' });
  }
});

app.put('/api/admin/armas/:index', authenticateAdmin, async (req, res) => {
  try {
    const armas = await readJSON('armas.json');
    const index = parseInt(req.params.index);
    armas[index] = req.body;
    await writeJSON('armas.json', armas);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar arma' });
  }
});

app.delete('/api/admin/armas/:index', authenticateAdmin, async (req, res) => {
  try {
    const armas = await readJSON('armas.json');
    const index = parseInt(req.params.index);
    armas.splice(index, 1);
    await writeJSON('armas.json', armas);
    res.json({ message: 'Arma removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover arma' });
  }
});

// ============ ROTAS ADMIN - CRUD DE RITUAIS ============

app.post('/api/admin/rituais', authenticateAdmin, async (req, res) => {
  try {
    const rituais = await readJSON('rituais.json');
    rituais.push(req.body);
    await writeJSON('rituais.json', rituais);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar ritual' });
  }
});

app.put('/api/admin/rituais/:index', authenticateAdmin, async (req, res) => {
  try {
    const rituais = await readJSON('rituais.json');
    const index = parseInt(req.params.index);
    rituais[index] = req.body;
    await writeJSON('rituais.json', rituais);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar ritual' });
  }
});

app.delete('/api/admin/rituais/:index', authenticateAdmin, async (req, res) => {
  try {
    const rituais = await readJSON('rituais.json');
    const index = parseInt(req.params.index);
    rituais.splice(index, 1);
    await writeJSON('rituais.json', rituais);
    res.json({ message: 'Ritual removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover ritual' });
  }
});

// ============ ROTAS ADMIN - CRUD DE EQUIPAMENTOS ============

app.post('/api/admin/equipamentos', authenticateAdmin, async (req, res) => {
  try {
    const equipamentos = await readJSON('equipamentos.json');
    equipamentos.push(req.body);
    await writeJSON('equipamentos.json', equipamentos);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar equipamento' });
  }
});

app.put('/api/admin/equipamentos/:index', authenticateAdmin, async (req, res) => {
  try {
    const equipamentos = await readJSON('equipamentos.json');
    const index = parseInt(req.params.index);
    equipamentos[index] = req.body;
    await writeJSON('equipamentos.json', equipamentos);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar equipamento' });
  }
});

app.delete('/api/admin/equipamentos/:index', authenticateAdmin, async (req, res) => {
  try {
    const equipamentos = await readJSON('equipamentos.json');
    const index = parseInt(req.params.index);
    equipamentos.splice(index, 1);
    await writeJSON('equipamentos.json', equipamentos);
    res.json({ message: 'Equipamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover equipamento' });
  }
});

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🎲 Servidor RPG Ordem Paranormal rodando em http://localhost:${PORT}`);
});
