const handleCatalog = require('../lib/menu/catalog');
const { handleAuth } = require('../lib/menu/auth');
const handleAdmin = require('../lib/menu/admin');

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (path.startsWith('/api/auth')) {
    return handleAuth(req, res);
  }

  if (path.startsWith('/api/admin')) {
    return handleAdmin(req, res);
  }

  return handleCatalog(req, res);
};
