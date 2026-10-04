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

  const { srCode, amount, description, bank = 'MBBank', expiresAt } = req.body || {};
  if (!srCode || !amount) {
    return res.status(400).json({ ok: false, error: 'Thiếu srCode hoặc amount' });
  }

  const rawCode = String(srCode).trim().toUpperCase();
  const numMatch = rawCode.match(/\d+/);
  const orderNum = numMatch ? numMatch[0] : rawCode.replace(/^(SR|ORD)/i, '');
  const ordCode = `ORD${orderNum}`;
  const numAmount = parseInt(amount, 10);
  const expTime = expiresAt || (Date.now() + 15 * 60 * 1000);

  const sessionData = {
    srCode: rawCode,
    ordCode,
    amount: numAmount,
    description: description || `Thanh toán đơn hàng ${ordCode}`,
    bank,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: expTime,
    transactionId: null,
    paidAt: null
  };

  const sessions = getSessions();
  sessions[rawCode] = sessionData;
  sessions[ordCode] = sessionData;
  saveSessions(sessions);

  res.json({
    ok: true,
    srCode: rawCode,
    ordCode,
    amount: numAmount,
    payUrl: `https://payment.sorae.tokyo/${ordCode}`,
    expiresAt: expTime
  });
};
