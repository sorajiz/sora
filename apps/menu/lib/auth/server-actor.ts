import { NextRequest } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "./session";
import { resolveActor, requireAdmin, requirePermission } from "./rbac";
import { Actor } from "../types";

export async function getActorFromRequest(req: NextRequest): Promise<Actor> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSession(token);
  return await resolveActor(session);
}

export async function requireAdminFromRequest(req: NextRequest): Promise<Actor> {
  const actor = await getActorFromRequest(req);
  if (actor.role === "GUEST") {
    const err = new Error("Unauthorized: authentication required");
    (err as any).statusCode = 401;
    throw err;
  }
  requireAdmin(actor);
  return actor;
}
