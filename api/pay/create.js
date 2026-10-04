const { BANK_CONFIG, fetchSessionsAsync, saveSessionsAsync, formatVND, getQRUrl, normalizeCode } = require('../_store');

module.exports = async (req, res) => {
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
  const sessions = await fetchSessionsAsync();
  const existingSession = sessions[ordCode] || (srCode ? sessions[srCode] : null);

  // Giữ nguyên expiresAt và createdAt gốc nếu phiên đã tồn tại và không truyền expiresAt mới
  const expTime = (expiresAt && !isNaN(Number(expiresAt)))
    ? Number(expiresAt)
    : (existingSession?.expiresAt || (Date.now() + 15 * 60 * 1000));
  const createdAtTime = existingSession?.createdAt || Date.now();
  const qrUrl = getQRUrl(numAmount, ordCode);

  const sessionData = {
    ...existingSession,
    orderId: ordCode,
    srCode: ordCode,
    ordCode,
    amount: numAmount,
    formattedAmount: formatVND(numAmount),
    description: description || existingSession?.description || `Thanh toán đơn hàng ${ordCode}`,
    bank: BANK_CONFIG,
    status: existingSession?.status || 'pending',
    qrUrl,
    payUrl: `https://payment.sorae.tokyo/${ordCode}`,
    directUrl: `https://sorae.tokyo/payment/${ordCode}`,
    subdomainUrl: `https://payment.sorae.tokyo/${ordCode}`,
    createdAt: createdAtTime,
    expiresAt: expTime,
    transactionId: existingSession?.transactionId || null,
    paidAt: existingSession?.paidAt || null
  };

  sessions[ordCode] = sessionData;
  if (srCode && srCode !== ordCode) {
    sessions[srCode] = sessionData;
  }
  await saveSessionsAsync(sessions);

  res.json({
    ok: true,
    orderId: ordCode,
    srCode: ordCode,
    ordCode,
    amount: numAmount,
    formattedAmount: formatVND(numAmount),
    qrUrl,
    payUrl: `https://payment.sorae.tokyo/${ordCode}`,
    directUrl: `https://sorae.tokyo/payment/${ordCode}`,
    subdomainUrl: `https://payment.sorae.tokyo/${ordCode}`,
    expiresAt: expTime,
    bank: BANK_CONFIG
  });
};
