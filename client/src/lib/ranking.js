// Game night picker — pure ranking logic. No React, no Redux.

/**
 * @typedef {Object} Constraints
 * @property {number} players
 * @property {number} minutes      max minutes available
 * @property {string} mood         'any' | 'strategy' | 'competitive' | 'cooperative' | 'party'
 * @property {number} [maxWeight]  1..5
 */

const DAY = 86400000;

function lastPlayed(gameId, plays) {
  let latest = null;
  for (const p of plays) {
    if (p.gameId === gameId && (!latest || p.date > latest)) latest = p.date;
  }
  return latest;
}

/**
 * Filter the shelf to games that physically fit tonight's constraints,
 * then score each so the best pick sorts first.
 *
 * @param {Array} games
 * @param {Constraints} c
 * @param {Array} plays   used for a mild "play something fresh" nudge
 * @returns {Array<{game:Object, score:number, reasons:string[]}>}
 */
export function rankGames(games, c, plays = []) {
  const maxWeight = c.maxWeight ?? 5;
  const results = [];

  for (const game of games) {
    if (c.players < game.minPlayers || c.players > game.maxPlayers) continue;
    if (game.minTime > c.minutes) continue;
    if (game.weight > maxWeight + 0.001) continue;
    if (c.mood !== 'any' && game.mood !== c.mood) continue;

    const reasons = [];
    let score = 100;

    // Tighter player fit is better (prefer games designed around this count).
    const span = game.maxPlayers - game.minPlayers || 1;
    const playerFit = 1 - Math.abs((game.minPlayers + game.maxPlayers) / 2 - c.players) / (span + 1);
    score += playerFit * 20;
    if (playerFit > 0.75) reasons.push(`great at ${c.players} players`);

    // Use the time you have without blowing past it.
    const typical = (game.minTime + game.maxTime) / 2;
    if (typical <= c.minutes) {
      score += 15 * (1 - Math.abs(c.minutes - typical) / c.minutes);
      reasons.push(`~${Math.round(typical)} min`);
    } else {
      score -= 10;
      reasons.push('may run long');
    }

    // Freshness nudge: haven't played it recently → small boost.
    const lp = lastPlayed(game.id, plays);
    if (!lp) {
      score += 8;
      reasons.push('never logged');
    } else {
      const days = Math.floor((Date.now() - new Date(lp).getTime()) / DAY);
      if (days > 30) {
        score += 6;
        reasons.push(`rested ${days} days`);
      } else {
        score -= 4;
        reasons.push(`played ${days}d ago`);
      }
    }

    results.push({ game, score: Math.round(score), reasons });
  }

  return results.sort((a, b) => b.score - a.score || a.game.title.localeCompare(b.game.title));
}
