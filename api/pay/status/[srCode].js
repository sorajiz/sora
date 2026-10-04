const { getSessions, normalizeCode, saveSessions } = require('../../_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const raw = (req.query.srCode || req.url.split('/').pop() || '').trim().toUpperCase();
  const ordCode = normalizeCode(raw);
  const sessions = getSessions();
  const session = sessions[ordCode] || sessions[raw];

  if (!session) {
    return res.json({
      ok: true,
      orderId: ordCode,
      srCode: ordCode,
      ordCode,
      status: 'pending',
      amount: null
    });
  }

  if (session.status === 'pending' && session.expiresAt && Date.now() > session.expiresAt) {
    session.status = 'expired';
    sessions[ordCode] = session;
    saveSessions(sessions);
  }

  res.json({
    ok: true,
    orderId: session.ordCode,
    srCode: session.srCode,
    ordCode: session.ordCode,
    amount: session.amount,
    status: session.status,
    transactionId: session.transactionId,
    paidAt: session.paidAt
  });
};
