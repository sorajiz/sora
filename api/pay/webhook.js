const { getSessions, saveSessions, normalizeCode } = require('../_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const payload = req.body || {};
    const content = payload.content || payload.description || payload.transactionContent || '';
    const amount = payload.transferAmount || payload.amount || payload.amountIn || 0;
    const transId = String(payload.id || payload.transactionId || payload.referenceNumber || ('FT' + Date.now()));

    const match = content.match(/(ORD|SR)?\d+/i);
    if (match) {
      const ordCode = normalizeCode(match[0]);
      const sessions = getSessions();
      let session = sessions[ordCode] || {
        orderId: ordCode,
        srCode: ordCode,
        ordCode,
        createdAt: Date.now()
      };

      session.status = 'paid';
      session.paidAt = Date.now();
      session.transactionId = transId;
      session.amount = Number(amount);
      session.bank = payload.gateway || payload.bankName || 'MBBank';

      sessions[ordCode] = session;
      saveSessions(sessions);

      console.log(`[SePay Webhook] ✅ Nhận tiền thành công: ${ordCode} (${amount}đ) - Trans: ${transId}`);
    }

    res.json({ success: true, message: 'Đã nhận webhook thành công' });
  } catch (err) {
    console.error('[SePay Webhook Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
