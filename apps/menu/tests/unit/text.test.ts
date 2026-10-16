import { describe, it, expect } from 'vitest';
import {
  sanitizeBrandText,
  countGraphemes,
  truncateGraphemes,
  slugifyVietnamese,
  foldVietnamese,
  isValidSku,
  isValidSlug
} from '@/lib/domain/text';
import unicodeFixtures from '../../../../contracts/menu/fixtures/text/unicode.json';

describe('Pade Text Integrity & Sanitization (§S4, §S11b)', () => {
  it('strips NUL, C0/C1 control characters and bidi overrides while keeping newlines and tabs', () => {
    const dirty = 'Hello\u0000 World\u0007!\nLine 2\tTabbed\u202eReversed\u2066Isolate';
    const clean = sanitizeBrandText(dirty);
    expect(clean).toBe('Hello World!\nLine 2\tTabbedReversedIsolate');
  });

  it('preserves all decorative brand glyphs and combining sequences byte-for-byte', () => {
    const glyphs = unicodeFixtures.brand_glyphs;
    expect(sanitizeBrandText(glyphs)).toBe(glyphs);

    for (const sample of unicodeFixtures.brand_samples) {
      expect(sanitizeBrandText(sample)).toBe(sample);
    }

    const combining = unicodeFixtures.combining_sequence;
    expect(sanitizeBrandText(combining)).toBe(combining);
  });

  it('correctly counts grapheme clusters (UAX #29)', () => {
    // Brand glyphs with combining marks
    expect(countGraphemes('𐙚')).toBe(1);
    expect(countGraphemes('𓆩 Nitro 𓆪')).toBe(9);
    expect(countGraphemes('cà phê')).toBe(6);
  });

  it('truncates on grapheme boundaries without breaking combining marks', () => {
    const text = 'một chút xinh xắn 𐙚 ✧';
    const truncated = truncateGraphemes(text, 10, '…');
    expect(countGraphemes(truncated)).toBeLessThanOrEqual(10);
    expect(truncated.endsWith('…')).toBe(true);
  });

  it('slugifyVietnamese creates valid URL-safe slugs with Vietnamese transliteration', () => {
    expect(slugifyVietnamese('Nitro Boosts Đẹp 1 Tháng')).toBe('nitro-boosts-dep-1-thang');
    expect(slugifyVietnamese('Cà Phê Sữa Đá & Trà Đào')).toBe('ca-phe-sua-da-tra-dao');
    expect(slugifyVietnamese('---Special---Discount---')).toBe('special-discount');
  });

  it('foldVietnamese performs accent-insensitive folding for search', () => {
    expect(foldVietnamese('Cà Phê')).toBe('ca phe');
    expect(foldVietnamese('Đăng Nhập')).toBe('dang nhap');
    expect(foldVietnamese('ĐƯỢC')).toBe('duoc');
  });

  it('validates SKU format strictly matching ^[A-Z0-9][A-Z0-9-]{1,31}$', () => {
    expect(isValidSku('NITRO-1M')).toBe(true);
    expect(isValidSku('BOOSTS-X2')).toBe(true);
    expect(isValidSku('A1')).toBe(true);
    expect(isValidSku('lowercase-sku')).toBe(false);
    expect(isValidSku('-INVALID')).toBe(false);
    expect(isValidSku('SKU_WITH_UNDERSCORE')).toBe(false);
  });

  it('validates Slug format strictly', () => {
    expect(isValidSlug('nitro-boosts-1-thang')).toBe(true);
    expect(isValidSlug('simple')).toBe(true);
    expect(isValidSlug('-invalid-start')).toBe(false);
    expect(isValidSlug('invalid-end-')).toBe(false);
    expect(isValidSlug('Invalid_Capital')).toBe(false);
  });
});
