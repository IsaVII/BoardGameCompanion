import { describe, it, expect } from 'vitest';
import { conditionAdjusted, collectionValue, formatMoney } from './value';

describe('conditionAdjusted', () => {
  it('applies the per-condition factor', () => {
    expect(conditionAdjusted({ estimatedValue: 100, condition: 'mint' })).toBe(100);
    expect(conditionAdjusted({ estimatedValue: 100, condition: 'worn' })).toBeCloseTo(55);
    expect(conditionAdjusted({ estimatedValue: 100, condition: 'damaged' })).toBeCloseTo(30);
  });

  it('defaults to the "good" factor for a missing/unknown condition', () => {
    expect(conditionAdjusted({ estimatedValue: 100 })).toBeCloseTo(80);
    expect(conditionAdjusted({ estimatedValue: 100, condition: 'nonsense' })).toBeCloseTo(80);
  });

  it('treats a missing value as zero', () => {
    expect(conditionAdjusted({ condition: 'mint' })).toBe(0);
  });
});

describe('collectionValue', () => {
  it('rolls up count, sticker and resale (rounded)', () => {
    const games = [
      { estimatedValue: 50, condition: 'mint' },
      { estimatedValue: 50, condition: 'worn' },
    ];
    expect(collectionValue(games)).toEqual({ count: 2, sticker: 100, resale: 78 });
  });

  it('handles an empty shelf', () => {
    expect(collectionValue([])).toEqual({ count: 0, sticker: 0, resale: 0 });
  });
});

describe('formatMoney', () => {
  it('formats with a $ prefix, rounding and grouping the amount', () => {
    // Grouping separator is locale-dependent, so compare on the digits.
    expect(formatMoney(1234.6).replace(/\D/g, '')).toBe('1235');
    expect(formatMoney(1234.6).startsWith('$')).toBe(true);
    expect(formatMoney(0)).toBe('$0');
  });
});
