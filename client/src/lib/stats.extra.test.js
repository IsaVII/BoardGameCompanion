import { describe, it, expect, vi, afterEach } from 'vitest';
import { totalPlays, totalHours, mostPlayed, playsPerMonth } from './stats';

const plays = [
  { gameId: 'x', date: '2026-03-04', minutes: 40 },
  { gameId: 'x', date: '2026-02-20', minutes: 50 },
  { gameId: 'y', date: '2026-01-10', minutes: 30 },
];

describe('totalPlays / totalHours', () => {
  it('counts plays', () => {
    expect(totalPlays(plays)).toBe(3);
  });
  it('sums minutes into rounded hours', () => {
    expect(totalHours(plays)).toBe(2);
    expect(totalHours([])).toBe(0);
  });
});

describe('mostPlayed', () => {
  it('ranks by play count and joins titles', () => {
    const out = mostPlayed(plays, [{ id: 'x', title: 'X' }]);
    expect(out[0]).toMatchObject({ gameId: 'x', title: 'X', count: 2 });
    expect(out[1]).toMatchObject({ gameId: 'y', title: 'Unknown', count: 1 });
  });

  it('honours the limit', () => {
    expect(mostPlayed(plays, [], 1)).toHaveLength(1);
  });
});

describe('playsPerMonth', () => {
  afterEach(() => vi.useRealTimers());

  it('returns one bucket per month, oldest first, counting by YYYY-MM prefix', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T00:00:00Z'));
    const out = playsPerMonth(plays, 3);
    expect(out.map((m) => m.month)).toEqual(['2026-01', '2026-02', '2026-03']);
    expect(out.map((m) => m.count)).toEqual([1, 1, 1]);
  });
});
