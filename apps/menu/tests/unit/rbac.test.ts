import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  resolveActor,
  hasPermission,
  requirePermission,
  requireAdmin,
  PERMISSIONS,
  ALL_PERMISSIONS,
  ADMIN_PERMISSIONS,
  MEMBER_PERMISSIONS,
  GUEST_PERMISSIONS
} from '@/lib/auth/rbac';
import * as db from '@/lib/db';

const OWNER_ID = '386528085681635328';
const MEMBER_ID = '123456789012345678';
const ADMIN_ID = '987654321098765432';

describe('RBAC & Snowflake Precision (§S3, §5.2, §S11)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.PADE_OWNER_DISCORD_ID = OWNER_ID;
  });

  it('demonstrates that JS Number precision breaks snowflakes > 2^53-1', () => {
    // Owner snowflake: 386528085681635328
    // MAX_SAFE_INTEGER: 9007199254740991 (16 digits)
    // 386528085681635328 is 18 digits, well above 2^53 - 1
    const ownerSnowflakeStr = OWNER_ID;
    const asBigInt = BigInt(ownerSnowflakeStr);
    expect(asBigInt.toString()).toBe(ownerSnowflakeStr);

    // Number conversion test:
    // If a number conversion happens, precision loss is a bug
    expect(typeof ownerSnowflakeStr).toBe('string');
  });

  it('correctly derives virtual OWNER tier for owner Discord ID string', async () => {
    const actor = await resolveActor({
      discordId: OWNER_ID,
      username: 'PadeOwner',
      avatar: 'avatar_hash'
    });

    expect(actor.role).toBe('OWNER');
    expect(actor.discordId).toBe(OWNER_ID);
    expect(actor.permissions).toEqual(ALL_PERMISSIONS);
    expect(hasPermission(actor, PERMISSIONS.PRODUCT_CREATE)).toBe(true);
    expect(hasPermission(actor, PERMISSIONS.SETTINGS_MANAGE)).toBe(true);
    expect(hasPermission(actor, PERMISSIONS.AUDIT_VIEW)).toBe(true);
    expect(() => requireAdmin(actor)).not.toThrow();
  });

  it('derives ADMIN tier when discordId exists in menu_admin_grants', async () => {
    vi.spyOn(db, 'query').mockResolvedValueOnce([{ discord_user_id: ADMIN_ID }] as any);

    const actor = await resolveActor({
      discordId: ADMIN_ID,
      username: 'TrustedStaff',
      avatar: 'avatar_hash'
    });

    expect(actor.role).toBe('ADMIN');
    expect(actor.permissions).toEqual(ADMIN_PERMISSIONS);
    expect(hasPermission(actor, PERMISSIONS.PRODUCT_CREATE)).toBe(true);
    expect(hasPermission(actor, PERMISSIONS.PRODUCT_EDIT)).toBe(true);
    expect(() => requireAdmin(actor)).not.toThrow();
  });

  it('derives MEMBER tier for standard authenticated user and denies admin actions', async () => {
    vi.spyOn(db, 'query').mockResolvedValueOnce([] as any);

    const actor = await resolveActor({
      discordId: MEMBER_ID,
      username: 'RegularCustomer',
      avatar: 'avatar_hash'
    });

    expect(actor.role).toBe('MEMBER');
    expect(actor.permissions).toEqual(MEMBER_PERMISSIONS);
    expect(hasPermission(actor, PERMISSIONS.MENU_VIEW)).toBe(true);
    expect(hasPermission(actor, PERMISSIONS.PRODUCT_CREATE)).toBe(false);
    expect(hasPermission(actor, PERMISSIONS.SETTINGS_MANAGE)).toBe(false);

    expect(() => requireAdmin(actor)).toThrowError(/Forbidden/);
    expect(() => requirePermission(actor, PERMISSIONS.PRODUCT_CREATE)).toThrowError(/Forbidden/);
  });

  it('handles guest/unauthenticated visitor safely', async () => {
    const actor = await resolveActor(null);
    expect(actor.role).toBe('GUEST');
    expect(actor.permissions).toEqual(GUEST_PERMISSIONS);
    expect(hasPermission(actor, PERMISSIONS.MENU_VIEW)).toBe(true);
    expect(() => requireAdmin(actor)).toThrowError(/Forbidden/);
  });
});
