import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const sessionToken =
      req.cookies.get("__Host-pade_session")?.value ||
      req.cookies.get("pade_session")?.value;

    if (!sessionToken) {
      const returnTo = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/api/auth/discord/login?returnTo=${returnTo}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
