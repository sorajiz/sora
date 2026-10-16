import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "../../../../../../lib/auth/server-actor";
import {
  updateCategoryMutation,
  archiveCategoryMutation,
} from "../../../../../../lib/admin/category-mutations";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const actor = await requireAdminFromRequest(req);
    const body = await req.json();

    const category = await updateCategoryMutation(actor, params.id, body);
    return NextResponse.json({ category });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const actor = await requireAdminFromRequest(req);
    await archiveCategoryMutation(actor, params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
