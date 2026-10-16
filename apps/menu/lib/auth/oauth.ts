import crypto from "crypto";
import { getEnv } from "../env";

export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function generatePKCE(): PKCEPair {
  // 64 random bytes -> 86 base64url characters (valid between 43 and 128 chars)
  const codeVerifier = crypto.randomBytes(48).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return { codeVerifier, codeChallenge };
}

/**
 * Validates returnTo path to prevent open redirects (§5.1)
 * Must be a same-origin relative path starting with '/', rejecting '//' or backslashes.
 */
export function validateReturnTo(returnTo: string | null | undefined): string {
  if (!returnTo) return "/";
  const trimmed = returnTo.trim();

  // Reject empty, protocol-relative (//), backslashes, or absolute URLs
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes(":") ||
    trimmed.includes("\0")
  ) {
    return "/";
  }

  return trimmed;
}

export function buildDiscordAuthorizeUrl(params: {
  state: string;
  codeChallenge: string;
}): string {
  const env = getEnv();
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", env.DISCORD_OAUTH_REDIRECT_URI);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "consent");

  return url.toString();
}

export interface DiscordUser {
  id: string; // Snowflake string
  username: string;
  avatar: string | null;
  global_name?: string | null;
}

/**
 * Exchanges OAuth authorization code for Discord user profile (§5.1).
 * Access token is used strictly ONCE and immediately discarded.
 */
export async function exchangeCodeForDiscordUser(params: {
  code: string;
  codeVerifier: string;
}): Promise<DiscordUser> {
  const env = getEnv();

  // 1. Exchange code for access token
  const body = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: env.DISCORD_OAUTH_REDIRECT_URI,
    code_verifier: params.codeVerifier,
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Discord OAuth token exchange failed: ${tokenRes.status} ${errText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error("Missing access_token in Discord response");
  }

  // 2. Fetch user profile
  try {
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      throw new Error(`Failed to fetch Discord user: ${userRes.status}`);
    }

    const userData = await userRes.json();
    return {
      id: String(userData.id), // Strictly string
      username: userData.global_name || userData.username,
      avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
    };
  } finally {
    // Access token is discarded; never stored or returned
  }
}
