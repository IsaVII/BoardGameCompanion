import { describe, it, expect, vi, afterEach } from 'vitest';
import { playerRange, timeRange, weightLabel, relativeDate, pct } from './format';

describe('playerRange', () => {
  it('collapses a fixed player count', () => {
    expect(playerRange({ minPlayers: 4, maxPlayers: 4 })).toBe('4');
  });
  it('shows a range otherwise', () => {
    expect(playerRange({ minPlayers: 2, maxPlayers: 5 })).toBe('2–5');
  });
});

describe('timeRange', () => {
  it('collapses a fixed time', () => {
    expect(timeRange({ minTime: 30, maxTime: 30 })).toBe('30 min');
  });
  it('shows a range otherwise', () => {
    expect(timeRange({ minTime: 30, maxTime: 60 })).toBe('30–60 min');
  });
});

describe('weightLabel', () => {
  it('maps weight buckets to labels', () => {
    expect(weightLabel(1.2)).toBe('Light');
    expect(weightLabel(2.0)).toBe('Medium-light');
    expect(weightLabel(3.0)).toBe('Medium');
    expect(weightLabel(3.5)).toBe('Medium-heavy');
    expect(weightLabel(4.5)).toBe('Heavy');
  });
});

describe('relativeDate', () => {
  afterEach(() => vi.useRealTimers());

  it('describes recent dates in words', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'));
    expect(relativeDate('2026-03-01T00:00:00Z')).toBe('today');
    expect(relativeDate('2026-02-28T00:00:00Z')).toBe('yesterday');
    expect(relativeDate('2026-02-20T00:00:00Z')).toBe('9 days ago');
    expect(relativeDate('2026-01-15T00:00:00Z')).toBe('last month');
    expect(relativeDate('2025-11-01T00:00:00Z')).toBe('4 months ago');
  });
});

describe('pct', () => {
  it('renders a rounded percentage', () => {
    expect(pct(0.333)).toBe('33%');
    expect(pct(1)).toBe('100%');
  });
});
