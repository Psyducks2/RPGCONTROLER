import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Personagens
  getCharacters: () => axios.get(`${API_BASE}/characters`),
  getCharacter: (id) => axios.get(`${API_BASE}/characters/${id}`),
  createCharacter: (data) => axios.post(`${API_BASE}/characters`, data),
  updateCharacter: (id, data) => axios.put(`${API_BASE}/characters/${id}`, data),
  deleteCharacter: (id) => axios.delete(`${API_BASE}/characters/${id}`),

  // Dados estáticos
  getOrigens: () => axios.get(`${API_BASE}/origens`),
  getPericias: () => axios.get(`${API_BASE}/pericias`),
  getArmas: () => axios.get(`${API_BASE}/armas`),
  getMunicoes: () => axios.get(`${API_BASE}/municoes`),
  getProtecoes: () => axios.get(`${API_BASE}/protecoes`),
  getEquipamentos: () => axios.get(`${API_BASE}/equipamentos`),
  getRituais: () => axios.get(`${API_BASE}/rituais`),
  getInsanidade: () => axios.get(`${API_BASE}/insanidade`),
  getDificuldades: () => axios.get(`${API_BASE}/dificuldades`),

  // Rolagem de dados
  rollDice: (quantity, sides, modifier = 0) => 
    axios.post(`${API_BASE}/roll`, { quantity, sides, modifier }),

  // Habilidades
  getHabilidades: () => axios.get(`${API_BASE}/habilidades`),

  // Modificações
  getModificacoes: () => axios.get(`${API_BASE}/modificacoes`),
};

export default api;
