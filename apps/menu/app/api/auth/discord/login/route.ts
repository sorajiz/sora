import { NextRequest, NextResponse } from "next/server";
import {
  generateOAuthState,
  generatePKCE,
  buildDiscordAuthorizeUrl,
  validateReturnTo,
} from "../../../../../lib/auth/oauth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo = validateReturnTo(rawReturnTo);

  const state = generateOAuthState();
  const { codeVerifier, codeChallenge } = generatePKCE();

  const authorizeUrl = buildDiscordAuthorizeUrl({ state, codeChallenge });

  const res = NextResponse.redirect(authorizeUrl);

  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 minutes
  };

  res.cookies.set("pade_oauth_state", state, cookieOptions);
  res.cookies.set("pade_oauth_verifier", codeVerifier, cookieOptions);
  res.cookies.set("pade_oauth_return", returnTo, cookieOptions);

  return res;
}
