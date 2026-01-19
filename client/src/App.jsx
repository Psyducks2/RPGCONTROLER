import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CharacterList from './pages/CharacterList';
import CharacterCreate from './pages/CharacterCreate';
import CharacterSheet from './pages/CharacterSheet';
import DiceRoller from './pages/DiceRoller';
import Database from './pages/Database';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCharacters from './pages/AdminCharacters';
import AdminManageItems from './pages/AdminManageItems';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/characters" element={<CharacterList />} />
              <Route path="/characters/new" element={<CharacterCreate />} />
              <Route path="/characters/:id" element={<CharacterSheet />} />
              <Route path="/dice" element={<DiceRoller />} />
              <Route path="/database" element={<Database />} />
              
              {/* Rotas Admin (Sem autenticação) */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/characters" element={<AdminCharacters />} />
              <Route path="/admin/manage/:type" element={<AdminManageItems />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
