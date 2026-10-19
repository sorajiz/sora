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
const { getTranscriptFromDB, getMediaAssetFromDB, getTranscriptMediaForExport } = require('../../lib/tickets/db');
const { renderPadeTranscriptPage } = require('../../lib/tickets/render');

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

function renderProcessingPage({ ticketId, status }) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pade Store • Đang Đóng Gói Transcript</title>
  <meta http-equiv="refresh" content="2">
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
    .spinner {
      width: 48px;
      height: 48px;
      margin: 0 auto 20px;
      border: 3px solid rgba(88, 101, 242, 0.2);
      border-radius: 50%;
      border-top-color: var(--accent);
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .status-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(88, 101, 242, 0.15);
      border: 1px solid rgba(88, 101, 242, 0.3);
      font-size: 11px;
      font-weight: 700;
      color: #818cf8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    h1 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
    .auto-refresh-note {
      font-size: 12px;
      color: #64748b;
      margin-top: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <div class="status-pill">${status || 'PROCESSING'}</div>
    <h1>Bản Ghi Đang Được Đóng Gói</h1>
    <p>Bản ghi hội thoại đang được hoàn tất đối soát và niêm phong mật mã bảo mật. Vui lòng đợi trong giây lát.</p>
    <div class="auto-refresh-note">⏳ Trang sẽ tự động tải lại sau 2 giây...</div>
  </div>
</body>
</html>`;
}

// --- standalone HTML export ------------------------------------------------
// Vercel caps a function response at 4.5 MB, and base64 adds 33%. The archived
// bytes therefore travel under a budget (avatars/icons/emoji first, because the
// rows arrive smallest-first); anything above it keeps its absolute URL.
const EXPORT_MEDIA_BUDGET = 3_200_000;
const EXPORT_REMOTE_BUDGET = 500_000;
const EXPORT_REMOTE_LIMIT = 60;
const EXPORT_MAX_BYTES = 4_400_000; // Vercel caps function responses at 4.5 MB
const EXPORT_BASE = 'https://transcript.sorae.tokyo';

/**
 * Data URIs repeat once per occurrence (an avatar in 40 messages is 40 copies),
 * so the budget is charged per reference found in the rendered document rather
 * than once per asset.
 */
function buildInlineMedia(rows, html, budget = EXPORT_MEDIA_BUDGET) {
  const map = new Map();
  const sizes = new Map();
  let left = budget;
  for (const row of rows || []) {
    const data = row && row.data;
    if (!data || !data.length) continue;
    const occurrences = Math.max(1, html.split(`/media/${row.asset_id}`).length - 1);
    const encoded = Math.ceil(data.length / 3) * 4;
    const cost = encoded * occurrences;
    if (cost > left) continue;
    left -= cost;
    const type = row.content_type || 'application/octet-stream';
    map.set(row.asset_id, `data:${type};base64,${data.toString('base64')}`);
    sizes.set(row.asset_id, encoded * occurrences);
  }
  return { map, sizes };
}

/**
 * Emoji and other Discord CDN images are not part of the archive, so they would
 * be broken in an offline copy. Fetch what is still live (bounded time, count
 * and bytes) and inline it; failures keep the original URL.
 */
async function inlineRemoteImages(html, { budgetBytes = EXPORT_REMOTE_BUDGET, maxItems = EXPORT_REMOTE_LIMIT } = {}) {
  const found = [];
  const seen = new Set();
  const re = /\s(?:src|poster)="(https?:\/\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) && found.length < maxItems) {
    const raw = m[1];
    const url = raw.replace(/&amp;/g, '&');
    if (seen.has(url)) continue;
    seen.add(url);
    if (!/(cdn\.discordapp\.com|media\.discordapp\.net)/i.test(url)) continue;
    found.push({ raw, url });
  }
  if (found.length === 0) return html;

  const replacements = new Map();
  let left = budgetBytes;
  let idx = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (idx < found.length) {
      if (left <= 0) return;
      const item = found[idx++];
      try {
        const response = await fetch(item.url, {
          signal: AbortSignal.timeout(2500),
          headers: { 'User-Agent': 'Pade-Store-Export/1.0 (+https://sorae.tokyo)' }
        });
        if (!response.ok) continue;
        const type = String(response.headers.get('content-type') || '').split(';')[0].trim();
        if (!/^image\//i.test(type)) continue;
        const buf = Buffer.from(await response.arrayBuffer());
        if (!buf.length || buf.length > left) continue;
        left -= buf.length;
        replacements.set(item.raw, `data:${type};base64,${buf.toString('base64')}`);
      } catch (e) {
        // Offline export is best effort: keep the remote URL on any failure.
      }
    }
  });
  await Promise.all(workers);

  let out = html;
  for (const [raw, dataUri] of replacements) {
    out = out.split(`"${raw}"`).join(`"${dataUri}"`);
  }
  return out;
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

  let mediaAssetId = queryParams.get('media') || queryParams.get('asset') || null;
  if (!mediaAssetId && req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      const segs = parsed.pathname.split('/').filter(Boolean);
      const mIdx = segs.findIndex(s => s === 'media');
      if (mIdx !== -1 && segs[mIdx + 1]) {
        mediaAssetId = segs[mIdx + 1];
      }
    } catch (e) {}
  }

  // 1b. Serve media binary asset from PostgreSQL ticket_media_assets
  if (ticketId && mediaAssetId) {
    try {
      const media = await getMediaAssetFromDB(ticketId, mediaAssetId);
      if (media && media.data) {
        res.status(200);
        res.setHeader('Content-Type', media.content_type || 'application/octet-stream');
        res.setHeader('Content-Length', media.size_bytes || media.data.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        if (media.sha256) {
          res.setHeader('ETag', `"${media.sha256}"`);
        }
        return res.send(media.data);
      }
      res.status(404);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send('Asset Not Found');
    } catch (mErr) {
      console.error('[TRANSCRIPT] Media lookup error:', mErr);
      res.status(500);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send('Internal Media Error');
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
      const status = (dbData.transcript.status || '').toUpperCase();

      // REVOKED -> 410 privacy-safe unavailable page
      if (dbData.transcript.revoked_at || status === 'REVOKED') {
        res.status(410);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(renderErrorPage({
          status: 410,
          title: 'Pade Store • Bản Ghi Đã Thu Hồi',
          heading: 'Bản Ghi Transcript Đã Thu Hồi',
          message: 'Bản ghi transcript này đã được thu hồi hoặc xóa bỏ theo chính sách bảo mật.'
        }));
      }

      // FAILED -> 503 service / archive unavailable
      if (status === 'FAILED') {
        res.status(503);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(renderErrorPage({
          status: 503,
          title: 'Pade Store • Bản Ghi Không Khả Dụng',
          heading: 'Bản Ghi Lưu Trữ Không Khả Dụng',
          message: 'Không thể tải bản ghi transcript do sự cố trong quá trình lưu trữ và niêm phong.'
        }));
      }

      // PROCESSING / VERIFYING / INITIALIZING / COLLECTING -> Sleek processing page with auto-refresh
      if (status === 'PROCESSING' || status === 'VERIFYING' || status === 'COLLECTING' || status === 'INITIALIZING') {
        res.status(202);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(renderProcessingPage({
          ticketId,
          status
        }));
      }

      const isDownload = queryParams.get('action') === 'download' || (req.url && req.url.includes('/download'));
      let htmlPage;
      if (isDownload) {
        const displayCode = dbData.transcript.public_id ? dbData.transcript.public_id.substring(0, 8) : 'export';
        let safeSlug = (dbData.transcript.ticket_name || 'ticket')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50);
        if (!safeSlug) safeSlug = 'ticket';
        const filename = `ticket-${safeSlug}-${displayCode}.html`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Offline export: inline archived media (images, GIF, video, audio) as
        // data URIs, then inline still-live CDN images such as custom emoji.
        try {
          const rows = await getTranscriptMediaForExport(ticketId);
          const baseline = renderPadeTranscriptPage(dbData, {
            exportMode: true,
            inlineMedia: new Map(),
            baseUrl: EXPORT_BASE
          });
          const built = buildInlineMedia(rows, baseline);
          const inlineMedia = built.map;
          const sizes = built.sizes;
          htmlPage = renderPadeTranscriptPage(dbData, {
            exportMode: true,
            inlineMedia,
            baseUrl: EXPORT_BASE
          });

          // Vercel rejects responses above 4.5 MB. Drop the heaviest inlined
          // assets (they repeat per occurrence) until the document fits; the
          // dropped ones keep their absolute live URL.
          let guard = 0;
          while (Buffer.byteLength(htmlPage) > EXPORT_MAX_BYTES && inlineMedia.size > 0 && guard++ < 12) {
            let heaviest = null;
            for (const [assetId, cost] of sizes) {
              if (!inlineMedia.has(assetId)) continue;
              if (!heaviest || cost > heaviest[1]) heaviest = [assetId, cost];
            }
            if (!heaviest) break;
            inlineMedia.delete(heaviest[0]);
            htmlPage = renderPadeTranscriptPage(dbData, {
              exportMode: true,
              inlineMedia,
              baseUrl: EXPORT_BASE
            });
          }

          // Remote emoji are a bonus: if inlining them would push the response
          // over the cap, keep the version that only has archive bytes.
          const beforeRemote = htmlPage;
          const withRemote = await inlineRemoteImages(htmlPage);
          htmlPage = Buffer.byteLength(withRemote) <= EXPORT_MAX_BYTES ? withRemote : beforeRemote;
        } catch (mediaErr) {
          console.warn('[TRANSCRIPT] Export media notice:', mediaErr.message);
          htmlPage = renderPadeTranscriptPage(dbData, {
            exportMode: true,
            inlineMedia: new Map(),
            baseUrl: EXPORT_BASE
          });
        }
      } else {
        htmlPage = renderPadeTranscriptPage(dbData);
      }

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (isDownload) {
        res.setHeader('Cache-Control', 'no-store');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
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
