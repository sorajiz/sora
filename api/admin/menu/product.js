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
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let actor;
  try {
    actor = await requireAdmin(req);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(err.statusCode || 403).json({ error: err.message });
  }

  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');

  if (!id) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(400).json({ error: 'Missing product id query parameter' });
  }

  const p = getPool();

  // 1. UPDATE PRODUCT
  if (req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Missing request body' });
    }

    const client = await p.connect();
    try {
      await client.query('BEGIN');

      const existingRes = await client.query('SELECT * FROM menu_products WHERE id = $1 AND deleted_at IS NULL FOR UPDATE;', [id]);
      if (existingRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found' });
      }
      const existing = existingRes.rows[0];

      // Optimistic concurrency check if expected_version provided
      if (body.expected_version && Number(body.expected_version) !== Number(existing.version)) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'Conflict: Product was modified by another session',
          code: 'CONFLICT',
          currentProduct: existing
        });
      }

      const name = (body.name !== undefined ? body.name : existing.name).trim();
      const shortDesc = body.short_description !== undefined ? body.short_description : existing.short_description;
      const desc = body.description !== undefined ? body.description : existing.description;
      const categoryId = body.category_id !== undefined ? body.category_id : existing.category_id;
      const priceAmount = body.price_amount !== undefined ? parseInt(body.price_amount, 10) : existing.price_amount;
      const comparePrice = body.compare_at_price !== undefined ? (body.compare_at_price ? parseInt(body.compare_at_price, 10) : null) : existing.compare_at_price;
      const status = body.status !== undefined ? body.status : existing.status;
      const isFeatured = body.is_featured !== undefined ? (body.is_featured === true || body.is_featured === 'true') : existing.is_featured;
      const sortOrder = body.sort_order !== undefined ? parseInt(body.sort_order, 10) : existing.sort_order;

      const emojiMarkup = body.emoji_markup || body.discord_select_emoji_name;
      const emojiInfo = emojiMarkup ? parseEmojiMarkup(emojiMarkup) : {
        name: existing.discord_select_emoji_name,
        id: existing.discord_select_emoji_id,
        animated: existing.discord_select_emoji_animated
      };

      const updRes = await client.query(`
        UPDATE menu_products
        SET name = $1,
            short_description = $2,
            description = $3,
            category_id = $4,
            price_amount = $5,
            compare_at_price = $6,
            status = $7,
            is_featured = $8,
            sort_order = $9,
            discord_select_label = $10,
            discord_select_description = $11,
            discord_select_emoji_name = $12,
            discord_select_emoji_id = $13,
            discord_select_emoji_animated = $14,
            version = version + 1,
            updated_by = $15,
            updated_at = NOW()
        WHERE id = $16
        RETURNING *;
      `, [
        name,
        shortDesc,
        desc,
        categoryId,
        priceAmount,
        comparePrice,
        status,
        isFeatured,
        sortOrder,
        name.slice(0, 100),
        (shortDesc || '').slice(0, 100),
        emojiInfo.name,
        emojiInfo.id,
        emojiInfo.animated,
        actor.discordId,
        id
      ]);

      const updatedProduct = updRes.rows[0];
      const newVersion = await bumpVersion(client, actor.discordId);

      await logAudit(client, {
        actorId: actor.discordId,
        action: 'PRODUCT_EDIT',
        productId: id,
        categoryId: updatedProduct.category_id,
        beforeJson: existing,
        afterJson: updatedProduct,
        version: newVersion
      });

      await client.query('COMMIT');

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({
        ok: true,
        product: updatedProduct,
        version: newVersion
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Product Update Error]:', err.message);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }

  // 2. DELETE / ARCHIVE PRODUCT
  if (req.method === 'DELETE') {
    const client = await p.connect();
    try {
      await client.query('BEGIN');

      const existingRes = await client.query('SELECT * FROM menu_products WHERE id = $1 AND deleted_at IS NULL FOR UPDATE;', [id]);
      if (existingRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found' });
      }
      const existing = existingRes.rows[0];

      await client.query(`
        UPDATE menu_products
        SET deleted_at = NOW(),
            deleted_by = $1,
            status = 'ARCHIVED',
            updated_at = NOW()
        WHERE id = $2;
      `, [actor.discordId, id]);

      const newVersion = await bumpVersion(client, actor.discordId);

      await logAudit(client, {
        actorId: actor.discordId,
        action: 'PRODUCT_ARCHIVE',
        productId: id,
        categoryId: existing.category_id,
        beforeJson: existing,
        afterJson: { deleted_at: new Date().toISOString(), status: 'ARCHIVED' },
        version: newVersion
      });

      await client.query('COMMIT');

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({
        ok: true,
        version: newVersion
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Product Delete Error]:', err.message);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }

  return res.status(405).end();
};
