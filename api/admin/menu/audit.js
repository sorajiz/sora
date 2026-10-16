const { requireAdmin } = require('../../_menu_auth');
const { getPool } = require('../../_menu_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await requireAdmin(req);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(err.statusCode || 403).json({ error: err.message });
  }

  const p = getPool();
  try {
    const logs = await p.query(`
      SELECT a.*, p.name as product_name, c.name as category_name
      FROM menu_audit_logs a
      LEFT JOIN menu_products p ON a.product_id = p.id
      LEFT JOIN menu_categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 100;
    `);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({
      ok: true,
      logs: logs.rows
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ error: err.message });
  }
};
