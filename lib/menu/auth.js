const crypto = require('crypto');
const { getPool, query } = require('./db');

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

    // Virtual Owner check (immutable, derived at request time)
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
  if (!actor.authenticated || !actor.isAdmin) {
    const err = new Error('Forbidden: Admin privilege required');
    err.statusCode = 403;
    throw err;
  }
  return actor;
}

// ── DISPATCH HANDLER FOR ALL /api/auth/* ROUTES ──
async function handleAuth(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  // 1. /api/auth/me
  if (path.endsWith('/me')) {
    try {
      const actor = await resolveActor(req);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({
        authenticated: actor.authenticated,
        discordId: actor.discordId,
        username: actor.username,
        avatar: actor.avatar,
        role: actor.role,
        isAdmin: actor.isAdmin
      });
    } catch (err) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({
        authenticated: false,
        role: 'GUEST',
        isAdmin: false,
        error: err.message
      });
    }
  }

  // 2. /api/auth/discord/login
  if (path.includes('/discord/login') || path.endsWith('/login')) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI || 'https://menu.sorae.tokyo/api/auth/discord/callback';

    if (!clientId) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(500).send('DISCORD_CLIENT_ID is not configured');
    }

    const returnTo = url.searchParams.get('returnTo') || '/';
    const state = generateState();
    const { codeVerifier, codeChallenge } = generatePKCE();

    const authUrl = new URL('https://discord.com/api/oauth2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'identify');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('prompt', 'consent');

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
      maxAge: 600
    };

    res.setHeader('Set-Cookie', [
      serializeCookie('pade_oauth_state', state, cookieOpts),
      serializeCookie('pade_oauth_verifier', codeVerifier, cookieOpts),
      serializeCookie('pade_oauth_return', returnTo, cookieOpts)
    ]);

    res.setHeader('Location', authUrl.toString());
    return res.status(302).end();
  }

  // 3. /api/auth/discord/callback
  if (path.includes('/discord/callback') || path.endsWith('/callback')) {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      res.setHeader('Location', '/?auth=cancelled');
      return res.status(302).end();
    }

    const cookies = parseCookies(req);
    const savedState = cookies.pade_oauth_state;
    const codeVerifier = cookies.pade_oauth_verifier;
    const returnTo = cookies.pade_oauth_return || '/';

    if (!code || !state || !savedState || state !== savedState || !codeVerifier) {
      res.setHeader('Location', '/?auth=error&reason=invalid_state');
      return res.status(302).end();
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI || 'https://menu.sorae.tokyo/api/auth/discord/callback';

    try {
      const tokenParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      });

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString()
      });

      if (!tokenRes.ok) throw new Error('Token exchange failed');

      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      if (!userRes.ok) throw new Error('User profile fetch failed');
      const userData = await userRes.json();

      const { rawToken } = await createSession({
        discordId: userData.id,
        username: userData.global_name || userData.username,
        avatar: userData.avatar
      });

      const isProd = process.env.NODE_ENV === 'production';
      res.setHeader('Set-Cookie', [
        serializeCookie(SESSION_COOKIE_NAME, rawToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'Lax',
          path: '/',
          maxAge: SESSION_TTL_DAYS * 24 * 60 * 60
        }),
        serializeCookie('pade_oauth_state', '', { maxAge: 0, path: '/' }),
        serializeCookie('pade_oauth_verifier', '', { maxAge: 0, path: '/' }),
        serializeCookie('pade_oauth_return', '', { maxAge: 0, path: '/' })
      ]);

      res.setHeader('Location', returnTo);
      return res.status(302).end();
    } catch (err) {
      console.error('[OAuth Callback Error]:', err.message);
      res.setHeader('Location', '/?auth=error&reason=exchange_failed');
      return res.status(302).end();
    }
  }

  // 4. /api/auth/logout
  if (path.endsWith('/logout')) {
    const cookies = parseCookies(req);
    const rawToken = cookies[SESSION_COOKIE_NAME];

    if (rawToken) {
      const sessionHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      query(`DELETE FROM menu_web_sessions WHERE id = $1;`, [sessionHash]).catch(() => {});
    }

    res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'Lax'
    }));

    res.setHeader('Location', '/');
    return res.status(302).end();
  }

  return res.status(404).json({ error: 'Auth endpoint not found' });
}

module.exports = {
  parseCookies,
  serializeCookie,
  generatePKCE,
  generateState,
  createSession,
  resolveActor,
  requireAdmin,
  handleAuth,
  SESSION_COOKIE_NAME,
  OWNER_DISCORD_ID
};
