const { requireAdmin } = require('../../_menu_auth');
const { getPool, bumpVersion, logAudit } = require('../../_menu_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const p = getPool();

  if (req.method === 'GET') {
    try {
      const result = await p.query(`
        SELECT c.*, count(p.id) as product_count
        FROM menu_categories c
        LEFT JOIN menu_products p ON c.id = p.category_id AND p.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC;
      `);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({
        ok: true,
        categories: result.rows
      });
    } catch (err) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    let actor;
    try {
      actor = await requireAdmin(req);
    } catch (err) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(err.statusCode || 403).json({ error: err.message });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    if (!body || !body.name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const name = body.name.trim();
    const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();
    const emoji = body.emoji || '📦';
    const desc = body.description || '';
    const sort = parseInt(body.sort_order, 10) || 0;

    const client = await p.connect();
    try {
      await client.query('BEGIN');

      const ins = await client.query(`
        INSERT INTO menu_categories (slug, name, description, emoji, sort_order, status, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            emoji = EXCLUDED.emoji,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW()
        RETURNING *;
      `, [slug, name, desc, emoji, sort]);

      const cat = ins.rows[0];
      const newVersion = await bumpVersion(client, actor.discordId);

      await logAudit(client, {
        actorId: actor.discordId,
        action: 'CATEGORY_MANAGE',
        categoryId: cat.id,
        beforeJson: null,
        afterJson: cat,
        version: newVersion
      });

      await client.query('COMMIT');

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({
        ok: true,
        category: cat,
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

  return res.status(405).end();
};
