import { describe, it, expect } from 'vitest';
import { leaderboard, longestWinStreak, mostPlayed } from './stats';

const players = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }];
const plays = [
  { gameId: 'x', date: '2026-01-01', playerIds: ['a', 'b'], winnerIds: ['a'], cooperativeWin: false },
  { gameId: 'x', date: '2026-01-02', playerIds: ['a', 'b'], winnerIds: ['a'], cooperativeWin: false },
  { gameId: 'y', date: '2026-01-03', playerIds: ['a', 'b'], winnerIds: ['b'], cooperativeWin: false },
  { gameId: 'z', date: '2026-01-04', playerIds: ['a', 'b'], winnerIds: ['a', 'b'], cooperativeWin: true },
];

describe('stats', () => {
  it('computes competitive win rate, excluding co-op wins', () => {
    const board = leaderboard(plays, players);
    const a = board.find((p) => p.id === 'a');
    expect(a.plays).toBe(3);
    expect(a.wins).toBe(2);
  });

  it('finds the longest win streak', () => {
    expect(longestWinStreak(plays, players)).toMatchObject({ id: 'a', streak: 2 });
  });

  it('ranks most played games', () => {
    expect(mostPlayed(plays, [{ id: 'x', title: 'X' }])[0]).toMatchObject({ gameId: 'x', count: 2 });
  });
});
