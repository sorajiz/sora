import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../../lib/db";
import { requireAdminFromRequest } from "../../../../../../lib/auth/server-actor";
import {
  updateProductMutation,
  archiveProductMutation,
  OptimisticConcurrencyError,
} from "../../../../../../lib/admin/mutations";
import { MenuProduct } from "../../../../../../lib/types";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminFromRequest(req);
    const rows = await query<MenuProduct>(
      `SELECT p.*, c.name as category_name, c.emoji as category_emoji
       FROM menu_products p
       LEFT JOIN menu_categories c ON p.category_id = c.id
       WHERE p.id = $1 LIMIT 1;`,
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: rows[0] });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const actor = await requireAdminFromRequest(req);
    const body = await req.json();

    const expectedVersion = Number(body.expected_version);
    if (isNaN(expectedVersion)) {
      return NextResponse.json(
        { error: "expected_version is required for optimistic concurrency" },
        { status: 400 }
      );
    }

    const updated = await updateProductMutation(
      actor,
      params.id,
      body,
      expectedVersion
    );

    return NextResponse.json({ product: updated });
  } catch (err: any) {
    if (err instanceof OptimisticConcurrencyError) {
      return NextResponse.json(
        {
          error: err.message,
          code: "CONFLICT",
          currentProduct: err.currentProduct,
        },
        { status: 409 }
      );
    }
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const actor = await requireAdminFromRequest(req);
    const { searchParams } = new URL(req.url);
    const expectedVersion = parseInt(searchParams.get("expected_version") || "1", 10);

    await archiveProductMutation(actor, params.id, expectedVersion);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
