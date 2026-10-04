const { getSessions, saveSessions, isTransactionProcessed, markTransactionProcessed, normalizeCode } = require('../_store');

/**
 * SePay Official Webhook Endpoint for Sora's Station (https://payment.sorae.tokyo)
 * 
 * Payload structure from SePay:
 * {
 *   "id": 92704,
 *   "gateway": "Vietcombank",
 *   "transactionDate": "2024-07-02 11:08:33",
 *   "accountNumber": "1017588888",
 *   "subAccount": "",
 *   "code": "SEVN63DC8E5C",
 *   "content": "ORD192 chuyen tien",
 *   "transferType": "in",
 *   "description": "NGUYEN VAN A chuyen tien",
 *   "transferAmount": 5000000,
 *   "accumulated": 105000000,
 *   "referenceCode": "FT24012345678"
 * }
 * 
 * Valid Response:
 * - HTTP Status: 200 or 201
 * - Exact JSON: {"success": true}
 * - Response within 30 seconds
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-webhook-token');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body || {};
    const transferType = String(payload.transferType || payload.type || 'in').trim().toLowerCase();
    const amount = Number(payload.transferAmount !== undefined ? payload.transferAmount : (payload.amount !== undefined ? payload.amount : payload.amountIn)) || 0;
    const transId = String(payload.id || payload.referenceCode || payload.transactionId || ('FT' + Date.now())).trim();

    // 1. Chỉ xử lý tiền vào ('in'), nếu là giao dịch tiền ra ('out') trả OK để SePay không retry
    if (transferType !== 'in') {
      return res.status(200).json({ success: true });
    }

    // 2. Chống trùng lặp (Idempotency): Khóa bằng transaction ID từ SePay
    if (isTransactionProcessed(transId)) {
      console.log(`[SePay Webhook] 🔁 Bỏ qua giao dịch đã xử lý trước đó: ${transId}`);
      return res.status(200).json({ success: true });
    }

    // 3. Trích xuất mã đơn hàng (ưu tiên trường code của SePay, fallback regex content / description)
    const rawCodeFromField = payload.code ? String(payload.code).trim() : '';
    const content = String(payload.content || payload.description || payload.transactionContent || '');
    const match = rawCodeFromField.match(/(ORD|SR)?\s*#?(\d+)/i) || content.match(/(ORD|SR)?\s*#?(\d+)/i) || content.match(/\d+/);

    let ordCode = null;
    let srCode = null;

    if (match) {
      const num = match[2] || match[0].replace(/[^0-9]/g, '');
      ordCode = num ? `ORD${num}` : normalizeCode(match[0]);
      srCode = num ? `SR${num}` : ordCode.replace(/^ORD/i, 'SR');
    } else if (rawCodeFromField) {
      ordCode = normalizeCode(rawCodeFromField);
      srCode = ordCode.replace(/^ORD/i, 'SR');
    }

    if (ordCode) {
      const sessions = getSessions();
      let session = sessions[ordCode] || sessions[srCode] || {
        orderId: ordCode,
        srCode: srCode || ordCode,
        ordCode: ordCode,
        createdAt: Date.now()
      };

      session.status = 'paid';
      session.paidAt = Date.now();
      session.transactionId = transId;
      session.amount = amount || session.amount || 0;
      session.bank = payload.gateway || payload.bankName || payload.bank || 'MBBank';

      // Lưu mapping cho cả ORD... và SR... để web poll không bị miss
      sessions[ordCode] = session;
      if (srCode) sessions[srCode] = session;
      saveSessions(sessions);

      // Đánh dấu giao dịch đã hoàn tất chống trùng lặp
      markTransactionProcessed(transId);

      console.log(`[SePay Webhook] ✅ Xác nhận thành công đơn: ${ordCode} (${amount.toLocaleString('vi-VN')} đ) - Trans: ${transId}`);

      // 4. Đồng bộ tức thì tới Discord Bot (nếu bot đang chạy trên localhost hoặc server riêng)
      const botWebhookEndpoints = [
        process.env.BOT_WEBHOOK_URL,
        'http://127.0.0.1:3000/api/sepay/webhook',
        'http://localhost:3000/api/sepay/webhook',
        'http://127.0.0.1:3000/webhook/payment'
      ].filter(Boolean);

      for (const botUrl of botWebhookEndpoints) {
        try {
          fetch(botUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Sora-Website-Webhook/1.0'
            },
            body: JSON.stringify({
              id: transId,
              gateway: session.bank,
              transactionDate: payload.transactionDate || new Date().toISOString(),
              accountNumber: payload.accountNumber || '',
              subAccount: payload.subAccount || '',
              code: ordCode,
              content: content || `${ordCode} thanh toan`,
              transferType: 'in',
              transferAmount: amount,
              referenceCode: payload.referenceCode || transId
            }),
            signal: AbortSignal.timeout(1500)
          }).catch(() => {});
          break; // Đã gửi tới endpoint đầu tiên hợp lệ
        } catch {}
      }
    } else {
      // Đơn không có mã đơn nhưng tiền vẫn vào -> Ghi nhận đã nhận
      markTransactionProcessed(transId);
      console.log(`[SePay Webhook] ℹ️ Nhận giao dịch không có mã đơn: ${amount}đ (${content}) - Trans: ${transId}`);
    }

    // 5. Phản hồi hợp lệ chuẩn SePay: HTTP 200 + body {"success": true}
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[SePay Webhook Error]:', err.message);
    // Trả 200 success: true hoặc 500 tùy tình huống
    return res.status(500).json({ success: false, error: err.message });
  }
};
