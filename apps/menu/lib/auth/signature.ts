import crypto from "crypto";
import { getEnv } from "../env";

const replayCache = new Map<string, number>(); // eventId -> expiresAt

// Periodic sweep of replay cache
setInterval(() => {
  const now = Date.now();
  for (const [key, expiresAt] of replayCache.entries()) {
    if (expiresAt < now) {
      replayCache.delete(key);
    }
  }
}, 60000);

export function verifySignedRequest(params: {
  rawBody: string;
  signatureHeader: string | null;
  eventId?: string;
}): { valid: boolean; reason?: string } {
  if (!params.signatureHeader) {
    return { valid: false, reason: "Missing X-Pade-Signature header" };
  }

  // Parse t=<unix>,v1=<hex>
  const parts = params.signatureHeader.split(",");
  let tStr: string | undefined;
  let v1Hex: string | undefined;

  for (const part of parts) {
    const [k, v] = part.trim().split("=");
    if (k === "t") tStr = v;
    if (k === "v1") v1Hex = v;
  }

  if (!tStr || !v1Hex) {
    return { valid: false, reason: "Malformed signature header" };
  }

  const timestamp = parseInt(tStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: "Invalid timestamp in signature" };
  }

  // Check clock skew (max 300 seconds per §S10)
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > 300) {
    return { valid: false, reason: "Clock skew exceeded 300s" };
  }

  // Replay protection check
  if (params.eventId) {
    if (replayCache.has(params.eventId)) {
      return { valid: false, reason: "Replayed event_id detected" };
    }
    // Store in cache for 10 minutes
    replayCache.set(params.eventId, Date.now() + 10 * 60 * 1000);
  }

  const payloadToSign = `${tStr}.${params.rawBody}`;
  const env = getEnv();

  // Try current secret
  const secretsToTry = [
    env.MENU_INTERNAL_API_SECRET,
    env.MENU_INTERNAL_API_SECRET_PREVIOUS,
  ].filter(Boolean) as string[];

  for (const secret of secretsToTry) {
    const expected = crypto.createHmac("sha256", secret).update(payloadToSign).digest("hex");
    if (crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1Hex, "hex"))) {
      return { valid: true };
    }
  }

  return { valid: false, reason: "Invalid HMAC signature" };
}

export function signInternalPayload(rawBody: string, secret: string, timestamp?: number): string {
  const t = timestamp ?? Math.floor(Date.now() / 1000);
  const payloadToSign = `${t}.${rawBody}`;
  const hmac = crypto.createHmac("sha256", secret).update(payloadToSign).digest("hex");
  return `t=${t},v1=${hmac}`;
}

