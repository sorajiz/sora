const { requireAdmin } = require('./auth');
const { getPool, bumpVersion, logAudit } = require('./db');

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

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    if (typeof req.body === 'string') {
      try { return resolve(JSON.parse(req.body)); } catch (e) { return resolve({}); }
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handleAdmin(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let actor;
  try {
    actor = await requireAdmin(req);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(err.statusCode || 403).json({ error: err.message });
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const p = getPool();

  if (!p) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(503).json({ error: 'Database unavailable' });
  }

  // 1. /api/admin/menu/products
  if (path.endsWith('/products')) {
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
        return res.status(200).json({ ok: true, products: result.rows });
      } catch (err) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(500).json({ error: err.message });
      }
    }

    if (req.method === 'POST') {
      const body = await parseRequestBody(req);
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

        const insertRes = await client.query(`
          INSERT INTO menu_products (
            sku, slug, name, short_description, description,
            category_id, price_amount, compare_at_price,
            discord_select_label, discord_select_description,
            discord_select_emoji_name, discord_select_emoji_id, discord_select_emoji_animated,
            is_featured, is_available, status, sort_order, created_by, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8,
            $9, $10,
            $11, $12, $13,
            $14, true, $15, $16, $17, NOW()
          )
          RETURNING *;
        `, [
          cleanSku, cleanSlug, name.trim(), short_description || null, description || null,
          category_id || null, parsedPrice, parsedComparePrice,
          name.slice(0, 100), (short_description || '').slice(0, 100),
          emojiInfo.name, emojiInfo.id, emojiInfo.animated,
          is_featured === true || is_featured === 'true', status || 'ACTIVE', sort_order || 10, actor.discordId
        ]);

        const newProduct = insertRes.rows[0];
        const newVersion = await bumpVersion(client, actor.discordId);

        await logAudit({
          action: 'CREATE',
          entityType: 'PRODUCT',
          entityId: newProduct.id,
          beforeState: null,
          afterState: newProduct,
          actorDiscordId: actor.discordId,
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        await client.query('COMMIT');

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(201).json({
          ok: true,
          product: newProduct,
          version: newVersion
        });
      } catch (err) {
        await client.query('ROLLBACK');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(500).json({ error: err.message });
      } finally {
        client.release();
      }
    }
  }

  // 2. /api/admin/menu/product (Single Product PUT/DELETE)
  if (path.endsWith('/product')) {
    const id = url.searchParams.get('id');
    if (!id) return res.status(400).json({ error: 'Missing product id query parameter' });

    if (req.method === 'PUT') {
      const body = await parseRequestBody(req);
      const client = await p.connect();
      try {
        await client.query('BEGIN');
        const existingRes = await client.query('SELECT * FROM menu_products WHERE id = $1 AND deleted_at IS NULL FOR UPDATE;', [id]);
        if (existingRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Product not found' });
        }
        const existing = existingRes.rows[0];

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
              discord_select_emoji_name = $11,
              discord_select_emoji_id = $12,
              discord_select_emoji_animated = $13,
              version = version + 1,
              updated_at = NOW(),
              updated_by = $14
          WHERE id = $15
          RETURNING *;
        `, [
          name, shortDesc, desc, categoryId, priceAmount, comparePrice,
          status, isFeatured, sortOrder,
          name.slice(0, 100), emojiInfo.name, emojiInfo.id, emojiInfo.animated,
          actor.discordId, id
        ]);

        const updatedProduct = updRes.rows[0];
        const newVersion = await bumpVersion(client, actor.discordId);

        await logAudit({
          action: 'EDIT',
          entityType: 'PRODUCT',
          entityId: id,
          beforeState: existing,
          afterState: updatedProduct,
          actorDiscordId: actor.discordId,
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        await client.query('COMMIT');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).json({ ok: true, product: updatedProduct, version: newVersion });
      } catch (err) {
        await client.query('ROLLBACK');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(500).json({ error: err.message });
      } finally {
        client.release();
      }
    }

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
              status = 'ARCHIVED',
              updated_at = NOW(),
              updated_by = $1
          WHERE id = $2;
        `, [actor.discordId, id]);

        const newVersion = await bumpVersion(client, actor.discordId);

        await logAudit({
          action: 'ARCHIVE',
          entityType: 'PRODUCT',
          entityId: id,
          beforeState: existing,
          afterState: { ...existing, status: 'ARCHIVED', deleted_at: new Date() },
          actorDiscordId: actor.discordId,
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        await client.query('COMMIT');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).json({ ok: true, archived: true, version: newVersion });
      } catch (err) {
        await client.query('ROLLBACK');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(500).json({ error: err.message });
      } finally {
        client.release();
      }
    }
  }

  // 3. /api/admin/menu/categories
  if (path.endsWith('/categories')) {
    if (req.method === 'GET') {
      const cats = await p.query('SELECT * FROM menu_categories ORDER BY sort_order ASC;');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({ ok: true, categories: cats.rows });
    }
  }

  // 4. /api/admin/menu/audit
  if (path.endsWith('/audit')) {
    const logs = await p.query('SELECT * FROM menu_audit_logs ORDER BY created_at DESC LIMIT 50;');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({ ok: true, logs: logs.rows });
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(404).json({ error: 'Admin endpoint not found' });
};
