const { resolveActor } = require('../_menu_auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

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
};
