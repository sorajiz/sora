/**
 * ============================================================================
 * PADE STORE DISCORD TICKET TRANSCRIPT PLATFORM - VERCEL SERVERLESS HANDLER
 * ============================================================================
 * Canonical Domain: https://transcript.sorae.tokyo
 * Routes:
 *   - /t/:id
 *   - /tickets/transcript?user=:user&id=:id&token=:token
 * Source of Truth: PostgreSQL & Binary Media Storage.
 * Offline Independence: Once READY, loads directly from Database / R2.
 * Bot Offline = OK | Tunnel Offline = OK | Developer PC Off = OK.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { getTranscriptFromDB } = require('./db');
const { renderPadeTranscriptPage } = require('./render');

function renderLandingPage() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pade Store • Ticket Transcripts</title>
  <meta name="description" content="Nền tảng lưu trữ bản ghi hội thoại hỗ trợ bảo mật của Pade Store.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0c0d11;
      --bg-surface: #111216;
      --bg-card: rgba(18, 20, 26, 0.85);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(255, 255, 255, 0.2);
      --text-main: #f8fafc;
      --text-muted: #949ba4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
      line-height: 1.6;
    }
    .wave-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 60%),
                  radial-gradient(circle at 80% 80%, rgba(88, 101, 242, 0.06) 0%, transparent 50%),
                  radial-gradient(circle at 20% 70%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }
    .landing-card {
      position: relative;
      z-index: 1;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 24px;
      max-width: 580px;
      width: 100%;
      padding: 48px 40px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65);
      text-align: center;
    }
    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .brand-pill .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #fff;
      margin-bottom: 12px;
      line-height: 1.2;
    }
    .tagline {
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 32px;
    }
    .lookup-box {
      display: flex;
      gap: 10px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 6px;
      margin-bottom: 28px;
      transition: border-color 0.2s;
    }
    .lookup-box:focus-within {
      border-color: var(--border-focus);
    }
    .lookup-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      padding: 10px 14px;
    }
    .lookup-input::placeholder {
      color: #64748b;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .lookup-btn {
      background: #f8fafc;
      color: #0c0d11;
      border: none;
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .lookup-btn:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }
    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 32px;
      text-align: left;
    }
    .feature-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 14px;
    }
    .feature-title {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }
    .feature-desc {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .footer {
      border-top: 1px solid var(--border-subtle);
      padding-top: 20px;
      font-size: 12px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer a {
      color: var(--text-muted);
      text-decoration: none;
    }
    .footer a:hover {
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="wave-bg"></div>
  <div class="landing-card">
    <div class="brand-pill">
      <span class="dot"></span>
      PADE STORE ARCHIVE PLATFORM
    </div>
    <h1>Ticket Transcripts</h1>
    <p class="tagline">Hệ thống lưu trữ và tra cứu bản ghi hội thoại hỗ trợ bảo mật cho khách hàng Pade Store.</p>

    <form class="lookup-box" onsubmit="event.preventDefault(); const val = document.getElementById('tid').value.trim(); if (val) window.location.href = '/t/' + encodeURIComponent(val);">
      <input type="text" id="tid" class="lookup-input" placeholder="Nhập mã transcript (ví dụ: tr_...)" required>
      <button type="submit" class="lookup-btn">Mở Bản Ghi</button>
    </form>

    <div class="features-grid">
      <div class="feature-item">
        <div class="feature-title">Xác Minh Toàn Vẹn</div>
        <div class="feature-desc">Mã hóa SHA-256 đối soát toàn bộ tin nhắn tại thời điểm đóng phiếu.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">Bảo Mật Bất Biến</div>
        <div class="feature-desc">Mã định danh CSPRNG 256-bit chống suy đoán và thu thập trái phép.</div>
      </div>
    </div>

    <div class="footer">
      <span>&copy; Pade Store</span>
      <a href="https://sorae.tokyo" target="_blank" rel="noopener">Trang Chủ Chính Thức &rarr;</a>
    </div>
  </div>
</body>
</html>`;
}

function renderErrorPage({ status, title, heading, message, referenceId }) {
  const safeRef = referenceId || ('err_' + Math.random().toString(36).substring(2, 10));
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title || 'Pade Store • Ticket Transcript'}</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0c0d11;
      --card-bg: rgba(22, 24, 31, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f8fafc;
      --text-muted: #949ba4;
      --accent: #5865f2;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 20%, #151822 0%, var(--bg) 80%);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      line-height: 1.6;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      max-width: 520px;
      width: 100%;
      padding: 36px 32px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      text-align: center;
    }
    .brand-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    h1 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
    .ref-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12px;
      color: #949ba4;
      margin-bottom: 24px;
      font-family: 'JetBrains Mono', monospace;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      background: #f8fafc;
      color: #0c0d11;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn:hover { background: #e2e8f0; transform: translateY(-1px); }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-label">PADE STORE</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    <div class="ref-box">Mã tham chiếu: ${safeRef}</div>
    <a href="https://sorae.tokyo" class="btn">Trang Chủ Pade Store</a>
    <div class="footer">Pade Store Transcript Platform &bull; https://transcript.sorae.tokyo</div>
  </div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Pade-Timestamp, X-Pade-Nonce, X-Pade-Signature');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Gather query & route parameters
  const queryParams = new URLSearchParams();
  if (req.query && typeof req.query === 'object') {
    for (const [k, v] of Object.entries(req.query)) {
      if (v !== undefined && v !== null && v !== '') {
        queryParams.set(k, String(v));
      }
    }
  }

  let ticketId = queryParams.get('id') || req.params?.id || null;
  if (!ticketId && req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      for (const [k, v] of parsed.searchParams.entries()) {
        if (!queryParams.has(k)) {
          queryParams.set(k, v);
        }
      }
      const segs = parsed.pathname.split('/').filter(Boolean);
      const tIdx = segs.findIndex(s => s === 't');
      if (tIdx !== -1 && segs[tIdx + 1]) {
        ticketId = segs[tIdx + 1];
      }
    } catch (e) {}
  }

  if (ticketId) {
    ticketId = ticketId.replace(/\.html$/, '');
    if (!queryParams.has('id')) {
      queryParams.set('id', ticketId);
    }
  }

  // 2. Root Domain Landing Page (Spec §7)
  if (!ticketId) {
    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderLandingPage());
  }

  // 3. Direct PostgreSQL Source of Truth: If database has transcript, render it natively!
  try {
    const dbData = await getTranscriptFromDB(ticketId);
    if (dbData && dbData.transcript) {
      if (dbData.transcript.revoked_at) {
        res.status(410);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(renderErrorPage({
          status: 410,
          title: 'Pade Store • Bản Ghi Đã Hết Hạn',
          heading: 'Bản Ghi Transcript Đã Hết Hạn',
          message: 'Bản ghi transcript này đã được thu hồi hoặc hết hạn theo chính sách bảo mật.'
        }));
      }

      const htmlPage = renderPadeTranscriptPage(dbData);
      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return res.send(htmlPage);
    }
  } catch (dbErr) {
    console.warn('[TRANSCRIPT] Database lookup notice:', dbErr.message);
  }

  // 4. Static File Fallback (Pre-generated standalone HTML exports)
  try {
    const localDir = path.join(process.cwd(), 'data', 'transcripts');
    const targetFile = path.join(localDir, `${ticketId}.html`);
    if (fs.existsSync(targetFile)) {
      const content = fs.readFileSync(targetFile, 'utf8');
      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(content);
    }
  } catch (fsErr) {}

  // 5. Legacy Backend Tunnel Proxy (Only if BOT_BACKEND_URL is explicitly configured)
  const rawBackend = (process.env.BOT_BACKEND_URL || process.env.DISCORD_BOT_BACKEND_URL || '').trim().replace(/\/+$/, '');
  if (rawBackend) {
    try {
      const endpointPath = rawBackend.endsWith('/tickets/transcript')
        ? rawBackend
        : `${rawBackend}/tickets/transcript`;

      const targetUrl = new URL(endpointPath);
      for (const [key, val] of queryParams.entries()) {
        targetUrl.searchParams.set(key, val);
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const botRes = await fetch(targetUrl.toString(), {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Pade-Store-Proxy/5.0 (+https://sorae.tokyo)',
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true'
        },
        signal: controller.signal
      });
      clearTimeout(timer);

      const botStatus = botRes.status;
      const body = await botRes.text();

      res.status(botStatus);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(body);
    } catch (proxyErr) {
      console.warn('[TRANSCRIPT] Proxy connection notice:', proxyErr.message);
    }
  }

  // 6. If infrastructure is completely unavailable, return safe 503 (Spec §6)
  if (!rawBackend && !process.env.DATABASE_URL) {
    res.status(503);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderErrorPage({
      status: 503,
      title: 'Pade Store • Dịch Vụ Tạm Thời Không Khả Dụng',
      heading: 'Transcript Service Unavailable',
      message: "We're unable to load this transcript right now. Please try again in a few moments."
    }));
  }

  // 7. Safe Pade Store 404 Response (Spec §6, §190 - Zero internal credentials shown)
  res.status(404);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderErrorPage({
    status: 404,
    title: 'Pade Store • Bản Ghi Không Tồn Tại',
    heading: 'Transcript Not Found',
    message: 'Bản ghi transcript bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ khỏi hệ thống Pade Store.'
  }));
};
