const fs = require('fs');
const path = require('path');

const BANK_CONFIG = {
  bin: '970422',
  stk: '67788990011',
  accountName: 'TRAN DANG KHOA',
  bankName: 'MBBank'
};

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

module.exports = {
  BANK_CONFIG,
  getSessions,
  saveSessions,
  formatVND,
  getQRUrl,
  normalizeCode
};
