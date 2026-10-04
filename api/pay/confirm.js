const { getSessions, saveSessions, fetchSessionsAsync, saveSessionsAsync, normalizeCode } = require('../_store');

module.exports = async (req, res) => {
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
  const numMatch = ordCode.match(/\d+/);
  const srAlt = numMatch ? `SR${numMatch[0]}` : ordCode;

  const sessions = await fetchSessionsAsync();
  let session = sessions[ordCode] || sessions[srAlt] || {
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
  if (srAlt) sessions[srAlt] = session;
  await saveSessionsAsync(sessions);

  res.json({
    ok: true,
    orderId: ordCode,
    srCode: ordCode,
    ordCode,
    status: 'paid',
    transactionId: session.transactionId
  });
};
