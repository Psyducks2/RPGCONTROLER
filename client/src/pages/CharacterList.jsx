import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './CharacterList.css';

function CharacterList() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const response = await api.getCharacters();
      setCharacters(response.data);
    } catch (err) {
      setError('Erro ao carregar personagens');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${name}?`)) {
      return;
    }

    try {
      await api.deleteCharacter(id);
      setCharacters(characters.filter(c => c.id !== id));
    } catch (err) {
      alert('Erro ao deletar personagem');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Carregando personagens</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="character-list">
      <div className="list-header">
        <h1>👥 Meus Personagens</h1>
        <Link to="/characters/new" className="btn-create">
          + Novo Personagem
        </Link>
      </div>

      {characters.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🎭</div>
          <h2>Nenhum personagem criado ainda</h2>
          <p>Comece criando seu primeiro agente da Ordem Paranormal!</p>
          <Link to="/characters/new">
            <button>Criar Personagem</button>
          </Link>
        </div>
      ) : (
        <div className="characters-grid">
          {characters.map((character) => (
            <div key={character.id} className="character-card card">
              <div className="character-header">
                <h3>{character.nome}</h3>
                <span className="character-nex">NEX {character.nex}%</span>
              </div>

              <div className="character-info">
                <div className="info-row">
                  <span className="label">Origem:</span>
                  <span className="value">{character.origem?.nome || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Trilha:</span>
                  <span className="value">{character.trilha || 'N/A'}</span>
                </div>
                {character.classe && (
                  <div className="info-row">
                    <span className="label">Classe:</span>
                    <span className="value">{character.classe}</span>
                  </div>
                )}
              </div>

              <div className="character-stats">
                <div className="stat">
                  <span className="stat-label">PV</span>
                  <span className="stat-value">
                    {character.pvAtual}/{character.pvMax}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">SAN</span>
                  <span className="stat-value">
                    {character.sanAtual}/{character.sanMax}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">PE</span>
                  <span className="stat-value">
                    {character.peAtual}/{character.peMax}
                  </span>
                </div>
              </div>

              <div className="character-attributes">
                <div className="attr">FOR {character.atributos?.FOR || 0}</div>
                <div className="attr">AGI {character.atributos?.AGI || 0}</div>
                <div className="attr">INT {character.atributos?.INT || 0}</div>
                <div className="attr">PRE {character.atributos?.PRE || 0}</div>
                <div className="attr">VIG {character.atributos?.VIG || 0}</div>
              </div>

              <div className="character-actions">
                <Link to={`/characters/${character.id}`}>
                  <button className="btn-view">Ver Ficha</button>
                </Link>
                <button
                  onClick={() => handleDelete(character.id, character.nome)}
                  className="btn-delete"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CharacterList;
