import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { requireAdminFromRequest } from "../../../../../lib/auth/server-actor";
import { requirePermission, PERMISSIONS } from "../../../../../lib/auth/rbac";
import { MenuAuditLog } from "../../../../../lib/types";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireAdminFromRequest(req);
    requirePermission(actor, PERMISSIONS.AUDIT_VIEW);

    const logs = await query<MenuAuditLog>(
      `SELECT * FROM menu_audit_logs
       ORDER BY created_at DESC
       LIMIT 100;`
    );

    return NextResponse.json({ logs });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
