const { requireAdmin } = require('../../_menu_auth');
const { getPool, bumpVersion, logAudit } = require('../../_menu_db');

function parseEmojiMarkup(markup) {
  if (!markup) return { name: '📦', id: null, animated: false };
  const match = markup.match(/<(a?):([a-zA-Z0-9_~]+):([0-9]{17,21})>/);
  if (match) {
    return {
      animated: match[1] === 'a',
      name: match[2],
      id: match[3]
    };
  }
  return { name: markup, id: null, animated: false };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let actor;
  try {
    actor = await requireAdmin(req);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(err.statusCode || 403).json({ error: err.message });
  }

  const p = getPool();

  if (req.method === 'GET') {
    try {
      const result = await p.query(`
        SELECT p.*, c.name as category_name, c.emoji as category_emoji, c.slug as category_slug
        FROM menu_products p
        LEFT JOIN menu_categories c ON p.category_id = c.id
        WHERE p.deleted_at IS NULL
        ORDER BY p.sort_order ASC, p.name ASC;
      `);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({
        ok: true,
        products: result.rows
      });
    } catch (err) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Missing request body' });
    }

    const {
      name,
      sku,
      category_id,
      price_amount,
      compare_at_price,
      short_description,
      description,
      status,
      emoji_markup,
      is_featured,
      sort_order
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const parsedPrice = parseInt(price_amount, 10);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative integer' });
    }

    let parsedComparePrice = null;
    if (compare_at_price !== null && compare_at_price !== undefined && compare_at_price !== '') {
      parsedComparePrice = parseInt(compare_at_price, 10);
      if (isNaN(parsedComparePrice) || parsedComparePrice <= parsedPrice) {
        return res.status(400).json({ error: 'Compare-at price must be greater than current price' });
      }
    }

    const cleanSku = (sku || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').toUpperCase()).trim();
    const cleanSlug = cleanSku.toLowerCase();
    const emojiInfo = parseEmojiMarkup(emoji_markup || body.discord_select_emoji_name);

    const client = await p.connect();
    try {
      await client.query('BEGIN');

      const insRes = await client.query(`
        INSERT INTO menu_products (
          sku, slug, name, short_description, description, category_id,
          price_amount, compare_at_price, stock_mode, stock_quantity,
          status, is_featured, is_available, sort_order,
          discord_select_label, discord_select_description,
          discord_select_emoji_name, discord_select_emoji_id, discord_select_emoji_animated,
          created_by, updated_by, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, 'UNLIMITED', 999,
          $9, $10, true, $11,
          $12, $13,
          $14, $15, $16,
          $17, $17, NOW(), NOW()
        )
        RETURNING *;
      `, [
        cleanSku,
        cleanSlug,
        name.trim(),
        (short_description || '').trim(),
        (description || '').trim(),
        category_id || null,
        parsedPrice,
        parsedComparePrice,
        status || 'ACTIVE',
        is_featured === true || is_featured === 'true',
        parseInt(sort_order, 10) || 0,
        name.trim().slice(0, 100),
        (short_description || '').slice(0, 100),
        emojiInfo.name,
        emojiInfo.id,
        emojiInfo.animated,
        actor.discordId
      ]);

      const createdProduct = insRes.rows[0];
      const newVersion = await bumpVersion(client, actor.discordId);

      await logAudit(client, {
        actorId: actor.discordId,
        action: 'PRODUCT_CREATE',
        productId: createdProduct.id,
        categoryId: createdProduct.category_id,
        beforeJson: null,
        afterJson: createdProduct,
        version: newVersion
      });

      await client.query('COMMIT');

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(201).json({
        ok: true,
        product: createdProduct,
        version: newVersion
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Product Create Error]:', err.message);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }

  return res.status(405).end();
};
