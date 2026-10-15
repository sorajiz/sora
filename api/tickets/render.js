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

function parseDiscordMarkdown(content) {
  if (!content) return '';

  const stashes = [];
  function stash(html) {
    const idx = stashes.length;
    stashes.push(html);
    return `@@@TOKEN_${idx}@@@`;
  }

  // 1. Code blocks ```lang\ncode``` (stash before escaping)
  let s = String(content).replace(/```(?:([a-zA-Z0-9_+-]+)\n)?([\s\S]*?)```/g, (match, lang, code) => {
    return stash(`<pre class="code-block"><code>${escapeHtml(code)}</code></pre>`);
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
    return stash(`<img class="custom-emoji" src="${url}" alt=":${cleanName}:" title=":${cleanName}:" loading="lazy">`);
  });

  // 5. Discord Markdown Sticker Links: [name](https://media.discordapp.net/stickers/id.ext?params) or cdn.discordapp.com
  s = s.replace(/\[([^\]]+)\]\((https:\/\/(?:media|cdn)\.discordapp\.(?:net|com)\/stickers\/([0-9]+)\.(?:png|webp|gif|json)(?:\?[^)]*)?)\)/gi, (m, rawName, url, id) => {
    const cleanName = rawName.replace(/<[^>]+>/g, '').replace(/[*_~]/g, '').trim();
    return stash(`<div class="discord-sticker"><img src="${url}" alt="${cleanName}" title="${cleanName}" loading="lazy"></div>`);
  });

  // 6. Raw Discord Emoji CDN URLs
  s = s.replace(/(^|[\s>(])(https:\/\/cdn\.discordapp\.com\/emojis\/([0-9]+)\.(?:webp|png|gif)(?:\?[^\s<"')]*)?)/gi, (m, prefix, url, id) => {
    return prefix + stash(`<img class="custom-emoji" src="${url}" loading="lazy">`);
  });

  // 7. Raw Discord Sticker CDN URLs
  s = s.replace(/(^|[\s>(])(https:\/\/(?:media|cdn)\.discordapp\.(?:net|com)\/stickers\/([0-9]+)\.(?:png|webp|gif|json)(?:\?[^\s<"')]*)?)/gi, (m, prefix, url, id) => {
    return prefix + stash(`<div class="discord-sticker"><img src="${url}" loading="lazy"></div>`);
  });

  // 8. Discord native custom emojis: <:name:id> or <a:name:id>
  s = s.replace(/&lt;(a?):([a-zA-Z0-9_]+):([0-9]+)&gt;/g, (m, anim, name, id) => {
    const ext = anim ? 'gif' : 'png';
    const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=48&quality=lossless`;
    return stash(`<img class="custom-emoji" src="${url}" alt=":${name}:" title=":${name}:" loading="lazy">`);
  });

  // 9. Discord Timestamps <t:timestamp:style>
  s = s.replace(/&lt;t:([0-9]+)(?::([a-zA-Z]))?&gt;/g, (m, ts) => {
    const date = new Date(parseInt(ts, 10) * 1000);
    const dateStr = date.toLocaleString('vi-VN');
    return stash(`<span class="discord-timestamp" title="${dateStr}">${dateStr}</span>`);
  });

  // 10. Standard Markdown links: [text](url)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, text, url) => {
    return stash(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
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
  s = s.replace(/&lt;@!?([0-9]+)&gt;/g, '<span class="mention">@user</span>');
  s = s.replace(/&lt;@&amp;([0-9]+)&gt;/g, '<span class="mention role">@role</span>');
  s = s.replace(/&lt;#([0-9]+)&gt;/g, '<span class="mention channel">#channel</span>');

  // 15. Convert newlines to <br>
  s = s.replace(/\n/g, '<br>');

  // 16. Restore all stashed tokens
  s = s.replace(/@@@TOKEN_(\d+)@@@/g, (m, idx) => stashes[parseInt(idx, 10)] || '');

  return s;
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

function renderPadeTranscriptPage({ transcript, users, messages }) {
  const publicId = transcript.public_id || 'tr_default';
  const ticketName = transcript.ticket_name || 'ticket';
  const messageCount = messages.length || transcript.message_count || 0;
  const wave = computeWaveParameters(publicId);

  const guildId = transcript.guild_id || '1559458306664439879';
  const guildIconUrl = transcript.guild_icon_url || (guildId === '1559458306664439879' 
    ? 'https://cdn.discordapp.com/icons/1559458306664439879/9c07b41c9403f41d779867722d30ad2c.png?size=128' 
    : `https://cdn.discordapp.com/icons/${guildId}/9c07b41c9403f41d779867722d30ad2c.png?size=128`);

  const openedDate = transcript.opened_at ? new Date(transcript.opened_at) : new Date();
  const closedDate = transcript.closed_at ? new Date(transcript.closed_at) : new Date();
  const durationSec = Math.max(0, Math.floor((closedDate - openedDate) / 1000));
  const durH = Math.floor(durationSec / 3600);
  const durM = Math.floor((durationSec % 3600) / 60);
  const durationStr = durH > 0 ? `${durH}h ${durM}m` : `${durM}m ${durationSec % 60}s`;

  // Safe OpenGraph preview (NO conversation leak)
  const ogTitle = `Pade Store • Ticket Transcript #${ticketName}`;
  const ogDesc = `Bản ghi phiếu hỗ trợ #${ticketName} • ${messageCount} tin nhắn • Thời gian đóng: ${closedDate.toLocaleDateString('vi-VN')}.`;

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

  // Render HTML message groups
  let messagesHtml = '';
  for (const group of messageGroups) {
    const u = users[group.authorId] || {};
    const authorName = u.guild_display_name || u.global_name || u.username || 'User';
    const avatarUrl = u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const isBot = u.is_bot;

    let itemsHtml = '';
    for (const m of group.items) {
      const msgTime = new Date(m.timestamp);
      const timeStr = msgTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const fullDateStr = msgTime.toLocaleString('vi-VN');
      const renderedContent = parseDiscordMarkdown(m.content_original);

      // Reply Reference Header
      let replyHtml = '';
      if (m.reference && (m.reference.referenced_message_id || m.reference.referenced_author_id)) {
        const refUser = users[m.reference.referenced_author_id] || {};
        const refAuthor = refUser.guild_display_name || refUser.global_name || refUser.username || 'User';
        const refPreview = m.reference.content_preview ? parseDiscordMarkdown(m.reference.content_preview) : 'Tin nhắn gốc';
        replyHtml = `
          <div class="reply-context">
            <svg class="reply-spine" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span class="reply-author">@${escapeHtml(refAuthor)}</span>
            <span class="reply-preview">${refPreview}</span>
          </div>
        `;
      }

      // Structured Message Stickers
      let stickerHtml = '';
      if (m.stickers && m.stickers.length > 0) {
        const stkTags = m.stickers.map(stk => {
          const stkUrl = stk.r2_url || stk.source_url || `https://media.discordapp.net/stickers/${stk.discord_sticker_id}.png?size=160`;
          return `<div class="discord-sticker"><img src="${escapeHtml(stkUrl)}" alt="${escapeHtml(stk.name)}" title="${escapeHtml(stk.name)}" loading="lazy"></div>`;
        }).join('');
        stickerHtml = `<div class="message-stickers">${stkTags}</div>`;
      }

      // Attachments
      let attHtml = '';
      if (m.attachments && m.attachments.length > 0) {
        const imgList = [];
        const fileList = [];

        for (const att of m.attachments) {
          const fn = (att.filename || '').toLowerCase();
          const ct = (att.content_type || '').toLowerCase();
          const isImg = ct.startsWith('image/') || fn.endsWith('.png') || fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.webp') || fn.endsWith('.gif');
          const isVid = ct.startsWith('video/') || fn.endsWith('.mp4') || fn.endsWith('.webm') || fn.endsWith('.mov');
          const isAud = ct.startsWith('audio/') || fn.endsWith('.mp3') || fn.endsWith('.ogg') || fn.endsWith('.wav');

          const mediaUrl = att.r2_url || att.source_url;

          if (isImg) {
            imgList.push({ ...att, url: mediaUrl });
          } else if (isVid) {
            fileList.push(`<div class="media-video"><video src="${escapeHtml(mediaUrl)}" controls preload="metadata"></video></div>`);
          } else if (isAud) {
            fileList.push(`<div class="media-audio"><audio src="${escapeHtml(mediaUrl)}" controls preload="none"></audio></div>`);
          } else {
            fileList.push(`<div class="media-file"><a href="${escapeHtml(mediaUrl)}" target="_blank" rel="noopener">📎 <span>${escapeHtml(att.filename)}</span> <span class="file-size">(${Math.round(att.size_bytes / 1024)} KB)</span></a></div>`);
          }
        }

        if (imgList.length > 0) {
          const gridClass = imgList.length === 1 ? 'grid-1' : imgList.length === 2 ? 'grid-2' : 'grid-many';
          const imgTags = imgList.map(a => `
            <div class="gallery-item" onclick="openLightbox('${escapeHtml(a.url)}')">
              <img src="${escapeHtml(a.url)}" alt="${escapeHtml(a.filename)}" loading="lazy">
            </div>
          `).join('');
          attHtml += `<div class="media-gallery ${gridClass}">${imgTags}</div>`;
        }

        if (fileList.length > 0) {
          attHtml += `<div class="media-files-stream">${fileList.join('')}</div>`;
        }
      }

      // Embeds
      let embedHtml = '';
      if (m.embeds && m.embeds.length > 0) {
        for (const emb of m.embeds) {
          const fields = typeof emb.fields === 'string' ? JSON.parse(emb.fields) : (emb.fields || []);
          const fieldsHtml = fields.map(f => `
            <div class="embed-field ${f.inline ? 'inline' : ''}">
              <div class="field-name">${escapeHtml(f.name)}</div>
              <div class="field-val">${parseDiscordMarkdown(f.value)}</div>
            </div>
          `).join('');

          embedHtml += `
            <div class="embed-card" style="border-left-color: ${emb.color ? '#' + emb.color.toString(16).padStart(6, '0') : '#5865f2'}">
              ${emb.author_name ? `<div class="embed-author">${emb.author_icon_url ? `<img class="embed-author-icon" src="${escapeHtml(emb.author_icon_url)}">` : ''}<span>${escapeHtml(emb.author_name)}</span></div>` : ''}
              ${emb.title ? `<div class="embed-title">${emb.url ? `<a href="${escapeHtml(emb.url)}" target="_blank" rel="noopener">${escapeHtml(emb.title)}</a>` : escapeHtml(emb.title)}</div>` : ''}
              ${emb.description ? `<div class="embed-desc">${parseDiscordMarkdown(emb.description)}</div>` : ''}
              ${fieldsHtml ? `<div class="embed-fields-grid">${fieldsHtml}</div>` : ''}
              ${emb.thumbnail_url ? `<div class="embed-thumbnail"><img src="${escapeHtml(emb.thumbnail_url)}" loading="lazy"></div>` : ''}
              ${emb.image_url ? `<div class="embed-image"><img src="${escapeHtml(emb.image_url)}" loading="lazy"></div>` : ''}
              ${emb.footer_text ? `<div class="embed-footer">${emb.footer_icon_url ? `<img class="embed-footer-icon" src="${escapeHtml(emb.footer_icon_url)}">` : ''}<span>${escapeHtml(emb.footer_text)}</span></div>` : ''}
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
            emojiVisual = `<img class="react-custom-emoji" src="${url}" alt=":${escapeHtml(r.emoji_name)}:" loading="lazy">`;
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

      itemsHtml += `
        <div class="message-item" id="message-${escapeHtml(m.discord_message_id)}">
          ${replyHtml}
          <div class="msg-content-row">
            <div class="msg-text searchable-content">${renderedContent}</div>
            ${m.is_edited ? '<span class="edited-tag">(đã chỉnh sửa)</span>' : ''}
          </div>
          ${stickerHtml}
          ${attHtml}
          ${embedHtml}
          ${reactHtml}
        </div>
      `;
    }

    const firstTimeStr = group.firstTime.toLocaleDateString('vi-VN') + ' ' + group.firstTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    messagesHtml += `
      <div class="message-group">
        <img class="group-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(authorName)}" loading="lazy">
        <div class="group-body">
          <div class="group-header">
            <span class="author-name searchable-content">${escapeHtml(authorName)}</span>
            ${isBot ? '<span class="badge-bot">BOT</span>' : ''}
            <span class="group-time" title="${escapeHtml(group.firstTime.toISOString())}">${escapeHtml(firstTimeStr)}</span>
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
  <meta name="theme-color" content="#111216">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-base: #0c0d11;
      --bg-surface: #111216;
      --bg-card: rgba(22, 24, 31, 0.75);
      --bg-card-hover: rgba(28, 30, 39, 0.9);
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(255, 255, 255, 0.16);
      --text: #f8fafc;
      --text-muted: #949ba4;
      --text-sub: #64748b;
      --accent: #5865F2;
      --accent-hover: #4752c4;
      --silver: #cbd5e1;
      --silver-glow: rgba(203, 213, 225, 0.08);
      --highlight: rgba(245, 158, 11, 0.3);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: var(--bg-base);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }

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
      width: 44px;
      height: 44px;
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
      background: #090a0d;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      margin: 8px 0;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #cbd5e1;
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
      max-width: 520px;
    }
    .embed-image img {
      max-width: 100%;
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

    /* Media Gallery & Lightbox */
    .media-gallery {
      margin-top: 8px;
      display: grid;
      gap: 8px;
      max-width: 540px;
    }
    .media-gallery.grid-1 { grid-template-columns: 1fr; }
    .media-gallery.grid-2 { grid-template-columns: 1fr 1fr; }
    .media-gallery.grid-many { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .gallery-item {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
      cursor: zoom-in;
      background: #000;
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

    /* Lightbox Modal */
    .lightbox-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 200;
      cursor: zoom-out;
    }
    .lightbox-modal.active { display: flex; }
    .lightbox-img {
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 12px;
      box-shadow: 0 16px 50px rgba(0,0,0,0.8);
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

  <div class="container">
    <!-- Navbar Header -->
    <header class="navbar">
      <div class="brand-block">
        <img class="brand-logo" src="${escapeHtml(guildIconUrl)}" alt="Discord Server Icon" loading="lazy">
        <div class="brand-info">
          <h1>Pade Store Transcript</h1>
          <p>Phiếu hỗ trợ #${escapeHtml(ticketName)} &bull; ${messageCount} tin nhắn</p>
        </div>
      </div>
    </header>

    <!-- Metrics Bar -->
    <div class="metrics-bar">
      <div class="metric-card">
        <div class="metric-label">Kênh Ticket</div>
        <div class="metric-value">#${escapeHtml(ticketName)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Tổng Tin Nhắn</div>
        <div class="metric-value">${messageCount}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Thời Gian Đóng</div>
        <div class="metric-value">${closedDate.toLocaleDateString('vi-VN')}</div>
      </div>
    </div>

    <!-- Message Stream -->
    <main class="stream-container" id="stream">
      ${messagesHtml}
    </main>

    <!-- Footer -->
    <footer class="page-footer">
      Bản ghi transcript được lưu trữ bất biến và bảo mật bởi Pade Store Engine &bull; <a href="https://sorae.tokyo">sorae.tokyo</a>
    </footer>
  </div>

  <!-- Search Panel (Ctrl+F) -->
  <div class="search-panel" id="searchPanel">
    <input type="text" class="search-input" id="searchInput" placeholder="Tìm kiếm nội dung...">
    <span class="search-counter" id="searchCount">0/0</span>
    <button class="search-btn" onclick="prevMatch()">▲</button>
    <button class="search-btn" onclick="nextMatch()">▼</button>
    <button class="search-btn" onclick="toggleSearch()">✕</button>
  </div>

  <!-- Image Lightbox Modal -->
  <div class="lightbox-modal" id="lightboxModal" onclick="closeLightbox()">
    <img class="lightbox-img" id="lightboxImg" src="" alt="Zoomed Media">
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
    });

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

    // Lightbox
    function openLightbox(url) {
      const modal = document.getElementById('lightboxModal');
      const img = document.getElementById('lightboxImg');
      img.src = url;
      modal.classList.add('active');
    }
    function closeLightbox() {
      document.getElementById('lightboxModal').classList.remove('active');
    }

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

    // Deep link hash jump on load
    window.addEventListener('DOMContentLoaded', () => {
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
