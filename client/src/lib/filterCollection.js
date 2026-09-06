// The "very common use case" from the App Store reviews:
// filter your shelf by players, length, weight, and mood.
export function filterCollection(games, f) {
  const q = f.query.trim().toLowerCase();
  return games.filter((g) => {
    if (q && !g.title.toLowerCase().includes(q)) return false;
    if (f.players > 0 && (f.players < g.minPlayers || f.players > g.maxPlayers)) return false;
    if (f.maxMinutes > 0 && g.minTime > f.maxMinutes) return false;
    if (f.maxWeight > 0 && g.weight > f.maxWeight + 0.001) return false;
    if (f.mood !== 'any' && g.mood !== f.mood) return false;
    return true;
  });
}
