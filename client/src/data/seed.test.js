import { describe, it, expect } from 'vitest';
import { buildSeed } from './seed';
import { rankGames } from '../lib/ranking';
import { leaderboard } from '../lib/stats';

describe('buildSeed', () => {
  const seed = buildSeed();

  it('produces a coherent starter dataset', () => {
    expect(seed.games.length).toBeGreaterThan(0);
    expect(seed.players.length).toBeGreaterThan(0);
    expect(seed.plays.length).toBeGreaterThan(0);
  });

  it('gives every entity a unique id', () => {
    const ids = [...seed.games, ...seed.players, ...seed.plays, ...seed.loans, ...seed.wishlist].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real game and player ids from plays', () => {
    const gameIds = new Set(seed.games.map((g) => g.id));
    const playerIds = new Set(seed.players.map((p) => p.id));
    for (const play of seed.plays) {
      expect(gameIds.has(play.gameId)).toBe(true);
      for (const pid of [...play.playerIds, ...play.winnerIds]) {
        expect(playerIds.has(pid)).toBe(true);
      }
    }
  });

  it('feeds the ranking and stats logic without throwing', () => {
    expect(() => rankGames(seed.games, { players: 3, minutes: 60, mood: 'any' }, seed.plays)).not.toThrow();
    expect(() => leaderboard(seed.plays, seed.players)).not.toThrow();
  });
});
