import { decimalsFor, majorToMinor, minorToMajor, convert } from '../src/utils/currency';

describe('currency utils', () => {
  test('decimals for common currencies returns non-negative integers', () => {
    expect(Number.isInteger(decimalsFor('USD'))).toBe(true);
    expect(decimalsFor('USD')).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(decimalsFor('EUR'))).toBe(true);
    expect(decimalsFor('EUR')).toBeGreaterThanOrEqual(0);
  });

  test('majorToMinor and minorToMajor round-trip for USD', () => {
    expect(majorToMinor(1.23, 'USD')).toBe(123);
    expect(minorToMajor(123, 'USD')).toBeCloseTo(1.23, 2);
  });

  test('convert between currencies using rates', () => {
    const rates = {
      base: 'USD',
      values: {
        USD: 1,
        EUR: 0.5,
      },
      updatedAt: Date.now(),
    };

    // 100 minor USD == $1.00 -> convert to EUR: 1 USD -> 0.5 EUR -> 0.50 EUR => 50 minor EUR
    const result = convert(100, 'USD', 'EUR', rates as any);
    expect(result).toBe(50);
  });
});
