import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Não mostrar header nas páginas admin
  if (isAdminRoute) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">🎲 Ordem Paranormal RPG</h1>
        <nav className="nav">
          <Link to="/" className="nav-link">Início</Link>
          <Link to="/characters" className="nav-link">Personagens</Link>
          <Link to="/dice" className="nav-link">Dados</Link>
          <Link to="/database" className="nav-link">Database</Link>
          <Link to="/admin" className="nav-link admin-link">
            🎭 Mestre
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
