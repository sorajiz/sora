import crypto from "crypto";

const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateTraceId(): string {
  return crypto.randomUUID();
}

/**
 * Derives a 5-character Crockford Base32 string from a traceId (§S13).
 * Error references: PM-XXXXX (Website)
 */
export function deriveReferenceId(traceId: string, prefix = "PM"): string {
  const hash = crypto.createHash("sha256").update(traceId).digest();
  // Take first 4 bytes as unsigned integer
  const num = hash.readUInt32BE(0);
  
  let result = "";
  let current = num;
  for (let i = 0; i < 5; i++) {
    const idx = current % CROCKFORD_ALPHABET.length;
    result = CROCKFORD_ALPHABET[idx] + result;
    current = Math.floor(current / CROCKFORD_ALPHABET.length);
  }

  return `${prefix}-${result}`;
}
