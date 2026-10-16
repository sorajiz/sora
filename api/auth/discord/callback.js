const { parseCookies, serializeCookie, createSession, SESSION_COOKIE_NAME } = require('../../_menu_auth');

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    res.setHeader('Location', '/menu?auth=cancelled');
    return res.status(302).end();
  }

  const cookies = parseCookies(req);
  const savedState = cookies.pade_oauth_state;
  const codeVerifier = cookies.pade_oauth_verifier;
  const returnTo = cookies.pade_oauth_return || '/menu';

  if (!code || !state || !savedState || state !== savedState || !codeVerifier) {
    console.error('[OAuth Validation Failed]: Mismatched state or missing code/verifier');
    res.setHeader('Location', '/menu?auth=error&reason=invalid_state');
    return res.status(302).end();
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI || 'https://menu.sorae.tokyo/api/auth/discord/callback';

  try {
    // 1. Exchange code for access token
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

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Token exchange failed: ${tokenRes.status} ${errText}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userRes.ok) {
      throw new Error(`User profile fetch failed: ${userRes.status}`);
    }

    const userData = await userRes.json();
    const discordId = String(userData.id);
    const username = userData.global_name || userData.username;
    const avatar = userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : null;

    // 3. Create server-side session in PostgreSQL
    const { rawToken } = await createSession({
      discordId,
      username,
      avatar
    });

    // 4. Set session cookie and clear oauth cookies
    const isProd = process.env.NODE_ENV === 'production';
    const sessionCookie = serializeCookie(SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    const clearState = serializeCookie('pade_oauth_state', '', { path: '/', maxAge: 0 });
    const clearVerifier = serializeCookie('pade_oauth_verifier', '', { path: '/', maxAge: 0 });
    const clearReturn = serializeCookie('pade_oauth_return', '', { path: '/', maxAge: 0 });

    res.setHeader('Set-Cookie', [sessionCookie, clearState, clearVerifier, clearReturn]);
    res.setHeader('Location', returnTo);
    return res.status(302).end();
  } catch (err) {
    console.error('[Discord OAuth Callback Error]:', err.message);
    res.setHeader('Location', '/menu?auth=error&reason=exchange_failed');
    return res.status(302).end();
  }
};
