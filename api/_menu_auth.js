const crypto = require('crypto');
const { getPool, query } = require('./_menu_db');

const SESSION_COOKIE_NAME = 'pade_session';
const SESSION_TTL_DAYS = 7;
const OWNER_DISCORD_ID = (process.env.PADE_OWNER_DISCORD_ID || process.env.OWNER_DISCORD_USER_ID || '386528085681635328').trim();

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie;
  if (!header) return list;

  header.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });

  return list;
}

function serializeCookie(name, val, options = {}) {
  const enc = encodeURIComponent(val);
  const parts = [`${name}=${enc}`];

  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');

  return parts.join('; ');
}

function generatePKCE() {
  const codeVerifier = crypto.randomBytes(48).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

function generateState() {
  return crypto.randomBytes(24).toString('base64url');
}

async function createSession({ discordId, username, avatar }) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const sessionHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await query(`
    INSERT INTO menu_web_sessions (id, discord_id, username, avatar, created_at, last_seen_at, expires_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW(), $5);
  `, [sessionHash, String(discordId), username, avatar, expiresAt]);

  return { rawToken, expiresAt };
}

async function resolveActor(req) {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];

  if (!rawToken || typeof rawToken !== 'string') {
    return {
      authenticated: false,
      discordId: null,
      username: 'Guest',
      avatar: null,
      role: 'GUEST',
      isAdmin: false
    };
  }

  const sessionHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  try {
    const res = await query(`
      SELECT id, discord_id, username, avatar, expires_at
      FROM menu_web_sessions
      WHERE id = $1 AND expires_at > NOW()
      LIMIT 1;
    `, [sessionHash]);

    if (res.rows.length === 0) {
      return {
        authenticated: false,
        discordId: null,
        username: 'Guest',
        avatar: null,
        role: 'GUEST',
        isAdmin: false
      };
    }

    const session = res.rows[0];
    const discordId = String(session.discord_id);

    // Update last_seen_at asynchronously
    query(`UPDATE menu_web_sessions SET last_seen_at = NOW() WHERE id = $1;`, [sessionHash]).catch(() => {});

    // Virtual Owner check per §S11 (immutable, derived at request time)
    if (discordId === OWNER_DISCORD_ID) {
      return {
        authenticated: true,
        discordId,
        username: session.username,
        avatar: session.avatar,
        role: 'OWNER',
        isAdmin: true
      };
    }

    // Check explicit admin grants in DB or env var
    const envAdminIds = (process.env.ADMIN_DISCORD_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (envAdminIds.includes(discordId)) {
      return {
        authenticated: true,
        discordId,
        username: session.username,
        avatar: session.avatar,
        role: 'ADMIN',
        isAdmin: true
      };
    }

    const adminRes = await query(`
      SELECT discord_user_id FROM menu_admin_grants WHERE discord_user_id = $1 LIMIT 1;
    `, [discordId]);

    if (adminRes.rows.length > 0) {
      return {
        authenticated: true,
        discordId,
        username: session.username,
        avatar: session.avatar,
        role: 'ADMIN',
        isAdmin: true
      };
    }

    return {
      authenticated: true,
      discordId,
      username: session.username,
      avatar: session.avatar,
      role: 'MEMBER',
      isAdmin: false
    };
  } catch (err) {
    console.error('[Session Verification Error]:', err.message);
    return {
      authenticated: false,
      discordId: null,
      username: 'Guest',
      avatar: null,
      role: 'GUEST',
      isAdmin: false
    };
  }
}

async function requireAdmin(req) {
  const actor = await resolveActor(req);
  if (!actor.isAdmin) {
    const err = new Error('Forbidden: Admin access required');
    err.statusCode = 403;
    throw err;
  }
  return actor;
}

module.exports = {
  SESSION_COOKIE_NAME,
  OWNER_DISCORD_ID,
  parseCookies,
  serializeCookie,
  generatePKCE,
  generateState,
  createSession,
  resolveActor,
  requireAdmin
};
