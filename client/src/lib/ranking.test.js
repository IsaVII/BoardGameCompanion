import { describe, it, expect } from 'vitest';
import { rankGames } from './ranking';

const game = (o) => ({
  id: o.title, title: o.title, minPlayers: 2, maxPlayers: 4,
  minTime: 30, maxTime: 45, weight: 2, mood: 'strategy', ...o,
});

const shelf = [
  game({ title: 'Fits' }),
  game({ title: 'TooManyPlayers', minPlayers: 5, maxPlayers: 6 }),
  game({ title: 'TooLong', minTime: 120, maxTime: 180 }),
  game({ title: 'TooHeavy', weight: 4.5 }),
  game({ title: 'WrongMood', mood: 'party' }),
];

describe('rankGames', () => {
  it('drops games that do not fit the constraints', () => {
    const out = rankGames(shelf, { players: 3, minutes: 60, mood: 'strategy', maxWeight: 3 });
    expect(out.map((r) => r.game.title)).toEqual(['Fits']);
  });

  it('ignores mood when set to any', () => {
    const out = rankGames(shelf, { players: 3, minutes: 60, mood: 'any', maxWeight: 3 });
    expect(out.map((r) => r.game.title).sort()).toEqual(['Fits', 'WrongMood']);
  });

  it('ranks a rested game above a recently played one', () => {
    const two = [game({ title: 'Fresh' }), game({ title: 'Stale' })];
    const plays = [{ gameId: 'Stale', date: new Date().toISOString().slice(0, 10) }];
    const out = rankGames(two, { players: 3, minutes: 60, mood: 'any', maxWeight: 5 }, plays);
    expect(out[0].game.title).toBe('Fresh');
  });
});
