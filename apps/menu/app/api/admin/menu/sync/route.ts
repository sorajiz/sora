import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "../../../../../lib/auth/server-actor";
import {
  getSyncOverview,
  enqueueRepairPublication,
  retryDeadOutboxEvents,
} from "../../../../../lib/admin/sync";

export async function GET(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);
    const overview = await getSyncOverview();
    return NextResponse.json(overview);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminFromRequest(req);
    await enqueueRepairPublication(actor);
    const overview = await getSyncOverview();
    return NextResponse.json({ ok: true, message: "Repair publication requested", overview });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actor = await requireAdminFromRequest(req);
    const retriedCount = await retryDeadOutboxEvents(actor);
    const overview = await getSyncOverview();
    return NextResponse.json({ ok: true, retriedCount, overview });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
