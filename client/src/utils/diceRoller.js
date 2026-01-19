// Sistema de rolagem de dados
export const rollDice = (quantity, sides) => {
  const rolls = [];
  for (let i = 0; i < quantity; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
};

export const rollD20 = () => rollDice(1, 20)[0];

export const rollAttribute = (attributeValue, skillBonus = 0) => {
  const roll = rollD20();
  const total = roll + attributeValue + skillBonus;
  return {
    roll,
    attributeValue,
    skillBonus,
    total,
    isCritical: roll === 20,
    isFumble: roll === 1
  };
};

export const parseDiceFormula = (formula) => {
  // Suporta formatos como: 1d6, 2d10, 3d8+5, 1d12-2
  const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return null;
  
  const quantity = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  
  return { quantity, sides, modifier };
};

export const rollFormula = (formula) => {
  const parsed = parseDiceFormula(formula);
  if (!parsed) return null;
  
  const rolls = rollDice(parsed.quantity, parsed.sides);
  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + parsed.modifier;
  
  return {
    rolls,
    modifier: parsed.modifier,
    total,
    formula
  };
};

export const calculateDamage = (weaponDamage, attributeBonus = 0) => {
  const result = rollFormula(weaponDamage);
  if (!result) return null;
  
  return {
    ...result,
    total: result.total + attributeBonus,
    attributeBonus
  };
};
