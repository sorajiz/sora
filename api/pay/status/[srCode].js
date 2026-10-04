const { getSessions, normalizeCode, saveSessions, fetchSessionsAsync, saveSessionsAsync } = require('../../_store');

const SEPAY_TOKEN = process.env.SEPAY_API_TOKEN || 'L6UBGXPLJQSNGQHVBQJYMBAQ2C4L77TAPTKRDZCV9UJ2XDHAPZMGD0X6DSKI15Z5';

let cachedTransactions = null;
let lastFetchTime = 0;

/**
 * Kiểm tra trực tiếp trên SePay xem đơn đã có tiền vào chưa
 * Dùng bộ đệm 2 giây để tránh vượt rate-limit của SePay (tối đa 3 req/s)
 * @param {string} ordCode 
 */
async function checkSePayForOrder(ordCode) {
  if (!SEPAY_TOKEN || !ordCode) return null;
  const now = Date.now();

  // Chỉ fetch SePay tối đa 1 lần mỗi 2 giây giữa các client
  if (!cachedTransactions || (now - lastFetchTime) > 2000) {
    try {
      const res = await fetch('https://my.sepay.vn/userapi/transactions/list?limit=15', {
        headers: {
          'Authorization': `Bearer ${SEPAY_TOKEN}`,
          'Accept': 'application/json',
          'User-Agent': 'SoraPay-StatusCheck/1.0'
        },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        cachedTransactions = Array.isArray(data?.transactions) ? data.transactions : [];
        lastFetchTime = now;
      }
    } catch {
      // Bỏ qua lỗi mạng, tiếp tục dùng cache cũ nếu có
    }
  }

  if (!cachedTransactions || !cachedTransactions.length) return null;

  const targetCode = String(ordCode).toUpperCase();
  const numMatch = targetCode.match(/\d+/);
  const num = numMatch ? numMatch[0] : '';

  for (const tx of cachedTransactions) {
    const content = String(tx.transaction_content || tx.content || tx.description || '').toUpperCase();
    const codeField = String(tx.code || '').toUpperCase();
    const amountIn = Number(tx.amount_in || tx.amount || tx.transferAmount || 0);

    // Giao dịch phải là tiền vào (> 0)
    if (amountIn <= 0) continue;

    // Kiểm tra khớp mã ORD... / SR... / số thứ tự đơn
    const isMatched = (
      (codeField && codeField === targetCode) ||
      content.includes(targetCode) ||
      (num && (
        content.includes(`ORD${num}`) ||
        content.includes(`SR${num}`) ||
        content.includes(`.${num}.`) ||
        content.includes(` ${num} `)
      ))
    );

    if (isMatched) {
      return {
        status: 'paid',
        amount: amountIn,
        transactionId: tx.reference_number || String(tx.id),
        paidAt: tx.transaction_date ? new Date(tx.transaction_date).getTime() : Date.now(),
        bank: tx.bank_brand_name || tx.gateway || 'MBBank'
      };
    }
  }

  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const raw = (req.query.srCode || req.url.split('?')[0].split('/').pop() || '').trim().toUpperCase();
  const ordCode = normalizeCode(raw);
  const numMatch = ordCode.match(/\d+/);
  const srCode = numMatch ? `SR${numMatch[0]}` : ordCode;

  // Luôn tải từ Cloud Master Store để đảm bảo dữ liệu nhất quán
  // (Vercel serverless có nhiều instance độc lập, memory không chia sẻ)
  const sessions = await fetchSessionsAsync();
  let session = sessions[ordCode] || sessions[srCode] || sessions[raw];

  // 1. Nếu session chưa có hoặc đang pending, kiểm tra SePay Realtime
  if (!session || session.status === 'pending') {
    const sepayTx = await checkSePayForOrder(ordCode);
    if (sepayTx) {
      session = session || {
        orderId: ordCode,
        srCode: ordCode,
        ordCode,
        createdAt: Date.now()
      };
      session.status = 'paid';
      // Ưu tiên giữ amount từ session gốc (Bot tạo), chỉ dùng SePay amount làm fallback
      // Điều này đảm bảo amount hiển thị đúng với số tiền yêu cầu, không phải số tiền thực tế chuyển
      if (!session.amount || session.amount <= 0) {
        session.amount = sepayTx.amount;
      }
      session.transactionId = sepayTx.transactionId;
      session.paidAt = sepayTx.paidAt;
      session.bank = sepayTx.bank;

      sessions[ordCode] = session;
      sessions[srCode] = session;
      await saveSessionsAsync(sessions);
    }
  }

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

  const { formatVND } = require('../../_store');
  const finalAmount = session.amount || 0;
  res.json({
    ok: true,
    orderId: session.ordCode || ordCode,
    srCode: session.srCode || srCode,
    ordCode: session.ordCode || ordCode,
    amount: finalAmount,
    amountFormatted: finalAmount > 0 ? formatVND(finalAmount) : null,
    description: session.description || null,
    status: session.status,
    transactionId: session.transactionId,
    paidAt: session.paidAt
  });
};
