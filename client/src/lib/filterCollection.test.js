import { describe, it, expect } from 'vitest';
import { filterCollection } from './filterCollection';

const game = (o) => ({
  title: o.title, minPlayers: 2, maxPlayers: 4, minTime: 30, weight: 2, mood: 'strategy', ...o,
});

const shelf = [
  game({ title: 'Azul' }),
  game({ title: 'Codenames', minPlayers: 2, maxPlayers: 8, minTime: 15, weight: 1.3, mood: 'party' }),
  game({ title: 'Brass', minTime: 90, weight: 3.9 }),
];

const base = { query: '', players: 0, maxMinutes: 0, maxWeight: 0, mood: 'any' };

describe('filterCollection', () => {
  it('returns everything with the empty filter', () => {
    expect(filterCollection(shelf, base)).toHaveLength(3);
  });

  it('matches the title query case-insensitively', () => {
    expect(filterCollection(shelf, { ...base, query: '  aZ ' }).map((g) => g.title)).toEqual(['Azul']);
  });

  it('filters by player count against the game range', () => {
    expect(filterCollection(shelf, { ...base, players: 6 }).map((g) => g.title)).toEqual(['Codenames']);
  });

  it('drops games whose minimum time exceeds the budget', () => {
    expect(filterCollection(shelf, { ...base, maxMinutes: 60 }).map((g) => g.title)).toEqual(['Azul', 'Codenames']);
  });

  it('filters by max weight with a small tolerance', () => {
    expect(filterCollection(shelf, { ...base, maxWeight: 2 }).map((g) => g.title)).toEqual(['Azul', 'Codenames']);
  });

  it('filters by mood unless "any"', () => {
    expect(filterCollection(shelf, { ...base, mood: 'party' }).map((g) => g.title)).toEqual(['Codenames']);
  });
});
