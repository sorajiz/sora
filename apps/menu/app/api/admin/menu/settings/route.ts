import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { requireAdminFromRequest } from "../../../../../lib/auth/server-actor";
import { updateSettingsMutation } from "../../../../../lib/admin/settings-mutations";
import { MenuSettings } from "../../../../../lib/types";

export async function GET(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);
    const rows = await query<MenuSettings>(`SELECT * FROM menu_settings LIMIT 1;`);
    const settings = rows[0] || null;
    return NextResponse.json({ settings });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminFromRequest(req);
    const body = await req.json();

    const settings = await updateSettingsMutation(actor, body);
    return NextResponse.json({ settings });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
