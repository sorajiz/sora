const fs = require('fs');
const path = require('path');
const { getPool } = require('./db');

module.exports = async function handleCatalog(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, 'http://localhost');
  const action = url.searchParams.get('action');
  const isVersionCheck = action === 'version' || url.pathname.endsWith('/version');

  const p = getPool();

  // Offline / CI Pre-seeded Fallback
  if (!p) {
    let catalog = { ok: true, version: 1, products: [], categories: [] };
    try {
      const catPath = path.join(__dirname, '../../scripts/catalog.json');
      if (fs.existsSync(catPath)) {
        const d = JSON.parse(fs.readFileSync(catPath, 'utf8'));
        catalog = {
          ok: true,
          version: d.version || 1,
          products: d.products || [],
          categories: d.categories || []
        };
      }
    } catch(e) {}

    const version = Number(catalog.version || 1);
    const etag = `"menu-v${version}"`;
    res.setHeader('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=10');
    res.setHeader('ETag', etag);

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (isVersionCheck) {
      return res.status(200).json({ version });
    }
    return res.status(200).json(catalog);
  }

  // 1. Version Endpoint (§12.3: micro-response with strong ETag and 304)
  if (isVersionCheck) {
    let currentVersion = 1;
    try {
      const vRes = await p.query('SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;');
      if (vRes.rows.length > 0) {
        currentVersion = Number(vRes.rows[0].current_version || 1);
      }
    } catch (err) {
      console.error('[Menu Version Error]:', err.message);
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

  // 2. Full Public Catalog Endpoint
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
    console.error('[Menu Public Catalog Error]:', err.message);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ ok: false, error: 'Database catalog error' });
  }
};
