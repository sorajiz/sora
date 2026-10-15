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

function renderErrorPage({ status, title, heading, message, hint }) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title || 'Pade Store • Ticket Transcript'}</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
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
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
    .hint-box {
      background: rgba(88, 101, 242, 0.1);
      border: 1px solid rgba(88, 101, 242, 0.25);
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 13px;
      color: #c7d2fe;
      margin-bottom: 24px;
      text-align: left;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      background: var(--accent);
      color: #fff;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn:hover { background: #4752c4; transform: translateY(-1px); }
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
    <div class="icon">🔒</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    ${hint ? `<div class="hint-box"><strong>💡 Hướng dẫn:</strong><br>${hint}</div>` : ''}
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

  // 2. Direct PostgreSQL Source of Truth: If database has transcript, render it natively!
  if (ticketId) {
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

    // 3. Static File Fallback (Pre-generated standalone HTML exports)
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
  }

  // 4. Legacy Backend Tunnel Proxy (Only if BOT_BACKEND_URL is explicitly configured)
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

  // 5. If BOT_BACKEND_URL was not set and DB did not have it, return 503 explaining configuration
  if (!rawBackend && (!process.env.DATABASE_URL || !ticketId)) {
    res.status(503);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderErrorPage({
      status: 503,
      title: 'Sora — Chưa cấu hình Backend Bot',
      heading: 'Chưa cấu hình BOT_BACKEND_URL',
      message: 'Website đang hoạt động bình thường, nhưng chưa nhận được địa chỉ Backend của Discord Bot hoặc cơ sở dữ liệu PostgreSQL.',
      hint: 'Vui lòng thêm biến môi trường <code>DATABASE_URL</code> hoặc <code>BOT_BACKEND_URL</code> trên <strong>Vercel Dashboard &rarr; Settings &rarr; Environment Variables</strong>.'
    }));
  }

  // 6. Final 404 response
  res.status(404);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderErrorPage({
    status: 404,
    title: 'Pade Store • Không Tìm Thấy Bản Ghi',
    heading: 'Không Tìm Thấy Bản Ghi Transcript',
    message: 'Transcript này không tồn tại hoặc đã được gỡ bỏ khỏi hệ thống Pade Store.'
  }));
};
