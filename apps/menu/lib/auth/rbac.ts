import { query } from "../db";
import { getEnv } from "../env";
import { Actor, RoleTier } from "../types";

export const PERMISSIONS = {
  MENU_VIEW: "menu.view",
  PRODUCT_CREATE: "menu.product.create",
  PRODUCT_EDIT: "menu.product.edit",
  PRODUCT_ARCHIVE: "menu.product.archive",
  CATEGORY_MANAGE: "menu.category.manage",
  MEDIA_MANAGE: "menu.media.manage",
  SETTINGS_MANAGE: "menu.settings.manage",
  PUBLISH: "menu.publish",
  SYNC: "menu.sync",
  AUDIT_VIEW: "menu.audit.view",
} as const;

export const ALL_PERMISSIONS = new Set<string>(Object.values(PERMISSIONS));

export const ADMIN_PERMISSIONS = new Set<string>([
  PERMISSIONS.MENU_VIEW,
  PERMISSIONS.PRODUCT_CREATE,
  PERMISSIONS.PRODUCT_EDIT,
  PERMISSIONS.PRODUCT_ARCHIVE,
  PERMISSIONS.CATEGORY_MANAGE,
  PERMISSIONS.MEDIA_MANAGE,
  PERMISSIONS.SETTINGS_MANAGE,
  PERMISSIONS.PUBLISH,
  PERMISSIONS.SYNC,
  PERMISSIONS.AUDIT_VIEW,
]);

export const MEMBER_PERMISSIONS = new Set<string>([PERMISSIONS.MENU_VIEW]);
export const GUEST_PERMISSIONS = new Set<string>([PERMISSIONS.MENU_VIEW]);

/**
 * Derives actor identity and role strictly per-request (§5.2, §S11).
 * Owner identity is virtual and immutable: evaluated via string equality against PADE_OWNER_DISCORD_ID.
 */
export async function resolveActor(user: {
  discordId: string;
  username: string;
  avatar: string | null;
} | null): Promise<Actor> {
  if (!user || !user.discordId) {
    return {
      discordId: "",
      username: "Guest",
      avatar: null,
      role: "GUEST",
      permissions: GUEST_PERMISSIONS,
    };
  }

  const env = getEnv();
  const discordIdStr = String(user.discordId);

  // 1. Virtual Owner check (§S11: derived at request time, never revocable)
  if (discordIdStr === env.PADE_OWNER_DISCORD_ID) {
    return {
      discordId: discordIdStr,
      username: user.username,
      avatar: user.avatar,
      role: "OWNER",
      permissions: ALL_PERMISSIONS,
    };
  }

  // 2. Check explicit admin grants in database
  try {
    const grants = await query<{ discord_user_id: string }>(
      `SELECT discord_user_id FROM menu_admin_grants WHERE discord_user_id = $1 LIMIT 1;`,
      [discordIdStr]
    );

    if (grants.length > 0) {
      return {
        discordId: discordIdStr,
        username: user.username,
        avatar: user.avatar,
        role: "ADMIN",
        permissions: ADMIN_PERMISSIONS,
      };
    }
  } catch (err: any) {
    console.error("[RBAC grant query error]:", err.message);
  }

  // 3. Default to authenticated Member
  return {
    discordId: discordIdStr,
    username: user.username,
    avatar: user.avatar,
    role: "MEMBER",
    permissions: MEMBER_PERMISSIONS,
  };
}

export function hasPermission(actor: Actor, permission: string): boolean {
  return actor.permissions.has(permission);
}

export function requirePermission(actor: Actor, permission: string): void {
  if (!hasPermission(actor, permission)) {
    const err = new Error(`Forbidden: missing required permission '${permission}'`);
    (err as any).statusCode = 403;
    throw err;
  }
}

export function requireAdmin(actor: Actor): void {
  if (actor.role !== "OWNER" && actor.role !== "ADMIN") {
    const err = new Error("Forbidden: requires OWNER or ADMIN role");
    (err as any).statusCode = 403;
    throw err;
  }
}
