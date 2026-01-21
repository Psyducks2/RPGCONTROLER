import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sections = [
    {
      title: 'Personagens dos Jogadores',
      icon: '👥',
      description: 'Visualizar e editar fichas de todos os jogadores',
      link: '/admin/characters',
      color: '#8b0000'
    },
    {
      title: 'Gerenciar Armas',
      icon: '⚔️',
      description: 'Adicionar, editar ou remover armas do database',
      link: '/admin/manage/armas',
      color: '#b22222'
    },
    {
      title: 'Gerenciar Rituais',
      icon: '🔮',
      description: 'Criar e modificar rituais',
      link: '/admin/manage/rituais',
      color: '#7c3aed'
    },
    {
      title: 'Gerenciar Equipamentos',
      icon: '🎒',
      description: 'Gerenciar equipamentos e itens',
      link: '/admin/manage/equipamentos',
      color: '#0891b2'
    },
    {
      title: 'Gerenciar Munições',
      icon: '🔫',
      description: 'Adicionar e editar tipos de munição',
      link: '/admin/manage/municoes',
      color: '#d97706'
    },
    {
      title: 'Gerenciar Proteções',
      icon: '🛡️',
      description: 'Configurar proteções disponíveis',
      link: '/admin/manage/protecoes',
      color: '#059669'
    },
    {
      title: 'Gerenciar Habilidades',
      icon: '⭐',
      description: 'Adicionar e editar habilidades do sistema',
      link: '/admin/manage/habilidades',
      color: '#7c3aed'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>🎭 Painel do Mestre</h1>
          <p className="dashboard-subtitle">Controle total do sistema</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Sair
        </button>
      </div>

      <div className="dashboard-grid">
        {sections.map((section, index) => (
          <Link
            key={index}
            to={section.link}
            className="dashboard-card"
            style={{ borderColor: section.color }}
          >
            <div className="card-icon" style={{ color: section.color }}>
              {section.icon}
            </div>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <div className="card-arrow" style={{ color: section.color }}>
              →
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-info card">
        <h2>⚠️ Informações Importantes</h2>
        <ul>
          <li>Todas as alterações são salvas imediatamente no banco de dados</li>
          <li>Faça backup regular dos arquivos em <code>server/data/</code></li>
          <li>Ao editar fichas dos jogadores, as mudanças são permanentes</li>
          <li>Novos itens criados estarão disponíveis imediatamente para todos</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
