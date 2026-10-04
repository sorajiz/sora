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

function saveSessions(data) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch {}
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { srCode, amount, transactionId, bank } = req.body || {};
  if (!srCode) {
    return res.status(400).json({ ok: false, error: 'Thiếu srCode' });
  }

  const rawCode = String(srCode).trim().toUpperCase();
  const numMatch = rawCode.match(/\d+/);
  const orderNum = numMatch ? numMatch[0] : rawCode.replace(/^(SR|ORD)/i, '');
  const ordCode = `ORD${orderNum}`;

  const sessions = getSessions();
  let session = sessions[rawCode] || sessions[ordCode] || {
    srCode: rawCode,
    ordCode,
    amount: amount ? parseInt(amount, 10) : 0,
    createdAt: Date.now()
  };

  session.status = 'paid';
  session.paidAt = Date.now();
  session.transactionId = transactionId || ('FT' + Date.now());
  if (amount) session.amount = parseInt(amount, 10);
  if (bank) session.bank = bank;

  sessions[rawCode] = session;
  sessions[ordCode] = session;
  saveSessions(sessions);

  res.json({
    ok: true,
    srCode: rawCode,
    ordCode,
    status: 'paid',
    transactionId: session.transactionId
  });
};
