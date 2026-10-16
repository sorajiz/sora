import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MenuCategory, MenuProduct, MenuSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Get global menu version
    const stateRows = await query<{ current_version: string }>(
      'SELECT current_version FROM menu_state WHERE id = 1'
    );
    const version = stateRows.length > 0 ? parseInt(stateRows[0].current_version, 10) : 1;
    const etag = `"W/menu-v${version}"`;

    const clientEtag = request.headers.get('if-none-match');
    if (clientEtag === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=1, stale-while-revalidate=10',
        },
      });
    }

    // 2. Query settings
    const settingsRows = await query<MenuSettings>(
      'SELECT store_name, tagline, description_template, tos_url, rules_url, support_url, sale_url, discord_invite_url, website_url, currency FROM menu_settings WHERE id = 1'
    );
    const settings = settingsRows[0] || {
      store_name: 'Pade Store',
      tagline: 'Little cute store for digital goods',
      description_template: '',
      tos_url: 'https://menu.sorae.tokyo',
      rules_url: 'https://menu.sorae.tokyo',
      support_url: 'https://menu.sorae.tokyo',
      sale_url: 'https://menu.sorae.tokyo',
      discord_invite_url: 'https://discord.gg/pade',
      website_url: 'https://menu.sorae.tokyo',
      currency: 'VND',
    };

    // 3. Query active categories
    const categories = await query<MenuCategory>(
      `SELECT c.id, c.slug, c.name, c.description, c.emoji, c.sort_order, c.status,
              COUNT(p.id)::int as product_count
       FROM menu_categories c
       LEFT JOIN menu_products p ON p.category_id = c.id AND p.status IN ('ACTIVE', 'SOLD_OUT')
       WHERE c.status = 'ACTIVE'
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    // 4. Query active products
    const products = await query<MenuProduct>(
      `SELECT p.id, p.sku, p.slug, p.name, p.short_description, p.description,
              p.category_id, c.name as category_name, c.emoji as category_emoji,
              p.price_amount, p.currency, p.compare_at_price, p.stock_mode, p.stock_quantity,
              p.status, p.is_featured, p.is_available, p.sort_order,
              p.discord_select_label, p.discord_select_description,
              p.discord_select_emoji_name, p.discord_select_emoji_id, p.discord_select_emoji_animated,
              p.badges, p.version, p.created_at, p.updated_at
       FROM menu_products p
       LEFT JOIN menu_categories c ON p.category_id = c.id
       WHERE p.status IN ('ACTIVE', 'SOLD_OUT')
       ORDER BY p.is_featured DESC, p.sort_order ASC, p.name ASC`
    );

    return NextResponse.json(
      {
        version,
        settings,
        categories,
        products,
      },
      {
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=1, stale-while-revalidate=10',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to query menu data:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve menu catalog',
        reference: 'PM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
      { status: 500 }
    );
  }
}
