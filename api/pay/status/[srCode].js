const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join('/tmp', 'pay_sessions.json');

function getSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const code = (req.query.srCode || req.url.split('/').pop() || '').trim().toUpperCase();
  const sessions = getSessions();
  const numMatch = code.match(/\d+/);
  const ordCode = numMatch ? `ORD${numMatch[0]}` : code;

  const session = sessions[code] || (numMatch ? (sessions[ordCode] || sessions[numMatch[0]]) : null);

  if (!session) {
    return res.json({
      ok: true,
      srCode: code,
      ordCode,
      status: 'pending',
      amount: null
    });
  }

  res.json({
    ok: true,
    srCode: session.srCode,
    ordCode: session.ordCode,
    amount: session.amount,
    status: session.status,
    transactionId: session.transactionId,
    paidAt: session.paidAt
  });
};
