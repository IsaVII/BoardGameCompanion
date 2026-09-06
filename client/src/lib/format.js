export function playerRange(game) {
  return game.minPlayers === game.maxPlayers
    ? `${game.minPlayers}`
    : `${game.minPlayers}–${game.maxPlayers}`;
}

export function timeRange(game) {
  return game.minTime === game.maxTime
    ? `${game.minTime} min`
    : `${game.minTime}–${game.maxTime} min`;
}

export function weightLabel(w) {
  if (w < 1.6) return 'Light';
  if (w < 2.5) return 'Medium-light';
  if (w < 3.2) return 'Medium';
  if (w < 4) return 'Medium-heavy';
  return 'Heavy';
}

export function relativeDate(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 60) return 'last month';
  return `${Math.floor(days / 30)} months ago`;
}

export function pct(n) {
  return `${Math.round(n * 100)}%`;
}
