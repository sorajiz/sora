/**
 * ============================================================================
 * PADE STORE ULTIMATE DISCORD TICKET TRANSCRIPT RENDERER
 * ============================================================================
 * Cyberpunk Dark Glassmorphism, Deep Black & Graphite Palette,
 * Deterministic Silver Gradient Wave Seed, Full-Text Search UX,
 * Media Gallery & Lightbox, Discord-Fidelity Message Stream.
 * ============================================================================
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getMediaDimensions(w, h) {
  if (!w || !h || w <= 0 || h <= 0) {
    return {
      sizeClass: 'size-default',
      style: 'max-width: min(460px, 100%); max-height: 420px;'
    };
  }

  const ratio = w / h;

  // 1. SMALL: w <= 200 && h <= 200 (never upscale!)
  if (w <= 200 && h <= 200) {
    const pw = Math.max(128, Math.min(w, 200));
    const ph = Math.round(pw / ratio);
    return {
      sizeClass: 'size-small',
      style: `max-width: ${pw}px; max-height: ${Math.max(ph, 140)}px; aspect-ratio: ${w}/${h};`
    };
  }

  // 2. VERY TALL / LONG SCREENSHOT: h >= w * 1.8 (e.g. 1242x2688)
  if (h >= w * 1.8) {
    return {
      sizeClass: 'size-tall',
      style: `max-width: min(300px, 100%); max-height: 480px; aspect-ratio: ${w}/${h};`
    };
  }

  // 3. PORTRAIT: h > w * 1.2 (e.g. 1080x1920)
  if (h > w * 1.2) {
    return {
      sizeClass: 'size-portrait',
      style: `max-width: min(330px, 100%); max-height: 440px; aspect-ratio: ${w}/${h};`
    };
  }

  // 4. PANORAMA: w >= h * 2.2
  if (w >= h * 2.2) {
    return {
      sizeClass: 'size-panorama',
      style: `max-width: min(540px, 100%); max-height: 240px; aspect-ratio: ${w}/${h};`
    };
  }

  // 5. LANDSCAPE: w > h * 1.2 (e.g. 1920x1080)
  if (w > h * 1.2) {
    return {
      sizeClass: 'size-landscape',
      style: `max-width: min(460px, 100%); max-height: 320px; aspect-ratio: ${w}/${h};`
    };
  }

  // 6. SQUARE: 0.85 <= ratio <= 1.2 (e.g. 1080x1080)
  return {
    sizeClass: 'size-square',
    style: `max-width: min(360px, 100%); max-height: 360px; aspect-ratio: ${w}/${h};`
  };
}

/**
 * Maps a Discord CDN URL back to the asset id used by the transcript archive.
 *
 * The archive is the durable copy: it never expires. CDN URLs are the opposite —
 * attachment URLs are signed and expire, and avatar/guild-icon URLs embed a hash
 * that rots the moment the user or guild changes their image. Mapping is pure so
 * the viewer can decide to prefer the archive only for ids that really exist.
 *
 * Embed default avatars (/embed/avatars/N.png) are permanent Discord objects and
 * deliberately have no mapping.
 */
function assetIdFromCdnUrl(rawUrl) {
  if (!rawUrl) return null;
  const url = String(rawUrl);
  let m = url.match(/cdn\.discordapp\.com\/avatars\/(\d+)\//);
  if (m) return `avatar-${m[1]}`;
  m = url.match(/cdn\.discordapp\.com\/guilds\/\d+\/users\/(\d+)\/avatars\//);
  if (m) return `avatar-${m[1]}`;
  m = url.match(/cdn\.discordapp\.com\/icons\/(\d+)\//);
  if (m) return `guild-icon-${m[1]}`;
  m = url.match(/cdn\.discordapp\.com\/emojis\/(\d+)\./);
  if (m) return `emoji-${m[1]}`;
  m = url.match(/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/stickers\/(\d+)\./);
  if (m) return `stk-${m[1]}`;
  m = url.match(/cdn\.discordapp\.com\/attachments\/\d+\/(\d+)\//);
  if (m) return `att-${m[1]}`;
  return null;
}

/** Extracts the asset id from an already-relinked viewer media URL. */
function assetIdFromMediaUrl(rawUrl) {
  if (!rawUrl) return null;
  const m = String(rawUrl).match(/\/media\/([A-Za-z0-9_-]+)\s*$/);
  return m ? m[1] : null;
}

/**
 * Returns the archived media URL when the asset is present in the archive,
 * otherwise the original URL untouched. Never guesses: an id missing from the
 * archive keeps the URL it already had, so a live CDN copy still renders.
 */
function resolveMediaUrl(rawUrl, ctx) {
  if (!rawUrl) return rawUrl;
  const assetId = assetIdFromCdnUrl(rawUrl) || assetIdFromMediaUrl(rawUrl);
  const inline = ctx && ctx.inlineMedia;
  // Offline export: the archived bytes travel inside the document as data URIs.
  if (assetId && inline && typeof inline.get === 'function') {
    const dataUri = inline.get(assetId);
    if (dataUri) return dataUri;
  }
  const assets = ctx && ctx.assets;
  if (!assets || typeof assets.has !== 'function' || assets.size === 0 || !assetId || !assets.has(assetId)) {
    return withPublicBase(rawUrl, ctx);
  }
  const publicId = ctx.publicId || '';
  return withPublicBase(publicId ? `/t/${publicId}/media/${assetId}` : rawUrl, ctx);
}

/**
 * The hosted viewer uses root-relative media URLs. A downloaded copy is opened
 * from `file://`, where those URLs point nowhere, so the export mode rewrites
 * them to absolute URLs on the transcript host.
 */
function withPublicBase(url, ctx) {
  if (!url || !ctx || !ctx.absoluteBase) return url;
  const base = String(ctx.absoluteBase).replace(/\/+$/, '');
  if (url.charAt(0) !== '/') return url;
  return base + url;
}

/**
 * Attachment/sticker resolution. Prefers the archived copy, and falls back to the
 * original CDN URL when the archive row is missing (an incomplete close) so a
 * still-live source is shown instead of a guaranteed 404.
 */
function resolveBinaryUrl(item, ctx) {
  const archivedUrl = (item && (item.r2_url || item.archive_url)) || '';
  const sourceUrl = (item && item.source_url) || '';
  const assets = ctx && ctx.assets;
  const inline = ctx && ctx.inlineMedia;
  const archivedId = assetIdFromMediaUrl(archivedUrl) || assetIdFromCdnUrl(archivedUrl);
  if (archivedId && inline && typeof inline.get === 'function') {
    const dataUri = inline.get(archivedId);
    if (dataUri) return dataUri;
  }
  if (archivedId && assets && typeof assets.has === 'function' && assets.has(archivedId)) {
    return withPublicBase(archivedUrl, ctx);
  }
  if (sourceUrl) return resolveMediaUrl(sourceUrl, ctx);
  return withPublicBase(archivedUrl || sourceUrl, ctx);
}

/** Human readable byte size, Discord style (1.2 MB, 268 KB, 940 B). */
function formatBytesHuman(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = n / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || Number.isInteger(value) ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

/**
 * Discord signs attachment URLs with an `ex=<hex unix ts>` expiry. When that
 * moment is already in the past the CDN copy is guaranteed to 404, so the viewer
 * can say so up front instead of showing a broken image. Timestamps before
 * 2020 are treated as noise (they are not real Discord expiry values).
 */
function signedUrlExpired(rawUrl, nowMs = Date.now()) {
  const m = String(rawUrl || '').match(/[?&]ex=([0-9a-fA-F]+)/);
  if (!m) return false;
  const ts = parseInt(m[1], 16);
  if (!Number.isFinite(ts) || ts < 1600000000) return false;
  return ts * 1000 < nowMs - 60000;
}

/**
 * Decides whether a media URL is known to be unrecoverable, and why. Returns
 * `null` when the file should be rendered normally. A media URL that belongs to
 * a different transcript is never called missing: this archive simply does not
 * own that asset list.
 */
function mediaUnavailableReason(rawUrl, ctx) {
  const assets = ctx && ctx.assets;
  const url = String(rawUrl || '');
  const assetId = assetIdFromMediaUrl(url);
  if (assetId && assets && typeof assets.has === 'function' && !assets.has(assetId)) {
    const urlPublicId = (url.match(/\/t\/([A-Za-z0-9_-]+)\/media\//) || [])[1] || '';
    if (!urlPublicId || !ctx.publicId || urlPublicId === ctx.publicId) {
      return 'Không có trong kho lưu trữ';
    }
  }
  if (signedUrlExpired(url)) {
    return 'Liên kết gốc đã hết hạn';
  }
  return null;
}

const MEDIA_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15V5a2 2 0 0 0-2-2H5"></path><path d="M3 3l18 18"></path><path d="M3 5v14a2 2 0 0 0 2 2h14"></path><circle cx="9" cy="9" r="1.5"></circle><path d="M21 15l-5-5"></path></svg>';
const FILE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5"></path></svg>';
const DOWNLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"></path><path d="m7 12 5 5 5-5"></path><path d="M4 21h16"></path></svg>';

/**
 * Premium "file unrecoverable" card: shows the real filename, size, dimensions
 * and the reason, plus a link to the original CDN URL when one is still known.
 */
function unavailableMediaCard({ name, bytes, width, height, contentType, reason, sourceUrl } = {}) {
  const metaParts = [
    formatBytesHuman(bytes),
    width && height ? `${width}×${height}` : '',
    String(contentType || '').replace(/^image\//i, '').replace(/^video\//i, '').toUpperCase()
  ].filter(Boolean);
  const meta = [...metaParts, reason || 'Không thể khôi phục'].join(' · ');
  const link = sourceUrl && !/^\/t\//.test(sourceUrl)
    ? `<a class="mf-btn" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Mở link gốc</a>`
    : '';
  return `<div class="media-fallback" data-state="unrecoverable">
      <div class="mf-icon" aria-hidden="true">${MEDIA_OFF_ICON}</div>
      <div class="mf-body">
        <div class="mf-head">
          <span class="mf-name">${escapeHtml(name || 'tệp đính kèm')}</span>
          <span class="mf-badge">Không khả dụng</span>
        </div>
        <div class="mf-meta">${escapeHtml(meta)}</div>
      </div>
      ${link}
    </div>`;
}

// Every timestamp in a transcript is expressed in the store's time zone, never
// the host's: Vercel renders in UTC, which used to shift every clock by 7 hours.
const STORE_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const formatStoreDateTime = (date) => new Intl.DateTimeFormat('vi-VN', {
  timeZone: STORE_TIME_ZONE,
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
}).format(date);

function parseDiscordMarkdown(content, ctx = {}, opts = {}) {
  if (!content) return '';

  const users = ctx.users || {};
  const roles = ctx.roles || {};
  const channels = ctx.channels || {};

  const stashes = [];
  // Placeholder markers must survive the whole markdown pipeline. Using
  // underscores (the old "@@@TOKEN_0@@@" form) let the italic rule eat the
  // token and leak it to the page, so tokens now use private-use code points
  // that no Discord markdown rule can match.
  const TOKEN_OPEN = '\uE000';
  const TOKEN_CLOSE = '\uE001';
  const TOKEN_RE = /\uE000(\d+)\uE001/g;
  function stash(html) {
    const idx = stashes.length;
    stashes.push(html);
    return TOKEN_OPEN + idx + TOKEN_CLOSE;
  }

  // Block-level markup (code blocks) is stashed before headings are detected, so a
  // fence that is not on its own line can end up inside a heading line. Wrapping it
  // would emit invalid nesting (<h1><pre>...</pre></h1>), so those lines stay literal.
  function hasBlockStash(text) {
    const tokens = text.match(TOKEN_RE) || [];
    return tokens.some(tok => /^<(pre|div|blockquote)\b/i.test(stashes[parseInt(tok.slice(1, -1), 10)] || ''));
  }

  // 1. Fenced code blocks: 3+ backticks, optional language, nested backticks safe.
  //    Discord parity: the language is surfaced as a badge (data-lang) and long
  //    lines wrap instead of forcing a horizontal scrollbar.
  let s = String(content).replace(/\r\n/g, '\n');
  s = s.replace(/(`{3,})(?:([a-zA-Z0-9_+-]+)[ \t]*\n|\n)?([\s\S]*?)\n?\1/g, (match, fence, lang, code) => {
    const langLabel = (lang || '').toLowerCase();
    const langAttr = langLabel ? ` data-lang="${langLabel}"` : '';
    return stash(`<pre class="code-block"${langAttr}><code>${escapeHtml(code)}</code></pre>`);
  });

  // 2. Inline code `code` (stash before escaping)
  s = s.replace(/`([^`]+)`/g, (match, code) => {
    return stash(`<code class="code-inline">${escapeHtml(code)}</code>`);
  });

  // 3. Escape HTML on remainder
  s = escapeHtml(s);

  // 4. Discord Markdown Custom Emoji Links: [name](https://cdn.discordapp.com/emojis/id.ext?params)
  s = s.replace(/\[([^\]]+)\]\((https:\/\/cdn\.discordapp\.com\/emojis\/([0-9]+)\.(?:webp|png|gif)(?:\?[^)]*)?)\)/gi, (m, rawName, url, id) => {
    const cleanName = rawName.replace(/<[^>]+>/g, '').replace(/[*_~]/g, '').trim();
    return stash(`<img class="custom-emoji" src="${resolveMediaUrl(url, ctx)}" alt=":${cleanName}:" data-emoji=":${cleanName}:" title=":${cleanName}:" loading="lazy">`);
  });

  // 5. Discord Markdown Sticker Links: [name](https://media.discordapp.net/stickers/id.ext?params) or cdn.discordapp.com
  s = s.replace(/\[([^\]]+)\]\((https:\/\/(?:media|cdn)\.discordapp\.(?:net|com)\/stickers\/([0-9]+)\.(?:png|webp|gif|json)(?:\?[^)]*)?)\)/gi, (m, rawName, url, id) => {
    const cleanName = rawName.replace(/<[^>]+>/g, '').replace(/[*_~]/g, '').trim();
    return stash(`<div class="discord-sticker"><img src="${resolveMediaUrl(url, ctx)}" alt="${cleanName}" title="${cleanName}" loading="lazy"></div>`);
  });

  // 6. Raw Discord Emoji CDN URLs
  s = s.replace(/(^|[\s>(])(https:\/\/cdn\.discordapp\.com\/emojis\/([0-9]+)\.(?:webp|png|gif)(?:\?[^\s<"')]*)?)/gi, (m, prefix, url, id) => {
    return prefix + stash(`<img class="custom-emoji" src="${resolveMediaUrl(url, ctx)}" alt="" data-emoji=":emoji:" loading="lazy">`);
  });

  // 7. Raw Discord Sticker CDN URLs
  s = s.replace(/(^|[\s>(])(https:\/\/(?:media|cdn)\.discordapp\.(?:net|com)\/stickers\/([0-9]+)\.(?:png|webp|gif|json)(?:\?[^\s<"')]*)?)/gi, (m, prefix, url, id) => {
    return prefix + stash(`<div class="discord-sticker"><img src="${resolveMediaUrl(url, ctx)}" loading="lazy"></div>`);
  });

  // 8. Discord native custom emojis: <:name:id> or <a:name:id>
  s = s.replace(/&lt;(a?):([a-zA-Z0-9_]+):([0-9]+)&gt;/g, (m, anim, name, id) => {
    const ext = anim ? 'gif' : 'png';
    const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=48&quality=lossless`;
    return stash(`<img class="custom-emoji" src="${resolveMediaUrl(url, ctx)}" alt=":${name}:" data-emoji=":${name}:" title=":${name}:" loading="lazy">`);
  });

  // 9. Discord Timestamps <t:timestamp:style>
  s = s.replace(/&lt;t:([0-9]+)(?::([a-zA-Z]))?&gt;/g, (m, ts) => {
    const date = new Date(parseInt(ts, 10) * 1000);
    const dateStr = formatStoreDateTime(date);
    return stash(`<span class="discord-timestamp" title="${dateStr}">${dateStr}</span>`);
  });

  // 10. Standard Markdown links: [text](url)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, text, url) => {
    return stash(`<a href="${url}" target="_blank" rel="noopener noreferrer nofollow ugc">${text}</a>`);
  });

  // 10b. Bare URLs are auto-linked, exactly like the Discord client. The
  //      protocol is hidden in the label ("discord.gg/x" reads like Discord).
  s = s.replace(/(^|[\s(])((?:https?:\/\/|www\.)[^\s<]*[^\s<.,;:!?)\]}"'])/gi, (m, prefix, url) => {
    const href = /^www\./i.test(url) ? `https://${url}` : url;
    const label = url.replace(/^https?:\/\//i, '');
    return prefix + stash(`<a class="markdown-link" href="${href}" target="_blank" rel="noopener noreferrer nofollow ugc" title="${url}">${label}</a>`);
  });

  // 11. Spoilers ||spoiler||
  s = s.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');

  // 12. Bold, Italic, Strikethrough, Underline
  s = s.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/___(.*?)___/g, '<u><em>$1</em></u>');
  s = s.replace(/__(.*?)__/g, '<u>$1</u>');
  s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  s = s.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // 13. Blockquotes > quote
  s = s.replace(/^&gt;(?:&gt;)?\s?(.*)$/gm, '<blockquote class="quote-line">$1</blockquote>');
  s = s.replace(/^>(?:>)?\s?(.*)$/gm, '<blockquote class="quote-line">$1</blockquote>');

  // 14. User mentions <@id>, Role mentions <@&id>, Channel mentions <#id>
  s = s.replace(/&lt;@!?([0-9]+)&gt;/g, (match, id) => {
    const u = users[id];
    // Discord renders mentions it cannot resolve as @unknown-user and deleted
    // accounts as @deleted-user; a bare "@user" reads like a broken placeholder.
    const name = u
      ? (u.guild_display_name || u.global_name || u.username || 'unknown-user')
      : 'unknown-user';
    const roleHex = (u && u.display_color) ? '#' + u.display_color.toString(16).padStart(6, '0') : '';
    const colorStyle = roleHex ? ` style="color: ${roleHex};" data-role-color="${roleHex}"` : '';
    return `<span class="mention user"${colorStyle}>@${escapeHtml(name)}</span>`;
  });

  s = s.replace(/&lt;@&amp;([0-9]+)&gt;/g, (match, id) => {
    const r = roles[id];
    const name = r ? r.role_name : 'deleted-role';
    const color = (r && r.color) ? `#${r.color.toString(16).padStart(6, '0')}` : '#5865f2';
    let icon = '';
    if (r && r.icon_url) {
      icon = `<img class="role-mention-icon" src="${escapeHtml(resolveMediaUrl(r.icon_url, ctx))}" alt="">`;
    } else if (r && r.unicode_emoji) {
      icon = `<span class="role-mention-emoji">${escapeHtml(r.unicode_emoji)}</span>`;
    }
    return `<span class="mention role" style="color: ${color}; border-left: 2px solid ${color};" data-role-color="${color}">${icon}@${escapeHtml(name)}</span>`;
  });

  s = s.replace(/&lt;#([0-9]+)&gt;/g, (match, id) => {
    const c = channels[id];
    const name = c ? c.name : 'deleted-channel';
    return `<span class="mention channel">#${escapeHtml(name)}</span>`;
  });

  s = s.replace(/@everyone/g, '<span class="mention everyone">@everyone</span>');
  s = s.replace(/@here/g, '<span class="mention here">@here</span>');

  // 14b. Line-leading Discord headings (#, ##, ###) and subtext (-# text).
  //      Mirrors the exporter contract: (#{1,3}) <text> -> <hN class="markdown-heading">.
  //      Skipped for inline contexts (reply previews) where block markup would break
  //      the single-line ellipsised layout.
  if (!opts.inline) {
    s = s.replace(/^-# (.*)\n?/gm, (match, text) => {
      if (hasBlockStash(text)) return match;
      return `<div class="markdown-subtext">${text}</div>`;
    });
    s = s.replace(/^(#{1,3}) (.*)\n?/gm, (match, hashes, text) => {
      if (hasBlockStash(text)) return match;
      const level = hashes.length;
      return `<h${level} class="markdown-heading markdown-h${level}">${text}</h${level}>`;
    });
  }

  // 15. Convert newlines to <br>
  s = s.replace(/\n/g, '<br>');

  // 16. Restore all stashed tokens (and drop anything that somehow survived,
  // so a raw placeholder can never reach the page).
  s = s.replace(TOKEN_RE, (m, idx) => stashes[parseInt(idx, 10)] || '');

  return s;
}

/**
 * Member-rail group label. Discord role names are usually words, but guilds
 * sometimes use decorative names such as "~1"; those read like broken data in a
 * section header, so they fall back to the neutral bucket name.
 */
function cleanRoleLabel(name) {
  const label = String(name || '').trim();
  if (!label) return 'Thành viên';
  if (!/\p{L}/u.test(label)) return 'Thành viên';
  return label;
}

function computeWaveParameters(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const pos1 = Math.abs(hash % 30) + 10;
  const pos2 = Math.abs((hash >> 3) % 40) + 20;
  const opacity = 0.04 + (Math.abs(hash % 10) * 0.005);
  return { pos1, pos2, opacity };
}

function looksLikeVideo(contentType, url) {
  const ct = String(contentType || '').toLowerCase();
  if (ct.startsWith('video/')) return true;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url || ''));
}

function renderDiscordComponent(comp, ctx) {
  if (!comp) return '';
  const type = comp.type;

  // 1. Container (type 17, legacy 15) — Discord's Components V2 box: rounded
  //    surface with an optional accent stripe on the leading edge.
  if (type === 17 || type === 15) {
    const children = (comp.components || []).map(c => renderDiscordComponent(c, ctx)).join('');
    const hasAccent = comp.accent_color !== null && comp.accent_color !== undefined && Number.isFinite(Number(comp.accent_color));
    const accentStyle = hasAccent ? ` style="--dvc-accent: #${Number(comp.accent_color).toString(16).padStart(6, '0')};"` : '';
    return `<div class="discord-component-container${comp.spoiler ? ' is-spoiler' : ''}"${accentStyle}>${children}</div>`;
  }

  // 2. Section (type 9): text block plus an accessory (thumbnail / button).
  if (type === 9) {
    const children = (comp.components || []).map(c => renderDiscordComponent(c, ctx)).join('');
    let accessoryHtml = '';
    if (comp.accessory) {
      const accessory = renderDiscordComponent(comp.accessory, ctx);
      if (accessory) accessoryHtml = `<div class="section-accessory">${accessory}</div>`;
    }
    return `<div class="discord-component-section"><div class="section-content">${children}</div>${accessoryHtml}</div>`;
  }

  // 3. TextDisplay (type 10)
  if (type === 10) {
    const parsedText = parseDiscordMarkdown(comp.content || '', ctx);
    return `<div class="discord-component-text">${parsedText}</div>`;
  }

  // 4. Separator (type 14): divider on/off and small/large spacing.
  if (type === 14) {
    const hasDivider = comp.divider !== false;
    const spacing = comp.spacing === 2 ? 'large' : 'small';
    return `<div class="discord-component-separator ${hasDivider ? 'divider' : 'no-divider'} spacing-${spacing}"></div>`;
  }

  // 5. Thumbnail (type 11)
  if (type === 11) {
    const media = comp.media || {};
    const url = media.url || comp.url || '';
    if (!url) return '';
    const resolved = escapeHtml(resolveMediaUrl(url, ctx));
    const alt = escapeHtml(comp.description || media.description || 'thumbnail');
    const body = looksLikeVideo(media.content_type, url)
      ? `<video src="${resolved}" controls preload="metadata" playsinline></video>`
      : `<img src="${resolved}" alt="${alt}" loading="lazy">`;
    return `<div class="discord-component-thumbnail${comp.spoiler ? ' is-spoiler' : ''}">${body}</div>`;
  }

  // 6. MediaGallery (type 12): images and, since Discord supports videos here
  //    too, inline players for video items. Clicking an image opens the lightbox.
  if (type === 12) {
    const items = (comp.items || []).map(it => {
      const media = it.media || {};
      const u = media.url || it.url || '';
      if (!u) return '';
      const resolved = escapeHtml(resolveMediaUrl(u, ctx));
      const alt = escapeHtml(it.description || media.description || '');
      const video = looksLikeVideo(media.content_type, u);
      const inner = video
        ? `<video src="${resolved}" controls preload="metadata" playsinline></video>`
        : `<img src="${resolved}" alt="${alt}" loading="lazy">`;
      const click = video ? '' : ' onclick="openLightboxFromElement(this)"';
      return `<div class="gallery-item${it.spoiler ? ' is-spoiler' : ''}"${click}>${inner}</div>`;
    }).join('');
    return `<div class="discord-component-media-gallery">${items}</div>`;
  }

  // 7. File (type 13): a Discord attachment card.
  if (type === 13) {
    const file = comp.file || {};
    const url = file.url || file.proxy_url || comp.url || '';
    const name = file.name || comp.filename || 'Tệp đính kèm';
    const size = formatBytesHuman(file.size);
    const ext = String(name).split('.').pop().toUpperCase().slice(0, 4);
    const meta = [ext && ext !== String(name).toUpperCase() ? ext : '', size].filter(Boolean).join(' • ');
    const href = url ? ` href="${escapeHtml(resolveMediaUrl(url, ctx))}" target="_blank" rel="noopener noreferrer"` : '';
    return `<a class="dvc-file"${href}>
      <span class="dvc-file-icon" aria-hidden="true">${DOWNLOAD_ICON}</span>
      <span class="dvc-file-body">
        <span class="dvc-file-name">${escapeHtml(name)}</span>
        <span class="dvc-file-meta">${escapeHtml(meta || 'Tệp đính kèm')}</span>
      </span>
    </a>`;
  }

  // 8. ActionRow (type 1)
  if (type === 1) {
    const children = (comp.components || []).map(c => renderDiscordComponent(c, ctx)).join('');
    return `<div class="discord-component-action-row">${children}</div>`;
  }

  // 9. Button (type 2)
  if (type === 2) {
    const styleClass = comp.style === 1 ? 'btn-primary' : comp.style === 3 ? 'btn-success' : comp.style === 4 ? 'btn-danger' : comp.style === 5 ? 'btn-link' : 'btn-secondary';
    let emojiHtml = '';
    if (comp.emoji) {
      if (comp.emoji.id) {
        const ext = comp.emoji.animated ? 'gif' : 'png';
        const name = comp.emoji.name || 'emoji';
        emojiHtml = `<img class="btn-emoji" src="${resolveMediaUrl(`https://cdn.discordapp.com/emojis/${comp.emoji.id}.${ext}?size=32`, ctx)}" alt=":${escapeHtml(name)}:" data-emoji=":${escapeHtml(name)}:">`;
      } else if (comp.emoji.name) {
        emojiHtml = `<span class="btn-emoji">${escapeHtml(comp.emoji.name)}</span>`;
      }
    }
    const label = comp.label ? `<span>${escapeHtml(comp.label)}</span>` : '';
    if (comp.url) {
      return `<a class="discord-btn-snapshot ${styleClass}" href="${escapeHtml(comp.url)}" target="_blank" rel="noopener noreferrer">${emojiHtml}${label}</a>`;
    }
    return `<span class="discord-btn-snapshot ${styleClass} is-disabled" aria-disabled="true">${emojiHtml}${label}</span>`;
  }

  // Fallback for sub-components or unhandled
  if (Array.isArray(comp.components)) {
    return comp.components.map(c => renderDiscordComponent(c, ctx)).join('');
  }
  return '';
}

function renderPadeTranscriptPage({ transcript, users = {}, roles = {}, channels = {}, messages = [], assets = [] }, options = {}) {
  const exportMode = !!(options && options.exportMode);
  const inlineMedia = (options && options.inlineMedia) || null;
  const absoluteBase = exportMode ? (options.baseUrl || 'https://transcript.sorae.tokyo') : '';
  const publicId = transcript.public_id || 'tr_default';
  const ticketName = transcript.ticket_name || 'ticket';
  const messageCount = messages.length || transcript.message_count || 0;
  const wave = computeWaveParameters(publicId);

  const openedDate = transcript.opened_at ? new Date(transcript.opened_at) : new Date();
  const closedDate = transcript.closed_at ? new Date(transcript.closed_at) : new Date();
  const durationSec = Math.max(0, Math.floor((closedDate - openedDate) / 1000));
  const durH = Math.floor(durationSec / 3600);
  const durM = Math.floor((durationSec % 3600) / 60);
  const durationStr = durH > 0 ? `${durH}h ${durM}m` : `${durM}m ${durationSec % 60}s`;

  // --- time zone ----------------------------------------------------------
  // The page is rendered on the server (formerly wherever the host ran, i.e.
  // UTC on Vercel), which shifted every clock by the offset to Vietnam. Pin
  // the store's time zone so a transcript reads the same on every machine.
  const STORE_TZ = STORE_TIME_ZONE;
  const fmtDate = (d, opts) => new Intl.DateTimeFormat('vi-VN', Object.assign(
    { timeZone: STORE_TZ, day: '2-digit', month: '2-digit', year: 'numeric' }, opts
  )).format(d);
  const fmtTime = (d, opts) => new Intl.DateTimeFormat('vi-VN', Object.assign(
    { timeZone: STORE_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }, opts
  )).format(d);
  const dayKey = (d) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: STORE_TZ, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(d);
    const map = {};
    for (const p of parts) map[p.type] = p.value;
    return `${map.year}-${map.month}-${map.day}`;
  };

  // Safe OpenGraph preview (NO conversation leak)
  const ogTitle = `Pade Store • Ticket Transcript #${ticketName}`;
  const ogDesc = `Bản ghi phiếu hỗ trợ #${ticketName} • ${messageCount} tin nhắn • Thời gian đóng: ${fmtDate(closedDate)}.`;

  // --- Discord channel identity -------------------------------------------
  // Discord names ticket channels `ticket-<number>`; the transcript only stores
  // the internal slug, so the trailing number is used to rebuild the label.
  const ticketNumberMatch = String(ticketName).match(/(\d+)(?!.*\d)/);
  const channelLabel = ticketNumberMatch ? `ticket-${ticketNumberMatch[1]}` : String(ticketName);
  const participantCount = new Set(messages.map(m => m.author_id).filter(Boolean)).size;
  const messageIdSet = new Set(messages.map(m => m.discord_message_id).filter(Boolean));
  const messageById = new Map(messages.filter(m => m.discord_message_id).map(m => [m.discord_message_id, m]));

  // `assets` is the set of asset ids that really exist in the transcript archive;
  // media URL resolution only swaps a CDN URL for the archived copy when the id is
  // in this set, so the viewer never points at a missing asset.
  const ctx = { users, roles, channels, publicId, assets: new Set(assets || []), inlineMedia, absoluteBase };

  // --- member list (Discord right rail) -----------------------------------
  // Grouped by the top role Discord already resolved for the snapshot, exactly
  // like the member list of a real server. Bots get their own section.
  const memberMap = new Map();
  for (const m of messages) {
    const uid = m.author_id || 'unknown';
    if (!memberMap.has(uid)) {
      const u = (ctx.users && ctx.users[uid]) || {};
      const displayName = u.guild_display_name || u.global_name || u.username || 'Thành viên';
      const roleName = String(u.display_color_role || '').trim();
      memberMap.set(uid, {
        uid,
        name: displayName,
        color: u.display_color ? `#${u.display_color.toString(16).padStart(6, '0')}` : '',
        avatar: resolveMediaUrl(u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png', ctx),
        isBot: !!u.is_bot,
        roleName: u.is_bot ? 'BOT' : cleanRoleLabel(roleName),
        count: 0,
        firstMessageId: m.discord_message_id || ''
      });
    }
    memberMap.get(uid).count += 1;
  }
  const memberList = Array.from(memberMap.values()).sort((a, b) =>
    (Number(b.isBot) - Number(a.isBot)) || (b.count - a.count) || a.name.localeCompare(b.name, 'vi')
  );
  const memberGroups = [];
  {
    const byRole = new Map();
    for (const member of memberList) {
      const key = member.roleName || 'Thành viên';
      if (!byRole.has(key)) byRole.set(key, []);
      byRole.get(key).push(member);
    }
    for (const [roleName, roleMembers] of byRole) memberGroups.push({ roleName, members: roleMembers });
  }
  const memberRailHtml = memberGroups.map(group => `
        <div class="rail-group">
          <div class="rail-group-title">${escapeHtml(group.roleName)}</div>
          ${group.members.map(mb => `<button class="rail-member${mb.isBot ? ' is-bot' : ''}" type="button" onclick="jumpToMessage('${escapeHtml(mb.firstMessageId)}')" title="${escapeHtml(mb.name)} — ${mb.count} tin nhắn">
            <img class="rail-avatar" src="${escapeHtml(mb.avatar)}" alt="" loading="lazy" decoding="async" data-avatar-initial="${escapeHtml(mb.name.charAt(0).toUpperCase())}">
            <span class="rail-name"${mb.color ? ` style="color: ${mb.color};" data-role-color="${mb.color}"` : ''}>${escapeHtml(mb.name)}</span>
            ${mb.isBot ? '<span class="badge-bot">BOT</span>' : ''}
            <span class="rail-msg" aria-label="${mb.count} tin nhắn">${mb.count}</span>
          </button>`).join('')}
        </div>`).join('');

  const sameDay = (a, b) => dayKey(a) === dayKey(b);
  const nowDate = new Date();
  const yesterdayDate = new Date(nowDate.getTime() - 24 * 3600 * 1000);

  /** Day separator label: "Hôm nay" / "Hôm qua" / "Thứ Bảy, 17 tháng 10, 2026". */
  const formatDayLabel = (d) => {
    if (sameDay(d, nowDate)) return 'Hôm nay';
    if (sameDay(d, yesterdayDate)) return 'Hôm qua';
    return fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  /** Discord timestamp: "Hôm nay lúc 14:53" / "Hôm qua lúc 09:02" / "17/10/2026 14:53". */
  const formatTimeLabel = (d) => {
    const time = fmtTime(d);
    if (sameDay(d, nowDate)) return `Hôm nay lúc ${time}`;
    if (sameDay(d, yesterdayDate)) return `Hôm qua lúc ${time}`;
    return `${fmtDate(d)} ${time}`;
  };
  const fullTimestamp = (d) => `${fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ${fmtTime(d, { second: '2-digit' })}`;

  const openedLabel = `${fmtDate(openedDate)} ${fmtTime(openedDate)}`;
  const closedLabel = `${fmtDate(closedDate)} ${fmtTime(closedDate)}`;

  // Group messages consecutively by author within 5 minutes
  const messageGroups = [];
  let currentGroup = null;

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const prevM = i > 0 ? messages[i - 1] : null;

    const mTime = new Date(m.timestamp);
    const sameAuthor = prevM && prevM.author_id === m.author_id;
    const withinTime = prevM && (mTime - new Date(prevM.timestamp)) < 5 * 60 * 1000;

    if (sameAuthor && withinTime && currentGroup) {
      currentGroup.items.push(m);
    } else {
      currentGroup = {
        authorId: m.author_id,
        firstTime: mTime,
        items: [m]
      };
      messageGroups.push(currentGroup);
    }
  }

  // Groups that start on a new calendar day get a Discord day separator above them.
  const dayDividers = new Map();
  {
    let prevDay = null;
    for (const group of messageGroups) {
      if (!prevDay || !sameDay(prevDay, group.firstTime)) {
        dayDividers.set(group, formatDayLabel(group.firstTime));
        prevDay = group.firstTime;
      }
    }
  }

  // Render HTML message groups
  let messagesHtml = '';
  for (const group of messageGroups) {
    const u = users[group.authorId] || {};
    const authorName = u.guild_display_name || u.global_name || u.username || 'User';
    const avatarUrl = u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const isBot = u.is_bot;
    const authorColor = u.display_color ? `#${u.display_color.toString(16).padStart(6, '0')}` : '';
    const authorColorStyle = authorColor ? ` style="color: ${authorColor};" data-role-color="${authorColor}"` : '';

    let roleIconHtml = '';
    if (u.display_icon_url) {
      roleIconHtml = `<img class="author-role-icon" src="${escapeHtml(u.display_icon_url)}" alt="${escapeHtml(u.display_icon_role || '')}" title="${escapeHtml(u.display_icon_role || '')}" loading="lazy">`;
    } else if (u.display_unicode_emoji) {
      roleIconHtml = `<span class="author-role-emoji" title="${escapeHtml(u.display_icon_role || '')}">${escapeHtml(u.display_unicode_emoji)}</span>`;
    }

    let itemsHtml = '';
    for (const m of group.items) {
      const msgTime = new Date(m.timestamp);
      const timeStr = fmtTime(msgTime, { second: '2-digit' });
      const fullDateStr = fullTimestamp(msgTime);
      const renderedContent = parseDiscordMarkdown(m.content_original, ctx);

      // Reply reference (Discord style: spine + 16px avatar + author + preview)
      let replyHtml = '';
      if (m.reference && (m.reference.referenced_message_id || m.reference.referenced_author_id)) {
        const refId = m.reference.referenced_message_id || '';
        const refUser = users[m.reference.referenced_author_id] || {};
        const refAuthor = refUser.guild_display_name || refUser.global_name || refUser.username || 'Người dùng';
        const refColor = refUser.display_color ? `#${refUser.display_color.toString(16).padStart(6, '0')}` : '';
        const refAvatar = resolveMediaUrl(refUser.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png', ctx);
        const targetMessage = refId ? messageById.get(refId) : null;
        const rawPreview = (m.reference.content_preview || (targetMessage && targetMessage.content_original) || '').trim();
        let refPreview = rawPreview
          ? parseDiscordMarkdown(rawPreview, ctx, { inline: true })
          : '<span class="reply-placeholder">Tin nhắn gốc</span>';
        if (targetMessage && targetMessage.attachments && targetMessage.attachments.length > 0 && !rawPreview) {
          refPreview = '<span class="reply-placeholder">📎 Tệp đính kèm</span>';
        }
        const jumpable = !!(refId && messageIdSet.has(refId));
        replyHtml = `
          <div class="reply-context${jumpable ? ' is-jumpable' : ''}"${jumpable ? ` role="button" tabindex="0" onclick="jumpToMessage('${escapeHtml(refId)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();jumpToMessage('${escapeHtml(refId)}');}" title="${jumpable ? 'Đi tới tin nhắn gốc' : 'Tin nhắn gốc không có trong bản ghi'}"` : ` title="Tin nhắn gốc không có trong bản ghi"`}>
            <svg class="reply-spine" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M5.83 1.29a1 1 0 0 1 0 1.42L4.54 4h3.96A5.5 5.5 0 0 1 14 9.5V13a1 1 0 1 1-2 0V9.5A3.5 3.5 0 0 0 8.5 6H4.54l1.29 1.29a1 1 0 1 1-1.42 1.42L1.3 5.59a1 1 0 0 1 0-1.42l3.11-2.88a1 1 0 0 1 1.42 0Z"/></svg>
            <img class="reply-avatar" src="${escapeHtml(refAvatar)}" alt="" loading="lazy" decoding="async">
            <span class="reply-author"${refColor ? ` style="color: ${refColor};" data-role-color="${refColor}"` : ''}>${escapeHtml(refAuthor)}</span>
            <span class="reply-preview">${refPreview}</span>
          </div>
        `;
      }

      // Structured Message Stickers
      let stickerHtml = '';
      if (m.stickers && m.stickers.length > 0) {
        const stkTags = m.stickers.map(stk => {
          const stkUrl = resolveBinaryUrl(stk, ctx) || `https://media.discordapp.net/stickers/${stk.discord_sticker_id}.png?size=160`;
          return `<div class="discord-sticker"><img src="${escapeHtml(stkUrl)}" alt="${escapeHtml(stk.name)}" title="${escapeHtml(stk.name)}" loading="lazy"></div>`;
        }).join('');
        stickerHtml = `<div class="message-stickers">${stkTags}</div>`;
      }

      // Attachments
      let attHtml = '';
      if (m.attachments && m.attachments.length > 0) {
        const imgList = [];
        const fileList = [];
        const brokenList = [];

        for (const att of m.attachments) {
          const fn = (att.filename || '').toLowerCase();
          const ct = (att.content_type || '').toLowerCase();
          const isImg = ct.startsWith('image/') || fn.endsWith('.png') || fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.webp') || fn.endsWith('.gif');
          const isVid = ct.startsWith('video/') || fn.endsWith('.mp4') || fn.endsWith('.webm') || fn.endsWith('.mov');
          const isAud = ct.startsWith('audio/') || fn.endsWith('.mp3') || fn.endsWith('.ogg') || fn.endsWith('.wav');

          const mediaUrl = resolveBinaryUrl(att, ctx);
          const reason = mediaUnavailableReason(mediaUrl, ctx);
          // A still-live source link is only offered when it has not expired.
          const liveSource = att.source_url && !signedUrlExpired(att.source_url) ? att.source_url : '';
          const cardOptions = {
            name: att.filename,
            bytes: att.size_bytes,
            width: att.width,
            height: att.height,
            contentType: att.content_type,
            reason,
            sourceUrl: liveSource
          };

          if (reason) {
            brokenList.push(unavailableMediaCard(cardOptions));
            continue;
          }

          if (isImg) {
            imgList.push({ ...att, url: mediaUrl });
          } else if (isVid) {
            fileList.push(`<div class="media-video"><video src="${escapeHtml(mediaUrl)}" controls preload="metadata"></video></div>`);
          } else if (isAud) {
            fileList.push(`<div class="media-audio"><audio src="${escapeHtml(mediaUrl)}" controls preload="none"></audio></div>`);
          } else {
            const sizeLabel = formatBytesHuman(att.size_bytes);
            const fileExt = String(att.filename || '').split('.').pop().toUpperCase().slice(0, 4);
            const fileMeta = [fileExt, sizeLabel].filter(Boolean).join(' · ');
            fileList.push(`<div class="media-file"><a href="${escapeHtml(mediaUrl)}" target="_blank" rel="noopener" title="${escapeHtml(att.filename)}">
              <span class="file-icon" aria-hidden="true">${FILE_ICON}</span>
              <span class="file-body"><span class="file-name">${escapeHtml(att.filename)}</span><span class="file-meta">${escapeHtml(fileMeta || 'Tệp đính kèm')}</span></span>
              <span class="file-dl" aria-hidden="true">${DOWNLOAD_ICON}</span>
            </a></div>`);
          }
        }

        if (imgList.length === 1) {
          const a = imgList[0];
          const dim = getMediaDimensions(a.width, a.height);
          attHtml += `
            <div class="transcript-media-frame ${dim.sizeClass}" style="${dim.style}">
              <div class="transcript-image-wrap" onclick="openLightboxFromElement(this)"
                   data-full-url="${escapeHtml(a.url)}"
                   data-filename="${escapeHtml(a.filename)}"
                   data-width="${a.width || ''}"
                   data-height="${a.height || ''}"
                   data-size="${a.size_bytes || ''}">
                <img class="transcript-image" src="${escapeHtml(a.url)}" alt="${escapeHtml(a.filename)}" loading="lazy" decoding="async">
                <div class="media-hover-overlay">
                  <span class="media-hover-action">
                    <svg class="zoom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    Mở
                  </span>
                </div>
              </div>
            </div>
          `;
        } else if (imgList.length > 1) {
          const galleryId = `gal-${m.id || m.discord_message_id || Math.random().toString(36).slice(2, 8)}`;
          const galleryClass = imgList.length === 2 ? 'gallery-2' : imgList.length === 3 ? 'gallery-3' : imgList.length === 4 ? 'gallery-4' : 'gallery-many';
          const imgTags = imgList.map((a, idx) => `
            <div class="gallery-item-frame" onclick="openLightboxFromElement(this)"
                 data-gallery-group="${galleryId}"
                 data-gallery-index="${idx}"
                 data-full-url="${escapeHtml(a.url)}"
                 data-filename="${escapeHtml(a.filename)}"
                 data-width="${a.width || ''}"
                 data-height="${a.height || ''}"
                 data-size="${a.size_bytes || ''}">
              <img class="gallery-thumb" src="${escapeHtml(a.url)}" alt="${escapeHtml(a.filename)}" loading="lazy" decoding="async">
              <div class="media-hover-overlay">
                <span class="media-hover-action">
                  <svg class="zoom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </span>
              </div>
            </div>
          `).join('');
          attHtml += `<div class="transcript-gallery ${galleryClass}">${imgTags}</div>`;
        }

        if (fileList.length > 0) {
          attHtml += `<div class="media-files-stream">${fileList.join('')}</div>`;
        }

        if (brokenList.length > 0) {
          attHtml += `<div class="media-fallback-list">${brokenList.join('')}</div>`;
        }
      }

      // Embeds (Filter out empty shells / emoji / sticker preview unfurls)
      let embedHtml = '';
      if (m.embeds && m.embeds.length > 0) {
        for (const emb of m.embeds) {
          const fields = typeof emb.fields === 'string' ? JSON.parse(emb.fields) : (emb.fields || []);
          const isEmojiOrSticker = (emb.thumbnail_url && (emb.thumbnail_url.includes('/emojis/') || emb.thumbnail_url.includes('/stickers/'))) ||
                                  (emb.url && (emb.url.includes('/emojis/') || emb.url.includes('/stickers/')));
          if (isEmojiOrSticker && !emb.title && !emb.description && fields.length === 0) {
            continue; // Suppress empty embed previews for emojis/stickers
          }
          const hasContent = emb.title || emb.description || (fields && fields.length > 0) || emb.author_name || emb.image_url;
          if (!hasContent) {
            continue; // Avoid empty border bars
          }

          const fieldsHtml = fields.map(f => `
            <div class="embed-field ${f.inline ? 'inline' : ''}">
              <div class="field-name">${escapeHtml(f.name)}</div>
              <div class="field-val">${parseDiscordMarkdown(f.value, ctx)}</div>
            </div>
          `).join('');

          embedHtml += `
            <div class="embed-card" style="border-left-color: ${emb.color ? '#' + emb.color.toString(16).padStart(6, '0') : '#5865f2'}">
              ${emb.thumbnail_url ? `<div class="embed-thumbnail"><img src="${escapeHtml(resolveMediaUrl(emb.thumbnail_url, ctx))}" loading="lazy"></div>` : ''}
              ${emb.author_name ? `<div class="embed-author">${emb.author_icon_url ? `<img class="embed-author-icon" src="${escapeHtml(resolveMediaUrl(emb.author_icon_url, ctx))}">` : ''}<span>${escapeHtml(emb.author_name)}</span></div>` : ''}
              ${emb.title ? `<div class="embed-title">${emb.url ? `<a href="${escapeHtml(emb.url)}" target="_blank" rel="noopener">${escapeHtml(emb.title)}</a>` : escapeHtml(emb.title)}</div>` : ''}
              ${emb.description ? `<div class="embed-desc">${parseDiscordMarkdown(emb.description, ctx)}</div>` : ''}
              ${fieldsHtml ? `<div class="embed-fields-grid">${fieldsHtml}</div>` : ''}
              ${emb.image_url ? `<div class="embed-image"><img src="${escapeHtml(resolveMediaUrl(emb.image_url, ctx))}" loading="lazy"></div>` : ''}
              ${emb.footer_text ? `<div class="embed-footer">${emb.footer_icon_url ? `<img class="embed-footer-icon" src="${escapeHtml(resolveMediaUrl(emb.footer_icon_url, ctx))}">` : ''}<span>${escapeHtml(emb.footer_text)}</span></div>` : ''}
            </div>
          `;
        }
      }

      // Reactions with Custom Emoji
      let reactHtml = '';
      if (m.reactions && m.reactions.length > 0) {
        const pills = m.reactions.map(r => {
          let emojiVisual = '';
          if (r.emoji_id) {
            const ext = r.animated ? 'gif' : 'png';
            const url = `https://cdn.discordapp.com/emojis/${r.emoji_id}.${ext}?size=32&quality=lossless`;
            emojiVisual = `<img class="react-custom-emoji" src="${resolveMediaUrl(url, ctx)}" alt=":${escapeHtml(r.emoji_name)}:" data-emoji=":${escapeHtml(r.emoji_name)}:" loading="lazy">`;
          } else {
            emojiVisual = `<span class="react-emoji">${escapeHtml(r.emoji_name)}</span>`;
          }
          return `
            <div class="reaction-pill">
              ${emojiVisual}
              <span class="react-count">${r.count}</span>
            </div>
          `;
        }).join('');
        reactHtml = `<div class="reactions-row">${pills}</div>`;
      }

      // Components V2 (e.g. Welcome Message container)
      let compHtml = '';
      if (m.components) {
        let tree = m.components;
        if (typeof tree === 'string') {
          try { tree = JSON.parse(tree); } catch (e) {}
        }
        if (Array.isArray(tree)) {
          compHtml = `<div class="discord-components-tree">${tree.map(c => renderDiscordComponent(c, ctx)).join('')}</div>`;
        } else if (tree && typeof tree === 'object') {
          compHtml = `<div class="discord-components-tree">${renderDiscordComponent(tree, ctx)}</div>`;
        }
      }

      const hasContent = renderedContent && renderedContent.trim().length > 0;

      itemsHtml += `
        <div class="message-item" id="message-${escapeHtml(m.discord_message_id)}">
          ${m.discord_message_id ? `<button class="msg-action" type="button" onclick="copyMessageLink('${escapeHtml(m.discord_message_id)}')" title="Copy link tin nhắn" aria-label="Copy link tin nhắn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>` : ''}
          ${replyHtml}
          ${hasContent ? `
            <div class="msg-content-row">
              <div class="msg-text searchable-content">${renderedContent}</div>
              ${m.is_edited ? '<span class="edited-tag">(đã chỉnh sửa)</span>' : ''}
            </div>
          ` : ''}
          ${compHtml}
          ${stickerHtml}
          ${attHtml}
          ${embedHtml}
          ${reactHtml}
        </div>
      `;
    }

    const firstTimeStr = formatTimeLabel(group.firstTime);
    const dayLabel = dayDividers.get(group) || '';

    messagesHtml += `
      ${dayLabel ? `<div class="day-divider"><span>${escapeHtml(dayLabel)}</span></div>` : ''}
      <div class="message-group">
        <img class="group-avatar" src="${escapeHtml(resolveMediaUrl(avatarUrl, ctx))}" alt="${escapeHtml(authorName)}" loading="lazy">
        <div class="group-body">
          <div class="group-header">
            <span class="author-name searchable-content"${authorColorStyle}>${escapeHtml(authorName)}</span>
            ${roleIconHtml}
            ${isBot ? '<span class="badge-bot">BOT</span>' : ''}
            <span class="group-time" title="${escapeHtml(fullTimestamp(group.firstTime))}">${escapeHtml(firstTimeStr)}</span>
          </div>
          <div class="group-items">
            ${itemsHtml}
          </div>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDesc)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Pade Store">
  <meta name="theme-color" content="#313338">
  <script>
    // Apply the stored theme before first paint so the page never flashes the
    // wrong palette. Discord dark is the house default; light is opt-in and
    // remembers the choice (or ?theme=light / ?theme=dark).
    (function () {
      try {
        var param = (location.search.match(/[?&]theme=(light|dark)/) || [])[1];
        var stored = localStorage.getItem('pade-transcript-theme');
        var theme = param || stored || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  </script>

  ${exportMode ? '' : `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`}

  <style>
    :root {
      /* Discord dark theme palette ------------------------------------- */
      --bg-base: #313338;          /* chat background */
      --bg-surface: #2b2d31;       /* cards, embeds, panels */
      --bg-card: #2b2d31;
      --bg-card-hover: #35373c;
      --bg-deep: #232428;          /* rail / deepest surface */
      --bg-raised: #383a40;        /* composer, pills */
      --border: rgba(255, 255, 255, 0.06);
      --border-accent: rgba(255, 255, 255, 0.12);
      --text: #dbdee1;             /* body copy */
      --text-strong: #f2f3f5;      /* names, headings */
      --text-muted: #b5bac1;       /* secondary */
      --text-sub: #949ba4;         /* timestamps, captions */
      --accent: #5865f2;
      --accent-hover: #4752c4;
      --link: #00a8fc;
      --green: #23a55a;
      --danger: #da373c;
      --silver: #cbd5e1;
      --silver-glow: rgba(203, 213, 225, 0.08);
      --highlight: rgba(245, 158, 11, 0.3);

      /* chrome + surfaces used by the channel view ---------------------- */
      --topbar-bg: rgba(49, 51, 56, 0.94);
      --chat-hover: #2e3035;
      --divider: rgba(255, 255, 255, 0.05);
      --panel-deep: #1e1f22;
      --input-deep: #111214;
      --composer-fade: #313338;
      --rail-bg: #2b2d31;
      --rail-hover: rgba(255, 255, 255, 0.05);
      --modal-bg: #313338;
      --code-bg: #2b2d31;
      --scroll-thumb: #1a1b1e;
      --shadow-strong: rgba(0, 0, 0, 0.55);
      --focus: #00a8fc;
      --topbar-h: 48px;
      --pad-x: clamp(12px, 2.2vw, 20px);
      --gap-msg: clamp(10px, 1.6vw, 16px);
      --avatar-msg: clamp(32px, 3.2vw, 40px);
      color-scheme: dark;
    }

    /* Discord light theme (opt-in, remembers the choice) ---------------- */
    [data-theme="light"] {
      --bg-base: #ffffff;
      --bg-surface: #f2f3f5;
      --bg-card: #f2f3f5;
      --bg-card-hover: #e9eaec;
      --bg-deep: #e3e5e8;
      --bg-raised: #ebedef;
      --border: rgba(6, 6, 7, 0.08);
      --border-accent: rgba(6, 6, 7, 0.16);
      --text: #313338;
      --text-strong: #060607;
      --text-muted: #4e5058;
      --text-sub: #5c5e66;
      --link: #006ce7;
      --green: #248046;
      --danger: #d83c3e;
      --silver: #4e5058;
      --silver-glow: rgba(78, 80, 88, 0.08);
      --highlight: rgba(245, 158, 11, 0.35);

      --topbar-bg: rgba(255, 255, 255, 0.94);
      --chat-hover: #f6f7f8;
      --divider: rgba(6, 6, 7, 0.09);
      --panel-deep: #ffffff;
      --input-deep: #f2f3f5;
      --composer-fade: #ffffff;
      --rail-bg: #f2f3f5;
      --ci-stat-bg: rgba(6, 6, 7, 0.035);
      --rail-hover: rgba(6, 6, 7, 0.05);
      --modal-bg: #ffffff;
      --code-bg: #f2f3f5;
      --scroll-thumb: #c4c9ce;
      --shadow-strong: rgba(0, 0, 0, 0.18);
      color-scheme: light;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      scroll-behavior: smooth;
      background-color: var(--bg-base);
      scrollbar-color: var(--scroll-thumb) transparent;
    }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: var(--scroll-thumb);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    body {
      background-color: var(--bg-base);
      color: var(--text);
      font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', sans-serif;
      font-size: 16px;
      line-height: 1.375rem;
      min-height: 100vh;
      min-height: 100dvh;
      overflow-x: hidden;
      position: relative;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -webkit-tap-highlight-color: transparent;
    }
    :focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    ::selection { background: rgba(88, 101, 242, 0.4); }

    /* Ambient Silver Wave Background */
    .ambient-waves {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .wave-svg {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      opacity: ${wave.opacity};
      filter: blur(40px);
    }

    .container {
      max-width: 980px;
      margin: 0 auto;
      padding: 32px 16px 80px 16px;
      position: relative;
      z-index: 1;
    }

    /* Navbar / Header */
    .navbar {
      background: var(--bg-card);
      border: 1px solid var(--border);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 18px;
      padding: 22px 28px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 40px var(--silver-glow);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-block {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid var(--border-accent);
      object-fit: cover;
      display: block;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .brand-info h1 {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .brand-info p {
      font-size: 13px;
      color: var(--text-muted);
    }
    .badge-verified {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #86efac;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-verified .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }

    /* Actions row (Search trigger, Drawer trigger) */
    .nav-actions {
      display: flex;
      gap: 10px;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-action:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-accent);
      transform: translateY(-1px);
    }

    /* Summary Metrics Bar */
    .metrics-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 18px;
    }
    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--text-sub);
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Message Stream */
    .stream-container {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .message-group {
      display: flex;
      gap: 16px;
      padding: 4px 8px;
      border-radius: 12px;
      transition: background 0.15s ease;
    }
    .message-group:hover {
      background: rgba(255, 255, 255, 0.015);
    }
    .group-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
      background: #1e2230;
      border: 1px solid var(--border);
    }
    .group-body {
      flex: 1;
      min-width: 0;
    }
    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    .author-name {
      font-weight: 700;
      font-size: 15px;
      color: #fff;
    }
    .author-role-icon {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      vertical-align: -3px;
      object-fit: contain;
      margin-left: 2px;
      display: inline-block;
    }
    .author-role-emoji {
      font-size: 15px;
      line-height: 1;
      vertical-align: -1px;
      margin-left: 2px;
      display: inline-block;
    }
    .badge-bot {
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .group-time {
      font-size: 12px;
      color: var(--text-sub);
    }
    .group-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .message-item {
      padding: 2px 0;
      border-radius: 6px;
      transition: background 0.3s ease;
    }
    .message-item.target-highlight {
      background: rgba(88, 101, 242, 0.25);
      box-shadow: 0 0 12px rgba(88, 101, 242, 0.4);
    }
    .msg-content-row {
      display: inline;
    }
    .msg-text {
      display: inline;
      font-size: 14.5px;
      color: var(--text);
      word-break: break-word;
    }
    .edited-tag {
      font-size: 11px;
      color: var(--text-sub);
      margin-left: 6px;
    }

    /* Markdown Formats */
    .code-inline {
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid var(--border);
      padding: 2px 6px;
      border-radius: 5px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #e2e8f0;
    }
    .code-block {
      position: relative;
      display: block;
      background: #090a0d;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      margin: 8px 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #cbd5e1;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      max-width: 100%;
      tab-size: 4;
    }
    .code-block code {
      display: block;
      background: transparent;
      border: none;
      padding: 0;
      font: inherit;
      color: inherit;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      max-height: 520px;
      overflow: auto;
    }
    .code-block code::-webkit-scrollbar { width: 8px; height: 8px; }
    .code-block code::-webkit-scrollbar-thumb { background: #1a1b1e; border-radius: 4px; }
    .code-block code::-webkit-scrollbar-track { background: transparent; }
    .code-block[data-lang]:not([data-lang=""]) {
      padding-top: 33px;
    }
    /* Language badge injected by CSS so the HTML stays deterministic. */
    .code-block[data-lang]:not([data-lang=""])::before {
      content: attr(data-lang);
      position: absolute;
      top: 8px;
      left: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 5px;
      padding: 1px 7px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: lowercase;
      color: var(--text-muted);
      pointer-events: none;
    }
    /* Discord headings (#, ##, ###) and subtext (-#) inside messages */
    .markdown-heading {
      color: #f2f3f5;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.01em;
      margin: 14px 0 6px;
    }
    .markdown-heading.markdown-h1 { font-size: 24px; }
    .markdown-heading.markdown-h2 { font-size: 20px; }
    .markdown-heading.markdown-h3 { font-size: 16px; }
    /* A heading that opens a message or a component block sits flush with the
       block padding instead of pushing it down by the default top margin. */
    .markdown-heading:first-child { margin-top: 2px; }
    .markdown-subtext {
      font-size: 13px;
      line-height: 1.4;
      color: var(--text-sub);
      margin: 2px 0;
    }
    .spoiler {
      background: #2b2d31;
      color: #2b2d31;
      padding: 1px 6px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s;
    }
    .spoiler.revealed {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    /* A spoiler must hide its whole payload. Mentions/emoji/links carry inline
       colours and pill backgrounds, which used to leak the hidden text. */
    .spoiler:not(.revealed) .mention,
    .spoiler:not(.revealed) .custom-emoji,
    .spoiler:not(.revealed) .code-inline,
    .spoiler:not(.revealed) img,
    .spoiler:not(.revealed) a {
      color: inherit !important;
      background: transparent !important;
      border-color: transparent !important;
    }
    .spoiler:not(.revealed) img {
      filter: blur(6px);
      opacity: 0.25;
    }
    .custom-emoji {
      width: 22px;
      height: 22px;
      vertical-align: -4px;
      display: inline-block;
      object-fit: contain;
    }
    .custom-emoji.jumbo {
      width: 48px;
      height: 48px;
      vertical-align: middle;
      display: inline-block;
    }
    .discord-sticker {
      margin-top: 8px;
      max-width: 160px;
      max-height: 160px;
      display: inline-block;
    }
    .discord-sticker img {
      width: 100%;
      height: 100%;
      max-width: 160px;
      max-height: 160px;
      object-fit: contain;
      display: block;
    }
    .message-stickers {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .reply-context {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
      padding-left: 2px;
    }
    .reply-spine {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      opacity: 0.7;
      color: var(--accent);
    }
    .reply-author {
      font-weight: 600;
      color: #c7d2fe;
    }
    .reply-preview {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 420px;
      color: var(--text-sub);
    }
    .react-custom-emoji {
      width: 16px;
      height: 16px;
      vertical-align: -2px;
      object-fit: contain;
      display: inline-block;
    }
    .discord-timestamp {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      padding: 1px 4px;
      font-size: 12.5px;
      color: #cbd5e1;
    }
    .embed-author {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
    }
    .embed-author-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
    }
    .embed-thumbnail {
      float: right;
      max-width: 80px;
      max-height: 80px;
      margin-left: 12px;
      margin-bottom: 8px;
      border-radius: 6px;
      overflow: hidden;
    }
    .embed-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .embed-image {
      margin-top: 10px;
      border-radius: 8px;
      overflow: hidden;
      max-width: 460px;
      max-height: 360px;
    }
    .embed-image img {
      width: 100%;
      height: 100%;
      max-width: 460px;
      max-height: 360px;
      object-fit: contain;
      border-radius: 8px;
      display: block;
    }
    .embed-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text-sub);
      margin-top: 10px;
    }
    .embed-footer-icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      object-fit: cover;
    }
    .mention {
      background: rgba(88, 101, 242, 0.15);
      color: #c7d2fe;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 13.5px;
    }
    .mention.role {
      background: rgba(88, 101, 242, 0.12);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .role-mention-icon {
      width: 14px;
      height: 14px;
      border-radius: 2px;
      vertical-align: -2px;
      object-fit: contain;
    }
    .role-mention-emoji {
      font-size: 13px;
      vertical-align: -1px;
    }
    .img-fallback-card {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--text-muted);
      font-size: 12.5px;
      margin: 6px 0;
    }
    .img-fallback-card .fallback-icon { font-size: 16px; opacity: 0.8; }
    .img-fallback-card .fallback-text { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

    /* Discord Components V2 System */
    .discord-components-tree {
      margin: 8px 0;
      max-width: 540px;
    }
    .discord-component-container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 14px 16px;
      margin: 6px 0;
      backdrop-filter: blur(12px);
    }
    .discord-component-section {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin: 6px 0;
    }
    .discord-component-section .section-content {
      flex: 1;
      min-width: 0;
    }
    .discord-component-section .section-accessory {
      flex-shrink: 0;
    }
    .discord-component-thumbnail img {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      object-fit: cover;
      display: block;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .discord-component-text {
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-main);
      word-break: break-word;
    }
    .discord-component-text h3 {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #fff;
    }
    .discord-component-separator {
      margin: 10px 0;
      height: 1px;
      background: transparent;
    }
    .discord-component-separator.divider {
      background: rgba(255, 255, 255, 0.08);
    }
    .discord-component-separator.spacing-large {
      margin: 16px 0;
    }
    .discord-component-action-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 8px 0;
    }
    .discord-btn-snapshot {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: default;
      user-select: none;
      text-decoration: none;
      line-height: 1.3;
      border: 1px solid transparent;
    }
    .discord-btn-snapshot.btn-primary {
      background: #5865f2;
      color: #fff;
    }
    .discord-btn-snapshot.btn-secondary {
      background: #313338;
      color: #dbdee1;
      border-color: rgba(255, 255, 255, 0.08);
    }
    .discord-btn-snapshot.btn-success {
      background: #23a55a;
      color: #fff;
    }
    .discord-btn-snapshot.btn-danger {
      background: #da373c;
      color: #fff;
    }
    .discord-btn-snapshot.btn-link {
      background: #2b2d31;
      color: #00a8fc;
      border-color: rgba(255, 255, 255, 0.06);
    }
    .discord-btn-snapshot .btn-emoji {
      width: 16px;
      height: 16px;
      object-fit: contain;
      vertical-align: -2px;
    }
    .discord-component-media-gallery {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 8px 0;
      border-radius: 8px;
      overflow: hidden;
    }
    .discord-component-media-gallery img {
      max-width: 100%;
      border-radius: 8px;
      display: block;
    }

    /* Pade Store Transcript Premium Media System V5 */
    .transcript-media-frame {
      display: block;
      width: fit-content;
      max-width: min(460px, 100%);
      margin-top: 8px;
      background: #0d0f13;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }
    .transcript-media-frame:hover {
      border-color: rgba(255, 255, 255, 0.16);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
    }
    .transcript-media-frame.size-small {
      border-radius: 10px;
    }
    .transcript-media-frame.size-portrait,
    .transcript-media-frame.size-tall {
      max-width: min(330px, 100%);
    }

    .transcript-image-wrap {
      position: relative;
      cursor: zoom-in;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    .transcript-image {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: inherit;
      object-fit: contain;
      transition: transform 0.2s ease, filter 0.2s ease;
    }
    .transcript-image-wrap:hover .transcript-image {
      filter: brightness(1.02);
      transform: scale(1.008);
    }

    .media-hover-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
      z-index: 2;
    }
    .transcript-image-wrap:hover .media-hover-overlay,
    .gallery-item-frame:hover .media-hover-overlay {
      opacity: 1;
    }
    .media-hover-action {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(13, 15, 19, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #f8fafc;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }
    .media-hover-action .zoom-icon {
      width: 13px;
      height: 13px;
      stroke: #cbd5e1;
    }

    /* Multi-Image Adaptive Gallery */
    .transcript-gallery {
      margin-top: 8px;
      display: grid;
      gap: 6px;
      max-width: 560px;
      width: 100%;
    }
    .transcript-gallery.gallery-2 {
      grid-template-columns: 1fr 1fr;
      height: 220px;
    }
    .transcript-gallery.gallery-3 {
      grid-template-columns: 3fr 2fr;
      grid-template-rows: 1fr 1fr;
      height: 280px;
    }
    .transcript-gallery.gallery-4 {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      height: 320px;
    }
    .transcript-gallery.gallery-many {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }

    .gallery-item-frame {
      position: relative;
      background: #0d0f13;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      cursor: zoom-in;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .gallery-item-frame:hover {
      border-color: rgba(255, 255, 255, 0.18);
      z-index: 1;
    }
    .gallery-item-frame .gallery-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.2s ease, filter 0.2s ease;
    }
    .gallery-item-frame:hover .gallery-thumb {
      transform: scale(1.02);
      filter: brightness(1.03);
    }

    /* Coordinated outer corners for galleries */
    .transcript-gallery.gallery-2 .gallery-item-frame:nth-child(1) { border-radius: 12px 4px 4px 12px; }
    .transcript-gallery.gallery-2 .gallery-item-frame:nth-child(2) { border-radius: 4px 12px 12px 4px; }

    .transcript-gallery.gallery-3 .gallery-item-frame:nth-child(1) { grid-row: span 2; border-radius: 12px 4px 4px 12px; }
    .transcript-gallery.gallery-3 .gallery-item-frame:nth-child(2) { border-radius: 4px 12px 4px 4px; }
    .transcript-gallery.gallery-3 .gallery-item-frame:nth-child(3) { border-radius: 4px 4px 12px 4px; }

    .transcript-gallery.gallery-4 .gallery-item-frame:nth-child(1) { border-radius: 12px 4px 4px 4px; }
    .transcript-gallery.gallery-4 .gallery-item-frame:nth-child(2) { border-radius: 4px 12px 4px 4px; }
    .transcript-gallery.gallery-4 .gallery-item-frame:nth-child(3) { border-radius: 4px 4px 4px 12px; }
    .transcript-gallery.gallery-4 .gallery-item-frame:nth-child(4) { border-radius: 4px 4px 12px 4px; }

    .transcript-gallery.gallery-many .gallery-item-frame {
      aspect-ratio: 1;
      border-radius: 8px;
    }

    /* Legacy compatibility */
    .media-gallery {
      margin-top: 8px;
      display: grid;
      gap: 6px;
      max-width: 560px;
    }
    .media-gallery.grid-1 { grid-template-columns: 1fr; }
    .media-gallery.grid-2 { grid-template-columns: 1fr 1fr; }
    .media-gallery.grid-many { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
    .gallery-item {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
      cursor: zoom-in;
      background: #0d0f13;
    }
    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.2s ease;
    }
    .gallery-item:hover img {
      transform: scale(1.02);
    }
    .media-files-stream {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .media-file a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,0,0,0.3);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      color: #93c5fd;
      text-decoration: none;
      font-size: 13px;
    }
    .media-file a:hover {
      text-decoration: underline;
      background: rgba(0,0,0,0.5);
    }
    .file-size { color: var(--text-sub); font-size: 11px; }

    /* Embed Cards */
    .embed-card {
      background: #14161d;
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: 8px;
      padding: 14px 18px;
      max-width: 560px;
      margin-top: 8px;
    }
    .embed-title {
      font-weight: 700;
      font-size: 14px;
      color: #fff;
      margin-bottom: 6px;
    }
    .embed-title a { color: #60a5fa; text-decoration: none; }
    .embed-title a:hover { text-decoration: underline; }
    .embed-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 8px;
    }
    .embed-fields-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      margin-top: 8px;
    }
    .embed-field .field-name {
      font-size: 12px;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 2px;
    }
    .embed-field .field-val {
      font-size: 12.5px;
      color: var(--text-muted);
    }

    /* Reactions */
    .reactions-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .reaction-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2px 8px;
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Floating Search Bar (Ctrl+F) */
    .search-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(18, 20, 27, 0.95);
      border: 1px solid var(--border-accent);
      backdrop-filter: blur(16px);
      border-radius: 14px;
      padding: 8px 14px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.7);
      display: none;
      align-items: center;
      gap: 10px;
      z-index: 100;
    }
    .search-panel.active { display: flex; }
    .search-input {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      color: #fff;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 13px;
      width: 200px;
      outline: none;
    }
    .search-counter { font-size: 12px; color: var(--text-muted); font-family: monospace; }
    .search-btn {
      background: none; border: none; color: #cbd5e1;
      cursor: pointer; font-size: 14px; padding: 4px;
    }
    .search-btn:hover { color: #fff; }
    .mark-found { background: var(--highlight); color: #fff; border-radius: 2px; }
    .mark-found.current { background: #f59e0b; color: #000; font-weight: bold; }

    /* Premium Lightbox Modal V5 */
    .lightbox-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .lightbox-modal.active {
      display: flex !important;
    }
    .lightbox-backdrop {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 1;
    }
    .lightbox-container {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 95vw;
      max-height: 95vh;
      transform: scale(0.985);
      transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .lightbox-modal.active .lightbox-container {
      transform: scale(1);
    }
    @media (prefers-reduced-motion: reduce) {
      .lightbox-modal, .lightbox-container { transition: none !important; }
    }

    .lightbox-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(13, 15, 19, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #e2e8f0;
    }
    .lightbox-counter {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--text-muted);
      background: rgba(255,255,255,0.06);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .lightbox-filename {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 60vw;
    }
    .lightbox-close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .lightbox-close-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    .lightbox-stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 92vw;
      max-height: 82vh;
    }
    .lightbox-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(13, 15, 19, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      z-index: 10;
      transition: background 0.15s, transform 0.15s;
      user-select: none;
    }
    .lightbox-nav-btn:hover {
      background: rgba(28, 30, 39, 0.95);
      transform: translateY(-50%) scale(1.08);
    }
    .lightbox-nav-btn.prev { left: -56px; }
    .lightbox-nav-btn.next { right: -56px; }

    .lightbox-img-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 92vw;
      max-height: 80vh;
    }
    .lightbox-img {
      max-width: 92vw;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 16px 50px rgba(0, 0, 0, 0.8);
      display: block;
    }

    .lightbox-footer {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(13, 15, 19, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .lightbox-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .lightbox-meta-sep { opacity: 0.5; }
    .lightbox-download-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 5px 10px;
      color: #f8fafc;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      transition: background 0.15s;
    }
    .lightbox-download-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      text-decoration: none;
    }
    .lightbox-download-btn .download-icon {
      width: 13px;
      height: 13px;
    }

    /* Fallback Card with Retry Button */
    .img-fallback-card {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #0d0f13;
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 8px 14px;
      color: var(--text-muted);
      font-size: 12px;
      margin: 6px 0;
      max-width: min(460px, 100%);
    }
    .img-fallback-card .fallback-icon { font-size: 15px; opacity: 0.8; }
    .img-fallback-card .fallback-body { display: flex; flex-direction: column; gap: 2px; }
    .img-fallback-card .fallback-text { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #cbd5e1; }
    .img-fallback-card .fallback-sub { font-size: 11px; color: var(--text-sub); }
    .fallback-retry-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 5px;
      color: #f8fafc;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
      margin-left: auto;
    }
    .fallback-retry-btn:hover { background: rgba(255, 255, 255, 0.15); }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .lightbox-nav-btn.prev { left: 8px; }
      .lightbox-nav-btn.next { right: 8px; }
      .transcript-media-frame { max-width: 100%; }
      .transcript-gallery { max-width: 100%; }
      .group-avatar { width: 34px; height: 34px; }
    }

    /* Floating Jump to Latest Button */
    .jump-bottom-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-surface);
      border: 1px solid var(--border-accent);
      color: #fff;
      padding: 10px 16px;
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      cursor: pointer;
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      z-index: 90;
      transition: all 0.2s ease;
    }
    .jump-bottom-btn:hover {
      background: #1c1e28;
      transform: translateY(-2px);
    }

    /* Footer */
    .page-footer {
      text-align: center;
      margin-top: 40px;
      font-size: 13px;
      color: var(--text-sub);
    }
    .page-footer a { color: var(--silver); text-decoration: none; }
    .page-footer a:hover { text-decoration: underline; }

    /* ==================================================================
       DISCORD CHANNEL VIEW
       Renders the archive as a read-only Discord channel: sticky channel
       bar, channel intro, day dividers, Discord message geometry and a
       read-only composer. Rules below intentionally win over the legacy
       document/card layout above.
       ================================================================== */
    .ambient-waves,
    .navbar,
    .metrics-bar,
    .stream-container,
    .page-footer { display: none !important; }

    .app {
      max-width: 1280px;
      margin: 0 auto;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
    }

    /* ---- shell: chat column + member list ---------------------------- */
    .shell {
      display: flex;
      flex: 1 1 auto;
      align-items: stretch;
      min-height: 0;
      width: 100%;
    }
    .chat-col {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .chat-col > .chat { flex: 1 1 auto; }

    .member-rail {
      flex: 0 0 240px;
      width: 240px;
      display: none;
      background: var(--rail-bg);
      border-left: 1px solid var(--border);
      position: sticky;
      top: var(--topbar-h);
      align-self: flex-start;
      height: calc(100dvh - var(--topbar-h));
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 14px 8px 28px;
      scrollbar-width: thin;
      scrollbar-color: var(--scroll-thumb) transparent;
    }
    @media (min-width: 1100px) {
      .member-rail { display: block; }
      body.rail-off .member-rail { display: none; }
    }
    @media (max-width: 1099px) {
      .member-rail {
        display: block;
        position: fixed;
        top: var(--topbar-h);
        right: 0;
        bottom: 0;
        height: auto;
        width: min(302px, 86vw);
        z-index: 70;
        transform: translateX(100%);
        visibility: hidden;
        box-shadow: -18px 0 40px rgba(0, 0, 0, 0.45);
        transition: transform 0.22s ease, visibility 0.22s ease;
      }
      .member-rail.open { transform: translateX(0); visibility: visible; }
      .rail-backdrop { display: block; }
    }
    .rail-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 8px 8px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 4px;
    }
    .rail-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-sub);
    }
    .rail-total {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-sub);
      background: var(--bg-raised);
      border-radius: 999px;
      padding: 1px 8px;
    }
    .rail-head-actions { display: flex; align-items: center; gap: 6px; }
    .rail-close {
      display: none;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--text-muted);
      font-size: 14px;
      cursor: pointer;
    }
    .rail-close:hover { background: var(--rail-hover); color: var(--text-strong); }
    .rail-group-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-sub);
      padding: 16px 8px 6px;
    }
    .rail-member {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-height: 40px;
      padding: 5px 8px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      text-align: left;
      font-family: inherit;
      color: var(--text-muted);
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .rail-member:hover { background: var(--rail-hover); }
    .rail-member:active { background: var(--bg-card-hover); }
    .rail-avatar {
      width: 32px;
      height: 32px;
      flex: 0 0 32px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--accent);
    }
    .rail-name {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .rail-member:hover .rail-name { color: var(--text-strong); }
    .rail-member .badge-bot { flex: 0 0 auto; }
    .rail-msg {
      flex: 0 0 auto;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-sub);
      font-variant-numeric: tabular-nums;
      opacity: 0.85;
    }
    .rail-empty { padding: 16px 8px; font-size: 13px; color: var(--text-sub); }
    .rail-backdrop {
      display: none;
      position: fixed;
      top: var(--topbar-h);
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.52);
      z-index: 65;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.18s ease, visibility 0.18s ease;
    }
    .rail-backdrop.open { opacity: 1; visibility: visible; }
    body.rail-locked { overflow: hidden; }
    @media (max-width: 1099px) {
      .rail-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }

    /* ---- toast ------------------------------------------------------- */
    .toast {
      position: fixed;
      left: 50%;
      bottom: calc(96px + env(safe-area-inset-bottom, 0px));
      transform: translate(-50%, 14px);
      z-index: 90;
      max-width: min(92vw, 420px);
      padding: 9px 16px;
      border-radius: 999px;
      background: #1e1f22;
      color: #f2f3f5;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
      font-size: 0.8125rem;
      font-weight: 500;
      text-align: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }
    [data-theme="light"] .toast {
      background: #ffffff;
      color: #060607;
      border-color: rgba(6, 6, 7, 0.12);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
    }
    .toast.show { opacity: 1; transform: translate(-50%, 0); }

    /* ---- per-message hover action (copy deep link) ------------------- */
    .message-item {
      position: relative;
      /* keep anchor/deep-link jumps clear of the sticky channel bar */
      scroll-margin-top: calc(var(--topbar-h) + 28px);
      scroll-margin-bottom: 96px;
    }
    .msg-action {
      position: absolute;
      top: -10px;
      right: 6px;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 4px;
      background: var(--bg-raised);
      color: var(--text-muted);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.12s ease, background 0.12s ease, color 0.12s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }
    .msg-action svg { width: 15px; height: 15px; }
    .message-item:hover .msg-action,
    .msg-action:focus-visible { opacity: 1; pointer-events: auto; }
    .msg-action:hover { background: var(--bg-card-hover); color: var(--text-strong); }
    @media (hover: none) {
      .message-item:hover .msg-action { opacity: 0; pointer-events: none; }
      .msg-action { opacity: 0.55; pointer-events: auto; }
    }

    /* ---- channel bar ------------------------------------------------ */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 60;
      height: var(--topbar-h);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 max(var(--pad-x), env(safe-area-inset-right, 0px)) 0 max(var(--pad-x), env(safe-area-inset-left, 0px));
      background: var(--topbar-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .topbar-hash {
      color: var(--text-sub);
      font-size: 22px;
      font-weight: 500;
      line-height: 1;
      flex: 0 0 auto;
    }
    .topbar-channel {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-strong);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 32vw;
    }
    .topbar-sep {
      width: 1px;
      height: 22px;
      background: rgba(255, 255, 255, 0.08);
      flex: 0 0 auto;
      margin: 0 2px;
    }
    .topbar-meta {
      font-size: 13px;
      color: var(--text-sub);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .topbar-dot { opacity: 0.6; margin: 0 2px; }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 0 0 auto;
    }
    .tb-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 24px;
      padding: 0 9px;
      margin-right: 4px;
      border-radius: 999px;
      background: rgba(35, 165, 90, 0.12);
      border: 1px solid rgba(35, 165, 90, 0.25);
      color: #8ee39b;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .tb-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #23a55a;
    }
    .tb-btn {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
      text-decoration: none;
    }
    .tb-btn:hover { background: var(--rail-hover); color: var(--text-strong); }
    .tb-btn:active { background: var(--bg-card-hover); }
    .tb-btn svg { width: 18px; height: 18px; }
    .ico-sun { display: none; }
    [data-theme="light"] .ico-sun { display: block; }
    [data-theme="light"] .ico-moon { display: none; }
    .tb-btn-members { position: relative; }
    .tb-btn-members[aria-expanded="true"] { color: var(--text-strong); background: var(--rail-hover); }

    /* ---- chat body --------------------------------------------------- */
    .chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 0 8px;
    }
    /* ---- channel intro (Components V2 container) --------------------- */
    .channel-intro {
      padding: clamp(20px, 4vw, 40px) var(--pad-x) 4px;
    }
    .ci-card {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: 4px 10px 10px 4px;
      padding: clamp(16px, 2.4vw, 22px) clamp(16px, 2.6vw, 24px);
      box-shadow: 0 8px 26px rgba(0, 0, 0, 0.10);
    }
    .ci-head {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }
    .ci-avatar {
      flex: 0 0 auto;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      font-size: 28px;
      font-weight: 500;
      color: #fff;
      background: linear-gradient(180deg, #7d7bf6 0%, #4f56e8 100%);
      box-shadow: 0 8px 22px rgba(79, 86, 232, 0.32);
      user-select: none;
    }
    .ci-headings { min-width: 0; }
    .ci-title {
      font-size: clamp(18px, 2.3vw, 23px);
      font-weight: 800;
      color: var(--text-strong);
      letter-spacing: -0.01em;
      line-height: 1.25;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .ci-sub {
      font-size: clamp(12px, 1.1vw, 14px);
      color: var(--text-muted);
      margin-top: 4px;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .ci-divider {
      height: 1px;
      background: var(--border);
      margin: 16px 0 14px;
    }
    .ci-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .ci-stat {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding: 9px 11px;
      border-radius: 9px;
      background: var(--ci-stat-bg, rgba(255, 255, 255, 0.035));
      border: 1px solid var(--border);
    }
    .ci-stat-icon {
      flex: 0 0 auto;
      width: 32px;
      height: 32px;
      border-radius: 9px;
      display: grid;
      place-items: center;
      color: var(--accent);
      background: rgba(88, 101, 242, 0.14);
    }
    .ci-stat-icon svg { width: 17px; height: 17px; }
    .ci-stat-body {
      display: flex;
      flex-direction: column;
      min-width: 0;
      line-height: 1.25;
    }
    .ci-stat-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--text-sub);
    }
    .ci-stat-value {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-strong);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chat-rule {
      height: 1px;
      background: var(--border);
      margin: 26px var(--pad-x) 6px;
    }

    /* ---- day dividers ------------------------------------------------ */
    .day-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 18px var(--pad-x) 6px;
      color: var(--text-sub);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    .day-divider::before,
    .day-divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--divider);
    }
    .day-divider span { white-space: nowrap; }

    /* ---- message geometry (Discord) --------------------------------- */
    .message-group {
      display: flex;
      gap: var(--gap-msg);
      padding: 2px var(--pad-x);
      border-radius: 0;
      transition: background 0.1s ease;
    }
    .message-group:hover { background: var(--chat-hover); }
    .group-avatar {
      width: var(--avatar-msg);
      height: var(--avatar-msg);
      flex: 0 0 var(--avatar-msg);
      margin-top: 2px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--accent);
      border: 0;
    }
    .group-body { flex: 1; min-width: 0; }
    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
      flex-wrap: wrap;
      min-width: 0;
    }
    .author-name {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-strong);
      line-height: 1.375rem;
    }
    .author-role-icon {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      object-fit: contain;
      vertical-align: -3px;
      margin-left: 0;
    }
    .author-role-emoji { font-size: 15px; line-height: 1; vertical-align: -1px; }
    .badge-bot {
      background: var(--accent);
      color: #fff;
      font-size: 0.625rem;
      font-weight: 500;
      line-height: 1;
      padding: 3px 4px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .group-time { font-size: 0.75rem; color: var(--text-sub); }
    .group-items { display: flex; flex-direction: column; gap: 2px; }
    .message-item {
      padding: 0;
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    .message-item.target-highlight {
      background: rgba(88, 101, 242, 0.12);
      box-shadow: inset 2px 0 0 var(--accent);
    }
    .msg-content-row { display: inline; }
    .msg-text {
      display: inline;
      font-size: 1rem;
      line-height: 1.375rem;
      color: var(--text);
    }
    .msg-text a { color: var(--link); text-decoration: none; }
    .msg-text a:hover { text-decoration: underline; }
    .edited-tag { font-size: 0.625rem; color: var(--text-sub); margin-left: 4px; }

    /* ---- replies ----------------------------------------------------- */
    .reply-context {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 2px 0 3px;
      padding: 0;
      background: none;
      border: 0;
      font-size: 0.875rem;
      color: var(--text-sub);
      max-width: 100%;
      cursor: default;
    }
    .reply-context.is-jumpable { cursor: pointer; }
    .reply-spine {
      width: 16px;
      height: 16px;
      flex: 0 0 16px;
      opacity: 1;
      color: #4e5058;
      margin-right: 2px;
    }
    .reply-avatar {
      width: 16px;
      height: 16px;
      flex: 0 0 16px;
      border-radius: 50%;
      object-fit: cover;
    }
    .reply-author {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--text-muted);
      white-space: nowrap;
      max-width: 30%;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
    }
    .reply-preview {
      color: var(--text-sub);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      font-size: 0.875rem;
    }
    .reply-context:hover .reply-author,
    .reply-context:hover .reply-preview { color: var(--text); }

    /* ---- markdown ---------------------------------------------------- */
    .markdown-heading {
      color: var(--text-strong);
      font-weight: 700;
      margin: 14px 0 6px;
    }
    .markdown-subtext {
      display: block;
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.25rem;
      margin: 2px 0;
    }
    .code-inline {
      background: var(--bg-surface);
      border: 0;
      border-radius: 4px;
      padding: 0 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: var(--text);
    }
    .code-block {
      background: var(--bg-surface);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 4px;
      padding: 8px 12px;
      margin: 6px 0;
      max-width: 100%;
      overflow: hidden;
    }
    .code-block code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--text);
    }
    .mention {
      background: rgba(88, 101, 242, 0.3);
      color: #dee0fc;
      padding: 0 2px;
      border-radius: 3px;
      font-size: 1rem;
      font-weight: 500;
      transition: background 0.1s ease;
    }
    .mention:hover { background: var(--accent); color: #fff; }
    .mention.role {
      background: rgba(88, 101, 242, 0.3);
      color: #dee0fc;
      padding: 0 2px;
      border-radius: 3px;
      gap: 4px;
    }
    .spoiler {
      background: #202225;
      color: transparent;
      padding: 1px 4px;
      border-radius: 4px;
      text-shadow: none;
    }
    .spoiler.revealed {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
    }
    .custom-emoji { width: 22px; height: 22px; vertical-align: -4px; }
    .custom-emoji.jumbo { width: 48px; height: 48px; vertical-align: middle; }

    /* ---- components v2 / panels ------------------------------------- */
    .discord-components-tree { margin-top: 4px; }
    .discord-component-container {
      background: var(--bg-surface);
      border: 0;
      border-left: 4px solid var(--dvc-accent, var(--accent));
      border-radius: 4px 8px 8px 4px;
      padding: 12px 16px;
      margin: 4px 0;
      max-width: 100%;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      box-shadow: none;
    }
    .discord-component-container.is-spoiler > * { filter: blur(6px); pointer-events: none; }
    .discord-component-text {
      font-size: 1rem;
      line-height: 1.375rem;
      color: var(--text);
    }
    .discord-component-text h3 { font-size: 1rem; font-weight: 700; margin: 0 0 4px; }
    .discord-component-section { margin-top: 4px; }
    .discord-component-section .section-content { font-size: 1rem; }
    .discord-component-separator.divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 10px 0;
    }
    .discord-component-separator.spacing-large { margin: 16px 0; }
    .discord-component-action-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .discord-component-thumbnail img {
      max-width: 100%;
      border-radius: 8px;
      display: block;
    }
    .discord-component-media-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 4px;
      margin-top: 8px;
      max-width: 520px;
    }
    .discord-component-media-gallery img {
      width: 100%;
      border-radius: 4px;
      display: block;
    }
    .discord-component-media-gallery video {
      width: 100%;
      border-radius: 4px;
      display: block;
      background: #000;
    }
    .discord-component-media-gallery .gallery-item {
      cursor: zoom-in;
      overflow: hidden;
      border-radius: 4px;
      background: var(--bg-raised);
    }
    .discord-component-media-gallery .gallery-item.is-spoiler img { filter: blur(14px); }
    /* Components V2 file card */
    .dvc-file {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--bg-raised);
      border: 1px solid var(--border);
      text-decoration: none;
      color: inherit;
      max-width: 520px;
    }
    .dvc-file:hover { border-color: var(--border-accent); }
    .dvc-file-icon {
      flex: 0 0 auto;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: rgba(88, 101, 242, 0.14);
      color: var(--accent);
    }
    .dvc-file-icon svg { width: 18px; height: 18px; }
    .dvc-file-body { display: flex; flex-direction: column; min-width: 0; }
    .dvc-file-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dvc-file-meta { font-size: 11px; color: var(--text-sub); }
    /* Emoji that Discord no longer serves degrades to readable text, never a
       broken-image icon. */
    .emoji-fallback {
      display: inline-block;
      padding: 0 4px;
      border-radius: 4px;
      background: var(--bg-raised);
      color: var(--text-muted);
      font-size: 0.85em;
      font-family: 'JetBrains Mono', monospace;
      vertical-align: baseline;
    }
    .discord-btn-snapshot {
      height: 32px;
      padding: 0 16px;
      border-radius: 3px;
      font-size: 0.875rem;
      font-weight: 500;
      border: 0;
      gap: 8px;
    }
    .discord-btn-snapshot.btn-primary { background: var(--accent); }
    .discord-btn-snapshot.btn-secondary { background: #4e5058; color: #fff; border: 0; }
    .discord-btn-snapshot.btn-success { background: #248046; }
    .discord-btn-snapshot.btn-danger { background: var(--danger); }
    .discord-btn-snapshot.btn-link { background: #4e5058; color: #fff; border: 0; }
    .discord-btn-snapshot .btn-emoji { width: 16px; height: 16px; vertical-align: -3px; }
    .discord-btn-snapshot.is-disabled { opacity: 0.55; cursor: not-allowed; }

    /* ---- embeds ------------------------------------------------------ */
    .embed-card {
      background: var(--bg-surface);
      border: 0;
      border-left: 4px solid var(--accent);
      border-radius: 4px;
      padding: 8px 14px 12px;
      max-width: 520px;
      margin-top: 4px;
      display: flow-root;
    }
    .embed-author {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-strong);
    }
    .embed-author-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }
    .embed-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-strong);
      margin: 6px 0 2px;
    }
    .embed-title a { color: var(--link); text-decoration: none; }
    .embed-desc {
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--text);
    }
    .embed-fields-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .embed-field { flex: 1 1 100%; min-width: 0; }
    .embed-field.inline { flex: 1 1 calc(33% - 8px); }
    .embed-field .field-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-strong);
      margin-bottom: 2px;
    }
    .embed-field .field-val { font-size: 0.875rem; line-height: 1.25rem; color: var(--text); }
    .embed-image img { width: auto; max-width: 100%; max-height: 360px; border-radius: 4px; display: block; margin-top: 8px; }
    .embed-thumbnail img { width: auto; max-width: 100%; max-height: 80px; border-radius: 4px; }
    .embed-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-sub);
      margin-top: 8px;
    }
    .embed-footer-icon { width: 20px; height: 20px; border-radius: 50%; }

    /* ---- reactions --------------------------------------------------- */
    .reactions-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .reaction-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 24px;
      padding: 0 8px;
      background: var(--bg-surface);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      font-size: 0.875rem;
      color: var(--text-muted);
      cursor: default;
    }
    .react-custom-emoji { width: 16px; height: 16px; vertical-align: -3px; }

    /* ---- attachments / media ---------------------------------------- */
    .transcript-media-frame {
      display: block;
      width: fit-content;
      max-width: min(480px, 100%);
      margin-top: 4px;
      background: transparent;
      border: 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: none;
      transition: none;
    }
    .transcript-media-frame:hover { border: 0; box-shadow: none; }
    .transcript-media-frame.size-small { border-radius: 8px; }
    .transcript-media-frame.size-tall { max-width: min(340px, 100%); }
    .transcript-image-wrap { position: relative; border-radius: 8px; overflow: hidden; cursor: zoom-in; }
    .transcript-image { display: block; max-width: 100%; border-radius: 8px; }
    .gallery-item-frame {
      background: transparent;
      border: 0;
      border-radius: 4px;
      overflow: hidden;
      cursor: zoom-in;
    }
    .gallery-item-frame:hover { border: 0; }
    .gallery-item-frame .gallery-thumb { border-radius: 4px; }
    .transcript-gallery { gap: 4px; margin-top: 4px; max-width: 520px; border-radius: 8px; }
    .media-files-stream { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
    .media-file a {
      display: flex;
      align-items: center;
      gap: 10px;
      width: fit-content;
      max-width: min(420px, 100%);
      padding: 10px 12px;
      background: var(--bg-surface);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      color: var(--text);
      text-decoration: none;
    }
    .media-file a:hover { background: var(--bg-card-hover); border-color: var(--border-accent); }
    .file-icon {
      width: 32px;
      height: 32px;
      flex: 0 0 32px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: rgba(88, 101, 242, 0.14);
      color: #a5b3ff;
    }
    .file-icon svg { width: 18px; height: 18px; }
    .file-body { display: flex; flex-direction: column; min-width: 0; }
    .file-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-strong);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-meta { font-size: 0.75rem; color: var(--text-sub); margin-top: 1px; }
    .file-dl { width: 18px; height: 18px; flex: 0 0 18px; margin-left: 6px; color: var(--text-sub); }
    .file-dl svg { width: 18px; height: 18px; }
    .media-video video, .media-audio audio { max-width: min(480px, 100%); border-radius: 8px; }
    .discord-sticker img { max-width: 160px; max-height: 160px; }
    .message-stickers { gap: 8px; margin-top: 4px; }

    /* ---- unrecoverable / broken media card -------------------------- */
    .media-fallback {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 6px 0;
      padding: 12px 14px;
      width: fit-content;
      max-width: min(470px, 100%);
      background: var(--bg-surface);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
    .mf-icon {
      width: 36px;
      height: 36px;
      flex: 0 0 36px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: rgba(218, 55, 60, 0.12);
      color: #f28b8e;
    }
    .mf-icon svg { width: 20px; height: 20px; }
    .mf-body { flex: 1; min-width: 0; }
    .mf-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .mf-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-strong);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mf-badge {
      flex: 0 0 auto;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      background: rgba(218, 55, 60, 0.15);
      border: 1px solid rgba(218, 55, 60, 0.25);
      color: #f28b8e;
      white-space: nowrap;
    }
    .mf-meta {
      margin-top: 2px;
      font-size: 0.75rem;
      color: var(--text-sub);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mf-btn,
    .mf-retry {
      flex: 0 0 auto;
      height: 30px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 0;
      border-radius: 4px;
      background: #4e5058;
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .mf-btn:hover,
    .mf-retry:hover { background: #5d6069; }
    .media-fallback[data-state="loading"] .mf-retry { background: #3c3f45; color: var(--text-sub); }
    .img-fallback-card {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 6px 0;
      padding: 12px 14px;
      width: fit-content;
      max-width: min(470px, 100%);
      background: var(--bg-surface);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 0.75rem;
    }
    .media-fallback-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
    .reply-placeholder { font-style: italic; opacity: 0.75; }

    /* ---- read-only composer ----------------------------------------- */
    .composer {
      position: sticky;
      bottom: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px max(var(--pad-x), env(safe-area-inset-right, 0px)) max(14px, env(safe-area-inset-bottom, 0px)) max(var(--pad-x), env(safe-area-inset-left, 0px));
      background: linear-gradient(180deg, transparent 0%, var(--composer-fade) 42%);
    }
    .composer-plus {
      width: 40px;
      height: 40px;
      flex: 0 0 40px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: var(--bg-raised);
      color: var(--text-strong);
      font-size: 22px;
      line-height: 1;
      cursor: not-allowed;
      pointer-events: none;
    }
    .composer-box {
      flex: 1;
      min-width: 0;
      height: 44px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-radius: 8px;
      background: var(--bg-raised);
      color: var(--text-sub);
      font-size: 1rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .composer-hint { margin-left: 6px; color: #6d6f78; font-size: 0.875rem; }
    .archive-note {
      text-align: center;
      font-size: 12px;
      color: #6d6f78;
      padding: 0 16px 20px;
    }
    .archive-note a { color: var(--text-sub); text-decoration: none; }
    .archive-note a:hover { text-decoration: underline; }
    .chat-tail { height: 8px; }

    /* ---- floating controls ------------------------------------------ */
    .jump-bottom-btn {
      bottom: 84px;
      right: 24px;
      background: var(--accent);
      border: 0;
      color: #fff;
      padding: 10px 16px;
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      font-size: 13px;
      font-weight: 600;
    }
    .jump-bottom-btn:hover { background: var(--accent-hover); transform: translateY(-2px); }
    .search-panel {
      top: calc(var(--topbar-h) + 10px);
      right: auto;
      left: 50%;
      transform: translateX(-50%);
      background: var(--panel-deep);
      border: 1px solid var(--border-accent);
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 12px 32px var(--shadow-strong);
      gap: 8px;
    }
    .search-input {
      background: var(--input-deep);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text);
      font-size: 0.875rem;
      padding: 6px 10px;
      width: 240px;
    }
    .search-counter { font-size: 12px; color: var(--text-sub); }
    .search-btn {
      width: 28px;
      height: 28px;
      display: inline-grid;
      place-items: center;
      background: transparent;
      border: 0;
      border-radius: 4px;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
    }
    .search-btn:hover { background: rgba(255, 255, 255, 0.06); color: var(--text-strong); }

    /* ==================================================================
       LIGHT THEME COMPONENT OVERRIDES
       Tokens flip most surfaces; these catch component colours that were
       authored as literal hex values.
       ================================================================== */
    [data-theme="light"] .code-inline {
      background: rgba(6, 6, 7, 0.06);
      border-color: rgba(6, 6, 7, 0.1);
      color: #2e3338;
    }
    [data-theme="light"] .code-block {
      background: var(--code-bg);
      border-color: rgba(6, 6, 7, 0.08);
      color: #2e3338;
    }
    [data-theme="light"] .spoiler { background: #c9ccd1; color: #c9ccd1; }
    [data-theme="light"] .spoiler.revealed { color: #060607; }
    [data-theme="light"] .markdown-heading { color: var(--text-strong); }
    [data-theme="light"] .mention {
      background: rgba(88, 101, 242, 0.12);
      color: #4752c4;
    }
    [data-theme="light"] .mention:hover { background: var(--accent); color: #fff; }
    [data-theme="light"] .reply-author { color: #4752c4; }
    [data-theme="light"] .transcript-media-frame,
    [data-theme="light"] .gallery-item-frame,
    [data-theme="light"] .gallery-item { background: var(--bg-surface); }
    [data-theme="light"] .embed-card { background: var(--bg-surface); }
    [data-theme="light"] .embed-title,
    [data-theme="light"] .embed-author { color: var(--text-strong); }
    [data-theme="light"] .embed-title a { color: #006ce7; }
    [data-theme="light"] .embed-field .field-name { color: var(--text-strong); }
    [data-theme="light"] .discord-component-container {
      background: var(--bg-surface);
      border-color: var(--border);
    }
    [data-theme="light"] .discord-component-text h1,
    [data-theme="light"] .discord-component-text h2,
    [data-theme="light"] .discord-component-text h3 { color: var(--text-strong); }
    [data-theme="light"] .discord-btn-snapshot.btn-secondary,
    [data-theme="light"] .discord-btn-snapshot.btn-link { background: #4e5058; color: #fff; }
    [data-theme="light"] .reaction-pill {
      background: var(--bg-surface);
      border-color: var(--border);
      color: var(--text);
    }
    [data-theme="light"] .reaction-pill.me { border-color: var(--accent); }
    [data-theme="light"] .media-fallback { background: var(--bg-surface); }
    [data-theme="light"] .mf-badge { background: rgba(216, 60, 62, 0.1); }
    [data-theme="light"] .mf-icon { background: rgba(216, 60, 62, 0.1); }
    [data-theme="light"] .mf-retry { background: #4e5058; color: #fff; }
    [data-theme="light"] .img-fallback-card { background: var(--bg-surface); }
    [data-theme="light"] .mark-found { color: #060607; }
    [data-theme="light"] .msg-action { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12); }
    [data-theme="light"] .archive-note a { color: var(--text-muted); }
    /* White role icons would disappear on a white canvas: add a hairline
       outline around their alpha silhouette without touching the hue. */
    [data-theme="light"] .author-role-icon,
    [data-theme="light"] .role-mention-icon {
      filter: drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.45));
    }
    /* Pure-white custom emoji would vanish on the white canvas. */
    [data-theme="light"] .custom-emoji,
    [data-theme="light"] .react-custom-emoji,
    [data-theme="light"] .btn-emoji {
      filter: drop-shadow(0 0 0.7px rgba(0, 0, 0, 0.55));
    }
    [data-theme="light"] .ci-card { box-shadow: 0 8px 26px rgba(0, 0, 0, 0.06); }
    [data-theme="light"] .ci-stat-icon { background: rgba(88, 101, 242, 0.12); }
    [data-theme="light"] .dvc-file-icon { background: rgba(88, 101, 242, 0.12); }

    /* ==================================================================
       RESPONSIVE MATRIX
       One layout, every device: small phones, phablets, tablets, laptops,
       ultrawide desktop, landscape phones, touch, keyboard and print.
       ================================================================== */

    /* Tablets and small laptops: keep the rail reachable but out of the way */
    @media (max-width: 1099px) {
      .app { max-width: 100%; }
    }

    /* Desktop: rail shown by default, wider on big screens */
    @media (min-width: 1100px) and (max-width: 1599px) {
      .member-rail { flex-basis: 232px; width: 232px; }
    }

    /* Tablets in portrait / large phones */
    @media (max-width: 900px) {
      :root { --topbar-h: 46px; }
      .topbar-channel { max-width: 42vw; }
    }

    /* Phones */
    @media (max-width: 768px) {
      :root {
        --topbar-h: 46px;
        --pad-x: 12px;
        --gap-msg: 12px;
        --avatar-msg: 36px;
      }
      .topbar { gap: 8px; }
      .topbar-hash { font-size: 20px; }
      .topbar-channel { max-width: 38vw; font-size: 15px; }
      .topbar-sep { display: none; }
      .topbar-meta { display: none; }
      .tb-chip { display: none; }
      .tb-btn { width: 36px; height: 36px; }
      .channel-intro { padding: 20px var(--pad-x) 4px; }
      .ci-card { padding: 14px; }
      .ci-head { gap: 12px; }
      .ci-title { font-size: 18px; }
      .ci-stats { gap: 6px; }
      .ci-stat { padding: 8px 9px; gap: 8px; }
      .ci-stat-icon { width: 28px; height: 28px; border-radius: 8px; }
      .ci-stat-icon svg { width: 15px; height: 15px; }
      .ci-stat-value { font-size: 12.5px; }
      .day-divider { margin: 14px var(--pad-x) 6px; font-size: 11px; }
      .chat-rule { margin: 20px var(--pad-x) 6px; }
      .author-name { font-size: 0.9375rem; }
      .msg-text { font-size: 0.9375rem; line-height: 1.32rem; }
      .group-time { font-size: 0.6875rem; }
      .composer { gap: 8px; padding: 8px var(--pad-x) max(10px, env(safe-area-inset-bottom, 0px)); }
      .composer-plus { width: 36px; height: 36px; flex-basis: 36px; font-size: 20px; }
      .composer-box { height: 42px; padding: 0 12px; font-size: 0.9375rem; }
      .composer-hint { display: none; }
      .message-fallback, .media-fallback, .media-file a, .embed-card { max-width: 100%; }
      .embed-card { padding: 8px 10px 10px; }
      .search-panel { width: calc(100vw - 16px); padding: 6px; gap: 6px; }
      .search-input { width: 100%; min-width: 0; flex: 1 1 auto; font-size: 16px; }
      .jump-bottom-btn { right: 12px; bottom: calc(78px + env(safe-area-inset-bottom, 0px)); font-size: 12px; padding: 9px 13px; }
      .archive-note { font-size: 11px; padding: 0 var(--pad-x) 18px; }
      .lightbox-nav-btn { width: 40px; height: 40px; font-size: 20px; }
      .lightbox-nav-btn.prev { left: 8px; }
      .lightbox-nav-btn.next { right: 8px; }
      .lightbox-header { padding: 10px 14px; }
      .lightbox-footer { flex-wrap: wrap; gap: 8px; }
      .toast { bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }
    }

    /* Small phones */
    @media (max-width: 480px) {
      :root { --avatar-msg: 32px; --gap-msg: 10px; }
      .topbar-channel { max-width: none; flex: 1 1 auto; }
      .topbar-right { gap: 0; }
      .tb-btn { width: 34px; height: 34px; }
      .tb-btn svg { width: 17px; height: 17px; }
      .ci-avatar { display: none; }
      .ci-title { font-size: 17px; }
      .ci-stats { grid-template-columns: 1fr; }
      .ci-stat-value { font-size: 13px; }
      .group-header { gap: 6px; }
      .badge-bot { font-size: 0.5625rem; padding: 2px 4px; }
      .msg-text { font-size: 0.9375rem; }
      .media-file a { padding: 8px 10px; gap: 8px; }
      .file-icon { width: 28px; height: 28px; flex-basis: 28px; }
      .reactions-row { gap: 4px; }
      .lightbox-img-wrap { padding: 0; }
    }

    /* Very small phones (iPhone SE, Galaxy A0x) */
    @media (max-width: 360px) {
      :root { --pad-x: 10px; --avatar-msg: 30px; --gap-msg: 8px; }
      .composer-plus { display: none; }
      .ci-card { padding: 12px; }
      .ci-stat { padding: 7px 8px; }
      .composer-box { font-size: 0.875rem; }
    }

    /* Landscape phones: reclaim vertical space */
    @media (max-height: 520px) and (orientation: landscape) {
      .channel-intro { padding-top: 14px; }
      .ci-avatar { display: none; }
      .ci-sub { display: none; }
      .ci-divider { margin: 10px 0; }
    }

    /* Big / ultrawide desktop: give the channel and the rail more room */
    @media (min-width: 1600px) {
      .app { max-width: 1480px; }
      .member-rail { flex-basis: 264px; width: 264px; }
    }
    @media (min-width: 2100px) {
      .app { max-width: 1680px; }
      .member-rail { flex-basis: 288px; width: 288px; }
    }

    /* Touch devices: comfortable hit areas, no sticky hover states */
    @media (pointer: coarse) {
      .tb-btn { min-width: 40px; min-height: 40px; }
      .rail-member { min-height: 46px; }
      .rail-close { width: 34px; height: 34px; }
      .msg-action { opacity: 0.5; pointer-events: auto; }
      .message-group:hover { background: transparent; }
      .message-item.target-highlight { background: rgba(88, 101, 242, 0.16); }
    }

    /* Keyboard users see the same affordances as mouse users */
    @media (hover: hover) {
      .message-group:focus-within { background: var(--chat-hover); }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }
    }

    @media (prefers-contrast: more) {
      :root { --border: rgba(255, 255, 255, 0.22); --divider: rgba(255, 255, 255, 0.18); }
      [data-theme="light"] { --border: rgba(6, 6, 7, 0.24); --divider: rgba(6, 6, 7, 0.2); }
      .msg-text { color: var(--text-strong); }
    }

    /* Print / Save as PDF: a clean document, no chrome */
    @media print {
      html, body { background: #fff !important; color: #111 !important; }
      .topbar, .composer, .member-rail, .rail-backdrop, .jump-bottom-btn,
      .search-panel, .msg-action, .toast, .ambient-waves { display: none !important; }
      .app { max-width: none !important; }
      .shell { display: block; }
      .message-group { break-inside: avoid; page-break-inside: avoid; }
      .day-divider { break-after: avoid; }
      .msg-text, .author-name, .embed-desc, .code-block { color: #111 !important; }
      .group-time, .day-divider { color: #555 !important; }
      .ci-avatar { display: none; }
      .channel-intro { padding-top: 0; }
      a { color: #0b57d0 !important; }
    }
  </style>
</head>
<body>
  <!-- Ambient Wave SVG -->
  <div class="ambient-waves">
    <svg class="wave-svg" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 450C240 ${wave.pos1 * 10} 480 ${wave.pos2 * 10} 720 450C960 600 1200 300 1440 450V900H0V450Z" fill="url(#wave-grad)"/>
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="#334155" stop-opacity="0.8"/>
          <stop offset="0.5" stop-color="#1e293b" stop-opacity="0.5"/>
          <stop offset="1" stop-color="#0f172a" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
    </svg>
  </div>

  <div class="app">
    <!-- Channel bar (Discord-like) -->
    <header class="topbar">
      <div class="topbar-left">
        <span class="topbar-hash" aria-hidden="true">#</span>
        <h1 class="topbar-channel" title="${escapeHtml(ticketName)}">${escapeHtml(channelLabel)}</h1>
        <span class="topbar-sep" aria-hidden="true"></span>
        <span class="topbar-meta">${messageCount} tin nhắn <span class="topbar-dot">&bull;</span> Transcript</span>
      </div>
      <div class="topbar-right">
        <span class="tb-chip" title="Bản ghi bất biến, không thể chỉnh sửa"><span class="dot"></span>Đã lưu trữ</span>
        <button class="tb-btn" type="button" id="themeBtn" onclick="toggleTheme()" title="Giao diện sáng / tối" aria-label="Đổi giao diện sáng tối">
          <svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          <svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
        </button>
        <button class="tb-btn tb-btn-members" type="button" id="membersBtn" onclick="toggleMembers()" title="Danh sách thành viên" aria-label="Danh sách thành viên" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </button>
        <button class="tb-btn" type="button" onclick="toggleSearch()" title="Tìm kiếm (Ctrl+F)" aria-label="Tìm kiếm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
        <a class="tb-btn" href="?action=download" title="Tải bản ghi HTML (kèm ảnh, GIF, video)" aria-label="Tải bản ghi HTML offline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </a>
      </div>
    </header>

    <div class="shell">
      <div class="chat-col">
        <!-- Message Stream -->
        <main class="chat" id="stream">
          <section class="channel-intro">
            <div class="ci-card">
              <div class="ci-head">
                <div class="ci-avatar" aria-hidden="true">#</div>
                <div class="ci-headings">
                  <h2 class="ci-title">Chào mừng đến #${escapeHtml(channelLabel)}!</h2>
                  <p class="ci-sub">Đây là khởi đầu của kênh #${escapeHtml(channelLabel)}.</p>
                </div>
              </div>
              <div class="ci-divider" aria-hidden="true"></div>
              <div class="ci-stats" role="list">
                <div class="ci-stat" role="listitem">
                  <span class="ci-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg></span>
                  <span class="ci-stat-body">
                    <span class="ci-stat-label">Ticket</span>
                    <span class="ci-stat-value" title="${escapeHtml(ticketName)}">#${escapeHtml(ticketName)}</span>
                  </span>
                </div>
                <div class="ci-stat" role="listitem">
                  <span class="ci-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>
                  <span class="ci-stat-body">
                    <span class="ci-stat-label">Tin nhắn</span>
                    <span class="ci-stat-value" title="${messageCount} tin nhắn">${messageCount}</span>
                  </span>
                </div>
                <div class="ci-stat" role="listitem" title="Đóng ${escapeHtml(closedLabel)} • ${escapeHtml(durationStr)}">
                  <span class="ci-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
                  <span class="ci-stat-body">
                    <span class="ci-stat-label">Mở lúc</span>
                    <span class="ci-stat-value">${escapeHtml(openedLabel)}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
          <div class="chat-rule" aria-hidden="true"></div>
          ${messagesHtml}
          <div class="chat-tail" aria-hidden="true"></div>
        </main>

        <!-- Read-only composer -->
        <footer class="composer" aria-hidden="true">
          <span class="composer-plus">+</span>
          <div class="composer-box">Nhắn tin #${escapeHtml(channelLabel)}<span class="composer-hint">(chỉ đọc — transcript)</span></div>
        </footer>
      </div>

      <!-- Member list (Discord right rail) -->
      <aside class="member-rail" id="memberRail" aria-label="Danh sách thành viên">
        <div class="rail-head">
          <span class="rail-title">Thành viên</span>
          <span class="rail-head-actions">
            <span class="rail-total">${participantCount}</span>
            <button class="rail-close" type="button" onclick="toggleMembers(false)" aria-label="Đóng danh sách thành viên"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"></path></svg></button>
          </span>
        </div>
        ${memberRailHtml}
      </aside>
    </div>
    <div class="rail-backdrop" id="railBackdrop" onclick="toggleMembers(false)"></div>
    <div class="archive-note">Bản ghi được lưu trữ bất biến và bảo mật bởi Pade Store Engine &bull; <a href="https://sorae.tokyo" target="_blank" rel="noopener">sorae.tokyo</a></div>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <!-- Search Panel (Ctrl+F) -->
  <div class="search-panel" id="searchPanel">
    <input type="text" class="search-input" id="searchInput" placeholder="Tìm kiếm nội dung...">
    <span class="search-counter" id="searchCount">0/0</span>
    <button class="search-btn" onclick="prevMatch()">▲</button>
    <button class="search-btn" onclick="nextMatch()">▼</button>
    <button class="search-btn" onclick="toggleSearch()">✕</button>
  </div>

  <!-- Upgraded Premium Lightbox Modal V5 -->
  <div class="lightbox-modal" id="lightboxModal" role="dialog" aria-modal="true" aria-label="Xem ảnh phóng to">
    <div class="lightbox-backdrop" onclick="closeLightbox()"></div>
    <div class="lightbox-container">
      <div class="lightbox-header">
        <span class="lightbox-counter" id="lightboxCounter">1 / 1</span>
        <span class="lightbox-filename" id="lightboxFilename">image.png</span>
        <button class="lightbox-close-btn" onclick="closeLightbox()" title="Đóng (Esc)" aria-label="Đóng">✕</button>
      </div>
      <div class="lightbox-stage">
        <button class="lightbox-nav-btn prev" id="lightboxPrevBtn" onclick="navigateLightbox(-1)" title="Ảnh trước (Mũi tên trái)" aria-label="Ảnh trước">❮</button>
        <div class="lightbox-img-wrap" onclick="closeLightboxOnBackdropClick(event)">
          <img class="lightbox-img" id="lightboxImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="Zoomed Media">
        </div>
        <button class="lightbox-nav-btn next" id="lightboxNextBtn" onclick="navigateLightbox(1)" title="Ảnh tiếp theo (Mũi tên phải)" aria-label="Ảnh tiếp theo">❯</button>
      </div>
      <div class="lightbox-footer">
        <div class="lightbox-meta">
          <span id="lightboxDimensions"></span>
          <span class="lightbox-meta-sep" id="lightboxMetaSep">&bull;</span>
          <span id="lightboxFileSize"></span>
        </div>
        <a class="lightbox-download-btn" id="lightboxDownloadBtn" href="" target="_blank" rel="noopener noreferrer" download>
          <svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Tải ảnh gốc</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Floating Jump to Latest Button -->
  <button class="jump-bottom-btn" id="jumpBtn" onclick="window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })">
    ↓ Đến tin nhắn mới nhất
  </button>

  <script>
    // Search UX (Ctrl+F / Cmd+F)
    const searchPanel = document.getElementById('searchPanel');
    const searchInput = document.getElementById('searchInput');
    const searchCount = document.getElementById('searchCount');
    let matches = [];
    let currentIdx = -1;

    function toggleSearch() {
      searchPanel.classList.toggle('active');
      if (searchPanel.classList.contains('active')) {
        searchInput.focus();
        searchInput.select();
      } else {
        clearHighlights();
      }
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape') {
        if (searchPanel.classList.contains('active')) toggleSearch();
        closeLightbox();
      }
      if (e.key === 'ArrowLeft') {
        const modal = document.getElementById('lightboxModal');
        if (modal && modal.classList.contains('active')) {
          navigateLightbox(-1);
        }
      }
      if (e.key === 'ArrowRight') {
        const modal = document.getElementById('lightboxModal');
        if (modal && modal.classList.contains('active')) {
          navigateLightbox(1);
        }
      }
    });

    // ---- theme (dark / light, remembered) ----------------------------------
    function syncThemeColor(theme) {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#313338');
    }
    function toggleTheme() {
      const rootEl = document.documentElement;
      const next = rootEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      rootEl.setAttribute('data-theme', next);
      try { localStorage.setItem('pade-transcript-theme', next); } catch (e) {}
      syncThemeColor(next);
      applyRoleColors();
      showToast(next === 'light' ? 'Đã bật giao diện sáng' : 'Đã bật giao diện tối');
    }
    window.toggleTheme = toggleTheme;
    syncThemeColor(document.documentElement.getAttribute('data-theme'));

    // Role colours are authored for Discord's dark theme. In light mode a pale
    // role colour would vanish on white, so keep the hue but guarantee contrast.
    function roleLuminance(r, g, b) {
      const lin = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    }
    function readableRoleColor(hex, isLight) {
      const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
      if (!m) return hex;
      const n = parseInt(m[1], 16);
      let r = (n >> 16) & 255;
      let g = (n >> 8) & 255;
      let b = n & 255;
      const contrastWhite = 1.05 / (roleLuminance(r, g, b) + 0.05);
      const contrastBlack = (roleLuminance(r, g, b) + 0.05) / 0.05;
      if (isLight && contrastWhite < 3.4) {
        for (let i = 0; i < 10; i++) {
          r = Math.round(r * 0.82);
          g = Math.round(g * 0.82);
          b = Math.round(b * 0.82);
          if (1.05 / (roleLuminance(r, g, b) + 0.05) >= 3.4) break;
        }
        return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      }
      if (!isLight && contrastBlack < 2.4) {
        for (let i = 0; i < 10; i++) {
          r = Math.round(r + (255 - r) * 0.18);
          g = Math.round(g + (255 - g) * 0.18);
          b = Math.round(b + (255 - b) * 0.18);
          if ((roleLuminance(r, g, b) + 0.05) / 0.05 >= 2.4) break;
        }
        return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      }
      return hex;
    }
    function applyRoleColors() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      document.querySelectorAll('[data-role-color]').forEach((el) => {
        el.style.color = readableRoleColor(el.getAttribute('data-role-color'), isLight);
      });
    }
    window.applyRoleColors = applyRoleColors;
    applyRoleColors();

    // ---- member list (desktop rail / mobile drawer) ------------------------
    const memberRail = document.getElementById('memberRail');
    const railBackdrop = document.getElementById('railBackdrop');
    const membersBtn = document.getElementById('membersBtn');
    function isNarrowView() { return window.matchMedia('(max-width: 1099px)').matches; }
    function railIsOpen() {
      if (!memberRail) return false;
      return isNarrowView()
        ? memberRail.classList.contains('open')
        : !document.body.classList.contains('rail-off');
    }
    function toggleMembers(force) {
      if (!memberRail) return;
      const open = typeof force === 'boolean' ? force : !railIsOpen();
      if (isNarrowView()) {
        memberRail.classList.toggle('open', open);
        if (railBackdrop) railBackdrop.classList.toggle('open', open);
        document.body.classList.toggle('rail-locked', open);
      } else {
        document.body.classList.toggle('rail-off', !open);
        if (memberRail.classList.contains('open')) memberRail.classList.remove('open');
        if (railBackdrop) railBackdrop.classList.remove('open');
        document.body.classList.remove('rail-locked');
        try { localStorage.setItem('pade-transcript-rail', open ? 'on' : 'off'); } catch (e) {}
      }
      if (membersBtn) membersBtn.setAttribute('aria-expanded', String(open));
    }
    window.toggleMembers = toggleMembers;
    (function initRail() {
      if (!memberRail) return;
      let stored = null;
      try { stored = localStorage.getItem('pade-transcript-rail'); } catch (e) {}
      if (stored === 'off' && !isNarrowView()) document.body.classList.add('rail-off');
      if (membersBtn) membersBtn.setAttribute('aria-expanded', String(railIsOpen()));
    })();
    window.addEventListener('resize', () => {
      if (!isNarrowView()) {
        if (memberRail) memberRail.classList.remove('open');
        if (railBackdrop) railBackdrop.classList.remove('open');
        document.body.classList.remove('rail-locked');
      }
      if (membersBtn) membersBtn.setAttribute('aria-expanded', String(railIsOpen()));
    });

    // ---- toast + copy deep link -------------------------------------------
    let toastTimer = null;
    function showToast(message) {
      const el = document.getElementById('toast');
      if (!el) return;
      el.textContent = message;
      el.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
    }
    window.showToast = showToast;

    function copyMessageLink(id) {
      const url = location.origin + location.pathname + '#message-' + id;
      const done = () => showToast('Đã copy link tin nhắn');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(() => legacyCopy(url, done));
      } else {
        legacyCopy(url, done);
      }
    }
    function legacyCopy(text, done) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done(); else showToast('Không copy được link');
    }
    window.copyMessageLink = copyMessageLink;

    // ---- keyboard: "/" focuses search, Escape closes the drawer ------------
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable);
      if (e.key === 'Escape' && memberRail && memberRail.classList.contains('open')) {
        toggleMembers(false);
      }
      if (!typing && e.key === '/') {
        e.preventDefault();
        if (!searchPanel.classList.contains('active')) toggleSearch();
        searchInput.focus();
        searchInput.select();
      }
    });

    // ---- lightbox swipe (phones) ------------------------------------------
    (function lightboxSwipe() {
      const modal = document.getElementById('lightboxModal');
      if (!modal) return;
      let startX = 0;
      let startY = 0;
      let tracking = false;
      modal.addEventListener('touchstart', (e) => {
        if (!modal.classList.contains('active') || e.touches.length !== 1) return;
        tracking = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      modal.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) navigateLightbox(dx < 0 ? 1 : -1);
      }, { passive: true });
    })();

    // ---- deep link: /t/<id>#message-<discord id> ---------------------------
    (function deepLink() {
      const m = location.hash.match(/^#message-([0-9]{5,})$/);
      if (!m) return;
      setTimeout(() => jumpToMessage(m[1]), 320);
    })();

    searchInput.addEventListener('input', () => {
      clearHighlights();
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchCount.textContent = '0/0';
        return;
      }

      const elements = document.querySelectorAll('.searchable-content');
      matches = [];
      elements.forEach(el => {
        const text = el.textContent.toLowerCase();
        let idx = text.indexOf(query);
        if (idx !== -1) {
          matches.push(el);
          el.innerHTML = el.innerHTML.replace(new RegExp('(' + escapeRegex(query) + ')', 'gi'), '<mark class="mark-found">$1</mark>');
        }
      });

      if (matches.length > 0) {
        currentIdx = 0;
        updateSearchNav();
      } else {
        searchCount.textContent = '0/0';
      }
    });

    function escapeRegex(s) {
      return s.replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&');
    }

    function clearHighlights() {
      document.querySelectorAll('mark.mark-found').forEach(m => {
        m.replaceWith(document.createTextNode(m.textContent));
      });
      matches = [];
      currentIdx = -1;
    }

    function updateSearchNav() {
      searchCount.textContent = (currentIdx + 1) + '/' + matches.length;
      document.querySelectorAll('mark.mark-found').forEach((m, i) => {
        m.classList.toggle('current', i === currentIdx);
      });
      if (matches[currentIdx]) {
        matches[currentIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function nextMatch() {
      if (matches.length === 0) return;
      currentIdx = (currentIdx + 1) % matches.length;
      updateSearchNav();
    }

    function prevMatch() {
      if (matches.length === 0) return;
      currentIdx = (currentIdx - 1 + matches.length) % matches.length;
      updateSearchNav();
    }

    // Lightbox & Gallery System V5
    let currentGallery = [];
    let currentGalleryIdx = 0;

    function openLightboxFromElement(el) {
      const target = (el && el.closest) ? (el.closest('.transcript-image-wrap, .gallery-item-frame') || el) : el;
      if (!target) return;
      const group = target.dataset.galleryGroup;
      if (group) {
        const items = Array.from(document.querySelectorAll('[data-gallery-group="' + group + '"]'));
        currentGallery = items.map(item => {
          const fbImg = item.querySelector ? item.querySelector('img') : null;
          return {
            url: item.dataset.fullUrl || (fbImg ? fbImg.src : (item.src || '')),
            filename: item.dataset.filename || (fbImg ? (fbImg.getAttribute('alt') || 'image.png') : 'image.png'),
            width: item.dataset.width || '',
            height: item.dataset.height || '',
            size: item.dataset.size ? formatBytes(parseInt(item.dataset.size, 10)) : ''
          };
        });
        currentGalleryIdx = parseInt(target.dataset.galleryIndex || '0', 10);
      } else {
        const fbImg = target.querySelector ? target.querySelector('img') : null;
        currentGallery = [{
          url: target.dataset.fullUrl || (fbImg ? fbImg.src : (target.src || '')),
          filename: target.dataset.filename || (fbImg ? (fbImg.getAttribute('alt') || 'image.png') : 'image.png'),
          width: target.dataset.width || '',
          height: target.dataset.height || '',
          size: target.dataset.size ? formatBytes(parseInt(target.dataset.size, 10)) : ''
        }];
        currentGalleryIdx = 0;
      }
      renderLightboxView();
      const modal = document.getElementById('lightboxModal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function renderLightboxView() {
      if (!currentGallery.length) return;
      const item = currentGallery[currentGalleryIdx];
      const img = document.getElementById('lightboxImg');
      const counter = document.getElementById('lightboxCounter');
      const filename = document.getElementById('lightboxFilename');
      const dims = document.getElementById('lightboxDimensions');
      const size = document.getElementById('lightboxFileSize');
      const sep = document.getElementById('lightboxMetaSep');
      const downloadBtn = document.getElementById('lightboxDownloadBtn');
      const prevBtn = document.getElementById('lightboxPrevBtn');
      const nextBtn = document.getElementById('lightboxNextBtn');

      if (img) {
        img.src = item.url;
        img.alt = item.filename;
      }
      if (filename) filename.textContent = item.filename;

      if (currentGallery.length > 1) {
        if (counter) {
          counter.textContent = (currentGalleryIdx + 1) + ' / ' + currentGallery.length;
          counter.style.display = 'inline-block';
        }
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
      } else {
        if (counter) counter.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
      }

      if (item.width && item.height) {
        if (dims) {
          dims.textContent = item.width + ' × ' + item.height;
          dims.style.display = 'inline';
        }
      } else {
        if (dims) dims.style.display = 'none';
      }

      if (item.size) {
        if (size) {
          size.textContent = item.size;
          size.style.display = 'inline';
        }
        if (sep) sep.style.display = (item.width && item.height) ? 'inline' : 'none';
      } else {
        if (size) size.style.display = 'none';
        if (sep) sep.style.display = 'none';
      }

      if (downloadBtn) {
        downloadBtn.href = item.url;
      }
    }

    function navigateLightbox(step) {
      if (currentGallery.length <= 1) return;
      currentGalleryIdx = (currentGalleryIdx + step + currentGallery.length) % currentGallery.length;
      renderLightboxView();
    }

    function closeLightbox() {
      const modal = document.getElementById('lightboxModal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    function closeLightboxOnBackdropClick(e) {
      if (e.target === e.currentTarget) {
        closeLightbox();
      }
    }

    function formatBytes(bytes) {
      if (!bytes || isNaN(bytes)) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function openLightbox(url) {
      currentGallery = [{
        url: url,
        filename: 'image.png',
        width: '',
        height: '',
        size: ''
      }];
      currentGalleryIdx = 0;
      renderLightboxView();
      const modal = document.getElementById('lightboxModal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    window.openLightboxFromElement = openLightboxFromElement;
    window.closeLightbox = closeLightbox;
    window.navigateLightbox = navigateLightbox;
    window.openLightbox = openLightbox;
    window.closeLightboxOnBackdropClick = closeLightboxOnBackdropClick;

    // Scroll UX - Jump to bottom button
    const jumpBtn = document.getElementById('jumpBtn');
    window.addEventListener('scroll', () => {
      const scrolledFromTop = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      if (totalHeight - scrolledFromTop > 600) {
        jumpBtn.style.display = 'inline-flex';
      } else {
        jumpBtn.style.display = 'none';
      }
    });

    // Jump to a referenced message (reply click) with a Discord-like highlight.
    function jumpToMessage(id) {
      const el = document.getElementById('message-' + id);
      if (!el) return;
      if (memberRail && memberRail.classList.contains('open')) toggleMembers(false);
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      el.classList.remove('target-highlight');
      void el.offsetWidth;
      el.classList.add('target-highlight');
      clearTimeout(window.__jumpTimer);
      window.__jumpTimer = setTimeout(() => el.classList.remove('target-highlight'), 2400);
      if (history.replaceState) history.replaceState(null, '', '#message-' + id);
    }
    window.jumpToMessage = jumpToMessage;

    const MEDIA_OFF_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15V5a2 2 0 0 0-2-2H5"></path><path d="M3 3l18 18"></path><path d="M3 5v14a2 2 0 0 0 2 2h14"></path><circle cx="9" cy="9" r="1.5"></circle><path d="M21 15l-5-5"></path></svg>';

    // Broken image fallback: premium card with filename, size, dimensions + retry.
    function attachImageFallbacks() {
      document.querySelectorAll('img:not(#lightboxImg)').forEach(img => {
        img.addEventListener('error', function() {
          if (this.dataset.fallbackHandled) return;
          this.dataset.fallbackHandled = 'true';
          // A deleted custom emoji degrades to its readable :name: instead of a
          // broken-image icon (and never to a full media card).
          if (this.dataset.emoji) {
            const span = document.createElement('span');
            span.className = 'emoji-fallback';
            span.textContent = this.dataset.emoji;
            span.title = 'Emoji không khả dụng';
            this.replaceWith(span);
            return;
          }
          if (this.classList.contains('author-role-icon')) {
            this.remove();
            return;
          }
          if (this.classList.contains('group-avatar') || this.classList.contains('brand-logo') || this.classList.contains('reply-avatar') || this.classList.contains('rail-avatar')) {
            this.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            return;
          }
          const originalUrl = this.src || '';
          const wrap = this.closest('.transcript-image-wrap') || this.closest('.gallery-item-frame');
          const name = (wrap && wrap.dataset.filename) || this.getAttribute('alt') || 'image.png';
          const size = wrap && wrap.dataset.size ? parseInt(wrap.dataset.size, 10) : 0;
          const w = wrap && wrap.dataset.width;
          const h = wrap && wrap.dataset.height;

          const metaParts = [];
          const humanSize = size ? formatBytes(size) : '';
          if (humanSize) metaParts.push(humanSize);
          if (w && h) metaParts.push(w + '×' + h);
          metaParts.push('Không thể tải tệp hình ảnh');

          const card = document.createElement('div');
          card.className = 'media-fallback';
          card.dataset.state = 'error';
          card.dataset.originalUrl = originalUrl;
          card.innerHTML =
            '<div class="mf-icon" aria-hidden="true">' + MEDIA_OFF_SVG + '</div>' +
            '<div class="mf-body">' +
              '<div class="mf-head"><span class="mf-name"></span><span class="mf-badge">Không khả dụng</span></div>' +
              '<div class="mf-meta"></div>' +
            '</div>' +
            '<button class="mf-retry" type="button">Thử lại</button>';
          card.querySelector('.mf-name').textContent = name;
          card.querySelector('.mf-meta').textContent = metaParts.join(' · ');
          card.querySelector('.mf-retry').onclick = function() {
            retryImage(this, card.dataset.originalUrl);
          };

          const container = wrap || this;
          container.replaceWith(card);
        });
      });
    }

    function retryImage(btn, originalUrl) {
      const card = btn.closest('.media-fallback') || btn.closest('.img-fallback-card');
      if (!card || !originalUrl) return;
      btn.textContent = 'Đang tải...';
      card.dataset.state = 'loading';
      const img = new Image();
      const sep = originalUrl.indexOf('?') !== -1 ? '&' : '?';
      img.src = originalUrl + sep + '_retry=' + Date.now();
      img.onload = () => {
        location.reload();
      };
      img.onerror = () => {
        card.dataset.state = 'error';
        btn.textContent = 'Vẫn hỏng';
        setTimeout(() => { btn.textContent = 'Thử lại'; }, 2200);
      };
    }

    // Deep link hash jump on load & image fallback attachment
    window.addEventListener('DOMContentLoaded', () => {
      attachImageFallbacks();
      document.querySelectorAll('.transcript-image-wrap, .gallery-item-frame').forEach(el => {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          openLightboxFromElement(this);
        });
      });
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('target-highlight');
          setTimeout(() => target.classList.remove('target-highlight'), 2500);
        }
      }
    });
  </script>
</body>
</html>`;
}

module.exports = {
  renderPadeTranscriptPage
};
