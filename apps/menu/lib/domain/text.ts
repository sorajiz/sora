/**
 * Pade Store Text Integrity & Processing (§S4, §S11b)
 * Preserves exact combining marks and brand glyphs without normalization.
 * Strips dangerous controls (NUL, C0/C1 except \n and \t, bidi overrides).
 */

const BANNED_CONTROL_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;

export function sanitizeBrandText(input: string | null | undefined): string {
  if (!input) return "";
  // Strip banned control characters without modifying valid combining marks or emoji
  return input.replace(BANNED_CONTROL_REGEX, "");
}

/**
 * Grapheme cluster counter using Intl.Segmenter (UAX #29)
 */
export function countGraphemes(text: string): number {
  if (!text) return 0;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new (Intl as any).Segmenter("vi", { granularity: "grapheme" });
    let count = 0;
    for (const _ of segmenter.segment(text)) {
      count++;
    }
    return count;
  }
  // Fallback if Segmenter is unavailable
  return Array.from(text).length;
}

/**
 * Truncate on grapheme boundaries with optional ellipsis inside the limit
 */
export function truncateGraphemes(text: string, maxLimit: number, ellipsis = "…"): string {
  if (!text) return "";
  const total = countGraphemes(text);
  if (total <= maxLimit) return text;

  const targetLimit = maxLimit - countGraphemes(ellipsis);
  if (targetLimit <= 0) return ellipsis.slice(0, maxLimit);

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new (Intl as any).Segmenter("vi", { granularity: "grapheme" });
    let result = "";
    let count = 0;
    for (const { segment } of segmenter.segment(text)) {
      if (count >= targetLimit) break;
      result += segment;
      count++;
    }
    return result + ellipsis;
  }

  return Array.from(text).slice(0, targetLimit).join("") + ellipsis;
}

/**
 * Vietnamese-aware transliteration for slugs and accent-insensitive search
 */
export function slugifyVietnamese(input: string): string {
  if (!input) return "";
  let str = input.toLowerCase();

  // Convert đ to d
  str = str.replace(/đ/g, "d");

  // Decompose and strip diacritics
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remove all non-alphanumeric characters except space and hyphen
  str = str.replace(/[^a-z0-9\s-]/g, "");

  // Collapse whitespace and hyphens
  str = str.trim().replace(/[\s-]+/g, "-");

  // Strip leading/trailing hyphens
  str = str.replace(/^-+|-+$/g, "");

  // Cap at 64 characters
  return str.slice(0, 64);
}

/**
 * Fold Vietnamese accents for fast in-memory search
 */
export function foldVietnamese(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Validate SKU format (§S3: ^[A-Z0-9][A-Z0-9-]{1,31}$)
 */
export function isValidSku(sku: string): boolean {
  return /^[A-Z0-9][A-Z0-9-]{1,31}$/.test(sku);
}

/**
 * Validate Slug format (§S3: ^[a-z0-9]+(-[a-z0-9]+)*$, <= 64 chars)
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 64) return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
