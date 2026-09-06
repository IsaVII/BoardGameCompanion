// Collection value roll-up, adjusted for condition (resale-market oriented).

const CONDITION_FACTOR = { mint: 1, good: 0.8, worn: 0.55, damaged: 0.3 };

export function conditionAdjusted(game) {
  return (game.estimatedValue || 0) * (CONDITION_FACTOR[game.condition] ?? 0.8);
}

export function collectionValue(games) {
  const sticker = games.reduce((s, g) => s + (g.estimatedValue || 0), 0);
  const resale = games.reduce((s, g) => s + conditionAdjusted(g), 0);
  return {
    count: games.length,
    sticker: Math.round(sticker),
    resale: Math.round(resale),
  };
}

export function formatMoney(n) {
  return `$${Math.round(n).toLocaleString()}`;
}
