import { useState } from 'react';
import { rollDice, rollFormula } from '../utils/diceRoller';
import './DiceRoller.css';

function DiceRoller() {
  const [quantity, setQuantity] = useState(1);
  const [sides, setSides] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [results, setResults] = useState([]);

  const commonDice = [4, 6, 8, 10, 12, 20, 100];

  const handleRoll = () => {
    const rolls = rollDice(quantity, sides);
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + modifier;

    const result = {
      id: Date.now(),
      rolls,
      quantity,
      sides,
      modifier,
      sum,
      total,
      formula: `${quantity}d${sides}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setResults([result, ...results]);
  };

  const handleQuickRoll = (q, s) => {
    const rolls = rollDice(q, s);
    const sum = rolls.reduce((a, b) => a + b, 0);

    const result = {
      id: Date.now(),
      rolls,
      quantity: q,
      sides: s,
      modifier: 0,
      sum,
      total: sum,
      formula: `${q}d${s}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setResults([result, ...results]);
  };

  const clearHistory = () => {
    setResults([]);
  };

  return (
    <div className="dice-roller">
      <h1>🎲 Rolagem de Dados</h1>

      <div className="roller-container">
        <div className="roller-controls card">
          <h2>Rolagem Personalizada</h2>
          
          <div className="form-group">
            <label>Quantidade de Dados</label>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="form-group">
            <label>Lados do Dado</label>
            <input
              type="number"
              min="2"
              max="100"
              value={sides}
              onChange={(e) => setSides(parseInt(e.target.value) || 20)}
            />
          </div>

          <div className="form-group">
            <label>Modificador</label>
            <input
              type="number"
              min="-20"
              max="20"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            />
          </div>

          <button onClick={handleRoll} className="roll-button">
            Rolar {quantity}d{sides}{modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}
          </button>

          <div className="quick-rolls">
            <h3>Rolagens Rápidas</h3>
            <div className="dice-buttons">
              {commonDice.map(d => (
                <button
                  key={d}
                  onClick={() => handleQuickRoll(1, d)}
                  className="dice-button"
                >
                  d{d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="results-container">
          <div className="results-header">
            <h2>Histórico de Rolagens</h2>
            {results.length > 0 && (
              <button onClick={clearHistory} className="clear-button">
                Limpar Histórico
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="no-results">
              Nenhuma rolagem ainda. Role os dados para começar!
            </div>
          ) : (
            <div className="results-list">
              {results.map((result) => (
                <div key={result.id} className="result-item card">
                  <div className="result-header">
                    <span className="result-formula">{result.formula}</span>
                    <span className="result-time">{result.timestamp}</span>
                  </div>
                  <div className="result-details">
                    <div className="rolls">
                      Dados: [{result.rolls.join(', ')}]
                    </div>
                    {result.modifier !== 0 && (
                      <div className="modifier-display">
                        Modificador: {result.modifier > 0 ? '+' : ''}{result.modifier}
                      </div>
                    )}
                    <div className={`result-total ${result.rolls.includes(result.sides) ? 'critical' : ''} ${result.rolls.includes(1) && result.quantity === 1 ? 'fumble' : ''}`}>
                      Total: {result.total}
                      {result.rolls.includes(result.sides) && result.quantity === 1 && ' 🔥 CRÍTICO!'}
                      {result.rolls.includes(1) && result.quantity === 1 && result.sides === 20 && ' 💀 FALHA!'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiceRoller;
