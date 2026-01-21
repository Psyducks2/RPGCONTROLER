import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { rollAttribute, rollFormula } from '../utils/diceRoller';
import './CharacterSheet.css';
import './CharacterSheetAdditions.css';

function CharacterSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [pericias, setPericias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [armas, setArmas] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [municoes, setMunicoes] = useState([]);
  const [protecoes, setProtecoes] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemType, setItemType] = useState('arma');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCharacter();
    loadPericias();
    loadItems();
  }, [id]);

  const calculateEspacoUsado = (inventario) => {
    if (!inventario || inventario.length === 0) return 0;
    return inventario.reduce((total, item) => {
      const espaco = item.espaco || 0;
      const quantidade = item.quantidade || 1;
      return total + (espaco * quantidade);
    }, 0);
  };

  // Função para remover duplicatas por nome
  const removeDuplicates = (items) => {
    const seen = new Set();
    return items.filter(item => {
      const nome = item.nome || item.id?.toString();
      if (seen.has(nome)) {
        return false;
      }
      seen.add(nome);
      return true;
    });
  };

  const loadItems = async () => {
    try {
      const [armasRes, equipamentosRes, municoesRes, protecoesRes] = await Promise.all([
        api.getArmas(),
        api.getEquipamentos(),
        api.getMunicoes(),
        api.getProtecoes()
      ]);
      // Remover duplicatas
      setArmas(removeDuplicates(armasRes.data || []));
      setEquipamentos(removeDuplicates(equipamentosRes.data || []));
      setMunicoes(removeDuplicates(municoesRes.data || []));
      setProtecoes(removeDuplicates(protecoesRes.data || []));
    } catch (err) {
      console.error('Erro ao carregar itens:', err);
    }
  };

  const loadCharacter = async () => {
    try {
      const response = await api.getCharacter(id);
      const char = response.data;
      // Calcular espaço usado se não estiver definido
      if (!char.espacoUsado || char.espacoUsado === 0) {
        char.espacoUsado = calculateEspacoUsado(char.inventario || []);
      }
      setCharacter(char);
    } catch (err) {
      console.error('Erro ao carregar personagem:', err);
      navigate('/characters');
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

  const updateCharacter = async (updates) => {
    try {
      const response = await api.updateCharacter(id, { ...character, ...updates });
      setCharacter(response.data);
    } catch (err) {
      alert('Erro ao atualizar personagem');
      console.error(err);
    }
  };

  const handleStatChange = (stat, value) => {
    updateCharacter({ [stat]: parseInt(value) || 0 });
  };

  const handleRollAttribute = (atributo) => {
    const result = rollAttribute(character.atributos[atributo]);
    setLastRoll({
      tipo: `Teste de ${atributo}`,
      ...result,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleRollPericia = (pericia) => {
    const periciaData = pericias.find(p => p.nome === pericia.nome);
    const atributoValue = character.atributos[periciaData?.atributo] || 0;
    const nivelTreinamento = character.pericias?.[pericia.nome] || null;
    
    // Calcular bônus baseado no nível de treinamento
    let skillBonus = 0;
    if (typeof nivelTreinamento === 'number') {
      skillBonus = Math.min(5, Math.max(0, nivelTreinamento)) * 5; // Cada nível = +5, máximo 5
    } else if (nivelTreinamento === 'treinado') skillBonus = 5;
    else if (nivelTreinamento === 'veterano') skillBonus = 10;
    else if (nivelTreinamento === 'expert') skillBonus = 15;
    
    const result = rollAttribute(atributoValue, skillBonus);
    setLastRoll({
      tipo: `Teste de ${pericia.nome} (${periciaData?.atributo || 'N/A'})`,
      ...result,
      skillBonus,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const adjustHP = (amount) => {
    const newHP = Math.max(0, Math.min(character.pvMax, character.pvAtual + amount));
    updateCharacter({ pvAtual: newHP });
  };

  const adjustSAN = (amount) => {
    const newSAN = Math.max(0, Math.min(character.sanMax, character.sanAtual + amount));
    updateCharacter({ sanAtual: newSAN });
  };

  const adjustPE = (amount) => {
    const newPE = Math.max(0, Math.min(character.peMax, character.peAtual + amount));
    updateCharacter({ peAtual: newPE });
  };

  const addItemToInventory = (item, tipo) => {
    const inventarioAtual = character.inventario || [];
    const novoItem = {
      ...item,
      tipo: tipo,
      quantidade: 1
    };
    
    // Verificar se já existe o item (mesmo nome e tipo)
    const itemIndex = inventarioAtual.findIndex(i => i.nome === item.nome && i.tipo === tipo);
    if (itemIndex >= 0) {
      // Se existe, aumentar quantidade
      const novoInventario = [...inventarioAtual];
      novoInventario[itemIndex].quantidade = (novoInventario[itemIndex].quantidade || 1) + 1;
      const novoEspacoUsado = calculateEspacoUsado(novoInventario);
      
      if (novoEspacoUsado <= (character.espacoTotal || 10)) {
        updateCharacter({ 
          inventario: novoInventario,
          espacoUsado: novoEspacoUsado
        });
      } else {
        alert('Não há espaço suficiente no inventário!');
      }
    } else {
      // Se não existe, adicionar novo
      const novoInventario = [...inventarioAtual, novoItem];
      const novoEspacoUsado = calculateEspacoUsado(novoInventario);
      
      if (novoEspacoUsado <= (character.espacoTotal || 10)) {
        updateCharacter({ 
          inventario: novoInventario,
          espacoUsado: novoEspacoUsado
        });
      } else {
        alert('Não há espaço suficiente no inventário!');
      }
    }
    setShowAddItemModal(false);
  };

  const removeItemFromInventory = (index) => {
    const inventarioAtual = [...(character.inventario || [])];
    inventarioAtual.splice(index, 1);
    const novoEspacoUsado = calculateEspacoUsado(inventarioAtual);
    updateCharacter({ 
      inventario: inventarioAtual,
      espacoUsado: novoEspacoUsado
    });
  };

  const updateItemQuantity = (index, change) => {
    const inventarioAtual = [...(character.inventario || [])];
    const item = inventarioAtual[index];
    const novaQuantidade = Math.max(1, (item.quantidade || 1) + change);
    
    inventarioAtual[index] = { ...item, quantidade: novaQuantidade };
    const novoEspacoUsado = calculateEspacoUsado(inventarioAtual);
    
    if (novoEspacoUsado <= (character.espacoTotal || 10)) {
      updateCharacter({ 
        inventario: inventarioAtual,
        espacoUsado: novoEspacoUsado
      });
    } else {
      alert('Não há espaço suficiente no inventário!');
    }
  };

  const handleRollAttack = (arma) => {
    const atributoRelevante = arma.tipo === 'Corpo a corpo' ? 'FOR' : 'AGI';
    const atributoValue = character.atributos[atributoRelevante] || 0;
    
    // Verificar se o personagem tem treinamento em Luta (corpo a corpo) ou Pontaria (armas de fogo)
    const periciaNome = arma.tipo === 'Corpo a corpo' ? 'Luta' : 'Pontaria';
    const nivelTreinamento = character.pericias?.[periciaNome] || null;
    
    let skillBonus = 0;
    if (nivelTreinamento === 'treinado') skillBonus = 5;
    else if (nivelTreinamento === 'veterano') skillBonus = 10;
    else if (nivelTreinamento === 'expert') skillBonus = 15;
    
    const result = rollAttribute(atributoValue, skillBonus);
    setLastRoll({
      tipo: `Ataque com ${arma.nome} (${atributoRelevante})`,
      ...result,
      skillBonus,
      arma: arma.nome,
      dano: arma.dano,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleRollDamage = (arma) => {
    const atributoRelevante = arma.tipo === 'Corpo a corpo' ? 'FOR' : null;
    const atributoValue = atributoRelevante ? character.atributos[atributoRelevante] || 0 : 0;
    
    const result = rollFormula(arma.dano);
    if (result) {
      const total = result.total + atributoValue;
      setLastRoll({
        tipo: `Dano com ${arma.nome}`,
        rolls: result.rolls,
        modifier: result.modifier,
        attributeValue: atributoValue,
        total: total,
        dano: arma.dano,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const updateEspacoTotal = (newEspacoTotal) => {
    const espacoAtual = character.espacoUsado || 0;
    if (espacoAtual <= newEspacoTotal) {
      updateCharacter({ espacoTotal: newEspacoTotal });
    } else {
      alert('O espaço usado atual é maior que o novo espaço total!');
    }
  };

  const updateConhecimento = (change) => {
    const conhecimentoAtual = character.conhecimento || 0;
    const novoConhecimento = Math.max(0, conhecimentoAtual + change);
    updateCharacter({ conhecimento: novoConhecimento });
  };

  if (loading) {
    return <div className="loading">Carregando ficha</div>;
  }

  if (!character) {
    return <div className="alert alert-danger">Personagem não encontrado</div>;
  }

  return (
    <div className="character-sheet">
      <div className="sheet-header">
        <div>
          <h1>{character.nome}</h1>
          <p className="character-subtitle">
            {character.origem?.nome} • {character.trilha} • {character.classe || 'Sem Classe'} • NEX {character.nex}%
          </p>
          {character.jogador && (
            <p className="character-player">Jogador: {character.jogador}</p>
          )}
        </div>
        <button onClick={() => navigate('/characters')}>
          ← Voltar
        </button>
      </div>

      {lastRoll && (
        <div className="last-roll card">
          <h3>🎲 Última Rolagem</h3>
          <div className="roll-details">
            <div className="roll-type">{lastRoll.tipo}</div>
            <div className="roll-breakdown">
              <span>Dado: {lastRoll.roll}</span>
              <span>+ Atributo: {lastRoll.attributeValue}</span>
              {lastRoll.skillBonus > 0 && <span>+ Perícia: {lastRoll.skillBonus}</span>}
            </div>
            <div className={`roll-total ${lastRoll.isCritical ? 'critical' : ''} ${lastRoll.isFumble ? 'fumble' : ''}`}>
              Total: {lastRoll.total}
              {lastRoll.isCritical && ' 🔥 CRÍTICO!'}
              {lastRoll.isFumble && ' 💀 FALHA CRÍTICA!'}
            </div>
            <div className="roll-time">{lastRoll.timestamp}</div>
          </div>
        </div>
      )}

      <div className="sheet-grid">
        {/* Informações Pessoais */}
        <div className="card info-pessoal-card">
          <h2>Informações Pessoais</h2>
          <div className="info-grid-compact">
            {character.idade && (
              <div className="info-item-compact">
                <span className="label">Idade:</span>
                <span className="value">{character.idade}</span>
              </div>
            )}
            {character.aniversario && (
              <div className="info-item-compact">
                <span className="label">Aniversário:</span>
                <span className="value">{character.aniversario}</span>
              </div>
            )}
            {character.local && (
              <div className="info-item-compact">
                <span className="label">Local:</span>
                <span className="value">{character.local}</span>
              </div>
            )}
            {character.peso && (
              <div className="info-item-compact">
                <span className="label">Peso/Altura:</span>
                <span className="value">{character.peso}</span>
              </div>
            )}
            <div className="info-item-compact">
              <span className="label">Patente:</span>
              <span className="value">{character.patente || 'Recruta'}</span>
            </div>
            <div className="info-item-compact">
              <span className="label">Prestígio:</span>
              <span className="value">{character.prestigio || 0}</span>
            </div>
          </div>
        </div>

        {/* Estatísticas de Combate */}
        <div className="card combat-stats-card">
          <h2>Combate</h2>
          <div className="combat-stats">
            <div className="combat-stat">
              <div className="stat-label">DEFESA</div>
              <div className="stat-value-large">{character.defesa || (10 + (character.atributos?.AGI || 0))}</div>
              <div className="stat-formula">10 + AGI</div>
            </div>
            <div className="combat-stat">
              <div className="stat-label">DESLOCAMENTO</div>
              <div className="stat-value-large">{character.deslocamento || (9 + (character.atributos?.AGI || 0))}m</div>
              <div className="stat-formula">9 + AGI</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="card status-card full-width">
          <h2>Status</h2>
          <div className="status-bars">
            <div className="status-item">
              <div className="status-header">
                <span className="status-label">PV (Pontos de Vida)</span>
                <span className="status-value">
                  {character.pvAtual} / {character.pvMax}
                </span>
              </div>
              <div className="status-bar">
                <div
                  className="status-fill pv"
                  style={{ width: `${(character.pvAtual / character.pvMax) * 100}%` }}
                />
              </div>
              <div className="status-controls">
                <button onClick={() => adjustHP(-5)}>-5</button>
                <button onClick={() => adjustHP(-1)}>-1</button>
                <button onClick={() => adjustHP(1)}>+1</button>
                <button onClick={() => adjustHP(5)}>+5</button>
              </div>
            </div>

            <div className="status-item">
              <div className="status-header">
                <span className="status-label">SAN (Sanidade)</span>
                <span className="status-value">
                  {character.sanAtual} / {character.sanMax}
                </span>
              </div>
              <div className="status-bar">
                <div
                  className="status-fill san"
                  style={{ width: `${(character.sanAtual / character.sanMax) * 100}%` }}
                />
              </div>
              <div className="status-controls">
                <button onClick={() => adjustSAN(-5)}>-5</button>
                <button onClick={() => adjustSAN(-1)}>-1</button>
                <button onClick={() => adjustSAN(1)}>+1</button>
                <button onClick={() => adjustSAN(5)}>+5</button>
              </div>
            </div>

            <div className="status-item">
              <div className="status-header">
                <span className="status-label">PE (Pontos de Esforço)</span>
                <span className="status-value">
                  {character.peAtual} / {character.peMax}
                </span>
              </div>
              <div className="status-bar">
                <div
                  className="status-fill pe"
                  style={{ width: `${(character.peAtual / character.peMax) * 100}%` }}
                />
              </div>
              <div className="status-controls">
                <button onClick={() => adjustPE(-1)}>-1</button>
                <button onClick={() => adjustPE(1)}>+1</button>
                <button onClick={() => adjustPE(character.peMax)}>Max</button>
              </div>
            </div>
          </div>
        </div>

        {/* Atributos */}
        <div className="card attributes-card">
          <h2>Atributos</h2>
          <div className="attributes-grid">
            {Object.entries(character.atributos).map(([attr, value]) => (
              <div key={attr} className="attribute-item" onClick={() => handleRollAttribute(attr)}>
                <div className="attr-name">{attr}</div>
                <div className="attr-value">{value}</div>
                <div className="attr-hint">Clique para rolar</div>
              </div>
            ))}
          </div>
        </div>

        {/* Perícias */}
        <div className="card pericias-card full-width">
          <div className="pericias-header">
            <h2>Perícias</h2>
            <button 
              onClick={() => {
                const nomePericia = prompt('Nome da nova perícia:');
                if (nomePericia && nomePericia.trim()) {
                  const atributoPericia = prompt('Atributo (FOR/AGI/INT/PRE/VIG):');
                  if (atributoPericia && ['FOR', 'AGI', 'INT', 'PRE', 'VIG'].includes(atributoPericia.toUpperCase())) {
                    const novaPericia = {
                      nome: nomePericia.trim(),
                      atributo: atributoPericia.toUpperCase()
                    };
                    const novasPericias = [...pericias, novaPericia];
                    setPericias(novasPericias);
                    // Opcional: salvar no backend
                  }
                }
              }}
              className="btn-add-pericia"
            >
              + Adicionar Perícia
            </button>
          </div>
          <div className="pericias-list">
            {pericias.map(pericia => {
              const atributo = character.atributos[pericia.atributo] || 0;
              const nivelTreinamento = character.pericias?.[pericia.nome] || null;
              
              // Calcular bônus baseado no nível de treinamento (máximo 5)
              let bonusTreinamento = 0;
              let nivelNumero = 0;
              if (typeof nivelTreinamento === 'number') {
                nivelNumero = Math.min(5, Math.max(0, nivelTreinamento));
                bonusTreinamento = nivelNumero * 5; // Cada nível = +5
              } else if (nivelTreinamento === 'treinado') bonusTreinamento = 5;
              else if (nivelTreinamento === 'veterano') bonusTreinamento = 10;
              else if (nivelTreinamento === 'expert') bonusTreinamento = 15;
              
              const total = atributo + bonusTreinamento;
              const isTreinada = nivelTreinamento !== null && nivelTreinamento !== 0;

              return (
                <div
                  key={pericia.nome}
                  className={`pericia-item ${isTreinada ? 'treinada' : ''}`}
                >
                  <div className="pericia-main" onClick={() => handleRollPericia(pericia)}>
                    <div className="pericia-info">
                      <span className="pericia-nome">{pericia.nome}</span>
                      <span className="pericia-attr">({pericia.atributo})</span>
                      {nivelTreinamento && (
                        <span className={`pericia-nivel ${nivelTreinamento}`}>
                          {typeof nivelTreinamento === 'number' ? `Nv.${nivelTreinamento}` : 
                           nivelTreinamento === 'treinado' ? 'T' : 
                           nivelTreinamento === 'veterano' ? 'V' : 'E'}
                        </span>
                      )}
                    </div>
                    <div className="pericia-bonus">
                      {atributo > 0 ? `+${atributo}` : atributo}
                      {bonusTreinamento > 0 && <span className="bonus-treinamento">+{bonusTreinamento}</span>}
                      {total !== 0 && <span className="total-bonus"> = {total > 0 ? '+' : ''}{total}</span>}
                    </div>
                  </div>
                  <div className="pericia-controls">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const novasPericias = { ...character.pericias };
                        const nivelAtual = typeof novasPericias[pericia.nome] === 'number' ? 
                          novasPericias[pericia.nome] : 
                          (novasPericias[pericia.nome] === 'treinado' ? 1 :
                           novasPericias[pericia.nome] === 'veterano' ? 2 :
                           novasPericias[pericia.nome] === 'expert' ? 3 : 0);
                        if (nivelAtual > 0) {
                          const novoNivel = nivelAtual - 1;
                          if (novoNivel === 0) {
                            delete novasPericias[pericia.nome];
                          } else {
                            novasPericias[pericia.nome] = Math.min(5, novoNivel);
                          }
                        }
                        updateCharacter({ pericias: novasPericias });
                      }}
                      className="btn-pericia-dec"
                      disabled={!isTreinada}
                    >
                      -
                    </button>
                    <span className="pericia-level">{typeof nivelTreinamento === 'number' ? nivelTreinamento : nivelNumero}/5</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const novasPericias = { ...character.pericias };
                        const nivelAtual = typeof novasPericias[pericia.nome] === 'number' ? 
                          novasPericias[pericia.nome] : 
                          (novasPericias[pericia.nome] === 'treinado' ? 1 :
                           novasPericias[pericia.nome] === 'veterano' ? 2 :
                           novasPericias[pericia.nome] === 'expert' ? 3 : 0);
                        if (nivelAtual < 5) {
                          novasPericias[pericia.nome] = nivelAtual + 1;
                          updateCharacter({ pericias: novasPericias });
                        }
                      }}
                      className="btn-pericia-inc"
                      disabled={nivelTreinamento === 5 || (typeof nivelTreinamento === 'string' && nivelTreinamento === 'expert')}
                    >
                      +
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remover perícia "${pericia.nome}"?`)) {
                          const novasPericias = [...pericias];
                          const index = novasPericias.findIndex(p => p.nome === pericia.nome);
                          if (index >= 0) {
                            novasPericias.splice(index, 1);
                            setPericias(novasPericias);
                          }
                          const novasPericiasChar = { ...character.pericias };
                          delete novasPericiasChar[pericia.nome];
                          updateCharacter({ pericias: novasPericiasChar });
                        }
                      }}
                      className="btn-pericia-remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Poderes e Habilidades */}
        <div className="card abilities-card full-width">
          <h2>Poderes e Habilidades</h2>
          
          {character.poderesOrigem && character.poderesOrigem.length > 0 && (
            <div className="abilities-section">
              <h3>Poderes de Origem</h3>
              <div className="abilities-list">
                {character.poderesOrigem.map((poder, index) => (
                  <div key={index} className="ability-item">
                    <span className="ability-icon">🎯</span>
                    <span className="ability-name">{poder}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {character.habilidadesClasse && character.habilidadesClasse.length > 0 && (
            <div className="abilities-section">
              <h3>Habilidades de Classe</h3>
              <div className="abilities-list">
                {character.habilidadesClasse.map((hab, index) => (
                  <div key={index} className="ability-item">
                    <span className="ability-icon">⭐</span>
                    <span className="ability-name">{hab}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!character.poderesOrigem || character.poderesOrigem.length === 0) && 
           (!character.habilidadesClasse || character.habilidadesClasse.length === 0) && (
            <p className="empty-text">Nenhum poder ou habilidade ainda</p>
          )}
        </div>

        {/* Conhecimento */}
        <div className="card conhecimento-card">
          <h2>Nível de Conhecimento</h2>
          <div className="conhecimento-controls">
            <button 
              onClick={() => updateConhecimento(-5)}
              className="btn-conhecimento"
              disabled={(character.conhecimento || 0) <= 0}
            >
              -5
            </button>
            <div className="conhecimento-value">
              <span className="conhecimento-label">Conhecimento:</span>
              <span className="conhecimento-number">{character.conhecimento || 0}</span>
            </div>
            <button 
              onClick={() => updateConhecimento(5)}
              className="btn-conhecimento"
            >
              +5
            </button>
            <input
              type="number"
              min="0"
              value={character.conhecimento || 0}
              onChange={(e) => updateCharacter({ conhecimento: parseInt(e.target.value) || 0 })}
              className="conhecimento-input"
              placeholder="Editar manualmente"
            />
          </div>
        </div>

        {/* Rituais */}
        <div className="card rituais-card">
          <h2>Rituais Conhecidos</h2>
          {character.rituaisConhecidos && character.rituaisConhecidos.length > 0 ? (
            <div className="rituais-list">
              {character.rituaisConhecidos.map((ritual, index) => (
                <div key={index} className="ritual-item">
                  <div className="ritual-header">
                    <span className="ritual-name">{ritual.nome || ritual}</span>
                    {ritual.circulo && (
                      <span className="ritual-circulo">Círculo {ritual.circulo}</span>
                    )}
                  </div>
                  {ritual.elemento && (
                    <div className="ritual-info">
                      <span>{ritual.elemento}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Nenhum ritual conhecido</p>
          )}
        </div>

        {/* Inventário */}
        <div className="card inventory-card full-width">
          <div className="inventory-header-section">
            <h2>Inventário</h2>
            <button 
              onClick={() => setShowAddItemModal(true)}
              className="btn-add-item"
            >
              + Adicionar Item
            </button>
          </div>
          <div className="inventory-header">
            <div className="espaco-controls">
              <span>Espaço Usado: {character.espacoUsado || 0} / {character.espacoTotal || 10}</span>
              <div className="espaco-edit">
                <label>Slots: </label>
                <input
                  type="number"
                  min="1"
                  value={character.espacoTotal || 10}
                  onChange={(e) => updateEspacoTotal(parseInt(e.target.value) || 10)}
                  className="espaco-input"
                />
              </div>
            </div>
            <div className="inventory-bar">
              <div 
                className="inventory-fill"
                style={{ width: `${Math.min(100, ((character.espacoUsado || 0) / (character.espacoTotal || 10)) * 100)}%` }}
              />
            </div>
          </div>
          
          {character.inventario && character.inventario.length > 0 ? (
            <div className="inventory-items">
              {character.inventario.map((item, index) => (
                <div key={index} className="inventory-item">
                  <div className="item-info">
                    <span className="item-name">{item.nome || item}</span>
                    {item.tipo && <span className="item-type">({item.tipo})</span>}
                    {item.dano && <span className="item-dano">Dano: {item.dano}</span>}
                  </div>
                  <div className="item-controls">
                    {item.quantidade > 1 && (
                      <button 
                        onClick={() => updateItemQuantity(index, -1)}
                        className="btn-quantity"
                      >
                        -
                      </button>
                    )}
                    {item.quantidade && <span className="item-qty">x{item.quantidade}</span>}
                    <button 
                      onClick={() => updateItemQuantity(index, 1)}
                      className="btn-quantity"
                    >
                      +
                    </button>
                    {item.espaco && <span className="item-space">{item.espaco * (item.quantidade || 1)} espaço(s)</span>}
                    {item.tipo === 'arma' && (
                      <div className="weapon-actions">
                        <button 
                          onClick={() => handleRollAttack(item)}
                          className="btn-attack"
                        >
                          🎯 Atacar
                        </button>
                        <button 
                          onClick={() => handleRollDamage(item)}
                          className="btn-damage"
                        >
                          ⚔️ Dano
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={() => removeItemFromInventory(index)}
                      className="btn-remove-item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Inventário vazio</p>
          )}
        </div>

        {/* Modal de Adicionar Item */}
        {showAddItemModal && (
          <div className="modal-overlay" onClick={() => {
            setShowAddItemModal(false);
            setSearchTerm('');
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🎒 Adicionar Item ao Inventário</h3>
                <button onClick={() => {
                  setShowAddItemModal(false);
                  setSearchTerm('');
                }} className="btn-close-modal">✕</button>
              </div>
              <div className="modal-body">
                <div className="item-type-selector">
                  <button 
                    className={itemType === 'arma' ? 'active' : ''}
                    onClick={() => {
                      setItemType('arma');
                      setSearchTerm('');
                    }}
                  >
                    ⚔️ Armas
                  </button>
                  <button 
                    className={itemType === 'equipamento' ? 'active' : ''}
                    onClick={() => {
                      setItemType('equipamento');
                      setSearchTerm('');
                    }}
                  >
                    🎒 Equipamentos
                  </button>
                  <button 
                    className={itemType === 'municao' ? 'active' : ''}
                    onClick={() => {
                      setItemType('municao');
                      setSearchTerm('');
                    }}
                  >
                    🔫 Munições
                  </button>
                  <button 
                    className={itemType === 'protecao' ? 'active' : ''}
                    onClick={() => {
                      setItemType('protecao');
                      setSearchTerm('');
                    }}
                  >
                    🛡️ Proteções
                  </button>
                </div>
                
                <div className="modal-search">
                  <input
                    type="text"
                    placeholder="🔍 Pesquisar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modal-search-input"
                  />
                </div>

                <div className="items-list-modal">
                  {(() => {
                    let items = [];
                    if (itemType === 'arma') items = armas;
                    else if (itemType === 'equipamento') items = equipamentos;
                    else if (itemType === 'municao') items = municoes;
                    else if (itemType === 'protecao') items = protecoes;

                    // Filtrar por termo de busca
                    const filteredItems = items.filter(item => 
                      item.nome?.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredItems.length === 0) {
                      return (
                        <div className="no-items-found">
                          <p>🔍 Nenhum item encontrado</p>
                          {searchTerm && (
                            <p className="search-hint">Tente pesquisar por outro nome</p>
                          )}
                        </div>
                      );
                    }

                    return filteredItems.map((item) => {
                      const uniqueKey = item.id || item.nome || `${itemType}-${item.nome}`;
                      return (
                        <div 
                          key={uniqueKey} 
                          className="modal-item"
                          onClick={() => addItemToInventory(item, itemType)}
                        >
                          <div className="modal-item-header">
                            <div className="modal-item-name">{item.nome}</div>
                            {item.descricao && (
                              <div className="modal-item-desc">{item.descricao}</div>
                            )}
                          </div>
                          <div className="modal-item-details">
                            {item.dano && <span className="detail-badge damage">⚔️ Dano: {item.dano}</span>}
                            {item.defesa && <span className="detail-badge defense">🛡️ Defesa: +{item.defesa}</span>}
                            {item.critico && <span className="detail-badge critico">💥 Crítico: {item.critico}</span>}
                            {item.alcance && <span className="detail-badge alcance">📏 Alcance: {item.alcance}</span>}
                            <span className="detail-badge space">📦 Espaço: {item.espaco || 0}</span>
                            {item.categoria && <span className="detail-badge categoria">🏷️ Cat: {item.categoria}</span>}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Descrição e História */}
        <div className="card description-card full-width">
          <h2>Descrição e História</h2>
          
          {character.descricao && (
            <div className="description-section">
              <h3>Descrição Física</h3>
              <p>{character.descricao}</p>
            </div>
          )}

          {character.historia && (
            <div className="description-section">
              <h3>História</h3>
              <p>{character.historia}</p>
            </div>
          )}

          {character.anotacoes && (
            <div className="description-section">
              <h3>Anotações / Objetivos</h3>
              <p>{character.anotacoes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CharacterSheet;
