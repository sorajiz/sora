const { BANK_CONFIG, getSessions, saveSessions, formatVND, getQRUrl, normalizeCode } = require('../_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { srCode, amount, description, expiresAt } = req.body || {};
  if (!amount) {
    return res.status(400).json({ ok: false, error: 'Thiếu số tiền (amount)' });
  }

  const numAmount = parseInt(amount, 10);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ ok: false, error: 'Số tiền không hợp lệ' });
  }

  const ordCode = normalizeCode(srCode);
  const expTime = expiresAt || (Date.now() + 15 * 60 * 1000);
  const qrUrl = getQRUrl(numAmount, ordCode);

  const sessionData = {
    orderId: ordCode,
    srCode: ordCode,
    ordCode,
    amount: numAmount,
    formattedAmount: formatVND(numAmount),
    description: description || `Thanh toán đơn hàng ${ordCode}`,
    bank: BANK_CONFIG,
    status: 'pending',
    qrUrl,
    payUrl: `https://sorae.tokyo/payment?code=${ordCode}`,
    directUrl: `https://sorae.tokyo/payment/${ordCode}`,
    subdomainUrl: `https://payment.sorae.tokyo/${ordCode}`,
    createdAt: Date.now(),
    expiresAt: expTime,
    transactionId: null,
    paidAt: null
  };

  const sessions = getSessions();
  sessions[ordCode] = sessionData;
  saveSessions(sessions);

  res.json({
    ok: true,
    orderId: ordCode,
    srCode: ordCode,
    ordCode,
    amount: numAmount,
    formattedAmount: formatVND(numAmount),
    qrUrl,
    payUrl: `https://sorae.tokyo/payment?code=${ordCode}`,
    directUrl: `https://sorae.tokyo/payment/${ordCode}`,
    subdomainUrl: `https://payment.sorae.tokyo/${ordCode}`,
    expiresAt: expTime,
    bank: BANK_CONFIG
  });
};
