import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { rollAttribute, rollFormula } from '../utils/diceRoller';
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
  const [armas, setArmas] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [municoes, setMunicoes] = useState([]);
  const [protecoes, setProtecoes] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemType, setItemType] = useState('arma');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [rituais, setRituais] = useState([]);
  const [showAddRitualModal, setShowAddRitualModal] = useState(false);
  const [ritualSearchTerm, setRitualSearchTerm] = useState('');
  const [modificacoes, setModificacoes] = useState([]);
  const [showModifyWeaponModal, setShowModifyWeaponModal] = useState(false);
  const [selectedWeaponIndex, setSelectedWeaponIndex] = useState(null);
  const [modificacaoSearchTerm, setModificacaoSearchTerm] = useState('');
  const lastRollRef = useRef(null);

  useEffect(() => {
    loadCharacter();
    loadPericias();
    loadItems();
    loadRituais();
    loadModificacoes();
  }, [id]);

  const loadRituais = async () => {
    try {
      const response = await api.getRituais();
      setRituais(response.data);
    } catch (err) {
      console.error('Erro ao carregar rituais:', err);
    }
  };

  const loadModificacoes = async () => {
    try {
      const response = await api.getModificacoes();
      setModificacoes(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar modificações:', err);
    }
  };

  // Scroll automático para resultados quando uma nova rolagem é feita
  useEffect(() => {
    if (lastRoll && lastRollRef.current) {
      setTimeout(() => {
        lastRollRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [lastRoll]);

  // Verificar se deve mostrar o botão de scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lastRollRef.current) {
      lastRollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateEspacoUsado = (inventario) => {
    if (!inventario || inventario.length === 0) return 0;
    return inventario.reduce((total, item) => {
      let espaco = item.espaco || 0;
      const quantidade = item.quantidade || 1;
      
      // Verificar modificações que alteram espaço (ex: Discreta reduz em -1)
      if (item.modificacoes && item.modificacoes.length > 0) {
        item.modificacoes.forEach(mod => {
          const modObj = typeof mod === 'object' ? mod : { nome: mod };
          const efeito = modObj.efeito || '';
          if (efeito.includes('Reduz espaço em 1')) {
            espaco = Math.max(0, espaco - 1);
          }
        });
      }
      
      return total + (espaco * quantidade);
    }, 0);
  };

  // Função para remover duplicatas por nome
  const removeDuplicates = (items) => {
    const seen = new Set();
    return items.filter(item => {
      const nome = item.nome || item.id?.toString();
      if (seen.has(nome)) {
        return false;
      }
      seen.add(nome);
      return true;
    });
  };

  const loadItems = async () => {
    try {
      const [armasRes, equipamentosRes, municoesRes, protecoesRes] = await Promise.all([
        api.getArmas(),
        api.getEquipamentos(),
        api.getMunicoes(),
        api.getProtecoes()
      ]);
      // Remover duplicatas
      setArmas(removeDuplicates(armasRes.data || []));
      setEquipamentos(removeDuplicates(equipamentosRes.data || []));
      setMunicoes(removeDuplicates(municoesRes.data || []));
      setProtecoes(removeDuplicates(protecoesRes.data || []));
    } catch (err) {
      console.error('Erro ao carregar itens:', err);
    }
  };

  const loadCharacter = async () => {
    try {
      const response = await api.getCharacter(id);
      const char = response.data;
      // Calcular espaço usado se não estiver definido
      if (!char.espacoUsado || char.espacoUsado === 0) {
        char.espacoUsado = calculateEspacoUsado(char.inventario || []);
      }
      setCharacter(char);
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
    const atributoValue = character.atributos[periciaData?.atributo] || 0;
    const nivelTreinamento = character.pericias?.[pericia.nome] || null;
    
    // Calcular bônus baseado no nível de treinamento
    let skillBonus = 0;
    if (typeof nivelTreinamento === 'number') {
      skillBonus = Math.min(5, Math.max(0, nivelTreinamento)) * 5; // Cada nível = +5, máximo 5
    } else if (nivelTreinamento === 'treinado') skillBonus = 5;
    else if (nivelTreinamento === 'veterano') skillBonus = 10;
    else if (nivelTreinamento === 'expert') skillBonus = 15;
    
    const result = rollAttribute(atributoValue, skillBonus);
    setLastRoll({
      tipo: `Teste de ${pericia.nome} (${periciaData?.atributo || 'N/A'})`,
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

  const addItemToInventory = (item, tipo) => {
    const inventarioAtual = character.inventario || [];
    const novoItem = {
      ...item,
      tipoItem: tipo, // Tipo do item (arma, equipamento, etc)
      // Manter o tipo original da arma (Corpo a corpo, Arma de fogo) se existir
      quantidade: 1
    };
    
    // Verificar se já existe o item (mesmo nome e tipoItem)
    const itemIndex = inventarioAtual.findIndex(i => i.nome === item.nome && i.tipoItem === tipo);
    if (itemIndex >= 0) {
      // Se existe, aumentar quantidade
      const novoInventario = [...inventarioAtual];
      novoInventario[itemIndex].quantidade = (novoInventario[itemIndex].quantidade || 1) + 1;
      const novoEspacoUsado = calculateEspacoUsado(novoInventario);
      
      if (novoEspacoUsado <= (character.espacoTotal || 10)) {
        updateCharacter({ 
          inventario: novoInventario,
          espacoUsado: novoEspacoUsado
        });
      } else {
        alert('Não há espaço suficiente no inventário!');
      }
    } else {
      // Se não existe, adicionar novo
      const novoInventario = [...inventarioAtual, novoItem];
      const novoEspacoUsado = calculateEspacoUsado(novoInventario);
      
      if (novoEspacoUsado <= (character.espacoTotal || 10)) {
        updateCharacter({ 
          inventario: novoInventario,
          espacoUsado: novoEspacoUsado
        });
      } else {
        alert('Não há espaço suficiente no inventário!');
      }
    }
    setShowAddItemModal(false);
  };

  const removeItemFromInventory = (index) => {
    const inventarioAtual = [...(character.inventario || [])];
    inventarioAtual.splice(index, 1);
    const novoEspacoUsado = calculateEspacoUsado(inventarioAtual);
    updateCharacter({ 
      inventario: inventarioAtual,
      espacoUsado: novoEspacoUsado
    });
  };

  const updateItemQuantity = (index, change) => {
    const inventarioAtual = [...(character.inventario || [])];
    const item = inventarioAtual[index];
    const novaQuantidade = Math.max(1, (item.quantidade || 1) + change);
    
    inventarioAtual[index] = { ...item, quantidade: novaQuantidade };
    const novoEspacoUsado = calculateEspacoUsado(inventarioAtual);
    
    if (novoEspacoUsado <= (character.espacoTotal || 10)) {
      updateCharacter({ 
        inventario: inventarioAtual,
        espacoUsado: novoEspacoUsado
      });
    } else {
      alert('Não há espaço suficiente no inventário!');
    }
  };

  const handleRollAttack = (arma) => {
    const tipoArma = arma.tipo || arma.tipoItem; // Tipo real da arma (Corpo a corpo ou Arma de fogo)
    const atributoRelevante = tipoArma === 'Corpo a corpo' ? 'FOR' : 'AGI';
    const atributoValue = character.atributos[atributoRelevante] || 0;
    
    // Verificar se o personagem tem treinamento em Luta (corpo a corpo) ou Pontaria (armas de fogo)
    const periciaNome = tipoArma === 'Corpo a corpo' ? 'Luta' : 'Pontaria';
    const nivelTreinamento = character.pericias?.[periciaNome] || null;
    
    let skillBonus = 0;
    if (typeof nivelTreinamento === 'number') {
      skillBonus = Math.min(5, Math.max(0, nivelTreinamento)) * 5;
    } else if (nivelTreinamento === 'treinado') skillBonus = 5;
    else if (nivelTreinamento === 'veterano') skillBonus = 10;
    else if (nivelTreinamento === 'expert') skillBonus = 15;
    
    // Aplicar modificações que afetam ataque
    let modificacaoBonus = 0;
    if (arma.modificacoes && arma.modificacoes.length > 0) {
      arma.modificacoes.forEach(mod => {
        const modObj = typeof mod === 'object' ? mod : { nome: mod };
        const efeito = modObj.efeito || '';
        
        // Certeira, Alongada: +2 em testes de ataque
        if (efeito.includes('+2 em testes de ataque')) {
          modificacaoBonus += 2;
        }
        // Mira Laser, Perigosa: +2 em margem de ameaça (será considerado separadamente)
      });
    }
    
    const result = rollAttribute(atributoValue, skillBonus + modificacaoBonus);
    
    // Calcular margem de ameaça considerando modificações
    let margemAmeaca = arma.critico || '20';
    if (arma.modificacoes && arma.modificacoes.length > 0) {
      arma.modificacoes.forEach(mod => {
        const modObj = typeof mod === 'object' ? mod : { nome: mod };
        const efeito = modObj.efeito || '';
        if (efeito.includes('+2 em margem de ameaça')) {
          const criticoAtual = parseInt(margemAmeaca) || 20;
          margemAmeaca = Math.max(2, criticoAtual - 2).toString();
        }
      });
    }
    
    setLastRoll({
      tipo: `Ataque com ${arma.nome} (${atributoRelevante})`,
      ...result,
      skillBonus,
      modificacaoBonus,
      arma: arma.nome,
      dano: arma.dano,
      margemAmeaca,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleRollDamage = (arma) => {
    const tipoArma = arma.tipo || arma.tipoItem; // Tipo real da arma
    const atributoRelevante = tipoArma === 'Corpo a corpo' ? 'FOR' : null;
    const atributoValue = atributoRelevante ? character.atributos[atributoRelevante] || 0 : 0;
    
    let danoModificado = arma.dano;
    let modificacaoBonus = 0;
    
    // Aplicar modificações que afetam dano
    if (arma.modificacoes && arma.modificacoes.length > 0) {
      arma.modificacoes.forEach(mod => {
        const modObj = typeof mod === 'object' ? mod : { nome: mod };
        const efeito = modObj.efeito || '';
        
        // Cruel: +2 em rolagens de dano
        if (efeito.includes('+2 em rolagens de dano')) {
          modificacaoBonus += 2;
        }
        // Calibre Grosso: aumenta um dado (isso precisa ser calculado manualmente)
        // Por enquanto, vamos apenas aplicar o bônus de Cruel
      });
    }
    
    const result = rollFormula(danoModificado);
    if (result) {
      const total = result.total + atributoValue + modificacaoBonus;
      setLastRoll({
        tipo: `Dano com ${arma.nome}`,
        rolls: result.rolls,
        modifier: result.modifier,
        attributeValue: atributoValue,
        modificacaoBonus,
        total: total,
        dano: danoModificado,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const updateEspacoTotal = (newEspacoTotal) => {
    const espacoAtual = character.espacoUsado || 0;
    if (espacoAtual <= newEspacoTotal) {
      updateCharacter({ espacoTotal: newEspacoTotal });
    } else {
      alert('O espaço usado atual é maior que o novo espaço total!');
    }
  };

  const updateConhecimento = (change) => {
    const conhecimentoAtual = character.conhecimento || 0;
    const novoConhecimento = Math.max(0, conhecimentoAtual + change);
    updateCharacter({ conhecimento: novoConhecimento });
  };

  const addRitualToCharacter = (ritual) => {
    const rituaisAtuais = character.rituaisConhecidos || [];
    // Verificar se o ritual já existe
    const jaExiste = rituaisAtuais.some(r => 
      (typeof r === 'object' ? r.nome : r) === ritual.nome
    );
    
    if (jaExiste) {
      alert('Este ritual já está na lista!');
      return;
    }
    
    // Adicionar o ritual completo (objeto com todas as informações)
    const novosRituais = [...rituaisAtuais, ritual];
    updateCharacter({ rituaisConhecidos: novosRituais });
    setShowAddRitualModal(false);
    setRitualSearchTerm('');
  };

  const removeRitualFromCharacter = (index) => {
    const rituaisAtuais = [...(character.rituaisConhecidos || [])];
    rituaisAtuais.splice(index, 1);
    updateCharacter({ rituaisConhecidos: rituaisAtuais });
  };

  const openModifyWeaponModal = (index) => {
    setSelectedWeaponIndex(index);
    setShowModifyWeaponModal(true);
    setModificacaoSearchTerm('');
  };

  const addModificacaoToWeapon = (modificacao) => {
    if (selectedWeaponIndex === null) return;
    
    const inventarioAtual = [...(character.inventario || [])];
    const arma = inventarioAtual[selectedWeaponIndex];
    
    // Inicializar array de modificações se não existir
    if (!arma.modificacoes) {
      arma.modificacoes = [];
    }
    
    // Verificar se a modificação já está aplicada
    const jaAplicada = arma.modificacoes.some(m => 
      (typeof m === 'object' ? m.nome : m) === modificacao.nome
    );
    
    if (jaAplicada) {
      alert('Esta modificação já está aplicada nesta arma!');
      return;
    }
    
    // Verificar se a modificação é compatível com o tipo de arma
    const armaTipoReal = arma.tipo || ''; // Tipo real da arma (Corpo a corpo, Arma de fogo)
    const modificacaoTipo = modificacao.tipo || '';
    const modificacaoAplicacao = modificacao.aplicacao || '';
    
    // Validações básicas
    if (modificacaoTipo === 'municao') {
      alert('Esta modificação é apenas para munições!');
      return;
    }
    
    // Verificar compatibilidade baseada na aplicação
    if (modificacaoAplicacao && modificacaoTipo === 'arma') {
      // Verificar se é para armas de fogo
      if (modificacaoAplicacao.includes('Armas de fogo') && armaTipoReal !== 'Arma de fogo') {
        alert(`Esta modificação é apenas para: ${modificacaoAplicacao}`);
        return;
      }
      // Verificar se é apenas para corpo a corpo (sem mencionar "e de disparo")
      if (modificacaoAplicacao.includes('Corpo a corpo') && 
          !modificacaoAplicacao.includes('e de disparo') && 
          armaTipoReal !== 'Corpo a corpo') {
        alert(`Esta modificação é apenas para: ${modificacaoAplicacao}`);
        return;
      }
      // Verificar armas automáticas
      if (modificacaoAplicacao.includes('armas automáticas') && armaTipoReal !== 'Arma de fogo') {
        alert(`Esta modificação é apenas para: ${modificacaoAplicacao}`);
        return;
      }
    }
    
    // Adicionar modificação
    arma.modificacoes = [...arma.modificacoes, modificacao];
    inventarioAtual[selectedWeaponIndex] = arma;
    
    // Recalcular espaço usado após adicionar modificação
    const novoEspacoUsado = calculateEspacoUsado(inventarioAtual);
    
    updateCharacter({ 
      inventario: inventarioAtual,
      espacoUsado: novoEspacoUsado
    });
  };

  const removeModificacaoFromWeapon = (weaponIndex, modificacaoIndex) => {
    const inventarioAtual = [...(character.inventario || [])];
    const arma = inventarioAtual[weaponIndex];
    
    if (arma.modificacoes && arma.modificacoes.length > 0) {
      arma.modificacoes.splice(modificacaoIndex, 1);
      inventarioAtual[weaponIndex] = arma;
      
      // Recalcular espaço usado após remover modificação
      const novoEspacoUsado = calculateEspacoUsado(inventarioAtual);
      
      updateCharacter({ 
        inventario: inventarioAtual,
        espacoUsado: novoEspacoUsado
      });
    }
  };

  const getModificacoesForWeapon = (arma) => {
    if (!arma || arma.tipoItem !== 'arma') return [];
    
    const armaTipoArma = arma.tipo || ''; // Tipo real da arma (ex: "Corpo a corpo" ou "Arma de fogo")
    
    return modificacoes.filter(mod => {
      // Modificações de munição não se aplicam a armas diretamente
      if (mod.tipo === 'municao') return false;
      
      // Verificar aplicação específica
      const aplicacao = mod.aplicacao || '';
      
      // Se aplicação menciona "Corpo a corpo e de disparo", aplica a ambos
      if (aplicacao.includes('Corpo a corpo e de disparo')) {
        return true;
      }
      
      // Se aplicação menciona "Armas de fogo", verificar se a arma é de fogo
      if (aplicacao.includes('Armas de fogo')) {
        return armaTipoArma === 'Arma de fogo';
      }
      
      // Se aplicação menciona "Corpo a corpo", verificar se a arma é corpo a corpo
      if (aplicacao.includes('Corpo a corpo')) {
        return armaTipoArma === 'Corpo a corpo';
      }
      
      // Se aplicação menciona "armas automáticas", precisa verificar a arma
      if (aplicacao.includes('armas automáticas')) {
        // Por enquanto, permitir para todas as armas de fogo
        // (em um sistema completo, verificaria se a arma é automática)
        return armaTipoArma === 'Arma de fogo';
      }
      
      // Por padrão, modificações de tipo 'arma' se aplicam a todas as armas
      return mod.tipo === 'arma';
    });
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
        <div className="last-roll card" ref={lastRollRef}>
          <h3>🎲 Última Rolagem</h3>
          <div className="roll-details">
            <div className="roll-type">{lastRoll.tipo}</div>
            <div className="roll-breakdown">
              <span>Dado: {lastRoll.roll}</span>
              <span>+ Atributo: {lastRoll.attributeValue}</span>
              {lastRoll.skillBonus > 0 && <span>+ Perícia: {lastRoll.skillBonus}</span>}
              {lastRoll.modificacaoBonus > 0 && <span>+ Modificação: {lastRoll.modificacaoBonus}</span>}
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

      {/* Botão flutuante para voltar aos resultados */}
      {showScrollButton && lastRoll && (
        <button 
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          title="Ver resultado dos dados"
        >
          🎲
        </button>
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
          <div className="pericias-header">
            <h2>Perícias</h2>
            <button 
              onClick={() => {
                const nomePericia = prompt('Nome da nova perícia:');
                if (nomePericia && nomePericia.trim()) {
                  const atributoPericia = prompt('Atributo (FOR/AGI/INT/PRE/VIG):');
                  if (atributoPericia && ['FOR', 'AGI', 'INT', 'PRE', 'VIG'].includes(atributoPericia.toUpperCase())) {
                    const novaPericia = {
                      nome: nomePericia.trim(),
                      atributo: atributoPericia.toUpperCase()
                    };
                    const novasPericias = [...pericias, novaPericia];
                    setPericias(novasPericias);
                    // Opcional: salvar no backend
                  }
                }
              }}
              className="btn-add-pericia"
            >
              + Adicionar Perícia
            </button>
          </div>
          <div className="pericias-list">
            {pericias.map(pericia => {
              const atributo = character.atributos[pericia.atributo] || 0;
              const nivelTreinamento = character.pericias?.[pericia.nome] || null;
              
              // Calcular bônus baseado no nível de treinamento (máximo 5)
              let bonusTreinamento = 0;
              let nivelNumero = 0;
              if (typeof nivelTreinamento === 'number') {
                nivelNumero = Math.min(5, Math.max(0, nivelTreinamento));
                bonusTreinamento = nivelNumero * 5; // Cada nível = +5
              } else if (nivelTreinamento === 'treinado') bonusTreinamento = 5;
              else if (nivelTreinamento === 'veterano') bonusTreinamento = 10;
              else if (nivelTreinamento === 'expert') bonusTreinamento = 15;
              
              const total = atributo + bonusTreinamento;
              const isTreinada = nivelTreinamento !== null && nivelTreinamento !== 0;

              return (
                <div
                  key={pericia.nome}
                  className={`pericia-item ${isTreinada ? 'treinada' : ''}`}
                >
                  <div className="pericia-main" onClick={() => handleRollPericia(pericia)}>
                    <div className="pericia-info">
                      <span className="pericia-nome">{pericia.nome}</span>
                      <span className="pericia-attr">({pericia.atributo})</span>
                      {nivelTreinamento && (
                        <span className={`pericia-nivel ${nivelTreinamento}`}>
                          {typeof nivelTreinamento === 'number' ? `Nv.${nivelTreinamento}` : 
                           nivelTreinamento === 'treinado' ? 'T' : 
                           nivelTreinamento === 'veterano' ? 'V' : 'E'}
                        </span>
                      )}
                    </div>
                    <div className="pericia-bonus">
                      {atributo > 0 ? `+${atributo}` : atributo}
                      {bonusTreinamento > 0 && <span className="bonus-treinamento">+{bonusTreinamento}</span>}
                      {total !== 0 && <span className="total-bonus"> = {total > 0 ? '+' : ''}{total}</span>}
                    </div>
                  </div>
                  <div className="pericia-controls">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const novasPericias = { ...character.pericias };
                        const nivelAtual = typeof novasPericias[pericia.nome] === 'number' ? 
                          novasPericias[pericia.nome] : 
                          (novasPericias[pericia.nome] === 'treinado' ? 1 :
                           novasPericias[pericia.nome] === 'veterano' ? 2 :
                           novasPericias[pericia.nome] === 'expert' ? 3 : 0);
                        if (nivelAtual > 0) {
                          const novoNivel = nivelAtual - 1;
                          if (novoNivel === 0) {
                            delete novasPericias[pericia.nome];
                          } else {
                            novasPericias[pericia.nome] = Math.min(5, novoNivel);
                          }
                        }
                        updateCharacter({ pericias: novasPericias });
                      }}
                      className="btn-pericia-dec"
                      disabled={!isTreinada}
                    >
                      -
                    </button>
                    <span className="pericia-level">{typeof nivelTreinamento === 'number' ? nivelTreinamento : nivelNumero}/5</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const novasPericias = { ...character.pericias };
                        const nivelAtual = typeof novasPericias[pericia.nome] === 'number' ? 
                          novasPericias[pericia.nome] : 
                          (novasPericias[pericia.nome] === 'treinado' ? 1 :
                           novasPericias[pericia.nome] === 'veterano' ? 2 :
                           novasPericias[pericia.nome] === 'expert' ? 3 : 0);
                        if (nivelAtual < 5) {
                          novasPericias[pericia.nome] = nivelAtual + 1;
                          updateCharacter({ pericias: novasPericias });
                        }
                      }}
                      className="btn-pericia-inc"
                      disabled={nivelTreinamento === 5 || (typeof nivelTreinamento === 'string' && nivelTreinamento === 'expert')}
                    >
                      +
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remover perícia "${pericia.nome}"?`)) {
                          const novasPericias = [...pericias];
                          const index = novasPericias.findIndex(p => p.nome === pericia.nome);
                          if (index >= 0) {
                            novasPericias.splice(index, 1);
                            setPericias(novasPericias);
                          }
                          const novasPericiasChar = { ...character.pericias };
                          delete novasPericiasChar[pericia.nome];
                          updateCharacter({ pericias: novasPericiasChar });
                        }
                      }}
                      className="btn-pericia-remove"
                    >
                      ✕
                    </button>
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

        {/* Conhecimento */}
        <div className="card conhecimento-card">
          <h2>Nível de Conhecimento</h2>
          <div className="conhecimento-controls">
            <button 
              onClick={() => updateConhecimento(-5)}
              className="btn-conhecimento"
              disabled={(character.conhecimento || 0) <= 0}
            >
              -5
            </button>
            <div className="conhecimento-value">
              <span className="conhecimento-label">Conhecimento:</span>
              <span className="conhecimento-number">{character.conhecimento || 0}</span>
            </div>
            <button 
              onClick={() => updateConhecimento(5)}
              className="btn-conhecimento"
            >
              +5
            </button>
            <input
              type="number"
              min="0"
              value={character.conhecimento || 0}
              onChange={(e) => updateCharacter({ conhecimento: parseInt(e.target.value) || 0 })}
              className="conhecimento-input"
              placeholder="Editar manualmente"
            />
          </div>
        </div>

        {/* Rituais */}
        <div className="card rituais-card">
          <div className="rituais-header-section">
            <h2>Rituais Conhecidos</h2>
            <button 
              onClick={() => setShowAddRitualModal(true)}
              className="btn-add-ritual"
            >
              + Adicionar Ritual
            </button>
          </div>
          {character.rituaisConhecidos && character.rituaisConhecidos.length > 0 ? (
            <div className="rituais-list">
              {character.rituaisConhecidos.map((ritual, index) => {
                const ritualObj = typeof ritual === 'object' ? ritual : { nome: ritual };
                return (
                  <div key={index} className="ritual-item">
                    <div className="ritual-content">
                      <div className="ritual-header">
                        <span className="ritual-name">{ritualObj.nome || ritual}</span>
                        <div className="ritual-badges">
                          {ritualObj.circulo && (
                            <span className="ritual-circulo">Círculo {ritualObj.circulo}</span>
                          )}
                          {ritualObj.elemento && (
                            <span className="ritual-elemento">{ritualObj.elemento}</span>
                          )}
                        </div>
                      </div>
                      {ritualObj.descricao && (
                        <div className="ritual-desc">{ritualObj.descricao}</div>
                      )}
                      {(ritualObj.execucao || ritualObj.alcance || ritualObj.alvo) && (
                        <div className="ritual-details">
                          {ritualObj.execucao && <span>Execução: {ritualObj.execucao}</span>}
                          {ritualObj.alcance && <span>Alcance: {ritualObj.alcance}</span>}
                          {ritualObj.alvo && <span>Alvo: {ritualObj.alvo}</span>}
                          {ritualObj.duracao && <span>Duração: {ritualObj.duracao}</span>}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => removeRitualFromCharacter(index)}
                      className="btn-remove-ritual"
                      title="Remover ritual"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-text">Nenhum ritual conhecido. Clique em "+ Adicionar Ritual" para começar!</p>
          )}
        </div>

        {/* Modal de Adicionar Ritual */}
        {showAddRitualModal && (
          <div className="modal-overlay" onClick={() => {
            setShowAddRitualModal(false);
            setRitualSearchTerm('');
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🔮 Adicionar Ritual</h3>
                <button onClick={() => {
                  setShowAddRitualModal(false);
                  setRitualSearchTerm('');
                }} className="btn-close-modal">✕</button>
              </div>
              <div className="modal-body">
                <div className="modal-search">
                  <input
                    type="text"
                    placeholder="🔍 Pesquisar rituais por nome..."
                    value={ritualSearchTerm}
                    onChange={(e) => setRitualSearchTerm(e.target.value)}
                    className="modal-search-input"
                  />
                </div>

                <div className="items-list-modal">
                  {(() => {
                    const filteredRituais = rituais.filter(ritual => 
                      ritual.nome?.toLowerCase().includes(ritualSearchTerm.toLowerCase()) ||
                      ritual.elemento?.toLowerCase().includes(ritualSearchTerm.toLowerCase()) ||
                      ritual.descricao?.toLowerCase().includes(ritualSearchTerm.toLowerCase())
                    );

                    if (filteredRituais.length === 0) {
                      return (
                        <div className="no-items-found">
                          <p>🔍 Nenhum ritual encontrado</p>
                          {ritualSearchTerm && (
                            <p className="search-hint">Tente pesquisar por outro nome</p>
                          )}
                        </div>
                      );
                    }

                    return filteredRituais.map((ritual) => {
                      const jaConhecido = character.rituaisConhecidos?.some(r => 
                        (typeof r === 'object' ? r.nome : r) === ritual.nome
                      );
                      const uniqueKey = ritual.id || ritual.nome;
                      return (
                        <div 
                          key={uniqueKey} 
                          className={`modal-item ${jaConhecido ? 'already-added' : ''}`}
                          onClick={() => !jaConhecido && addRitualToCharacter(ritual)}
                        >
                          <div className="modal-item-header">
                            <div className="modal-item-name">{ritual.nome}</div>
                            {ritual.descricao && (
                              <div className="modal-item-desc">{ritual.descricao}</div>
                            )}
                          </div>
                          <div className="modal-item-details">
                            <span className="detail-badge circulo">Círculo {ritual.circulo}</span>
                            <span className="detail-badge elemento">{ritual.elemento}</span>
                            {ritual.execucao && <span className="detail-badge">Execução: {ritual.execucao}</span>}
                            {ritual.alcance && <span className="detail-badge">Alcance: {ritual.alcance}</span>}
                            {ritual.alvo && <span className="detail-badge">Alvo: {ritual.alvo}</span>}
                            {ritual.duracao && <span className="detail-badge">Duração: {ritual.duracao}</span>}
                            {ritual.resistencia && <span className="detail-badge">Resistência: {ritual.resistencia}</span>}
                            {jaConhecido && <span className="detail-badge already-badge">✓ Já Conhecido</span>}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventário */}
        <div className="card inventory-card full-width">
          <div className="inventory-header-section">
            <h2>Inventário</h2>
            <button 
              onClick={() => setShowAddItemModal(true)}
              className="btn-add-item"
            >
              + Adicionar Item
            </button>
          </div>
          <div className="inventory-header">
            <div className="espaco-controls">
              <span>Espaço Usado: {character.espacoUsado || 0} / {character.espacoTotal || 10}</span>
              <div className="espaco-edit">
                <label>Slots: </label>
                <input
                  type="number"
                  min="1"
                  value={character.espacoTotal || 10}
                  onChange={(e) => updateEspacoTotal(parseInt(e.target.value) || 10)}
                  className="espaco-input"
                />
              </div>
            </div>
            <div className="inventory-bar">
              <div 
                className="inventory-fill"
                style={{ width: `${Math.min(100, ((character.espacoUsado || 0) / (character.espacoTotal || 10)) * 100)}%` }}
              />
            </div>
          </div>
          
          {character.inventario && character.inventario.length > 0 ? (
            <div className="inventory-items">
              {character.inventario.map((item, index) => (
                <div key={index} className="inventory-item">
                  <div className="item-info">
                    <div className="item-header">
                      <span className="item-name">{item.nome || item}</span>
                      {item.tipoItem && <span className="item-type">({item.tipoItem})</span>}
                    </div>
                    {item.dano && <span className="item-dano">⚔️ Dano: {item.dano}</span>}
                    {item.modificacoes && item.modificacoes.length > 0 && (
                      <div className="weapon-modifications">
                        <span className="modifications-label">Modificações:</span>
                        <div className="modifications-list">
                          {item.modificacoes.map((mod, modIndex) => {
                            const modObj = typeof mod === 'object' ? mod : { nome: mod };
                            return (
                              <span 
                                key={modIndex} 
                                className="modification-badge"
                                title={modObj.descricao || modObj.efeito || ''}
                              >
                                {modObj.nome}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeModificacaoFromWeapon(index, modIndex);
                                  }}
                                  className="btn-remove-modification"
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="item-controls">
                    <div className="item-controls-row">
                      <div className="quantity-controls">
                        {item.quantidade > 1 && (
                          <button 
                            onClick={() => updateItemQuantity(index, -1)}
                            className="btn-quantity"
                          >
                            -
                          </button>
                        )}
                        {item.quantidade && <span className="item-qty">x{item.quantidade}</span>}
                        <button 
                          onClick={() => updateItemQuantity(index, 1)}
                          className="btn-quantity"
                        >
                          +
                        </button>
                      </div>
                      {item.espaco && (() => {
                        let espacoItem = item.espaco || 0;
                        // Verificar se há modificação Discreta que reduz espaço
                        if (item.modificacoes && item.modificacoes.length > 0) {
                          item.modificacoes.forEach(mod => {
                            const modObj = typeof mod === 'object' ? mod : { nome: mod };
                            const efeito = modObj.efeito || '';
                            if (efeito.includes('Reduz espaço em 1')) {
                              espacoItem = Math.max(0, espacoItem - 1);
                            }
                          });
                        }
                        return <span className="item-space">📦 {espacoItem * (item.quantidade || 1)} espaço(s)</span>;
                      })()}
                    </div>
                    {item.tipoItem === 'arma' && (
                      <>
                        <div className="weapon-actions">
                          <button 
                            onClick={() => handleRollAttack(item)}
                            className="btn-attack"
                          >
                            🎯 Atacar
                          </button>
                          <button 
                            onClick={() => handleRollDamage(item)}
                            className="btn-damage"
                          >
                            ⚔️ Dano
                          </button>
                          <button 
                            onClick={() => openModifyWeaponModal(index)}
                            className="btn-modify"
                            title="Adicionar modificações"
                          >
                            ⚙️ Modificar
                          </button>
                        </div>
                      </>
                    )}
                    <button 
                      onClick={() => removeItemFromInventory(index)}
                      className="btn-remove-item"
                      title="Remover item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Inventário vazio</p>
          )}
        </div>

        {/* Modal de Adicionar Item */}
        {showAddItemModal && (
          <div className="modal-overlay" onClick={() => {
            setShowAddItemModal(false);
            setSearchTerm('');
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🎒 Adicionar Item ao Inventário</h3>
                <button onClick={() => {
                  setShowAddItemModal(false);
                  setSearchTerm('');
                }} className="btn-close-modal">✕</button>
              </div>
              <div className="modal-body">
                <div className="item-type-selector">
                  <button 
                    className={itemType === 'arma' ? 'active' : ''}
                    onClick={() => {
                      setItemType('arma');
                      setSearchTerm('');
                    }}
                  >
                    ⚔️ Armas
                  </button>
                  <button 
                    className={itemType === 'equipamento' ? 'active' : ''}
                    onClick={() => {
                      setItemType('equipamento');
                      setSearchTerm('');
                    }}
                  >
                    🎒 Equipamentos
                  </button>
                  <button 
                    className={itemType === 'municao' ? 'active' : ''}
                    onClick={() => {
                      setItemType('municao');
                      setSearchTerm('');
                    }}
                  >
                    🔫 Munições
                  </button>
                  <button 
                    className={itemType === 'protecao' ? 'active' : ''}
                    onClick={() => {
                      setItemType('protecao');
                      setSearchTerm('');
                    }}
                  >
                    🛡️ Proteções
                  </button>
                </div>
                
                <div className="modal-search">
                  <input
                    type="text"
                    placeholder="🔍 Pesquisar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modal-search-input"
                  />
                </div>

                <div className="items-list-modal">
                  {(() => {
                    let items = [];
                    if (itemType === 'arma') items = armas;
                    else if (itemType === 'equipamento') items = equipamentos;
                    else if (itemType === 'municao') items = municoes;
                    else if (itemType === 'protecao') items = protecoes;

                    // Filtrar por termo de busca
                    const filteredItems = items.filter(item => 
                      item.nome?.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredItems.length === 0) {
                      return (
                        <div className="no-items-found">
                          <p>🔍 Nenhum item encontrado</p>
                          {searchTerm && (
                            <p className="search-hint">Tente pesquisar por outro nome</p>
                          )}
                        </div>
                      );
                    }

                    return filteredItems.map((item) => {
                      const uniqueKey = item.id || item.nome || `${itemType}-${item.nome}`;
                      return (
                        <div 
                          key={uniqueKey} 
                          className="modal-item"
                          onClick={() => addItemToInventory(item, itemType)}
                        >
                          <div className="modal-item-header">
                            <div className="modal-item-name">{item.nome}</div>
                            {item.descricao && (
                              <div className="modal-item-desc">{item.descricao}</div>
                            )}
                          </div>
                          <div className="modal-item-details">
                            {item.dano && <span className="detail-badge damage">⚔️ Dano: {item.dano}</span>}
                            {item.defesa && <span className="detail-badge defense">🛡️ Defesa: +{item.defesa}</span>}
                            {item.critico && <span className="detail-badge critico">💥 Crítico: {item.critico}</span>}
                            {item.alcance && <span className="detail-badge alcance">📏 Alcance: {item.alcance}</span>}
                            <span className="detail-badge space">📦 Espaço: {item.espaco || 0}</span>
                            {item.categoria && <span className="detail-badge categoria">🏷️ Cat: {item.categoria}</span>}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Modificar Arma */}
        {showModifyWeaponModal && selectedWeaponIndex !== null && (
          <div className="modal-overlay" onClick={() => {
            setShowModifyWeaponModal(false);
            setSelectedWeaponIndex(null);
            setModificacaoSearchTerm('');
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>⚙️ Modificar Arma: {character.inventario[selectedWeaponIndex]?.nome}</h3>
                <button onClick={() => {
                  setShowModifyWeaponModal(false);
                  setSelectedWeaponIndex(null);
                  setModificacaoSearchTerm('');
                }} className="btn-close-modal">✕</button>
              </div>
              <div className="modal-body">
                <div className="modal-search">
                  <input
                    type="text"
                    placeholder="🔍 Pesquisar modificações por nome..."
                    value={modificacaoSearchTerm}
                    onChange={(e) => setModificacaoSearchTerm(e.target.value)}
                    className="modal-search-input"
                  />
                </div>

                <div className="items-list-modal">
                  {(() => {
                    const arma = character.inventario[selectedWeaponIndex];
                    if (!arma) return null;

                    const modificacoesDisponiveis = getModificacoesForWeapon(arma);
                    const modificacoesAplicadas = arma.modificacoes || [];
                    
                    const filteredMods = modificacoesDisponiveis.filter(mod => 
                      mod.nome?.toLowerCase().includes(modificacaoSearchTerm.toLowerCase()) ||
                      mod.efeito?.toLowerCase().includes(modificacaoSearchTerm.toLowerCase()) ||
                      mod.descricao?.toLowerCase().includes(modificacaoSearchTerm.toLowerCase())
                    );

                    if (filteredMods.length === 0) {
                      return (
                        <div className="no-items-found">
                          <p>🔍 Nenhuma modificação encontrada</p>
                          {modificacaoSearchTerm && (
                            <p className="search-hint">Tente pesquisar por outro nome</p>
                          )}
                        </div>
                      );
                    }

                    return filteredMods.map((modificacao) => {
                      const jaAplicada = modificacoesAplicadas.some(m => 
                        (typeof m === 'object' ? m.nome : m) === modificacao.nome
                      );
                      const uniqueKey = modificacao.id || modificacao.nome;
                      return (
                        <div 
                          key={uniqueKey} 
                          className={`modal-item ${jaAplicada ? 'already-added' : ''}`}
                          onClick={() => !jaAplicada && addModificacaoToWeapon(modificacao)}
                        >
                          <div className="modal-item-header">
                            <div className="modal-item-name">{modificacao.nome}</div>
                            {modificacao.descricao && (
                              <div className="modal-item-desc">{modificacao.descricao}</div>
                            )}
                          </div>
                          <div className="modal-item-details">
                            <span className={`detail-badge ${modificacao.tipo === 'arma' ? 'arma' : 'municao'}`}>
                              {modificacao.tipo === 'arma' ? '⚔️ Arma' : '🔫 Munição'}
                            </span>
                            {modificacao.aplicacao && (
                              <span className="detail-badge aplicacao">📋 {modificacao.aplicacao}</span>
                            )}
                            <span className="detail-badge efeito">✨ {modificacao.efeito}</span>
                            {jaAplicada && <span className="detail-badge already-badge">✓ Já Aplicada</span>}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

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
