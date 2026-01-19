import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './CharacterCreate.css';

function CharacterCreate() {
  const navigate = useNavigate();
  const [origens, setOrigens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nome: '',
    jogador: '',
    origem: '',
    trilha: 'Especialista',
    classe: '',
    patente: 'Recruta',
    nex: 5,
    atributos: {
      FOR: 1,
      AGI: 1,
      INT: 1,
      PRE: 1,
      VIG: 1
    },
    pericias: {},
    periciasTrainadas: [],
    descricao: '',
    historia: '',
    idade: '',
    aniversario: '',
    local: '',
    peso: '',
    deslocamento: 9,
    defesa: 10,
    poderesOrigem: [],
    habilidadesClasse: [],
    inventario: [],
    rituaisConhecidos: [],
    anotacoes: ''
  });

  const [pontosDisponiveis, setPontosDisponiveis] = useState(5);
  const [pericias, setPericias] = useState([]);
  const [periciasSelecionadas, setPericiasSelecionadas] = useState([]);

  useEffect(() => {
    loadOrigens();
    loadPericias();
  }, []);

  useEffect(() => {
    calcularPericiasDisponiveis();
  }, [formData.trilha, formData.atributos.INT, formData.origem]);

  // Atualizar cálculos automáticos quando atributos ou trilha mudarem
  useEffect(() => {
    let pvMax, sanMax, peMax;
    
    if (formData.trilha === 'Combatente') {
      pvMax = 20 + formData.atributos.VIG;
      peMax = 2 + formData.atributos.PRE;
      sanMax = 12;
    } else if (formData.trilha === 'Ocultista') {
      pvMax = 12 + formData.atributos.VIG;
      peMax = 4 + formData.atributos.PRE;
      sanMax = 20;
    } else { // Especialista
      pvMax = 16 + formData.atributos.VIG;
      peMax = 3 + formData.atributos.PRE;
      sanMax = 16;
    }

    const defesa = 10 + formData.atributos.AGI;
    const deslocamento = 9 + formData.atributos.AGI;

    setFormData(prev => ({
      ...prev,
      defesa,
      deslocamento
    }));
  }, [formData.trilha, formData.atributos.VIG, formData.atributos.PRE, formData.atributos.AGI]);

  const loadOrigens = async () => {
    try {
      const response = await api.getOrigens();
      setOrigens(response.data);
    } catch (err) {
      console.error('Erro ao carregar origens:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPericias = async () => {
    try {
      const response = await api.getPericias();
      setPericias(response.data);
    } catch (err) {
      console.error('Erro ao carregar perícias:', err);
    }
  };

  const calcularPericiasDisponiveis = () => {
    const origemSelecionada = origens.find(o => o.id === formData.origem);
    let quantidade = 0;

    if (formData.trilha === 'Combatente') {
      // Combatente: Luta ou Pontaria (1) + Fortitude ou Reflexos (1) + 1 + INT
      quantidade = 1 + 1 + 1 + formData.atributos.INT;
    } else if (formData.trilha === 'Especialista') {
      // Especialista: 7 + INT
      quantidade = 7 + formData.atributos.INT;
    } else if (formData.trilha === 'Ocultista') {
      // Ocultista: Ocultismo e Vontade já incluídas automaticamente + 3 + INT
      quantidade = 3 + formData.atributos.INT;
    }

    // Adiciona perícias da origem (exceto as que já são obrigatórias)
    if (origemSelecionada?.pericias) {
      const periciasOrigem = origemSelecionada.pericias.filter(p => 
        p !== 'Duas a sua escolha de mestre' && 
        p !== 'Duas à escolha do mestre' &&
        !(formData.trilha === 'Ocultista' && (p === 'Ocultismo' || p === 'Vontade'))
      );
      quantidade += periciasOrigem.length;
    }

    return quantidade;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAtributoChange = (attr, value) => {
    const numValue = parseInt(value) || 1;
    const currentValue = formData.atributos[attr];
    const difference = numValue - currentValue;
    
    if (pontosDisponiveis - difference >= 0 && numValue >= 1 && numValue <= 5) {
      const novosAtributos = { ...formData.atributos, [attr]: numValue };
      setFormData({
        ...formData,
        atributos: novosAtributos
      });
      setPontosDisponiveis(pontosDisponiveis - difference);
    }
  };

  const togglePericia = (periciaNome) => {
    // Não permite desmarcar perícias obrigatórias do Ocultista
    if (formData.trilha === 'Ocultista' && (periciaNome === 'Ocultismo' || periciaNome === 'Vontade')) {
      return;
    }

    const origemSelecionada = origens.find(o => o.id === formData.origem);
    const isOrigem = origemSelecionada?.pericias?.includes(periciaNome);
    
    // Se for da origem, não precisa selecionar manualmente
    if (isOrigem && !periciasSelecionadas.includes(periciaNome)) {
      return;
    }
    
    const maxPericias = calcularPericiasDisponiveis();
    
    if (periciasSelecionadas.includes(periciaNome)) {
      setPericiasSelecionadas(periciasSelecionadas.filter(p => p !== periciaNome));
    } else {
      if (periciasSelecionadas.length < maxPericias) {
        setPericiasSelecionadas([...periciasSelecionadas, periciaNome]);
      } else {
        alert(`Você só pode escolher ${maxPericias} perícias!`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pontosDisponiveis > 0) {
      alert(`Você ainda tem ${pontosDisponiveis} pontos de atributo para distribuir!`);
      return;
    }

    const origemSelecionada = origens.find(o => o.id === formData.origem);

    // Cálculos automáticos por trilha
    let pvMax, sanMax, peMax;
    
    if (formData.trilha === 'Combatente') {
      pvMax = 20 + formData.atributos.VIG;
      peMax = 2 + formData.atributos.PRE;
      sanMax = 12;
    } else if (formData.trilha === 'Ocultista') {
      pvMax = 12 + formData.atributos.VIG;
      peMax = 4 + formData.atributos.PRE;
      sanMax = 20;
    } else { // Especialista
      pvMax = 16 + formData.atributos.VIG;
      peMax = 3 + formData.atributos.PRE;
      sanMax = 16;
    }

    const defesa = 10 + formData.atributos.AGI;
    const deslocamento = 9 + formData.atributos.AGI;

    // Preparar perícias com níveis de treinamento
    const periciasObj = {};
    
    // Adicionar perícias obrigatórias do Ocultista
    if (formData.trilha === 'Ocultista') {
      periciasObj['Ocultismo'] = 'treinado';
      periciasObj['Vontade'] = 'treinado';
    }
    
    // Adicionar perícias da origem (se não forem obrigatórias)
    if (origemSelecionada?.pericias) {
      origemSelecionada.pericias.forEach(periciaNome => {
        if (periciaNome !== 'Duas a sua escolha de mestre' && 
            periciaNome !== 'Duas à escolha do mestre' &&
            !(formData.trilha === 'Ocultista' && (periciaNome === 'Ocultismo' || periciaNome === 'Vontade'))) {
          periciasObj[periciaNome] = 'treinado';
        }
      });
    }
    
    // Adicionar perícias selecionadas
    periciasSelecionadas.forEach(periciaNome => {
      periciasObj[periciaNome] = 'treinado'; // Inicia como treinado
    });

    const character = {
      ...formData,
      origem: origemSelecionada,
      poderesOrigem: origemSelecionada?.poderes || [],
      pericias: periciasObj,
      periciasTrainadas: periciasSelecionadas,
      pvMax,
      pvAtual: pvMax,
      sanMax,
      sanAtual: sanMax,
      peMax,
      peAtual: peMax,
      defesa,
      deslocamento,
      prestigio: 0,
      espacoUsado: 0,
      espacoTotal: formData.patente === 'Recruta' ? 10 : formData.patente === 'Operador' ? 15 : 20
    };

    try {
      const response = await api.createCharacter(character);
      navigate(`/characters/${response.data.id}`);
    } catch (err) {
      alert('Erro ao criar personagem');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Carregando formulário</div>;
  }

  return (
    <div className="character-create">
      <h1>📝 Criar Novo Personagem</h1>

      <form onSubmit={handleSubmit} className="create-form">
        <div className="card">
          <h2>Informações Básicas</h2>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Nome do Personagem *</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Digite o nome do agente"
              />
            </div>

            <div className="form-group">
              <label>Nome do Jogador</label>
              <input
                type="text"
                value={formData.jogador}
                onChange={(e) => handleChange('jogador', e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="form-group">
              <label>Origem *</label>
              <select
                required
                value={formData.origem}
                onChange={(e) => handleChange('origem', e.target.value)}
              >
                <option value="">Selecione uma origem</option>
                {origens.map(origem => (
                  <option key={origem.id} value={origem.id}>
                    {origem.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Trilha *</label>
              <select
                value={formData.trilha}
                onChange={(e) => {
                  handleChange('trilha', e.target.value);
                  setPericiasSelecionadas([]);
                }}
              >
                <option value="Combatente">Combatente (20 PV + VIG, 2 PE + PRE, SAN 12)</option>
                <option value="Especialista">Especialista (16 PV + VIG, 3 PE + PRE, SAN 16)</option>
                <option value="Ocultista">Ocultista (12 PV + VIG, 4 PE + PRE, SAN 20)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Classe</label>
              <input
                type="text"
                value={formData.classe}
                onChange={(e) => handleChange('classe', e.target.value)}
                placeholder="Ex: Combatente, Especialista..."
              />
            </div>

            <div className="form-group">
              <label>Patente</label>
              <select
                value={formData.patente}
                onChange={(e) => handleChange('patente', e.target.value)}
              >
                <option value="Recruta">Recruta</option>
                <option value="Operador">Operador</option>
                <option value="Agente de Elite">Agente de Elite</option>
                <option value="Agente Especial">Agente Especial</option>
              </select>
            </div>

            <div className="form-group">
              <label>NEX Inicial</label>
              <input
                type="number"
                min="5"
                max="99"
                step="5"
                value={formData.nex}
                onChange={(e) => handleChange('nex', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-3">
            <div className="form-group">
              <label>Idade</label>
              <input
                type="text"
                value={formData.idade}
                onChange={(e) => handleChange('idade', e.target.value)}
                placeholder="Ex: 28"
              />
            </div>

            <div className="form-group">
              <label>Aniversário</label>
              <input
                type="text"
                value={formData.aniversario}
                onChange={(e) => handleChange('aniversario', e.target.value)}
                placeholder="Ex: 15/03"
              />
            </div>

            <div className="form-group">
              <label>Local de Origem</label>
              <input
                type="text"
                value={formData.local}
                onChange={(e) => handleChange('local', e.target.value)}
                placeholder="Ex: São Paulo, SP"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Atributos</h2>
          <div className="pontos-info">
            <span className="pontos-label">Pontos Disponíveis:</span>
            <span className={`pontos-valor ${pontosDisponiveis === 0 ? 'completo' : ''}`}>
              {pontosDisponiveis}
            </span>
          </div>
          <p className="info-text">Todos começam com 1. Distribua 5 pontos adicionais (máximo 5 por atributo)</p>
          
          <div className="calculo-automatico">
            <h3>📊 Cálculos Automáticos</h3>
            <div className="calculo-grid">
              <div className="calculo-item">
                <span className="calculo-label">PV Máximo:</span>
                <span className="calculo-valor">
                  {formData.trilha === 'Combatente' ? `20 + ${formData.atributos.VIG} = ${20 + formData.atributos.VIG}` :
                   formData.trilha === 'Ocultista' ? `12 + ${formData.atributos.VIG} = ${12 + formData.atributos.VIG}` :
                   `16 + ${formData.atributos.VIG} = ${16 + formData.atributos.VIG}`}
                </span>
              </div>
              <div className="calculo-item">
                <span className="calculo-label">PE Máximo:</span>
                <span className="calculo-valor">
                  {formData.trilha === 'Combatente' ? `2 + ${formData.atributos.PRE} = ${2 + formData.atributos.PRE}` :
                   formData.trilha === 'Ocultista' ? `4 + ${formData.atributos.PRE} = ${4 + formData.atributos.PRE}` :
                   `3 + ${formData.atributos.PRE} = ${3 + formData.atributos.PRE}`}
                </span>
              </div>
              <div className="calculo-item">
                <span className="calculo-label">SAN Máximo:</span>
                <span className="calculo-valor">
                  {formData.trilha === 'Combatente' ? '12' :
                   formData.trilha === 'Ocultista' ? '20' : '16'}
                </span>
              </div>
              <div className="calculo-item">
                <span className="calculo-label">Defesa:</span>
                <span className="calculo-valor">
                  10 + {formData.atributos.AGI} = {10 + formData.atributos.AGI}
                </span>
              </div>
              <div className="calculo-item">
                <span className="calculo-label">Deslocamento:</span>
                <span className="calculo-valor">
                  9 + {formData.atributos.AGI} = {9 + formData.atributos.AGI}m
                </span>
              </div>
            </div>
          </div>
          
          <div className="atributos-grid">
            {['FOR', 'AGI', 'INT', 'PRE', 'VIG'].map(attr => (
              <div key={attr} className="atributo-control">
                <label>{attr}</label>
                <div className="atributo-input-group">
                  <button
                    type="button"
                    onClick={() => handleAtributoChange(attr, formData.atributos[attr] - 1)}
                    disabled={formData.atributos[attr] === 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.atributos[attr]}
                    onChange={(e) => handleAtributoChange(attr, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleAtributoChange(attr, formData.atributos[attr] + 1)}
                    disabled={formData.atributos[attr] === 5 || pontosDisponiveis === 0}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="atributos-descricao">
            <ul>
              <li><strong>FOR</strong> - Força física e muscular</li>
              <li><strong>AGI</strong> - Agilidade e destreza</li>
              <li><strong>INT</strong> - Intelecto e raciocínio</li>
              <li><strong>PRE</strong> - Presença e carisma</li>
              <li><strong>VIG</strong> - Vigor e resistência</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h2>Perícias Treinadas</h2>
          <div className="pericias-info">
            <p className="info-text">
              Você pode escolher <strong>{calcularPericiasDisponiveis()}</strong> perícias para treinar.
              {formData.trilha === 'Combatente' && ' (Luta ou Pontaria + Fortitude ou Reflexos + 1 + INT)'}
              {formData.trilha === 'Especialista' && ' (7 + INT)'}
              {formData.trilha === 'Ocultista' && ' (Ocultismo e Vontade já incluídas + 3 + INT)'}
            </p>
            <p className="selected-count">
              Selecionadas: {periciasSelecionadas.length} / {calcularPericiasDisponiveis()}
            </p>
          </div>

          {formData.trilha === 'Combatente' && (
            <div className="pericias-obrigatorias">
              <h3>Perícias Obrigatórias (Combatente)</h3>
              <div className="pericias-grid">
                <div className="pericia-group">
                  <label>Escolha uma:</label>
                  <div className="pericia-options">
                    {['Luta', 'Pontaria'].map(per => (
                      <label key={per} className="pericia-checkbox">
                        <input
                          type="radio"
                          name="combatente-1"
                          checked={periciasSelecionadas.includes(per)}
                          onChange={() => {
                            const outras = periciasSelecionadas.filter(p => p !== 'Luta' && p !== 'Pontaria');
                            setPericiasSelecionadas([...outras, per]);
                          }}
                        />
                        {per}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pericia-group">
                  <label>Escolha uma:</label>
                  <div className="pericia-options">
                    {['Fortitude', 'Reflexos'].map(per => (
                      <label key={per} className="pericia-checkbox">
                        <input
                          type="radio"
                          name="combatente-2"
                          checked={periciasSelecionadas.includes(per)}
                          onChange={() => {
                            const outras = periciasSelecionadas.filter(p => p !== 'Fortitude' && p !== 'Reflexos');
                            setPericiasSelecionadas([...outras, per]);
                          }}
                        />
                        {per}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.trilha === 'Ocultista' && (
            <div className="pericias-obrigatorias">
              <p className="info-text">Ocultismo e Vontade já estão incluídas automaticamente e não precisam ser selecionadas.</p>
            </div>
          )}

          {formData.trilha === 'Ocultista' && (
            <div className="pericias-list">
              <div className="pericias-grid-full">
                {pericias.map(pericia => {
                  const isObrigatoria = pericia.nome === 'Ocultismo' || pericia.nome === 'Vontade';
                  const origemSelecionada = origens.find(o => o.id === formData.origem);
                  const isOrigem = origemSelecionada?.pericias?.includes(pericia.nome);
                  
                  if (isObrigatoria) {
                    return (
                      <label key={pericia.nome} className="pericia-item obrigatoria">
                        <input type="checkbox" checked disabled />
                        <span className="pericia-nome">{pericia.nome}</span>
                        <span className="pericia-attr">({pericia.atributo})</span>
                        <span className="pericia-badge obrigatoria-badge">Obrigatória</span>
                      </label>
                    );
                  }
                  
                  return (
                    <label 
                      key={pericia.nome} 
                      className={`pericia-item ${periciasSelecionadas.includes(pericia.nome) ? 'selected' : ''} ${isOrigem ? 'origem' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={periciasSelecionadas.includes(pericia.nome)}
                        onChange={() => togglePericia(pericia.nome)}
                      />
                      <span className="pericia-nome">{pericia.nome}</span>
                      <span className="pericia-attr">({pericia.atributo})</span>
                      {isOrigem && <span className="pericia-badge">Origem</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {formData.trilha !== 'Ocultista' && (
            <div className="pericias-list">
              <h3>Escolha suas perícias:</h3>
              <div className="pericias-grid-full">
                {pericias.map(pericia => {
                  const isSelected = periciasSelecionadas.includes(pericia.nome);
                  const origemSelecionada = origens.find(o => o.id === formData.origem);
                  const isOrigem = origemSelecionada?.pericias?.includes(pericia.nome);
                  
                  return (
                    <label 
                      key={pericia.nome} 
                      className={`pericia-item ${isSelected ? 'selected' : ''} ${isOrigem ? 'origem' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePericia(pericia.nome)}
                      />
                      <span className="pericia-nome">{pericia.nome}</span>
                      <span className="pericia-attr">({pericia.atributo})</span>
                      {isOrigem && <span className="pericia-badge">Origem</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Informações Detalhadas</h2>
          
          <div className="form-group">
            <label>Peso / Altura</label>
            <input
              type="text"
              value={formData.peso}
              onChange={(e) => handleChange('peso', e.target.value)}
              placeholder="Ex: 75kg / 1,75m"
            />
          </div>

          <div className="form-group">
            <label>Descrição Física</label>
            <textarea
              rows="3"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Aparência, traços marcantes, cabelo, olhos..."
            />
          </div>

          <div className="form-group">
            <label>História do Personagem</label>
            <textarea
              rows="5"
              value={formData.historia}
              onChange={(e) => handleChange('historia', e.target.value)}
              placeholder="Passado, motivações, como entrou na Ordem..."
            />
          </div>

          <div className="form-group">
            <label>Anotações / Objetivo</label>
            <textarea
              rows="3"
              value={formData.anotacoes}
              onChange={(e) => handleChange('anotacoes', e.target.value)}
              placeholder="Objetivos, medos, segredos..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/characters')}>
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={
              pontosDisponiveis > 0 || 
              (formData.trilha === 'Combatente' && (periciasSelecionadas.length < 2 || periciasSelecionadas.length !== calcularPericiasDisponiveis())) ||
              (formData.trilha === 'Especialista' && periciasSelecionadas.length !== calcularPericiasDisponiveis()) ||
              (formData.trilha === 'Ocultista' && periciasSelecionadas.length !== calcularPericiasDisponiveis())
            }
          >
            Criar Personagem
          </button>
        </div>
      </form>
    </div>
  );
}

export default CharacterCreate;
