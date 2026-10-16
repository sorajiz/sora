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

function parseDiscordMarkdown(content, ctx = {}) {
  if (!content) return '';

  const users = ctx.users || {};
  const roles = ctx.roles || {};
  const channels = ctx.channels || {};

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
    return stash(`<a href="${url}" target="_blank" rel="noopener noreferrer nofollow ugc">${text}</a>`);
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
    const name = u ? (u.guild_display_name || u.global_name || u.username || 'user') : 'user';
    const colorStyle = (u && u.display_color) ? ` style="color: #${u.display_color.toString(16).padStart(6, '0')};"` : '';
    return `<span class="mention user"${colorStyle}>@${escapeHtml(name)}</span>`;
  });

  s = s.replace(/&lt;@&amp;([0-9]+)&gt;/g, (match, id) => {
    const r = roles[id];
    const name = r ? r.role_name : 'role';
    const color = (r && r.color) ? `#${r.color.toString(16).padStart(6, '0')}` : '#5865f2';
    let icon = '';
    if (r && r.icon_url) {
      icon = `<img class="role-mention-icon" src="${escapeHtml(r.icon_url)}" alt="">`;
    } else if (r && r.unicode_emoji) {
      icon = `<span class="role-mention-emoji">${escapeHtml(r.unicode_emoji)}</span>`;
    }
    return `<span class="mention role" style="color: ${color}; border-left: 2px solid ${color};">${icon}@${escapeHtml(name)}</span>`;
  });

  s = s.replace(/&lt;#([0-9]+)&gt;/g, (match, id) => {
    const c = channels[id];
    const name = c ? c.name : 'channel';
    return `<span class="mention channel">#${escapeHtml(name)}</span>`;
  });

  s = s.replace(/@everyone/g, '<span class="mention everyone">@everyone</span>');
  s = s.replace(/@here/g, '<span class="mention here">@here</span>');

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

function renderDiscordComponent(comp, ctx) {
  if (!comp) return '';
  const type = comp.type;

  // 1. Container (type 17 or 15)
  if (type === 17 || type === 15) {
    const children = (comp.components || []).map(c => renderDiscordComponent(c, ctx)).join('');
    const accentStyle = comp.accent_color ? ` style="border-left: 3px solid #${comp.accent_color.toString(16).padStart(6, '0')};"` : '';
    return `<div class="discord-component-container"${accentStyle}>${children}</div>`;
  }

  // 2. Section (type 9)
  if (type === 9) {
    const children = (comp.components || []).map(c => renderDiscordComponent(c, ctx)).join('');
    let accessoryHtml = '';
    if (comp.accessory) {
      accessoryHtml = `<div class="section-accessory">${renderDiscordComponent(comp.accessory, ctx)}</div>`;
    }
    return `
      <div class="discord-component-section">
        <div class="section-content">${children}</div>
        ${accessoryHtml}
      </div>
    `;
  }

  // 3. TextDisplay (type 10)
  if (type === 10) {
    const parsedText = parseDiscordMarkdown(comp.content || '', ctx);
    return `<div class="discord-component-text">${parsedText}</div>`;
  }

  // 4. Separator (type 14)
  if (type === 14) {
    const hasDivider = comp.divider !== false;
    const spacing = comp.spacing === 2 ? 'large' : 'small';
    return `<div class="discord-component-separator ${hasDivider ? 'divider' : ''} spacing-${spacing}"></div>`;
  }

  // 5. Thumbnail (type 11)
  if (type === 11) {
    const url = (comp.media && comp.media.url) || comp.url || '';
    if (!url) return '';
    return `<div class="discord-component-thumbnail"><img src="${escapeHtml(url)}" alt="thumbnail" loading="lazy"></div>`;
  }

  // 6. MediaGallery (type 12)
  if (type === 12) {
    const items = (comp.items || []).map(it => {
      const u = (it.media && it.media.url) || it.url || '';
      return `<div class="gallery-item" onclick="openLightbox('${escapeHtml(u)}')"><img src="${escapeHtml(u)}" alt="" loading="lazy"></div>`;
    }).join('');
    return `<div class="discord-component-media-gallery">${items}</div>`;
  }

  // 7. ActionRow (type 1)
  if (type === 1) {
    const children = (comp.components || []).map(c => renderDiscordComponent(c, ctx)).join('');
    return `<div class="discord-component-action-row">${children}</div>`;
  }

  // 8. Button (type 2)
  if (type === 2) {
    const styleClass = comp.style === 1 ? 'btn-primary' : comp.style === 3 ? 'btn-success' : comp.style === 4 ? 'btn-danger' : comp.style === 5 ? 'btn-link' : 'btn-secondary';
    let emojiHtml = '';
    if (comp.emoji) {
      if (comp.emoji.id) {
        const ext = comp.emoji.animated ? 'gif' : 'png';
        emojiHtml = `<img class="btn-emoji" src="https://cdn.discordapp.com/emojis/${comp.emoji.id}.${ext}?size=32" alt="">`;
      } else if (comp.emoji.name) {
        emojiHtml = `<span class="btn-emoji">${escapeHtml(comp.emoji.name)}</span>`;
      }
    }
    const label = comp.label ? `<span>${escapeHtml(comp.label)}</span>` : '';
    if (comp.url) {
      return `<a class="discord-btn-snapshot ${styleClass}" href="${escapeHtml(comp.url)}" target="_blank" rel="noopener">${emojiHtml}${label}</a>`;
    }
    return `<span class="discord-btn-snapshot ${styleClass}">${emojiHtml}${label}</span>`;
  }

  // Fallback for sub-components or unhandled
  if (Array.isArray(comp.components)) {
    return comp.components.map(c => renderDiscordComponent(c, ctx)).join('');
  }
  return '';
}

function renderPadeTranscriptPage({ transcript, users = {}, roles = {}, channels = {}, messages = [] }) {
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
  const ctx = { users, roles, channels };
  let messagesHtml = '';
  for (const group of messageGroups) {
    const u = users[group.authorId] || {};
    const authorName = u.guild_display_name || u.global_name || u.username || 'User';
    const avatarUrl = u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const isBot = u.is_bot;
    const authorColor = u.display_color ? `#${u.display_color.toString(16).padStart(6, '0')}` : '';
    const authorColorStyle = authorColor ? ` style="color: ${authorColor};"` : '';

    let roleIconHtml = '';
    if (u.display_icon_url) {
      roleIconHtml = `<img class="author-role-icon" src="${escapeHtml(u.display_icon_url)}" alt="${escapeHtml(u.display_icon_role || '')}" title="${escapeHtml(u.display_icon_role || '')}" loading="lazy">`;
    } else if (u.display_unicode_emoji) {
      roleIconHtml = `<span class="author-role-emoji" title="${escapeHtml(u.display_icon_role || '')}">${escapeHtml(u.display_unicode_emoji)}</span>`;
    }

    let itemsHtml = '';
    for (const m of group.items) {
      const msgTime = new Date(m.timestamp);
      const timeStr = msgTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const fullDateStr = msgTime.toLocaleString('vi-VN');
      const renderedContent = parseDiscordMarkdown(m.content_original, ctx);

      // Reply Reference Header
      let replyHtml = '';
      if (m.reference && (m.reference.referenced_message_id || m.reference.referenced_author_id)) {
        const refUser = users[m.reference.referenced_author_id] || {};
        const refAuthor = refUser.guild_display_name || refUser.global_name || refUser.username || 'User';
        const refPreview = m.reference.content_preview ? parseDiscordMarkdown(m.reference.content_preview, ctx) : 'Tin nhắn gốc';
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
              ${emb.author_name ? `<div class="embed-author">${emb.author_icon_url ? `<img class="embed-author-icon" src="${escapeHtml(emb.author_icon_url)}">` : ''}<span>${escapeHtml(emb.author_name)}</span></div>` : ''}
              ${emb.title ? `<div class="embed-title">${emb.url ? `<a href="${escapeHtml(emb.url)}" target="_blank" rel="noopener">${escapeHtml(emb.title)}</a>` : escapeHtml(emb.title)}</div>` : ''}
              ${emb.description ? `<div class="embed-desc">${parseDiscordMarkdown(emb.description, ctx)}</div>` : ''}
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

    const firstTimeStr = group.firstTime.toLocaleDateString('vi-VN') + ' ' + group.firstTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    messagesHtml += `
      <div class="message-group">
        <img class="group-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(authorName)}" loading="lazy">
        <div class="group-body">
          <div class="group-header">
            <span class="author-name searchable-content"${authorColorStyle}>${escapeHtml(authorName)}</span>
            ${roleIconHtml}
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
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 180ms ease, visibility 180ms ease;
    }
    .lightbox-modal.active {
      opacity: 1;
      visibility: visible;
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
          <img class="lightbox-img" id="lightboxImg" src="" alt="Zoomed Media">
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
      const group = el.dataset.galleryGroup;
      if (group) {
        const items = Array.from(document.querySelectorAll('[data-gallery-group="' + group + '"]'));
        currentGallery = items.map(item => ({
          url: item.dataset.fullUrl || '',
          filename: item.dataset.filename || 'image.png',
          width: item.dataset.width || '',
          height: item.dataset.height || '',
          size: item.dataset.size ? formatBytes(parseInt(item.dataset.size, 10)) : ''
        }));
        currentGalleryIdx = parseInt(el.dataset.galleryIndex || '0', 10);
      } else {
        currentGallery = [{
          url: el.dataset.fullUrl || '',
          filename: el.dataset.filename || 'image.png',
          width: el.dataset.width || '',
          height: el.dataset.height || '',
          size: el.dataset.size ? formatBytes(parseInt(el.dataset.size, 10)) : ''
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

    // Safe Image Error Fallback - replaces broken images with clean card
    function attachImageFallbacks() {
      document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
          if (this.dataset.fallbackHandled) return;
          this.dataset.fallbackHandled = 'true';
          if (this.classList.contains('group-avatar') || this.classList.contains('brand-logo')) {
            this.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            return;
          }
          const originalUrl = this.src || '';
          const card = document.createElement('div');
          card.className = 'img-fallback-card';
          const altText = this.getAttribute('alt') || 'Tập tin ảnh';
          const safeAlt = altText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeUrl = originalUrl.replace(/'/g, "\\'");
          card.innerHTML = '<span class="fallback-icon">⚠️</span>' +
            '<div class="fallback-body">' +
              '<span class="fallback-text">Ảnh không khả dụng &bull; ' + safeAlt + '</span>' +
              '<span class="fallback-sub">Không thể tải tệp hình ảnh</span>' +
            '</div>' +
            '<button class="fallback-retry-btn" onclick="retryImage(this, \'' + safeUrl + '\')">Thử lại</button>';
          const container = this.closest('.transcript-media-frame') || this.closest('.gallery-item-frame') || this;
          container.replaceWith(card);
        });
      });
    }

    function retryImage(btn, originalUrl) {
      const card = btn.closest('.img-fallback-card');
      if (!card || !originalUrl) return;
      btn.textContent = 'Đang tải...';
      const img = new Image();
      const sep = originalUrl.indexOf('?') !== -1 ? '&' : '?';
      img.src = originalUrl + sep + '_retry=' + Date.now();
      img.onload = () => {
        location.reload();
      };
      img.onerror = () => {
        btn.textContent = 'Thất bại';
        setTimeout(() => { btn.textContent = 'Thử lại'; }, 2000);
      };
    }

    // Deep link hash jump on load & image fallback attachment
    window.addEventListener('DOMContentLoaded', () => {
      attachImageFallbacks();
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
