const fs = require('fs');
const path = require('path');
const os = require('os');

const BANK_CONFIG = {
  bin: '970422',
  stk: '67788990011',
  accountName: 'TRAN DANG KHOA',
  bankName: 'MBBank'
};

const tmpDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
const SESSIONS_FILE = path.join(tmpDir, 'pay_sessions.json');
const PROCESSED_FILE = path.join(tmpDir, 'pay_processed_tx.json');

// In-memory fallback / cache for fast serverless execution
let memorySessions = null;
let memoryProcessedTx = null;

function getSessions() {
  if (memorySessions) return memorySessions;
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      memorySessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      return memorySessions;
    }
  } catch {}
  memorySessions = {};
  return memorySessions;
}

function saveSessions(data) {
  memorySessions = data || {};
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(memorySessions, null, 2), 'utf8');
  } catch {}
}

function getProcessedTx() {
  if (memoryProcessedTx) return memoryProcessedTx;
  try {
    if (fs.existsSync(PROCESSED_FILE)) {
      const arr = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
      memoryProcessedTx = new Set(Array.isArray(arr) ? arr : []);
      return memoryProcessedTx;
    }
  } catch {}
  memoryProcessedTx = new Set();
  return memoryProcessedTx;
}

function isTransactionProcessed(transId) {
  if (!transId) return false;
  const processed = getProcessedTx();
  return processed.has(String(transId));
}

function markTransactionProcessed(transId) {
  if (!transId) return;
  const processed = getProcessedTx();
  processed.add(String(transId));
  try {
    const list = Array.from(processed).slice(-500); // Lưu tối đa 500 ID gần nhất
    fs.writeFileSync(PROCESSED_FILE, JSON.stringify(list), 'utf8');
  } catch {}
}

function formatVND(amt) {
  return Number(amt || 0).toLocaleString('vi-VN') + ' đ';
}

function getQRUrl(amt, memo) {
  const encName = encodeURIComponent(BANK_CONFIG.accountName);
  const encMemo = encodeURIComponent(memo);
  const amtParam = (amt && !isNaN(amt)) ? `amount=${amt}&` : '';
  return `https://api.vietqr.io/image/${BANK_CONFIG.bin}-${BANK_CONFIG.stk}-qr_only.png?${amtParam}addInfo=${encMemo}&accountName=${encName}`;
}

function normalizeCode(rawCode) {
  if (!rawCode) return 'ORD' + Math.floor(100 + Math.random() * 900);
  const c = String(rawCode).trim().toUpperCase();
  const numMatch = c.match(/\d+/);
  return numMatch ? `ORD${numMatch[0]}` : c;
}

const CLOUD_MASTER_ID = 'ff808181a09d98f701a1078ee80a7454';
const CLOUD_API_URL = 'https://api.restful-api.dev/objects/' + CLOUD_MASTER_ID;

async function fetchSessionsAsync() {
  const local = getSessions();
  try {
    const res = await fetch(CLOUD_API_URL, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.orders) {
        memorySessions = { ...local, ...json.data.orders };
        saveSessions(memorySessions);
        return memorySessions;
      }
    }
  } catch {}
  return local;
}

async function saveSessionsAsync(data) {
  saveSessions(data);
  try {
    // Fetch-and-merge: luôn lấy dữ liệu mới nhất từ Cloud trước khi PUT
    // Tránh race condition khi nhiều Vercel instance PUT đồng thời sẽ overwrite mất nhau
    let cloudOrders = {};
    try {
      const fetchRes = await fetch(CLOUD_API_URL, { signal: AbortSignal.timeout(2000) });
      if (fetchRes.ok) {
        const json = await fetchRes.json();
        if (json?.data?.orders) cloudOrders = json.data.orders;
      }
    } catch {}

    // Merge: data mới ghi đè lên cloud cũ (để đảm bảo status update đúng)
    const merged = { ...cloudOrders, ...data };

    await fetch(CLOUD_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'sora_payments_master_store',
        data: { orders: merged, updatedAt: Date.now() }
      }),
      signal: AbortSignal.timeout(3000)
    });
  } catch {}
}


module.exports = {
  BANK_CONFIG,
  getSessions,
  saveSessions,
  fetchSessionsAsync,
  saveSessionsAsync,
  isTransactionProcessed,
  markTransactionProcessed,
  formatVND,
  getQRUrl,
  normalizeCode
};
