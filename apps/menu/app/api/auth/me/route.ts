import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { resolveActor } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSession(token);
  const actor = await resolveActor(session);

  return NextResponse.json({
    authenticated: actor.role !== "GUEST",
    user: actor.role !== "GUEST" ? {
      discordId: actor.discordId,
      username: actor.username,
      avatar: actor.avatar,
      role: actor.role,
    } : null,
  });
}
