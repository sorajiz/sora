import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { requireAdminFromRequest } from "../../../../../lib/auth/server-actor";
import { createProductMutation } from "../../../../../lib/admin/mutations";
import { MenuProduct } from "../../../../../lib/types";

export async function GET(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const products = await query<MenuProduct>(
      `SELECT p.*, c.name as category_name, c.emoji as category_emoji,
              (SELECT m.url FROM menu_product_media m WHERE m.product_id = p.id AND m.is_primary = true LIMIT 1) as primary_image
       FROM menu_products p
       LEFT JOIN menu_categories c ON p.category_id = c.id
       WHERE p.deleted_at IS NULL
       ORDER BY p.sort_order ASC, p.created_at DESC;`
    );

    return NextResponse.json({ products });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminFromRequest(req);
    const body = await req.json();

    const product = await createProductMutation(actor, body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
