import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { requireAdminFromRequest } from "../../../../../lib/auth/server-actor";
import { createCategoryMutation } from "../../../../../lib/admin/category-mutations";
import { MenuCategory } from "../../../../../lib/types";

export async function GET(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const categories = await query<MenuCategory>(
      `SELECT c.*,
              (SELECT count(*) FROM menu_products p WHERE p.category_id = c.id AND p.status = 'ACTIVE' AND p.deleted_at IS NULL) as active_product_count
       FROM menu_categories c
       ORDER BY c.sort_order ASC, c.name ASC;`
    );

    return NextResponse.json({ categories });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminFromRequest(req);
    const body = await req.json();

    const category = await createCategoryMutation(actor, body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
