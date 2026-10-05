const { getSessions, normalizeCode, saveSessions, fetchSessionsAsync, saveSessionsAsync, formatVND } = require('../../_store');

const SEPAY_TOKEN = process.env.SEPAY_API_TOKEN || 'L6UBGXPLJQSNGQHVBQJYMBAQ2C4L77TAPTKRDZCV9UJ2XDHAPZMGD0X6DSKI15Z5';

let cachedTransactions = null;
let lastFetchTime = 0;

async function fetchSePayTransactions() {
  if (!SEPAY_TOKEN) return [];
  const now = Date.now();
  if (!cachedTransactions || (now - lastFetchTime) > 2000) {
    try {
      const res = await fetch('https://my.sepay.vn/userapi/transactions/list?limit=25', {
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
    } catch {}
  }
  return cachedTransactions || [];
}

function parseTxTime(dateVal) {
  if (!dateVal) return Date.now();
  let str = String(dateVal).trim().replace(' ', 'T');
  if (!str.includes('+') && !str.includes('Z')) {
    str += '+07:00';
  }
  const parsed = Date.parse(str);
  return isNaN(parsed) ? Date.now() : parsed;
}

/**
 * Kiểm tra SePay cho giao dịch đơn có mã ORD/SR cụ thể
 */
async function checkSePayForOrder(ordCode) {
  if (!ordCode) return null;
  const transactions = await fetchSePayTransactions();
  if (!transactions.length) return null;

  const targetCode = String(ordCode).toUpperCase();
  const numMatch = targetCode.match(/\d+/);
  const num = numMatch ? numMatch[0] : '';

  for (const tx of transactions) {
    const content = String(tx.transaction_content || tx.content || tx.description || '').toUpperCase();
    const codeField = String(tx.code || '').toUpperCase();
    const amountIn = Number(tx.amount_in || tx.amount || tx.transferAmount || 0);

    if (amountIn <= 0) continue;

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
        paidAt: parseTxTime(tx.transaction_date),
        bank: tx.bank_brand_name || tx.gateway || 'MBBank'
      };
    }
  }
  return null;
}

/**
 * Kiểm tra SePay cho giao dịch tự do (QR bình thường, không mã đơn, số tiền tùy chỉnh)
 * Ai bank bao nhiêu trong phiên thì check bấy nhiêu!
 */
async function checkSePayForGeneral(sinceTime) {
  const transactions = await fetchSePayTransactions();
  if (!transactions.length) return null;

  const now = Date.now();
  // Buffer 3 phút cho sai lệch đồng hồ client/server
  const minTime = (sinceTime && !isNaN(Number(sinceTime))) ? (Number(sinceTime) - 3 * 60 * 1000) : (now - 15 * 60 * 1000);

  for (const tx of transactions) {
    const amountIn = Number(tx.amount_in || tx.amount || tx.transferAmount || 0);
    if (amountIn <= 0) continue;

    const txTime = parseTxTime(tx.transaction_date);

    if (txTime >= minTime) {
      return {
        status: 'paid',
        amount: amountIn,
        transactionId: tx.reference_number || String(tx.id),
        paidAt: txTime,
        bank: tx.bank_brand_name || tx.gateway || 'MBBank',
        content: tx.transaction_content || tx.content || ''
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
  const isGeneral = (!raw || raw === 'GENERAL' || raw === 'SORA' || raw === 'DEFAULT' || raw === '_GENERAL_' || raw === 'ROOT');
  const sinceParam = Number(req.query.since || 0);

  // Tải từ Cloud Master Store
  const sessions = await fetchSessionsAsync();

  // 1. XỬ LÝ PHIÊN THANH TOÁN TỰ DO (QR BÌNH THƯỜNG / KHÔNG MÃ ĐƠN)
  if (isGeneral) {
    let generalSession = sessions['GENERAL'] || sessions['_LATEST_'];
    const minCheckTime = sinceParam ? (sinceParam - 3 * 60 * 1000) : (Date.now() - 15 * 60 * 1000);

    // Kiểm tra xem đã có webhook nhận tiền trong phiên chưa
    if (generalSession && generalSession.status === 'paid' && generalSession.paidAt >= minCheckTime) {
      const finalAmt = generalSession.amount || 0;
      return res.json({
        ok: true,
        isGeneral: true,
        orderId: 'GENERAL',
        srCode: 'GENERAL',
        ordCode: 'GENERAL',
        status: 'paid',
        paid: true,
        amount: finalAmt,
        amountFormatted: finalAmt > 0 ? formatVND(finalAmt) : null,
        transactionId: generalSession.transactionId,
        paidAt: generalSession.paidAt,
        bank: generalSession.bank || 'MBBank'
      });
    }

    // Quét trực tiếp SePay API xem có tiền vào tài khoản không
    const sepayTx = await checkSePayForGeneral(sinceParam);
    if (sepayTx) {
      generalSession = {
        orderId: 'GENERAL',
        srCode: 'GENERAL',
        ordCode: 'GENERAL',
        status: 'paid',
        amount: sepayTx.amount,
        transactionId: sepayTx.transactionId,
        paidAt: sepayTx.paidAt,
        bank: sepayTx.bank
      };
      sessions['GENERAL'] = generalSession;
      sessions['_LATEST_'] = generalSession;
      await saveSessionsAsync(sessions);

      return res.json({
        ok: true,
        isGeneral: true,
        orderId: 'GENERAL',
        srCode: 'GENERAL',
        ordCode: 'GENERAL',
        status: 'paid',
        paid: true,
        amount: sepayTx.amount,
        amountFormatted: formatVND(sepayTx.amount),
        transactionId: sepayTx.transactionId,
        paidAt: sepayTx.paidAt,
        bank: sepayTx.bank
      });
    }

    return res.json({
      ok: true,
      isGeneral: true,
      orderId: 'GENERAL',
      srCode: 'GENERAL',
      ordCode: 'GENERAL',
      status: 'pending',
      paid: false,
      amount: null,
      message: 'Chưa ghi nhận biến động số dư'
    });
  }

  // 2. XỬ LÝ ĐƠN HÀNG CÓ MÃ ORD / SR CỤ THỂ
  const ordCode = normalizeCode(raw);
  const numMatch = ordCode.match(/\d+/);
  const srCode = numMatch ? `SR${numMatch[0]}` : ordCode;

  let session = sessions[ordCode] || sessions[srCode] || sessions[raw];

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
      // "ai bank bao nhiêu khi kiểm tra thì check bấy nhiêu":
      // Cập nhật số tiền thực nhận từ SePay (nếu đơn tùy chỉnh hoặc sepay có số tiền thực tế)
      if (!session.amount || session.amount <= 0 || sepayTx.amount > 0) {
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
      srCode: raw.startsWith('SR') ? raw : srCode,
      ordCode,
      status: 'pending',
      amount: null,
      expiresAt: null,
      createdAt: null
    });
  }

  if (session.status === 'pending' && session.expiresAt && Date.now() > session.expiresAt) {
    session.status = 'expired';
    sessions[ordCode] = session;
    saveSessions(sessions);
  }

  const finalAmount = session.amount || 0;
  res.json({
    ok: true,
    orderId: session.ordCode || ordCode,
    srCode: raw.startsWith('SR') ? raw : (session.srCode || srCode),
    ordCode: session.ordCode || ordCode,
    amount: finalAmount,
    amountFormatted: finalAmount > 0 ? formatVND(finalAmount) : null,
    description: session.description || null,
    status: session.status,
    transactionId: session.transactionId,
    paidAt: session.paidAt,
    expiresAt: session.expiresAt || null,
    createdAt: session.createdAt || null
  });
};
