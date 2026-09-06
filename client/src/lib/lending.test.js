import { describe, it, expect } from 'vitest';
import { daysOut, isOverdue, splitLoans } from './lending';

const DAY = 86400000;
const now = Date.parse('2026-03-01T00:00:00Z');
const ago = (d) => new Date(now - d * DAY).toISOString();

describe('daysOut', () => {
  it('counts days from lentAt to now for an active loan', () => {
    expect(daysOut({ lentAt: ago(10) }, now)).toBe(10);
  });

  it('counts days from lentAt to returnedAt for a closed loan', () => {
    expect(daysOut({ lentAt: ago(20), returnedAt: ago(5) }, now)).toBe(15);
  });
});

describe('isOverdue', () => {
  it('is false once returned', () => {
    expect(isOverdue({ lentAt: ago(90), returnedAt: ago(1) }, now)).toBe(false);
  });

  it('uses the default 30-day threshold', () => {
    expect(isOverdue({ lentAt: ago(29) }, now)).toBe(false);
    expect(isOverdue({ lentAt: ago(30) }, now)).toBe(true);
  });

  it('respects a custom reminderDays', () => {
    expect(isOverdue({ lentAt: ago(10), reminderDays: 7 }, now)).toBe(true);
  });
});

describe('splitLoans', () => {
  it('buckets loans into overdue / out / returned', () => {
    const loans = [
      { id: 'a', lentAt: ago(40) },
      { id: 'b', lentAt: ago(5) },
      { id: 'c', lentAt: ago(50), returnedAt: ago(2) },
    ];
    const { overdue, out, returned } = splitLoans(loans, now);
    expect(overdue.map((l) => l.id)).toEqual(['a']);
    expect(out.map((l) => l.id)).toEqual(['b']);
    expect(returned.map((l) => l.id)).toEqual(['c']);
  });
});
