/**
 * ============================================================================
 * PADE STORE MENU PLATFORM - VERCEL SERVERLESS HANDLER
 * ============================================================================
 * Canonical Domain: https://menu.sorae.tokyo
 * Routes:
 *   - /api/menu (catalog JSON)
 *   - /api/menu?action=version or /api/menu/version (micro-version endpoint with ETag)
 * ============================================================================
 */

const { Pool } = require('pg');
const crypto = require('crypto');

let pool = null;

function getPool() {
  const dbUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
  if (!dbUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

function generateReferenceId(traceId) {
  const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const hash = crypto.createHash("sha256").update(traceId || crypto.randomUUID()).digest();
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += alphabet[hash[i] % 32];
  }
  return `PM-${code}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, 'http://localhost');
  const action = url.searchParams.get('action');
  const isVersionCheck = action === 'version' || url.pathname.endsWith('/version');

  const p = getPool();

  // 1. Version Endpoint (§12.3: micro-response with strong ETag and 304)
  if (isVersionCheck) {
    let currentVersion = 1;
    if (p) {
      try {
        const vRes = await p.query('SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;');
        if (vRes.rows.length > 0) {
          currentVersion = Number(vRes.rows[0].current_version || 1);
        }
      } catch (err) {
        console.error('[Menu Version Error]:', err.message);
      }
    }

    const etag = `"menu-v${currentVersion}"`;
    res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=2');
    res.setHeader('ETag', etag);

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({ version: currentVersion });
  }

  // 2. Full Catalog Endpoint
  if (!p) {
    const ref = generateReferenceId();
    return res.status(200).json({
      ok: false,
      reference_id: ref,
      products: [],
      categories: [],
      settings: {
        store_name: "Pade Store",
        tagline: "a little menu / for things you love 𐙚",
        description_template: "❝  ﹒  **Pade Store**  ⏜  𐙚  menu ִ ࣪ !"
      }
    });
  }

  try {
    const [productsRes, categoriesRes, settingsRes, stateRes] = await Promise.all([
      p.query(`
        SELECT p.id, p.slug, p.sku, p.name, p.short_description, p.description,
               p.price_amount, p.compare_at_price, p.stock_mode, p.stock_quantity,
               p.status, p.is_featured, p.is_available, p.sort_order,
               p.discord_select_label, p.discord_select_description,
               p.discord_select_emoji_name, p.discord_select_emoji_id, p.discord_select_emoji_animated,
               p.version, p.created_at, p.updated_at,
               c.name as category_name, c.emoji as category_emoji, c.slug as category_slug,
               m.url as primary_image
        FROM menu_products p
        LEFT JOIN menu_categories c ON p.category_id = c.id
        LEFT JOIN menu_product_media m ON p.id = m.product_id AND m.is_primary = true
        WHERE p.deleted_at IS NULL AND p.status IN ('ACTIVE', 'SOLD_OUT')
        ORDER BY p.is_featured DESC, p.sort_order ASC, p.name ASC;
      `),
      p.query(`
        SELECT c.*, count(p.id) as product_count
        FROM menu_categories c
        LEFT JOIN menu_products p ON c.id = p.category_id AND p.status = 'ACTIVE' AND p.deleted_at IS NULL
        WHERE c.status = 'ACTIVE'
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC;
      `),
      p.query(`SELECT * FROM menu_settings LIMIT 1;`),
      p.query(`SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;`)
    ]);

    const version = Number(stateRes.rows[0]?.current_version || 1);
    const etag = `"menu-v${version}"`;

    res.setHeader('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=10');
    res.setHeader('ETag', etag);

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({
      ok: true,
      version,
      products: productsRes.rows,
      categories: categoriesRes.rows,
      settings: settingsRes.rows[0] || {
        store_name: "Pade Store",
        tagline: "a little menu / for things you love 𐙚",
        description_template: "❝  ﹒  **Pade Store**  ⏜  𐙚  menu ִ ࣪ !"
      }
    });
  } catch (err) {
    const traceId = crypto.randomUUID();
    const ref = generateReferenceId(traceId);
    console.error(`[Menu Catalog Error] ${traceId}:`, err.message);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({
      ok: false,
      error: "Menu Temporarily Unavailable",
      reference_id: ref
    });
  }
};
