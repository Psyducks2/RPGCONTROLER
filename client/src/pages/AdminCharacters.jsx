import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import axios from 'axios';
import './AdminCharacters.css';

function AdminCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChar, setSelectedChar] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [pericias, setPericias] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    loadCharacters();
    loadPericias();
    loadHabilidades();
  }, []);

  const loadPericias = async () => {
    try {
      const response = await api.getPericias();
      setPericias(response.data);
    } catch (err) {
      console.error('Erro ao carregar perícias:', err);
    }
  };

  const loadHabilidades = async () => {
    try {
      const response = await api.getHabilidades();
      setHabilidades(response.data);
    } catch (err) {
      console.error('Erro ao carregar habilidades:', err);
    }
  };

  const loadCharacters = async () => {
    try {
      const response = await axios.get('/api/characters');
      setCharacters(response.data);
    } catch (err) {
      console.error('Erro ao carregar personagens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (char) => {
    setSelectedChar({ ...char });
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/characters/${selectedChar.id}`, selectedChar, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCharacters(characters.map(c => 
        c.id === selectedChar.id ? selectedChar : c
      ));
      
      setEditMode(false);
      setSelectedChar(null);
      alert('Personagem atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao salvar personagem');
      console.error(err);
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${nome}?`)) {
      return;
    }

    try {
      await axios.delete(`/api/characters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCharacters(characters.filter(c => c.id !== id));
      alert('Personagem deletado com sucesso!');
    } catch (err) {
      alert('Erro ao deletar personagem');
      console.error(err);
    }
  };

  const updateCharField = (field, value) => {
    const updated = { ...selectedChar, [field]: value };
    
    // Se mudou a trilha, recalcular PV, PE, SAN
    if (field === 'trilha') {
      let pvMax, sanMax, peMax;
      if (value === 'Combatente') {
        pvMax = 20 + (updated.atributos?.VIG || 0);
        peMax = 2 + (updated.atributos?.PRE || 0);
        sanMax = 12;
      } else if (value === 'Ocultista') {
        pvMax = 12 + (updated.atributos?.VIG || 0);
        peMax = 4 + (updated.atributos?.PRE || 0);
        sanMax = 20;
      } else {
        pvMax = 16 + (updated.atributos?.VIG || 0);
        peMax = 3 + (updated.atributos?.PRE || 0);
        sanMax = 16;
      }
      updated.pvMax = pvMax;
      updated.peMax = peMax;
      updated.sanMax = sanMax;
    }
    
    setSelectedChar(updated);
  };

  const updateAtributo = (attr, value) => {
    const numValue = Math.max(1, Math.min(5, parseInt(value) || 1));
    const novosAtributos = { ...selectedChar.atributos, [attr]: numValue };
    
    // Recalcular valores automáticos
    let pvMax, sanMax, peMax;
    if (selectedChar.trilha === 'Combatente') {
      pvMax = 20 + novosAtributos.VIG;
      peMax = 2 + novosAtributos.PRE;
      sanMax = 12;
    } else if (selectedChar.trilha === 'Ocultista') {
      pvMax = 12 + novosAtributos.VIG;
      peMax = 4 + novosAtributos.PRE;
      sanMax = 20;
    } else {
      pvMax = 16 + novosAtributos.VIG;
      peMax = 3 + novosAtributos.PRE;
      sanMax = 16;
    }

    const defesa = 10 + novosAtributos.AGI;
    const deslocamento = 9 + novosAtributos.AGI;

    setSelectedChar({
      ...selectedChar,
      atributos: novosAtributos,
      pvMax,
      peMax,
      sanMax,
      defesa,
      deslocamento
    });
  };

  if (loading) {
    return <div className="loading">Carregando personagens</div>;
  }

  return (
    <div className="admin-characters">
      <div className="admin-header">
        <h1>👥 Gerenciar Personagens dos Jogadores</h1>
        <Link to="/admin/dashboard">
          <button>← Voltar ao Dashboard</button>
        </Link>
      </div>

      <div className="characters-layout">
        <div className="characters-sidebar">
          <h2>Personagens ({characters.length})</h2>
          <div className="characters-list">
            {characters.map(char => (
              <div
                key={char.id}
                className={`char-item ${selectedChar?.id === char.id ? 'active' : ''}`}
                onClick={() => setSelectedChar(char)}
              >
                <div className="char-item-header">
                  <strong>{char.nome}</strong>
                  <span className="char-nex">NEX {char.nex}%</span>
                </div>
                <div className="char-item-info">
                  {char.origem?.nome} • {char.trilha}
                </div>
                <div className="char-item-stats">
                  PV: {char.pvAtual}/{char.pvMax} | SAN: {char.sanAtual}/{char.sanMax}
                </div>
              </div>
            ))}
            {characters.length === 0 && (
              <div className="no-characters">
                Nenhum personagem criado ainda
              </div>
            )}
          </div>
        </div>

        <div className="character-details">
          {!selectedChar ? (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <h2>Selecione um personagem</h2>
              <p>Clique em um personagem na lista ao lado para visualizar e editar</p>
            </div>
          ) : (
            <div className="edit-container">
              <div className="edit-header">
                <h2>{selectedChar.nome}</h2>
                <div className="edit-actions">
                  {!editMode ? (
                    <>
                      <button onClick={() => setEditMode(true)} className="btn-edit">
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedChar.id, selectedChar.nome)}
                        className="btn-delete"
                      >
                        🗑️ Deletar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSave} className="btn-save">
                        💾 Salvar
                      </button>
                      <button 
                        onClick={() => {
                          setEditMode(false);
                          setSelectedChar(characters.find(c => c.id === selectedChar.id));
                        }}
                        className="btn-cancel"
                      >
                        ❌ Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="edit-content">
                <div className="card">
                  <h3>Informações Básicas</h3>
                  <div className="grid grid-3">
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        value={selectedChar.nome}
                        onChange={(e) => updateCharField('nome', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Jogador</label>
                      <input
                        type="text"
                        value={selectedChar.jogador || ''}
                        onChange={(e) => updateCharField('jogador', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Classe</label>
                      <input
                        type="text"
                        value={selectedChar.classe || ''}
                        onChange={(e) => updateCharField('classe', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Patente</label>
                      <select
                        value={selectedChar.patente || 'Recruta'}
                        onChange={(e) => updateCharField('patente', e.target.value)}
                        disabled={!editMode}
                      >
                        <option value="Recruta">Recruta</option>
                        <option value="Operador">Operador</option>
                        <option value="Agente de Elite">Agente de Elite</option>
                        <option value="Agente Especial">Agente Especial</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>NEX</label>
                      <input
                        type="number"
                        value={selectedChar.nex}
                        onChange={(e) => updateCharField('nex', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Prestígio</label>
                      <input
                        type="number"
                        value={selectedChar.prestigio || 0}
                        onChange={(e) => updateCharField('prestigio', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="form-group">
                      <label>Idade</label>
                      <input
                        type="text"
                        value={selectedChar.idade || ''}
                        onChange={(e) => updateCharField('idade', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Aniversário</label>
                      <input
                        type="text"
                        value={selectedChar.aniversario || ''}
                        onChange={(e) => updateCharField('aniversario', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Local</label>
                      <input
                        type="text"
                        value={selectedChar.local || ''}
                        onChange={(e) => updateCharField('local', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Estatísticas de Combate</h3>
                  <div className="grid grid-3">
                    <div className="form-group">
                      <label>Defesa</label>
                      <input
                        type="number"
                        value={selectedChar.defesa || (10 + (selectedChar.atributos?.AGI || 0))}
                        onChange={(e) => updateCharField('defesa', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Deslocamento</label>
                      <input
                        type="number"
                        value={selectedChar.deslocamento || (9 + (selectedChar.atributos?.AGI || 0))}
                        onChange={(e) => updateCharField('deslocamento', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>Espaço Total</label>
                      <input
                        type="number"
                        value={selectedChar.espacoTotal || 10}
                        onChange={(e) => updateCharField('espacoTotal', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Status</h3>
                  <div className="grid grid-3">
                    <div className="form-group">
                      <label>PV Atual</label>
                      <input
                        type="number"
                        value={selectedChar.pvAtual}
                        onChange={(e) => updateCharField('pvAtual', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>PV Máximo</label>
                      <input
                        type="number"
                        value={selectedChar.pvMax}
                        onChange={(e) => updateCharField('pvMax', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>SAN Atual</label>
                      <input
                        type="number"
                        value={selectedChar.sanAtual}
                        onChange={(e) => updateCharField('sanAtual', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>SAN Máximo</label>
                      <input
                        type="number"
                        value={selectedChar.sanMax}
                        onChange={(e) => updateCharField('sanMax', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>PE Atual</label>
                      <input
                        type="number"
                        value={selectedChar.peAtual}
                        onChange={(e) => updateCharField('peAtual', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="form-group">
                      <label>PE Máximo</label>
                      <input
                        type="number"
                        value={selectedChar.peMax}
                        onChange={(e) => updateCharField('peMax', parseInt(e.target.value))}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Atributos</h3>
                  <div className="grid grid-3">
                    {['FOR', 'AGI', 'INT', 'PRE', 'VIG'].map(attr => (
                      <div key={attr} className="form-group">
                        <label>{attr}</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={selectedChar.atributos[attr]}
                          onChange={(e) => updateAtributo(attr, parseInt(e.target.value) || 1)}
                          disabled={!editMode}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3>Perícias e Níveis de Treinamento</h3>
                  <div className="pericias-admin-list">
                    {pericias.map(pericia => {
                      const nivelAtual = selectedChar.pericias?.[pericia.nome] || null;
                      return (
                        <div key={pericia.nome} className="pericia-admin-item">
                          <div className="pericia-admin-info">
                            <span className="pericia-nome">{pericia.nome}</span>
                            <span className="pericia-attr">({pericia.atributo})</span>
                          </div>
                          <select
                            value={nivelAtual || ''}
                            onChange={(e) => {
                              const novasPericias = { ...selectedChar.pericias };
                              if (e.target.value === '') {
                                delete novasPericias[pericia.nome];
                              } else {
                                novasPericias[pericia.nome] = e.target.value;
                              }
                              setSelectedChar({ ...selectedChar, pericias: novasPericias });
                            }}
                            disabled={!editMode}
                          >
                            <option value="">Não treinada</option>
                            <option value="treinado">Treinado (+5)</option>
                            <option value="veterano">Veterano (+10)</option>
                            <option value="expert">Expert (+15)</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card">
                  <h3>Habilidades Adquiridas</h3>
                  <div className="habilidades-admin">
                    <div className="habilidades-list">
                      {selectedChar.habilidadesClasse && selectedChar.habilidadesClasse.length > 0 ? (
                        selectedChar.habilidadesClasse.map((hab, index) => (
                          <div key={index} className="habilidade-item">
                            <span>{hab}</span>
                            {editMode && (
                              <button
                                onClick={() => {
                                  const novasHabs = selectedChar.habilidadesClasse.filter((_, i) => i !== index);
                                  setSelectedChar({ ...selectedChar, habilidadesClasse: novasHabs });
                                }}
                                className="btn-remove"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="empty-text">Nenhuma habilidade adicionada</p>
                      )}
                    </div>
                    {editMode && (
                      <div className="add-habilidade">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const novasHabs = [...(selectedChar.habilidadesClasse || []), e.target.value];
                              setSelectedChar({ ...selectedChar, habilidadesClasse: novasHabs });
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">Adicionar habilidade...</option>
                          {habilidades
                            .filter(h => {
                              if (selectedChar.habilidadesClasse?.includes(h.nome)) return false;
                              
                              // Filtrar por tipo
                              if (h.tipo === 'Geral') return true;
                              if (h.tipo === selectedChar.trilha) return true;
                              if (h.tipo?.includes(selectedChar.trilha)) return true;
                              if (h.tipo === `Poder de ${selectedChar.trilha}`) return true;
                              
                              return false;
                            })
                            .map(hab => (
                              <option key={hab.nome} value={hab.nome}>
                                {hab.nome} {hab.nex ? `(NEX ${hab.nex}%)` : ''} {hab.prerequisito ? `[${hab.prerequisito}]` : ''}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCharacters;
