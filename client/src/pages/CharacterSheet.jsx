import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { rollAttribute } from '../utils/diceRoller';
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

  useEffect(() => {
    loadCharacter();
    loadPericias();
  }, [id]);

  const loadCharacter = async () => {
    try {
      const response = await api.getCharacter(id);
      setCharacter(response.data);
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
    const atributoValue = character.atributos[periciaData.atributo] || 0;
    const nivelTreinamento = character.pericias?.[pericia.nome] || null;
    
    // Calcular bônus baseado no nível de treinamento
    let skillBonus = 0;
    if (nivelTreinamento === 'treinado') skillBonus = 5;
    else if (nivelTreinamento === 'veterano') skillBonus = 10;
    else if (nivelTreinamento === 'expert') skillBonus = 15;
    
    const result = rollAttribute(atributoValue, skillBonus);
    setLastRoll({
      tipo: `Teste de ${pericia.nome} (${periciaData.atributo})`,
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
          <h2>Perícias</h2>
          <div className="pericias-list">
            {pericias.map(pericia => {
              const atributo = character.atributos[pericia.atributo] || 0;
              const nivelTreinamento = character.pericias?.[pericia.nome] || null;
              
              // Calcular bônus baseado no nível de treinamento
              let bonusTreinamento = 0;
              if (nivelTreinamento === 'treinado') bonusTreinamento = 5;
              else if (nivelTreinamento === 'veterano') bonusTreinamento = 10;
              else if (nivelTreinamento === 'expert') bonusTreinamento = 15;
              
              const total = atributo + bonusTreinamento;
              const isTreinada = nivelTreinamento !== null;

              return (
                <div
                  key={pericia.nome}
                  className={`pericia-item ${isTreinada ? 'treinada' : ''}`}
                  onClick={() => handleRollPericia(pericia)}
                >
                  <div className="pericia-info">
                    <span className="pericia-nome">{pericia.nome}</span>
                    <span className="pericia-attr">({pericia.atributo})</span>
                    {nivelTreinamento && (
                      <span className={`pericia-nivel ${nivelTreinamento}`}>
                        {nivelTreinamento === 'treinado' ? 'T' : nivelTreinamento === 'veterano' ? 'V' : 'E'}
                      </span>
                    )}
                  </div>
                  <div className="pericia-bonus">
                    {atributo > 0 ? `+${atributo}` : atributo}
                    {bonusTreinamento > 0 && <span className="bonus-treinamento">+{bonusTreinamento}</span>}
                    {total !== 0 && <span className="total-bonus"> = {total > 0 ? '+' : ''}{total}</span>}
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
          <h2>Inventário</h2>
          <div className="inventory-header">
            <span>Espaço Usado: {character.espacoUsado || 0} / {character.espacoTotal || 10}</span>
            <div className="inventory-bar">
              <div 
                className="inventory-fill"
                style={{ width: `${((character.espacoUsado || 0) / (character.espacoTotal || 10)) * 100}%` }}
              />
            </div>
          </div>
          
          {character.inventario && character.inventario.length > 0 ? (
            <div className="inventory-items">
              {character.inventario.map((item, index) => (
                <div key={index} className="inventory-item">
                  <span className="item-name">{item.nome || item}</span>
                  {item.quantidade && <span className="item-qty">x{item.quantidade}</span>}
                  {item.espaco && <span className="item-space">{item.espaco} espaço(s)</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Inventário vazio</p>
          )}
        </div>

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
