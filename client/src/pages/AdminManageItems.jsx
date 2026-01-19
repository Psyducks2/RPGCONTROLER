import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './AdminManageItems.css';

function AdminManageItems() {
  const { type } = useParams(); // armas, rituais, equipamentos, municoes, protecoes
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState(null);
  const { token } = useAuth();

  const typeConfig = {
    armas: {
      title: 'Armas',
      icon: '⚔️',
      fields: ['nome', 'tipo', 'categoria', 'dano', 'critico', 'alcance', 'espaco', 'municao', 'descricao']
    },
    rituais: {
      title: 'Rituais',
      icon: '🔮',
      fields: ['nome', 'circulo', 'elemento', 'execucao', 'alcance', 'alvo', 'duracao', 'resistencia', 'descricao']
    },
    equipamentos: {
      title: 'Equipamentos',
      icon: '🎒',
      fields: ['nome', 'categoria', 'espaco', 'descricao']
    },
    municoes: {
      title: 'Munições',
      icon: '🔫',
      fields: ['nome', 'categoria', 'espaco', 'descricao']
    },
    protecoes: {
      title: 'Proteções',
      icon: '🛡️',
      fields: ['nome', 'categoria', 'defesa', 'espaco', 'descricao']
    },
    habilidades: {
      title: 'Habilidades',
      icon: '⭐',
      fields: ['nome', 'tipo', 'nex', 'custo', 'prerequisito', 'descricao', 'progressao']
    }
  };

  const config = typeConfig[type];

  useEffect(() => {
    loadItems();
  }, [type]);

  const loadItems = async () => {
    try {
      const endpoint = type === 'habilidades' ? '/api/habilidades' : `/api/${type}`;
      const response = await axios.get(endpoint);
      setItems(response.data);
    } catch (err) {
      console.error('Erro ao carregar itens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const emptyItem = {};
    config.fields.forEach(field => {
      emptyItem[field] = '';
    });
    setNewItem(emptyItem);
  };

  const handleSaveNew = async () => {
    try {
      const endpoint = type === 'habilidades' ? '/api/admin/habilidades' : `/api/admin/${type}`;
      await axios.post(endpoint, newItem);
      
      await loadItems();
      setNewItem(null);
      alert('Item criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar item');
      console.error(err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const endpoint = type === 'habilidades' ? '/api/admin/habilidades' : `/api/admin/${type}`;
      await axios.put(`${endpoint}/${id}`, editingItem.data);
      
      await loadItems();
      setEditingItem(null);
      alert('Item atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar item');
      console.error(err);
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${nome}"?`)) {
      return;
    }

    try {
      const endpoint = type === 'habilidades' ? '/api/admin/habilidades' : `/api/admin/${type}`;
      await axios.delete(`${endpoint}/${id}`);
      
      await loadItems();
      alert('Item deletado com sucesso!');
    } catch (err) {
      alert('Erro ao deletar item');
      console.error(err);
    }
  };

  const renderField = (field, value, onChange) => {
    if (field === 'descricao') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(field, e.target.value)}
          rows="3"
        />
      );
    }

    if (field === 'circulo' || field === 'defesa' || field === 'espaco' || field === 'nex') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(field, e.target.value)}
        />
      );
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(field, e.target.value)}
      />
    );
  };

  if (loading) {
    return <div className="loading">Carregando itens</div>;
  }

  return (
    <div className="admin-manage-items">
      <div className="admin-header">
        <h1>{config.icon} Gerenciar {config.title}</h1>
        <div className="header-actions">
          <button onClick={handleCreate} className="btn-create">
            + Criar Novo
          </button>
          <Link to="/admin/dashboard">
            <button>← Dashboard</button>
          </Link>
        </div>
      </div>

      {newItem && (
        <div className="card new-item-card">
          <h2>🆕 Criar Novo Item</h2>
          <div className="grid grid-2">
            {config.fields.map(field => (
              <div key={field} className="form-group">
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {renderField(field, newItem[field], (f, v) => setNewItem({ ...newItem, [f]: v }))}
              </div>
            ))}
          </div>
          <div className="item-actions">
            <button onClick={handleSaveNew} className="btn-save">
              💾 Salvar
            </button>
            <button onClick={() => setNewItem(null)} className="btn-cancel">
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="items-grid">
        {items.map((item) => {
          const itemId = item.id || item.nome; // Usa ID do Supabase se existir
          return (
          <div key={itemId} className="item-card card">
            {editingItem && editingItem.id === itemId ? (
              <>
                <h3>✏️ Editando Item</h3>
                <div className="form-fields">
                  {config.fields.map(field => (
                    <div key={field} className="form-group">
                      <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      {renderField(field, editingItem.data[field], (f, v) => 
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, [f]: v }
                        })
                      )}
                    </div>
                  ))}
                </div>
                <div className="item-actions">
                  <button onClick={() => handleUpdate(itemId)} className="btn-save">
                    💾 Salvar
                  </button>
                  <button 
                    onClick={() => setEditingItem(null)} 
                    className="btn-cancel"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{item.nome}</h3>
                <div className="item-details">
                  {Object.entries(item).filter(([key]) => key !== 'nome' && key !== 'id').map(([key, value]) => (
                    <div key={key} className="detail-row">
                      <span className="label">{key}:</span>
                      <span className="value">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="item-actions">
                  <button 
                    onClick={() => setEditingItem({ id: itemId, data: { ...item } })}
                    className="btn-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(itemId, item.nome)}
                    className="btn-delete"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </>
            )}
          </div>
          );
        })}
      </div>

      {items.length === 0 && !newItem && (
        <div className="empty-state card">
          <div className="empty-icon">{config.icon}</div>
          <h2>Nenhum item cadastrado</h2>
          <p>Clique em "Criar Novo" para adicionar o primeiro item</p>
        </div>
      )}
    </div>
  );
}

export default AdminManageItems;
