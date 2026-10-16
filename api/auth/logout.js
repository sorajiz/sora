const crypto = require('crypto');
const { parseCookies, serializeCookie, SESSION_COOKIE_NAME } = require('../_menu_auth');
const { query } = require('../_menu_db');

module.exports = async (req, res) => {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];

  if (rawToken) {
    const sessionHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    try {
      await query(`DELETE FROM menu_web_sessions WHERE id = $1;`, [sessionHash]);
    } catch (e) {}
  }

  const clearSession = serializeCookie(SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0
  });

  res.setHeader('Set-Cookie', clearSession);

  const url = new URL(req.url, 'http://localhost');
  if (url.searchParams.get('redirect') === 'true' || req.method === 'GET') {
    res.setHeader('Location', '/menu');
    return res.status(302).end();
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json({ ok: true });
};
