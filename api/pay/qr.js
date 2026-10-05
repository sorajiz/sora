const { getQRUrl, normalizeCode } = require('../_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const urlParams = new URL(req.url, 'http://localhost').searchParams;
  const amount = parseInt(urlParams.get('amount') || urlParams.get('amt') || '0', 10);
  const rawCode = urlParams.get('code') || urlParams.get('order') || urlParams.get('sr');
  const code = rawCode ? normalizeCode(rawCode) : 'sora developer';

  const qrUrl = getQRUrl(amount, code);

  // If redirect query or accepts image, redirect directly to VietQR image
  if (urlParams.get('redirect') === 'true' || urlParams.get('raw') === 'true') {
    return res.redirect(302, qrUrl);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json({
    ok: true,
    orderId: code,
    amount,
    qrUrl
  });
};
