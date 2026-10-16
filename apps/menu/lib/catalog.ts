import { query, assertUtf8Encoding } from "./db";
import { MenuCategory, MenuProduct, MenuSettings } from "./types";
import { generateTraceId, deriveReferenceId } from "./domain/reference";

export interface PublicCatalogData {
  settings: MenuSettings;
  categories: MenuCategory[];
  products: MenuProduct[];
  version: number;
  error?: boolean;
  referenceId?: string;
}

const DEFAULT_SETTINGS: MenuSettings = {
  store_name: "Pade Store",
  tagline: "a little menu / for things you love 𐙚",
  description_template: "❝ ﹒ **Pade Store** ⏜ 𐙚 menu ִ ࣪ !\n\n′ · ｡ ghé một chút, chọn điều bạn thích ! ⌒⌒\n ╰ những món nhỏ xinh đang đợi bạn ở bên dưới ♡",
  thumbnail_url: null,
  banner_url: null,
  tos_url: "https://menu.sorae.tokyo/tos",
  rules_url: "https://menu.sorae.tokyo/rules",
  support_url: "https://discord.gg/pade",
  sale_url: "https://menu.sorae.tokyo/sale",
  discord_invite_url: "https://discord.gg/pade",
  website_url: "https://menu.sorae.tokyo",
  currency: "VND",
};

export async function getPublicCatalog(): Promise<PublicCatalogData> {
  const traceId = generateTraceId();
  try {
    await assertUtf8Encoding();

    // 1. Fetch settings
    const settingsRows = await query<MenuSettings>(
      `SELECT store_name, tagline, description_template, thumbnail_url, banner_url,
              tos_url, rules_url, support_url, sale_url, discord_invite_url, website_url, currency
       FROM menu_settings
       LIMIT 1;`
    );
    const settings = settingsRows.length > 0 ? settingsRows[0] : DEFAULT_SETTINGS;

    // 2. Fetch categories (ACTIVE only per §S6)
    const categories = await query<MenuCategory>(
      `SELECT id, slug, name, description, emoji, sort_order, status
       FROM menu_categories
       WHERE status = 'ACTIVE'
       ORDER BY sort_order ASC, name ASC;`
    );

    // 3. Fetch products (ACTIVE & SOLD_OUT only per §S6)
    const products = await query<MenuProduct>(
      `SELECT p.id, p.sku, p.slug, p.name, p.short_description, p.description,
              p.category_id, c.name as category_name, c.slug as category_slug, c.emoji as category_emoji,
              p.price_amount, p.currency, p.compare_at_price, p.stock_mode, p.stock_quantity,
              p.status, p.is_featured, p.is_available, p.sort_order,
              p.discord_select_label, p.discord_select_description,
              p.discord_select_emoji_name, p.discord_select_emoji_id, p.discord_select_emoji_animated,
              p.version, p.created_at, p.updated_at,
              (
                SELECT m.url FROM menu_product_media m
                WHERE m.product_id = p.id AND m.is_primary = true
                LIMIT 1
              ) as primary_image
       FROM menu_products p
       LEFT JOIN menu_categories c ON p.category_id = c.id
       WHERE p.status IN ('ACTIVE', 'SOLD_OUT')
         AND p.deleted_at IS NULL
       ORDER BY p.sort_order ASC, p.created_at DESC;`
    );

    // 4. Fetch current version from menu_state
    const stateRows = await query<{ current_version: string | number }>(
      `SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;`
    );
    const version = stateRows.length > 0 ? Number(stateRows[0].current_version) : 1;

    return {
      settings,
      categories,
      products,
      version,
    };
  } catch (err: any) {
    const ref = deriveReferenceId(traceId, "PM");
    console.error(`[Catalog Load Failed] Trace: ${traceId}, Ref: ${ref}, Error:`, err.message);
    return {
      settings: DEFAULT_SETTINGS,
      categories: [],
      products: [],
      version: 1,
      error: true,
      referenceId: ref,
    };
  }
}
