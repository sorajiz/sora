import { describe, it, expect } from 'vitest';
import { formatBrandMoney, parseMoneyMinor } from '@/lib/domain/money';
import moneyFixtures from '../../../../contracts/menu/fixtures/text/money.json';

describe('Pade Brand Money Formatter (§S3)', () => {
  it('matches all golden test vectors in contracts/menu/fixtures/text/money.json', () => {
    for (const tc of moneyFixtures.test_cases) {
      const result = formatBrandMoney(tc.input_minor);
      expect(result).toBe(tc.expected);
    }
  });

  it('correctly handles edge cases and nullish values', () => {
    expect(formatBrandMoney(null)).toBe('');
    expect(formatBrandMoney(undefined)).toBe('');
    expect(formatBrandMoney(0)).toBe('₫0');
    expect(formatBrandMoney('0')).toBe('₫0');
    expect(formatBrandMoney(BigInt(0))).toBe('₫0');
    expect(formatBrandMoney(-5000)).toBe('₫0');
    expect(formatBrandMoney('invalid')).toBe('₫0');
  });

  it('correctly parses input to minor units BigInt', () => {
    expect(parseMoneyMinor(90000)).toBe(BigInt(90000));
    expect(parseMoneyMinor('₫99.000')).toBe(BigInt(99000));
    expect(parseMoneyMinor('1.500.000 VND')).toBe(BigInt(1500000));
    expect(parseMoneyMinor('')).toBe(BigInt(0));
    expect(parseMoneyMinor(-100)).toBe(BigInt(0));
  });
});
