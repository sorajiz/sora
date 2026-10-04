const { getSessions, saveSessions, normalizeCode } = require('../_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { srCode, amount, transactionId, bank } = req.body || {};
  if (!srCode) {
    return res.status(400).json({ ok: false, error: 'Thiếu srCode (Mã đơn hàng)' });
  }

  const ordCode = normalizeCode(srCode);
  const sessions = getSessions();
  let session = sessions[ordCode] || {
    orderId: ordCode,
    srCode: ordCode,
    ordCode,
    amount: amount ? parseInt(amount, 10) : 0,
    createdAt: Date.now()
  };

  session.status = 'paid';
  session.paidAt = Date.now();
  session.transactionId = transactionId || ('FT' + Date.now());
  if (amount) session.amount = parseInt(amount, 10);
  if (bank) session.bank = bank;

  sessions[ordCode] = session;
  saveSessions(sessions);

  res.json({
    ok: true,
    orderId: ordCode,
    srCode: ordCode,
    ordCode,
    status: 'paid',
    transactionId: session.transactionId
  });
};
