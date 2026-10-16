import crypto from "crypto";
import { query } from "../db";

export interface SessionData {
  sessionId: string;
  discordId: string;
  username: string;
  avatar: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-pade_session" : "pade_session";

export const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
export const ABSOLUTE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashAuditString(value: string | null | undefined): string | null {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

/**
 * Creates a server-side session in menu_web_sessions (§5.2)
 * Returns the raw session token for the HttpOnly cookie.
 */
export async function createSession(params: {
  discordId: string;
  username: string;
  avatar: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const hashedId = hashToken(rawToken);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + IDLE_TIMEOUT_MS);
  const ipHash = hashAuditString(params.ip);
  const uaHash = hashAuditString(params.userAgent);

  await query(
    `INSERT INTO menu_web_sessions (
      id, discord_id, username, avatar, created_at, last_seen_at, expires_at, ip_hash, user_agent_hash
    ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      last_seen_at = EXCLUDED.last_seen_at,
      expires_at = EXCLUDED.expires_at;`,
    [
      hashedId,
      String(params.discordId), // Strictly string
      params.username,
      params.avatar,
      now,
      expiresAt,
      ipHash,
      uaHash,
    ]
  );

  return { rawToken, expiresAt };
}

/**
 * Validates session token, rolls idle expiry, and returns session data
 */
export async function getSession(rawToken: string | null | undefined): Promise<SessionData | null> {
  if (!rawToken) return null;
  const hashedId = hashToken(rawToken);

  const rows = await query<{
    id: string;
    discord_id: string;
    username: string;
    avatar: string | null;
    created_at: Date;
    expires_at: Date;
  }>(
    `SELECT id, discord_id, username, avatar, created_at, expires_at
     FROM menu_web_sessions
     WHERE id = $1 AND expires_at > NOW();`,
    [hashedId]
  );

  if (rows.length === 0) return null;

  const session = rows[0];
  const now = new Date();
  // Check if within absolute timeout
  const createdAt = new Date(session.created_at);
  if (now.getTime() - createdAt.getTime() > ABSOLUTE_TIMEOUT_MS) {
    await deleteSession(rawToken);
    return null;
  }

  // Roll idle expiry
  const newExpiresAt = new Date(now.getTime() + IDLE_TIMEOUT_MS);
  query(
    `UPDATE menu_web_sessions SET last_seen_at = NOW(), expires_at = $2 WHERE id = $1;`,
    [hashedId, newExpiresAt]
  ).catch((err) => console.error("[Session update warning]:", err.message));

  return {
    sessionId: session.id,
    discordId: String(session.discord_id),
    username: session.username,
    avatar: session.avatar,
    createdAt: session.created_at,
    expiresAt: newExpiresAt,
  };
}

export async function deleteSession(rawToken: string): Promise<void> {
  const hashedId = hashToken(rawToken);
  await query(`DELETE FROM menu_web_sessions WHERE id = $1;`, [hashedId]);
}
