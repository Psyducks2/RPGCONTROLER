import { useState, useEffect } from 'react';
import api from '../utils/api';
import './Database.css';

function Database() {
  const [activeTab, setActiveTab] = useState('armas');
  const [data, setData] = useState({
    armas: [],
    municoes: [],
    protecoes: [],
    equipamentos: [],
    rituais: [],
    origens: [],
    pericias: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [armas, municoes, protecoes, equipamentos, rituais, origens, pericias] = await Promise.all([
        api.getArmas(),
        api.getMunicoes(),
        api.getProtecoes(),
        api.getEquipamentos(),
        api.getRituais(),
        api.getOrigens(),
        api.getPericias()
      ]);

      setData({
        armas: armas.data,
        municoes: municoes.data,
        protecoes: protecoes.data,
        equipamentos: equipamentos.data,
        rituais: rituais.data,
        origens: origens.data,
        pericias: pericias.data
      });
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterData = (items) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const tabs = [
    { id: 'armas', label: '⚔️ Armas', count: data.armas.length },
    { id: 'municoes', label: '🔫 Munições', count: data.municoes.length },
    { id: 'protecoes', label: '🛡️ Proteções', count: data.protecoes.length },
    { id: 'equipamentos', label: '🎒 Equipamentos', count: data.equipamentos.length },
    { id: 'rituais', label: '🔮 Rituais', count: data.rituais.length },
    { id: 'origens', label: '📜 Origens', count: data.origens.length },
    { id: 'pericias', label: '🎯 Perícias', count: data.pericias.length }
  ];

  if (loading) {
    return <div className="loading">Carregando database</div>;
  }

  return (
    <div className="database">
      <h1>📚 Database - Ordem Paranormal</h1>

      <div className="search-box card">
        <input
          type="text"
          placeholder="Buscar itens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'armas' && (
          <div className="items-grid">
            {filterData(data.armas).map((arma, index) => (
              <div key={index} className="item-card card">
                <h3>{arma.nome}</h3>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="label">Tipo:</span>
                    <span className="value">{arma.tipo}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Categoria:</span>
                    <span className="value badge">{arma.categoria}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Dano:</span>
                    <span className="value damage">{arma.dano}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Crítico:</span>
                    <span className="value">{arma.critico}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Alcance:</span>
                    <span className="value">{arma.alcance}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Espaço:</span>
                    <span className="value">{arma.espaco}</span>
                  </div>
                  {arma.municao && (
                    <div className="detail-row">
                      <span className="label">Munição:</span>
                      <span className="value">{arma.municao}</span>
                    </div>
                  )}
                </div>
                <p className="item-description">{arma.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'municoes' && (
          <div className="items-grid">
            {filterData(data.municoes).map((municao, index) => (
              <div key={index} className="item-card card">
                <h3>{municao.nome}</h3>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="label">Categoria:</span>
                    <span className="value badge">{municao.categoria}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Espaço:</span>
                    <span className="value">{municao.espaco}</span>
                  </div>
                </div>
                <p className="item-description">{municao.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'protecoes' && (
          <div className="items-grid">
            {filterData(data.protecoes).map((protecao, index) => (
              <div key={index} className="item-card card">
                <h3>{protecao.nome}</h3>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="label">Categoria:</span>
                    <span className="value badge">{protecao.categoria}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Defesa:</span>
                    <span className="value defense">+{protecao.defesa}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Espaço:</span>
                    <span className="value">{protecao.espaco}</span>
                  </div>
                </div>
                <p className="item-description">{protecao.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'equipamentos' && (
          <div className="items-grid">
            {filterData(data.equipamentos).map((equip, index) => (
              <div key={index} className="item-card card">
                <h3>{equip.nome}</h3>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="label">Categoria:</span>
                    <span className="value badge">{equip.categoria}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Espaço:</span>
                    <span className="value">{equip.espaco}</span>
                  </div>
                </div>
                <p className="item-description">{equip.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rituais' && (
          <div className="items-grid">
            {filterData(data.rituais).map((ritual, index) => (
              <div key={index} className="item-card card ritual-card">
                <h3>{ritual.nome}</h3>
                <div className="ritual-header">
                  <span className="circulo-badge">Círculo {ritual.circulo}</span>
                  <span className="elemento-badge">{ritual.elemento}</span>
                </div>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="label">Execução:</span>
                    <span className="value">{ritual.execucao}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Alcance:</span>
                    <span className="value">{ritual.alcance}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Alvo:</span>
                    <span className="value">{ritual.alvo}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duração:</span>
                    <span className="value">{ritual.duracao}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Resistência:</span>
                    <span className="value">{ritual.resistencia}</span>
                  </div>
                </div>
                <p className="item-description">{ritual.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'origens' && (
          <div className="items-grid">
            {filterData(data.origens).map((origem, index) => (
              <div key={index} className="item-card card">
                <h3>{origem.nome}</h3>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="label">Perícias:</span>
                    <span className="value">{origem.pericias?.join(', ')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Poderes:</span>
                    <span className="value">{origem.poderes?.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pericias' && (
          <div className="items-grid">
            {filterData(data.pericias).map((pericia, index) => (
              <div key={index} className="item-card card">
                <h3>{pericia.nome}</h3>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="label">Atributo:</span>
                    <span className="value badge">{pericia.atributo}</span>
                  </div>
                </div>
                <p className="item-description">{pericia.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Database;
