const { generateState, generatePKCE, serializeCookie } = require('../../_menu_auth');

module.exports = async (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI || 'https://menu.sorae.tokyo/api/auth/discord/callback';

  if (!clientId) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send('DISCORD_CLIENT_ID is not configured');
  }

  const url = new URL(req.url, 'http://localhost');
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
    maxAge: 600 // 10 minutes
  };

  res.setHeader('Set-Cookie', [
    serializeCookie('pade_oauth_state', state, cookieOpts),
    serializeCookie('pade_oauth_verifier', codeVerifier, cookieOpts),
    serializeCookie('pade_oauth_return', returnTo, cookieOpts)
  ]);

  res.setHeader('Location', authUrl.toString());
  return res.status(302).end();
};
