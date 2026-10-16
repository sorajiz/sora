require('dotenv').config();
const { Pool } = require('pg');

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

async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('Database connection not configured');
  return p.query(text, params);
}

async function bumpVersion(client, actorId) {
  const c = client || (await getPool().connect());
  const shouldRelease = !client;
  try {
    const res = await c.query(`
      UPDATE menu_state
      SET current_version = current_version + 1,
          updated_at = NOW(),
          updated_by = $1
      RETURNING current_version;
    `, [actorId || 'system']);

    let version = 1;
    if (res.rows.length > 0) {
      version = Number(res.rows[0].current_version);
    } else {
      const ins = await c.query(`
        INSERT INTO menu_state (current_version, updated_at, updated_by)
        VALUES (2, NOW(), $1)
        RETURNING current_version;
      `, [actorId || 'system']);
      version = Number(ins.rows[0].current_version);
    }
    return version;
  } finally {
    if (shouldRelease) c.release();
  }
}

async function logAudit(c, { actorId, action, productId, categoryId, beforeJson, afterJson, version }) {
  await c.query(`
    INSERT INTO menu_audit_logs (
      actor_type, actor_id, source, action, product_id, category_id,
      before_json, after_json, menu_version, created_at
    )
    VALUES ('USER', $1, 'WEB_ADMIN', $2, $3, $4, $5, $6, $7, NOW());
  `, [
    actorId,
    action,
    productId || null,
    categoryId || null,
    beforeJson ? JSON.stringify(beforeJson) : null,
    afterJson ? JSON.stringify(afterJson) : null,
    version || 1
  ]);
}

module.exports = {
  getPool,
  query,
  bumpVersion,
  logAudit
};
