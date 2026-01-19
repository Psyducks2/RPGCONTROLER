import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Bem-vindo ao Sistema de Controle de RPG</h1>
        <p className="subtitle">Ordem Paranormal</p>
        <p className="description">
          Gerencie suas fichas de personagens, role dados, consulte rituais e muito mais!
        </p>
      </div>

      <div className="features grid grid-3">
        <Link to="/characters/new" className="feature-card card">
          <div className="feature-icon">📝</div>
          <h3>Criar Personagem</h3>
          <p>Crie sua ficha de agente da Ordem</p>
        </Link>

        <Link to="/characters" className="feature-card card">
          <div className="feature-icon">👥</div>
          <h3>Meus Personagens</h3>
          <p>Visualize e gerencie seus personagens</p>
        </Link>

        <Link to="/dice" className="feature-card card">
          <div className="feature-icon">🎲</div>
          <h3>Rolar Dados</h3>
          <p>Sistema de rolagem integrado</p>
        </Link>

        <Link to="/database" className="feature-card card">
          <div className="feature-icon">📚</div>
          <h3>Database</h3>
          <p>Consulte armas, rituais e equipamentos</p>
        </Link>

        <div className="feature-card card">
          <div className="feature-icon">🧠</div>
          <h3>Sanidade</h3>
          <p>Controle de SAN e efeitos de insanidade</p>
        </div>

        <div className="feature-card card">
          <div className="feature-icon">⚔️</div>
          <h3>Combate</h3>
          <p>Sistema de combate e iniciativa</p>
        </div>
      </div>

      <div className="info-section">
        <h2>Sobre o Sistema</h2>
        <div className="info-content">
          <div className="info-card card">
            <h3>Atributos</h3>
            <ul>
              <li><strong>FOR</strong> - Força física e muscular</li>
              <li><strong>AGI</strong> - Agilidade e destreza</li>
              <li><strong>INT</strong> - Intelecto e raciocínio</li>
              <li><strong>PRE</strong> - Presença e carisma</li>
              <li><strong>VIG</strong> - Vigor e resistência</li>
            </ul>
          </div>

          <div className="info-card card">
            <h3>Trilhas</h3>
            <ul>
              <li><strong>Ocultista</strong> - 20 PV iniciais, 4 PE</li>
              <li><strong>Especialista</strong> - 16 PV iniciais, 3 PE</li>
            </ul>
          </div>

          <div className="info-card card">
            <h3>Elementos</h3>
            <ul>
              <li><strong>Sangue</strong> - Vida e morte</li>
              <li><strong>Conhecimento</strong> - Mente e percepção</li>
              <li><strong>Energia</strong> - Força e movimento</li>
              <li><strong>Morte</strong> - Escuridão e fim</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
