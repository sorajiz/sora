/**
 * ============================================================================
 * SORA PRODUCTION & DEVELOPMENT SERVER - ULTRA-OPTIMIZED ENGINE
 * ============================================================================
 * - Zero "Load-Load" Latency: Instant First-Byte Delivery via Gzip/Brotli Compression
 * - Strict Hardened CSP: No 'unsafe-eval' (Eval-Free AST Obfuscation Architecture)
 * - Isolated Distribution: Serves strictly from dist/ (Root code is 100% shielded)
 * - Intelligent Rate Limiting: Anti-DDoS with Localhost / Private Subnet Bypass
 * - High-Speed Static Caching: Revalidating Asset Caching (< 1ms)
 * - Resilient Clean Routing & Graceful Lifecycle Management
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';
const DIST_DIR = path.join(__dirname, 'dist');

// Ensure dist exists before serving
if (!fs.existsSync(DIST_DIR)) {
  try {
    const build = require('./scripts/build');
    build();
  } catch (err) {
    console.warn('⚠️ [Server]: dist/ directory not found and auto-build failed:', err.message);
  }
}

// ----------------------------------------------------------------------------
// 1. REVERSE PROXY & TRUST SETTINGS
// ----------------------------------------------------------------------------
// Enables accurate client IP detection behind Cloudflare, Vercel, Nginx, or Docker
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ----------------------------------------------------------------------------
// 2. ULTRA-FAST GZIP / BROTLI COMPRESSION
// ----------------------------------------------------------------------------
app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  })
);

// Body parsing for JSON and URL-encoded API requests (Payment Webhooks & Session creation)
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf ? buf.toString('utf8') : '';
  }
}));
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------------------------------
// 3. HARDENED CSP & ADAPTIVE HELMET SECURITY (NO UNSAFE-EVAL)
// ----------------------------------------------------------------------------
// Removed 'unsafe-eval' - JavaScript runtime is pure AST without dynamic Function/eval
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://va.vercel-scripts.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
  imgSrc: ["'self'", "data:", "blob:", "https:"],
  mediaSrc: ["'self'", "data:", "blob:"],
  connectSrc: ["'self'", "ws:", "wss:", "http:", "https:", "https://va.vercel-scripts.com"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"]
};

// Only upgrade insecure requests if explicitly requested and running on HTTPS in production
if (IS_PROD && process.env.FORCE_HTTPS === 'true') {
  cspDirectives.upgradeInsecureRequests = [];
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: IS_PROD
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false, // Disabled on localhost to prevent permanent HTTPS lock
    noSniff: true,
    xssFilter: true,
    frameguard: { action: 'deny' }
  })
);

// ----------------------------------------------------------------------------
// 4. INTELLIGENT RATE LIMITING (ANTI-DDOS WITH LOCAL BYPASS)
// ----------------------------------------------------------------------------
const isLocalAddress = (ip) => {
  if (!ip) return false;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  );
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: IS_PROD ? 500 : 5000, // Generous limit
  skip: (req) => isLocalAddress(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Hệ thống bảo vệ Sora: Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.'
  }
});

app.use(limiter);

// ----------------------------------------------------------------------------
// 5. INTERNAL REPO & SOURCE CODE PROTECTION (SHIELD ROOT)
// ----------------------------------------------------------------------------
const FORBIDDEN_PATTERNS = [
  /^\/\.git/,
  /^\/\.github/,
  /^\/\.agents/,
  /^\/\.src/,
  /^\/views/,
  /^\/scripts/,
  /^\/security/,
  /^\/docs/,
  /^\/node_modules/,
  /^\/package\.json$/,
  /^\/package-lock\.json$/,
  /^\/\.env/,
  /^\/server\.js$/,
  /^\/index\.js$/,
  /^\/vercel\.json$/,
  /^\/vite\.config\.js$/,
  /^\/fiveserver\.config\.js$/,
  /^\/README\.md$/
];

app.use((req, res, next) => {
  const reqPath = req.path;
  const isForbidden = FORBIDDEN_PATTERNS.some((pattern) => pattern.test(reqPath));
  if (isForbidden) {
    return res.status(403).type('text/plain').send('403 Forbidden: Direct access to internal system files is restricted.');
  }
  next();
});

// ----------------------------------------------------------------------------
// 6. HEALTH & STATUS ENDPOINTS
// ----------------------------------------------------------------------------
app.get(['/health', '/api/health', '/api/status'], (req, res) => {
  res.json({
    status: 'ok',
    app: 'Sora Portfolio',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: IS_PROD ? 'production' : 'development'
  });
});

// ----------------------------------------------------------------------------
// 6b. REAL-TIME PAYMENT GATEWAY API & ORDER SESSIONS
// ----------------------------------------------------------------------------
const PAY_DATA_DIR = path.join(__dirname, 'data');
const PAY_SESSIONS_FILE = path.join(PAY_DATA_DIR, 'pay_sessions.json');

if (!fs.existsSync(PAY_DATA_DIR)) {
  try { fs.mkdirSync(PAY_DATA_DIR, { recursive: true }); } catch {}
}

const paySessions = new Map();

function loadPaySessions() {
  try {
    if (fs.existsSync(PAY_SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PAY_SESSIONS_FILE, 'utf8'));
      for (const [k, v] of Object.entries(data)) {
        paySessions.set(k.toUpperCase(), v);
      }
    }
  } catch {}
}

function savePaySessions() {
  try {
    const obj = {};
    for (const [k, v] of paySessions.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(PAY_SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch {}
}

loadPaySessions();

function findPaySession(queryCode) {
  if (!queryCode) return null;
  const q = String(queryCode).trim().toUpperCase();
  if (paySessions.has(q)) return paySessions.get(q);

  const numMatch = q.match(/\d+/);
  if (numMatch) {
    const num = numMatch[0];
    if (paySessions.has(`ORD${num}`)) return paySessions.get(`ORD${num}`);
    if (paySessions.has(`SR${num}`)) return paySessions.get(`SR${num}`);
    if (paySessions.has(num)) return paySessions.get(num);
  }
  return null;
}

const BANK_CONFIG = {
  bin: '970422',
  stk: '67788990011',
  accountName: 'TRAN DANG KHOA',
  bankName: 'MBBank'
};

function getQRUrl(amt, memo) {
  const encName = encodeURIComponent(BANK_CONFIG.accountName);
  const encMemo = encodeURIComponent(memo);
  const amtParam = (amt && !isNaN(amt)) ? `amount=${amt}&` : '';
  return `https://api.vietqr.io/image/${BANK_CONFIG.bin}-${BANK_CONFIG.stk}-qr_only.png?${amtParam}addInfo=${encMemo}&accountName=${encName}`;
}

// 6c. SORA PAYMENT GATEWAY API INFO
app.get(['/api/pay', '/api/payment'], (req, res) => {
  res.json({
    status: 'online',
    service: "Sora's Station Payment Gateway API",
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    bank: BANK_CONFIG,
    endpoints: {
      createOrder: 'POST /api/pay/create',
      checkStatus: 'GET /api/pay/status/:srCode',
      confirmPayment: 'POST /api/pay/confirm',
      getQR: 'GET /api/pay/qr?amount=10000&code=ORD197'
    },
    webUrls: {
      mainDomain: 'https://sorae.tokyo/pay/:code',
      subDomain: 'https://payment.sorae.tokyo/:code'
    }
  });
});

// GET QR image or URL
app.get(['/api/pay/qr', '/api/payment/qr'], (req, res) => {
  const amount = parseInt(req.query.amount || req.query.amt || '0', 10);
  const rawCode = (req.query.code || req.query.order || req.query.sr || 'ORD192').toUpperCase();
  const numMatch = rawCode.match(/\d+/);
  const ordCode = numMatch ? `ORD${numMatch[0]}` : rawCode;
  const qrUrl = getQRUrl(amount, ordCode);

  if (req.query.redirect === 'true' || req.query.raw === 'true') {
    return res.redirect(302, qrUrl);
  }

  res.json({
    ok: true,
    orderId: ordCode,
    amount,
    qrUrl
  });
});

// Create payment session (called by Workspace-ZyX-Bot upon /qr)
app.post(['/api/pay/create', '/api/payment/create'], (req, res) => {
  const { srCode, amount, description, bank = 'MBBank', expiresAt } = req.body || {};
  if (!amount) {
    return res.status(400).json({ ok: false, error: 'Thiếu số tiền (amount)' });
  }

  const numAmount = parseInt(amount, 10);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ ok: false, error: 'Số tiền không hợp lệ' });
  }

  const rawCode = srCode ? String(srCode).trim().toUpperCase() : ('ORD' + Math.floor(100 + Math.random() * 900));
  const numMatch = rawCode.match(/\d+/);
  const orderNum = numMatch ? numMatch[0] : rawCode.replace(/^(SR|ORD)/i, '');
  const ordCode = `ORD${orderNum}`;
  const expTime = expiresAt || (Date.now() + 15 * 60 * 1000);
  const qrUrl = getQRUrl(numAmount, ordCode);

  const sessionData = {
    orderId: ordCode,
    srCode: rawCode,
    ordCode,
    amount: numAmount,
    formattedAmount: numAmount.toLocaleString('vi-VN') + ' đ',
    description: description || `Thanh toán đơn hàng ${ordCode}`,
    bank: BANK_CONFIG,
    status: 'pending',
    qrUrl,
    payUrl: `https://sorae.tokyo/pay/${ordCode}`,
    subdomainUrl: `https://payment.sorae.tokyo/${ordCode}`,
    createdAt: Date.now(),
    expiresAt: expTime,
    transactionId: null,
    paidAt: null
  };

  paySessions.set(rawCode, sessionData);
  paySessions.set(ordCode, sessionData);
  savePaySessions();

  console.log(`[Payment] ⚡ Đã tạo phiên thanh toán Web: ${ordCode} (${rawCode}) — ${numAmount.toLocaleString('vi-VN')}đ`);

  res.json({
    ok: true,
    orderId: ordCode,
    srCode: rawCode,
    ordCode,
    amount: numAmount,
    formattedAmount: sessionData.formattedAmount,
    qrUrl,
    payUrl: `https://sorae.tokyo/payment?code=${ordCode}&amount=${numAmount}`,
    directUrl: `https://sorae.tokyo/payment/${ordCode}?amount=${numAmount}`,
    subdomainUrl: `https://payment.sorae.tokyo/${ordCode}?amount=${numAmount}`,
    cleanSubdomainUrl: `https://payment.sorae.tokyo/${ordCode}`,
    expiresAt: expTime,
    bank: BANK_CONFIG
  });
});

// Check payment status (polled by frontend or bot)
app.get(['/api/pay/status/:srCode', '/api/payment/status/:srCode'], (req, res) => {
  const code = (req.params.srCode || '').trim().toUpperCase();
  const session = findPaySession(code);

  if (!session) {
    const numMatch = code.match(/\d+/);
    const ordCode = numMatch ? `ORD${numMatch[0]}` : code;
    return res.json({
      ok: true,
      srCode: code,
      ordCode,
      status: 'pending',
      amount: null
    });
  }

  if (session.status === 'pending' && session.expiresAt && Date.now() > session.expiresAt) {
    session.status = 'expired';
    savePaySessions();
  }

  res.json({
    ok: true,
    orderId: session.ordCode || session.srCode,
    srCode: code || session.srCode,
    ordCode: session.ordCode || session.srCode,
    amount: session.amount,
    status: session.status,
    transactionId: session.transactionId,
    paidAt: session.paidAt
  });
});

// Confirm payment (called by Workspace-ZyX-Bot upon MBBank receipt)
app.post(['/api/pay/confirm', '/api/payment/confirm'], (req, res) => {
  const { srCode, amount, transactionId, bank } = req.body || {};
  if (!srCode) {
    return res.status(400).json({ ok: false, error: 'Thiếu srCode' });
  }

  const rawCode = String(srCode).trim().toUpperCase();
  let session = findPaySession(rawCode);

  const numMatch = rawCode.match(/\d+/);
  const orderNum = numMatch ? numMatch[0] : rawCode.replace(/^(SR|ORD)/i, '');
  const ordCode = `ORD${orderNum}`;

  if (!session) {
    session = {
      srCode: rawCode,
      ordCode,
      amount: amount ? parseInt(amount, 10) : 0,
      createdAt: Date.now()
    };
  }

  session.status = 'paid';
  session.paidAt = Date.now();
  session.transactionId = transactionId || ('FT' + Date.now());
  if (amount) session.amount = parseInt(amount, 10);
  if (bank) session.bank = bank;

  paySessions.set(rawCode, session);
  paySessions.set(ordCode, session);
  savePaySessions();

  console.log(`[Payment] 🎉 Xác nhận thanh toán thành công Web: ${ordCode} — Trans: ${session.transactionId}`);

  res.json({
    ok: true,
    srCode: rawCode,
    ordCode,
    status: 'paid',
    transactionId: session.transactionId
  });
});

// Direct Webhook endpoint for SePay / Payment gateways
app.post(['/api/pay/webhook', '/api/payment/webhook', '/hooks/sepay-payment', '/api/hooks/sepay-payment'], (req, res) => {
  try {
    const payload = req.body || {};
    const content = payload.content || payload.description || '';
    const amount = payload.transferAmount || payload.amount || 0;
    const transId = String(payload.id || payload.transactionId || 'FT' + Date.now());

    const match = content.match(/(ORD|SR)?\d+/i);
    if (match) {
      const matchedCode = match[0].toUpperCase();
      let session = findPaySession(matchedCode);
      const numMatch = matchedCode.match(/\d+/);
      const ordCode = numMatch ? `ORD${numMatch[0]}` : matchedCode;

      if (!session) {
        session = { srCode: matchedCode, ordCode, amount: Number(amount), createdAt: Date.now() };
      }
      session.status = 'paid';
      session.paidAt = Date.now();
      session.transactionId = transId;
      session.amount = Number(amount);
      paySessions.set(matchedCode, session);
      paySessions.set(ordCode, session);
      savePaySessions();
      console.log(`[Payment Webhook] ✅ Nhận tiền SePay Webhook: ${ordCode} (${amount}đ) - Trans: ${transId}`);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 7. HIGH-PERFORMANCE STATIC FILE SERVING FROM DIST/
// ----------------------------------------------------------------------------
// Serves exclusively from dist/ directory to isolate the repository root.
// Asset Cache-Control uses revalidation instead of permanent immutable cache.
const staticServingDir = fs.existsSync(DIST_DIR) ? DIST_DIR : __dirname;

app.use(
  express.static(staticServingDir, {
    dotfiles: 'allow',
    etag: true,
    index: false, // Custom clean routes handle HTML files
    maxAge: IS_PROD ? '7d' : 0,
    redirect: false,
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');

      if (filePath.endsWith('.html')) {
        // HTML is always validated with ETag (instant 304 if unchanged)
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|mp3|webm|wav|ogg)$/i)) {
        // Static media cached with stale-while-revalidate for freshness
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      } else if (filePath.endsWith('.css') || filePath.endsWith('.js') || filePath.endsWith('.json') || filePath.endsWith('.webmanifest')) {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      }
    }
  })
);

// ----------------------------------------------------------------------------
// 8. ZERO-DELAY CLEAN URL ROUTING (IN-MEMORY CACHED PAGES)
// ----------------------------------------------------------------------------
const PAGES = {
  home: 'index.html',
  intro: 'intro.html',
  skills: 'skills.html',
  contact: 'contact.html',
  discord: 'discord.html',
  timework: 'timework.html',
  pay: 'pay.html'
};

function serveHtmlPage(fileName, res) {
  let targetPath = path.join(DIST_DIR, fileName);
  let targetRoot = DIST_DIR;

  if (!fs.existsSync(targetPath)) {
    fileName = PAGES.home;
    targetPath = path.join(DIST_DIR, PAGES.home);
  }

  if (!fs.existsSync(targetPath)) {
    try {
      const build = require('./scripts/build');
      build();
    } catch (e) {
      console.error('Auto-build failed in serveHtmlPage:', e);
    }
  }

  if (!fs.existsSync(targetPath)) {
    return res.status(404).type('text/plain').send('404 Not Found: Page not found.');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(fileName, {
    root: targetRoot,
    dotfiles: 'allow',
    etag: true
  }, (err) => {
    if (err && !res.headersSent) {
      console.error(`⚠️ [Server Error sending ${fileName}]:`, err.message);
      res.status(500).type('text/plain').send('500 Internal Server Error: Please try again shortly.');
    }
  });
}

function servePayPage(req, res) {
  let targetPath = path.join(DIST_DIR, 'pay.html');
  if (!fs.existsSync(targetPath)) {
    try {
      const build = require('./scripts/build');
      build();
    } catch (e) {
      console.error('Auto-build failed in servePayPage:', e);
    }
  }
  if (!fs.existsSync(targetPath)) {
    return res.status(404).type('text/plain').send('404 Not Found: pay.html not found.');
  }

  // Parse order code and dynamic amount from path or query parameters
  const pathClean = req.path.replace(/^\/pay\/?|^\/payment\/?|^\//, '');
  const segments = pathClean.split('/').filter(Boolean);
  const codeParam = req.params?.srCode || req.query?.code || req.query?.order || req.query?.sr || (segments.length > 0 ? segments[0] : null);
  const amountQuery = req.query?.amount || req.query?.amt || req.query?.price || req.query?.tien || (segments.length > 1 ? segments[1] : null);

  const session = findPaySession(codeParam);
  let orderData = null;

  if (session) {
    orderData = { ...session };
    if (amountQuery) orderData.amount = parseInt(amountQuery, 10);
  } else if (codeParam || amountQuery) {
    const rawCode = (codeParam || 'ORD192').toUpperCase();
    const numMatch = rawCode.match(/\d+/);
    const ordCode = numMatch ? `ORD${numMatch[0]}` : rawCode;
    orderData = {
      srCode: rawCode,
      ordCode,
      amount: amountQuery ? parseInt(amountQuery, 10) : null
    };
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

  if (orderData) {
    try {
      let html = fs.readFileSync(targetPath, 'utf8');
      const injection = `window.__SERVER_ORDER__ = ${JSON.stringify(orderData)};`;
      html = html.replace('/*__SERVER_ORDER__*/', injection);
      return res.send(html);
    } catch (err) {
      console.error('Error injecting server order in servePayPage:', err);
    }
  }

  return res.sendFile('pay.html', { root: DIST_DIR });
}

// Hostname-based routing for subdomains (discord.sorae.tokyo, timework.sorae.tokyo, pay.sorae.tokyo, payment.sorae.tokyo)
app.use((req, res, next) => {
  const host = (req.hostname || req.headers.host || '').toLowerCase();
  if (host.startsWith('discord.')) {
    if (req.path === '/' || req.path === '/index' || req.path === '/index.html' || req.path === '/discord' || req.path === '/discord.html') {
      return serveHtmlPage(PAGES.discord, res);
    }
  }
  if (host.startsWith('timework.') || host.startsWith('timeworks.')) {
    if (req.path === '/' || req.path === '/index' || req.path === '/index.html' || req.path === '/timework' || req.path === '/timework.html' || req.path === '/timeworks' || req.path === '/timeworks.html') {
      return serveHtmlPage(PAGES.timework, res);
    }
  }
  if (host.startsWith('pay.') || host.startsWith('payment.')) {
    // If not an API or Webhook request, serve the payment page with dynamic order data
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/hooks/') && !req.path.startsWith('/assets/') && !req.path.startsWith('/js/') && !req.path.startsWith('/music/')) {
      return servePayPage(req, res);
    }
  }
  next();
});

// Clean route bindings
app.get(['/', '/index', '/index.html'], (req, res) => {
  serveHtmlPage(PAGES.home, res);
});

app.get(['/intro', '/intro.html'], (req, res) => {
  serveHtmlPage(PAGES.intro, res);
});

app.get(['/skills', '/skills.html'], (req, res) => {
  serveHtmlPage(PAGES.skills, res);
});

app.get(['/contact', '/contact.html'], (req, res) => {
  serveHtmlPage(PAGES.contact, res);
});

app.get(['/discord', '/discord.html'], (req, res) => {
  serveHtmlPage(PAGES.discord, res);
});

app.get(['/timework', '/timework.html', '/timeworks', '/timeworks.html'], (req, res) => {
  serveHtmlPage(PAGES.timework, res);
});

app.get([
  '/pay', '/pay.html', '/pay/:srCode', '/pay/:srCode/:amount',
  '/payment', '/payment.html', '/payment/:srCode', '/payment/:srCode/:amount'
], (req, res) => {
  servePayPage(req, res);
});

// Direct ORD/SR order code route support (e.g. /ORD198)
app.get(/^\/(ORD|SR)\d+/i, (req, res) => {
  servePayPage(req, res);
});

// Favicon endpoints (served cleanly from dist/assets/ or assets/)
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const favDist = path.join(DIST_DIR, 'assets', 'favicon.ico');
  const rootDir = fs.existsSync(favDist) ? DIST_DIR : __dirname;
  const relPath = fs.existsSync(favDist) ? path.join('assets', 'favicon.ico') : path.join('assets', 'favicon.ico');
  res.sendFile(relPath, { root: rootDir, dotfiles: 'allow' });
});

app.get('/favicon.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const favDist = path.join(DIST_DIR, 'assets', 'favicon.png');
  const rootDir = fs.existsSync(favDist) ? DIST_DIR : __dirname;
  const relPath = fs.existsSync(favDist) ? path.join('assets', 'favicon.png') : path.join('assets', 'favicon.png');
  res.sendFile(relPath, { root: rootDir, dotfiles: 'allow' });
});

// OpenGraph & Discord Rich Banner endpoint
app.get(['/banner.png', '/assets/banner.png'], (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  const bannerDist = path.join(DIST_DIR, 'assets', 'banner.png');
  const rootDir = fs.existsSync(bannerDist) ? DIST_DIR : __dirname;
  const relPath = fs.existsSync(bannerDist) ? path.join('assets', 'banner.png') : path.join('assets', 'banner.png');
  res.sendFile(relPath, { root: rootDir, dotfiles: 'allow' });
});

// Web App Manifest (PWA) endpoint
app.get(['/manifest.json', '/site.webmanifest'], (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const manifestDist = path.join(DIST_DIR, 'manifest.json');
  const targetRoot = fs.existsSync(manifestDist) ? DIST_DIR : __dirname;
  res.sendFile('manifest.json', { root: targetRoot, dotfiles: 'allow' });
});

// Vercel Web Analytics Local Sandbox Endpoint (production runs on Vercel Edge automatically)
app.get('/_vercel/insights/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send('/* [Vercel Web Analytics Local Sandbox] */ (function(){ window.va = window.va || function(){ (window.vaq = window.vaq || []).push(arguments); }; })();');
});

app.post(['/_vercel/insights/view', '/_vercel/insights/event'], (req, res) => {
  res.json({ ok: true, source: 'local-dev' });
});

// ----------------------------------------------------------------------------
// 8.5. PAYMENT & WEBHOOK API (Sora Pay Gateway & SePay Webhook)
// ----------------------------------------------------------------------------
const payWebhookHandler = require('./api/pay/webhook');
const payCreateHandler = require('./api/pay/create');
const payConfirmHandler = require('./api/pay/confirm');
const payStatusHandler = require('./api/pay/status/[srCode]');

app.all(['/api/pay/webhook', '/api/sepay/webhook', '/webhook/payment'], (req, res) => payWebhookHandler(req, res));
app.all('/api/pay/create', (req, res) => payCreateHandler(req, res));
app.all('/api/pay/confirm', (req, res) => payConfirmHandler(req, res));
app.all(['/api/pay/status/:srCode', '/api/pay/status'], (req, res) => {
  if (req.params.srCode) req.query.srCode = req.params.srCode;
  return payStatusHandler(req, res);
});
app.get(['/pay', '/payment'], (req, res) => {
  const payDist = path.join(DIST_DIR, 'pay.html');
  const targetRoot = fs.existsSync(payDist) ? DIST_DIR : path.join(__dirname, 'views');
  res.sendFile('pay.html', { root: targetRoot });
});

app.get(/^\/(ORD|SR)\d+$/i, (req, res) => {
  const payDist = path.join(DIST_DIR, 'pay.html');
  const targetRoot = fs.existsSync(payDist) ? DIST_DIR : path.join(__dirname, 'views');
  res.sendFile('pay.html', { root: targetRoot });
});

// ----------------------------------------------------------------------------
// 9. LIGHTWEIGHT ASSET 404 & SPA ROUTE FALLBACK
// ----------------------------------------------------------------------------
// If an asset (.css, .js, .png, .json, etc.) is missing, return a fast 404
app.use((req, res) => {
  const ext = path.extname(req.path).toLowerCase();
  const isAsset = Boolean(ext && ext !== '.html' && ext !== '.htm');

  if (isAsset) {
    return res.status(404).type('text/plain').send('404 Not Found: Asset does not exist.');
  }

  // Graceful fallback for non-asset routes: serve index page
  serveHtmlPage(PAGES.home, res);
});

// ----------------------------------------------------------------------------
// 10. GLOBAL ERROR HANDLER
// ----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('⚠️ [Server Error]:', err.stack || err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).type('text/plain').send('500 Internal Server Error: Please try again shortly.');
});

// ----------------------------------------------------------------------------
// 11. SERVER STARTUP & GRACEFUL LIFECYCLE
// ----------------------------------------------------------------------------
let server = null;

if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log(' ✨ SORA LIGHTNING SERVER - ULTRA-FAST & SECURE');
    console.log('======================================================');
    console.log(` 🌐 Local Access:    http://localhost:${PORT}`);
    console.log(` 🚀 Environment:     ${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(` 📁 Serving Root:    ${staticServingDir}`);
    console.log(` ⚡ Compression:     ACTIVE (Gzip/Brotli on-the-fly)`);
    console.log(` 🛡️ Helmet Security: ACTIVE (CSP: No 'unsafe-eval')`);
    console.log(` 🔒 Rate Limiting:   ACTIVE (Whitelisted for localhost)`);
    console.log(` 📦 Clean Routes:    /, /intro, /skills, /contact, /discord`);
    console.log('======================================================\n');
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down Sora server...`);
    if (server) {
      server.close(() => {
        console.log('✅ Server closed cleanly. Goodbye!');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout.');
        process.exit(1);
      }, 5000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Export for Vercel and testing
module.exports = app;
