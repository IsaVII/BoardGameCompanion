// Play-log analytics — pure functions over plays[] / games[] / players[].

export function totalPlays(plays) {
  return plays.length;
}

export function totalHours(plays) {
  return Math.round((plays.reduce((s, p) => s + (p.minutes || 0), 0) / 60) * 10) / 10;
}

export function mostPlayed(plays, games, limit = 5) {
  const counts = new Map();
  for (const p of plays) counts.set(p.gameId, (counts.get(p.gameId) || 0) + 1);
  return [...counts.entries()]
    .map(([gameId, count]) => ({
      gameId,
      title: games.find((g) => g.id === gameId)?.title ?? 'Unknown',
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Competitive win-rate per player (co-op wins are excluded from the ratio). */
export function leaderboard(plays, players) {
  const stat = new Map(players.map((p) => [p.id, { id: p.id, name: p.name, plays: 0, wins: 0 }]));
  for (const p of plays) {
    if (p.cooperativeWin) continue;
    for (const pid of p.playerIds) {
      const s = stat.get(pid);
      if (!s) continue;
      s.plays += 1;
      if (p.winnerIds.includes(pid)) s.wins += 1;
    }
  }
  return [...stat.values()]
    .map((s) => ({ ...s, winRate: s.plays ? s.wins / s.plays : 0 }))
    .sort((a, b) => b.winRate - a.winRate || b.plays - a.plays);
}

/** Longest run of consecutive competitive wins, scanning plays oldest→newest. */
export function longestWinStreak(plays, players) {
  const ordered = [...plays]
    .filter((p) => !p.cooperativeWin)
    .sort((a, b) => a.date.localeCompare(b.date));
  const best = new Map();
  const current = new Map();
  for (const p of ordered) {
    for (const pid of p.playerIds) {
      if (p.winnerIds.includes(pid)) {
        const n = (current.get(pid) || 0) + 1;
        current.set(pid, n);
        if (n > (best.get(pid) || 0)) best.set(pid, n);
      } else {
        current.set(pid, 0);
      }
    }
  }
  let top = null;
  for (const [pid, streak] of best.entries()) {
    if (!top || streak > top.streak) {
      top = { id: pid, name: players.find((x) => x.id === pid)?.name ?? '?', streak };
    }
  }
  return top;
}

/** { 'YYYY-MM': count } for the last `months` months, oldest first. */
export function playsPerMonth(plays, months = 6) {
  const out = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ month: key, count: plays.filter((p) => p.date.startsWith(key)).length });
  }
  return out;
}
