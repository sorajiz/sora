/**
 * Pade Store Brand Money Formatter (§S3)
 * Exact format: ₫99.000 (symbol first, '.' as thousands separator).
 * Golden-tested against fixtures/text/money.json.
 */

export function formatBrandMoney(amountMinor: number | bigint | string | null | undefined): string {
  if (amountMinor === null || amountMinor === undefined) return "";
  
  let val: bigint;
  if (typeof amountMinor === "bigint") {
    val = amountMinor;
  } else if (typeof amountMinor === "number") {
    if (isNaN(amountMinor)) return "₫0";
    val = BigInt(Math.round(amountMinor));
  } else {
    const trimmed = String(amountMinor).trim();
    if (!trimmed) return "";
    try {
      val = BigInt(trimmed);
    } catch {
      return "₫0";
    }
  }

  if (val < BigInt(0)) val = BigInt(0);

  // Format with '.' thousands separator
  const numStr = val.toString();
  const formatted = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return `₫${formatted}`;
}

export function parseMoneyMinor(input: string | number): bigint {
  if (typeof input === "number") {
    return BigInt(Math.max(0, Math.round(input)));
  }
  const clean = input.replace(/[^\d]/g, "");
  if (!clean) return BigInt(0);
  return BigInt(clean);
}
