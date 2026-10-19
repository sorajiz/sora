#!/usr/bin/env node
'use strict';

/**
 * Transcript media resolution contract tests.
 *
 * The viewer must serve media from the immutable transcript archive whenever the
 * asset really exists, because Discord CDN URLs expire (signed attachments) or rot
 * (hashed avatars / guild icons). When an asset is missing from the archive the URL
 * must be left exactly as it was, so a still-live CDN copy keeps working.
 */

const assert = require('assert');
const { renderPadeTranscriptPage } = require('../lib/tickets/render');

const PUBLIC_ID = 'tr_media_test';
const GUILD_ID = '1559458306664439879';

function render({ messages = [], assets = [], guildIconUrl } = {}) {
  return renderPadeTranscriptPage({
    transcript: {
      public_id: PUBLIC_ID,
      ticket_name: 'media-1',
      guild_id: GUILD_ID,
      guild_icon_url: guildIconUrl,
      opened_at: new Date('2026-01-01T00:00:00Z'),
      closed_at: new Date('2026-01-01T00:10:00Z')
    },
    users: { u1: { username: 'tester', global_name: 'Tester' } },
    roles: {},
    channels: {},
    messages,
    assets
  });
}

function message(extra = {}) {
  return {
    discord_message_id: 'm1',
    id: 'm1',
    author_id: 'u1',
    content_original: '',
    timestamp: new Date('2026-01-01T00:05:00Z'),
    message_type: 0,
    attachments: [],
    embeds: [],
    reactions: [],
    stickers: [],
    components: null,
    ...extra
  };
}

const media = (assetId) => `/t/${PUBLIC_ID}/media/${assetId}`;

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.error(`  FAIL ${name}`);
    console.error(`       ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('transcript media resolution contract');

const AVATAR_CDN = 'https://cdn.discordapp.com/avatars/1516353117292335190/539201750f4286aa860ea395b092f313.png?size=2048';
const THUMB_COMPONENT = [{ type: 17, components: [{ type: 11, media: { url: AVATAR_CDN } }] }];

check('component thumbnail served from the archive when present', () => {
  const html = render({
    messages: [message({ components: THUMB_COMPONENT })],
    assets: ['avatar-1516353117292335190']
  });
  assert.ok(html.includes(`thumbnail"><img src="${media('avatar-1516353117292335190')}"`), 'archived thumbnail not used');
  assert.ok(!html.includes(AVATAR_CDN), 'hotlinked thumbnail still present');
});

check('component thumbnail untouched when the asset is missing', () => {
  const html = render({ messages: [message({ components: THUMB_COMPONENT })], assets: [] });
  assert.ok(html.includes(AVATAR_CDN), 'CDN thumbnail should be kept as-is');
  assert.ok(!html.includes('/media/avatar-1516353117292335190'), 'must not point at a missing asset');
});

check('permanent embed default avatars are never rewritten', () => {
  const html = render({
    messages: [message({ components: [{ type: 11, media: { url: 'https://cdn.discordapp.com/embed/avatars/0.png' } } ] })],
    assets: ['avatar-0']
  });
  assert.ok(html.includes('https://cdn.discordapp.com/embed/avatars/0.png'), 'default avatar must stay hotlinked');
});

check('embed media resolved through the archive', () => {
  const html = render({
    messages: [
      message({
        embeds: [
          {
            title: 'Đơn hàng #265',
            author_name: 'Pade',
            author_icon_url: AVATAR_CDN,
            thumbnail_url: 'https://cdn.discordapp.com/emojis/1560012295654866944.png?size=64',
            image_url: 'https://cdn.discordapp.com/attachments/1/222/photo.png?ex=abc'
          }
        ]
      })
    ],
    assets: ['avatar-1516353117292335190', 'emoji-1560012295654866944', 'att-222']
  });
  assert.ok(html.includes(media('avatar-1516353117292335190')), 'embed author icon not archived');
  assert.ok(html.includes(media('emoji-1560012295654866944')), 'embed thumbnail not archived');
  assert.ok(html.includes(media('att-222')), 'embed image not archived');
});

check('attachment prefers the archived copy', () => {
  const html = render({
    messages: [
      message({
        attachments: [
          {
            filename: 'image.png',
            content_type: 'image/png',
            r2_url: media('att-1560990423386951720'),
            source_url: 'https://cdn.discordapp.com/attachments/1/1560990423386951720/image.png?ex=aaa',
            width: 1390,
            height: 827,
            size_bytes: 267718
          }
        ]
      })
    ],
    assets: ['att-1560990423386951720']
  });
  assert.ok(html.includes(`src="${media('att-1560990423386951720')}"`), 'archived attachment not used');
});

check('attachment falls back to the live CDN source when the archive is missing', () => {
  const source = 'https://cdn.discordapp.com/attachments/1/1560990423386951720/image.png?ex=aaa';
  const html = render({
    messages: [
      message({
        attachments: [
          {
            filename: 'image.png',
            content_type: 'image/png',
            r2_url: media('att-1560990423386951720'),
            source_url: source,
            width: 1390,
            height: 827,
            size_bytes: 267718
          }
        ]
      })
    ],
    assets: []
  });
  assert.ok(html.includes(source), 'should fall back to the source URL instead of a guaranteed 404');
});

check('message sticker link resolved through the archive', () => {
  const stickerUrl = 'https://media.discordapp.net/stickers/1550477319213158512.png?size=160';
  const withAsset = render({
    messages: [message({ content_original: `[cute](${stickerUrl})` })],
    assets: ['stk-1550477319213158512']
  });
  assert.ok(withAsset.includes(media('stk-1550477319213158512')), 'archived sticker not used');

  const withoutAsset = render({
    messages: [message({ content_original: `[cute](${stickerUrl})` })],
    assets: []
  });
  assert.ok(withoutAsset.includes(stickerUrl), 'sticker URL should stay when not archived');
});

check('custom emoji markup resolved through the archive', () => {
  const withAsset = render({
    messages: [message({ content_original: 'hi <:ped:1560012295654866944> there' })],
    assets: ['emoji-1560012295654866944']
  });
  assert.ok(withAsset.includes(media('emoji-1560012295654866944')), 'archived emoji not used');

  const withoutAsset = render({
    messages: [message({ content_original: 'hi <:ped:1560012295654866944> there' })],
    assets: []
  });
  assert.ok(withoutAsset.includes('https://cdn.discordapp.com/emojis/1560012295654866944.png'), 'emoji should stay hotlinked');
});

check('reaction and button emoji resolved through the archive', () => {
  const html = render({
    messages: [
      message({
        reactions: [{ emoji_id: '1560094396244951042', emoji_name: 'ped_gif_17', animated: true, count: 3 }],
        components: [{ type: 1, components: [{ type: 2, style: 2, label: 'Đóng Ticket', emoji: { id: '1560012295654866944', name: 'pade' } }] }]
      })
    ],
    assets: ['emoji-1560094396244951042', 'emoji-1560012295654866944']
  });
  assert.ok(html.includes(media('emoji-1560094396244951042')), 'reaction emoji not archived');
  assert.ok(html.includes(media('emoji-1560012295654866944')), 'button emoji not archived');
});

check('guild icon resolved through the archive when archived', () => {
  const icon = `https://cdn.discordapp.com/icons/${GUILD_ID}/9c07b41c9403f41d779867722d30ad2c.png?size=128`;
  const withAsset = render({ assets: [`guild-icon-${GUILD_ID}`], guildIconUrl: icon });
  assert.ok(withAsset.includes(media(`guild-icon-${GUILD_ID}`)), 'guild icon not archived');

  const withoutAsset = render({ assets: [], guildIconUrl: icon });
  assert.ok(withoutAsset.includes(icon), 'guild icon should stay hotlinked when not archived');
});

check('omitting the asset list keeps the previous behaviour exactly', () => {
  const html = render({ messages: [message({ components: THUMB_COMPONENT })] });
  assert.ok(html.includes(AVATAR_CDN), 'no assets passed must mean no rewriting');
  assert.ok(!html.includes('/media/avatar-'), 'must not invent archived URLs');
});

check('every emitted src is absolute or archive-relative', () => {
  const html = render({
    messages: [
      message({
        content_original: 'x <:ped:1560012295654866944>',
        components: THUMB_COMPONENT,
        attachments: [{ filename: 'a.png', content_type: 'image/png', r2_url: media('att-1'), source_url: '', width: 100, height: 100, size_bytes: 10 }]
      })
    ],
    assets: ['emoji-1560012295654866944', 'avatar-1516353117292335190', 'att-1']
  });
  const srcs = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]).filter(s => !s.startsWith('data:'));
  for (const src of srcs) {
    assert.ok(/^(https?:)?\//.test(src), `unexpected relative src: ${src}`);
  }
});

console.log(`\n${passed} passed`);
