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
    }

    try {
      await c.query(`
        INSERT INTO menu_outbox_events (
          event_type, aggregate_type, aggregate_id, menu_version, payload
        ) VALUES (
          'MENU_RECONCILE_REQUESTED', 'MENU', 'GLOBAL', $1, $2
        );
      `, [version, JSON.stringify({ triggered_by: actorId || 'system', source: 'WEB_PRODUCTION' })]);
    } catch (e) {
      // Non-blocking outbox insertion fallback
    }

    return version;
  } finally {
    if (shouldRelease) c.release();
  }
}

async function logAudit({ action, entityType, entityId, beforeState, afterState, actorDiscordId, menuVersion }) {
  const p = getPool();
  if (!p) return;
  try {
    const isProduct = entityType === 'PRODUCT';
    await p.query(`
      INSERT INTO menu_audit_logs (
        actor_type, actor_id, source, action,
        product_id, category_id,
        before_json, after_json,
        menu_version, created_at
      )
      VALUES ($1, $2, 'WEB', $3, $4, $5, $6, $7, $8, NOW());
    `, [
      'DISCORD_USER',
      actorDiscordId || '386528085681635328',
      action,
      isProduct ? entityId : null,
      !isProduct ? entityId : null,
      beforeState ? JSON.stringify(beforeState) : null,
      afterState ? JSON.stringify(afterState) : null,
      menuVersion || 1
    ]);
  } catch (err) {
    console.error('[Menu Audit Error]:', err.message);
  }
}

module.exports = {
  getPool,
  query,
  bumpVersion,
  logAudit
};
