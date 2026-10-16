import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForDiscordUser,
  validateReturnTo,
} from "../../../../../lib/auth/oauth";
import {
  createSession,
  SESSION_COOKIE_NAME,
  ABSOLUTE_TIMEOUT_MS,
} from "../../../../../lib/auth/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.warn("[Discord OAuth callback error]:", error);
    return NextResponse.redirect(new URL("/?auth=cancelled", req.url));
  }

  const savedState = req.cookies.get("pade_oauth_state")?.value;
  const codeVerifier = req.cookies.get("pade_oauth_verifier")?.value;
  const returnTo = validateReturnTo(req.cookies.get("pade_oauth_return")?.value);

  if (!code || !state || !savedState || state !== savedState || !codeVerifier) {
    console.error("[OAuth Validation Failed]: Mismatched state or missing code/verifier");
    return NextResponse.redirect(new URL("/?auth=error&reason=invalid_state", req.url));
  }

  try {
    const user = await exchangeCodeForDiscordUser({ code, codeVerifier });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || null;
    const userAgent = req.headers.get("user-agent") || null;

    const { rawToken } = await createSession({
      discordId: user.id,
      username: user.username,
      avatar: user.avatar,
      ip,
      userAgent,
    });

    const redirectUrl = new URL(returnTo, req.url);
    const res = NextResponse.redirect(redirectUrl);

    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set(SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(ABSOLUTE_TIMEOUT_MS / 1000),
    });

    // Clear OAuth state cookies
    res.cookies.delete("pade_oauth_state");
    res.cookies.delete("pade_oauth_verifier");
    res.cookies.delete("pade_oauth_return");

    return res;
  } catch (err: any) {
    console.error("[Discord OAuth Exchange Error]:", err.message);
    return NextResponse.redirect(new URL("/?auth=error&reason=exchange_failed", req.url));
  }
}
