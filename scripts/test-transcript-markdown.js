#!/usr/bin/env node
'use strict';

/**
 * Transcript markdown contract tests.
 *
 * Locks in Discord rendering parity for the hosted viewer:
 *  - headings (#, ##, ###) and subtext (-#) must render as markup, not literal '#'
 *  - fenced code blocks keep their language as a data-lang badge for CSS
 *  - long lines wrap (no horizontal scrollbar) and 3+ backtick fences are safe
 *  - the reply preview stays inline (no block markup inside a one-line preview)
 */

const assert = require('assert');
const { renderPadeTranscriptPage } = require('../lib/tickets/render');

function renderMessages(messages) {
  return renderPadeTranscriptPage({
    transcript: {
      public_id: 'tr_contract',
      ticket_name: 'contract-1',
      guild_id: '1',
      opened_at: new Date('2026-01-01T00:00:00Z'),
      closed_at: new Date('2026-01-01T00:10:00Z')
    },
    users: {
      u1: { username: 'tester', global_name: 'Tester', avatar_url: '' }
    },
    roles: {},
    channels: {},
    messages
  });
}

function render(content) {
  return renderMessages([
    {
      discord_message_id: 'm1',
      author_id: 'u1',
      content_original: content,
      timestamp: new Date('2026-01-01T00:05:00Z'),
      message_type: 0
    }
  ]);
}

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

console.log('transcript markdown contract');

check('renders #, ##, ### as heading markup', () => {
  const html = render('# One\n## Two\n### Three\nplain tail');
  assert.ok(html.includes('<h1 class="markdown-heading markdown-h1">One</h1>'), 'h1 missing');
  assert.ok(html.includes('<h2 class="markdown-heading markdown-h2">Two</h2>'), 'h2 missing');
  assert.ok(html.includes('<h3 class="markdown-heading markdown-h3">Three</h3>'), 'h3 missing');
  assert.ok(html.includes('plain tail'), 'tail text lost');
  assert.ok(!html.includes('># One<'), 'heading hash leaked as literal text');
});

check('leaves #### as literal text (Discord supports only 3 levels)', () => {
  const html = render('#### Four');
  assert.ok(!html.includes('markdown-h4'), 'h4 must not be produced');
  assert.ok(html.includes('#### Four'), 'literal #### text should survive');
});

check('does not insert a stray <br> after a heading', () => {
  const html = render('# Heading body');
  assert.ok(!html.includes('markdown-h1">Heading body</h1><br>'), 'heading should own the line break');
});

check('renders -# as subtext', () => {
  const html = render('-# small print');
  assert.ok(html.includes('<div class="markdown-subtext">small print</div>'), 'subtext missing');
});

check('resolves mentions inside a heading', () => {
  const html = render('# Cha de sv <@1270627041607286847>');
  assert.ok(
    /<h1 class="markdown-heading markdown-h1">Cha de sv <span class="mention user"/.test(html),
    'mention inside heading not resolved'
  );
  assert.ok(!html.includes('&lt;@1270627041607286847&gt;'), 'raw mention id leaked');
});

check('code block keeps its language as data-lang', () => {
  const html = render('```js\nconst a = 1;\n```');
  assert.ok(
    html.includes('<pre class="code-block" data-lang="js"><code>const a = 1;</code></pre>'),
    'language badge contract broken'
  );
});

check('code block without language emits no data-lang', () => {
  const html = render('```\nplain text\n```');
  assert.ok(html.includes('<pre class="code-block"><code>plain text</code></pre>'), 'plain fence broken');
  assert.ok(!/<pre class="code-block" data-lang=""/.test(html), 'empty data-lang must be omitted');
});

check('single-line fence is a code block, not a language', () => {
  const html = render('```x```');
  assert.ok(html.includes('<pre class="code-block"><code>x</code></pre>'), 'single-line fence misparsed');
});

check('4-backtick fence keeps inner backticks as content', () => {
  const html = render('````\n```\ninner\n```\n````');
  const fences = html.match(/<pre class="code-block"/g) || [];
  assert.strictEqual(fences.length, 1, 'expected exactly one code block');
  assert.ok(html.includes('inner'), 'inner content lost');
});

check('long single-line code does not need a horizontal scrollbar', () => {
  const long = 'x'.repeat(400);
  const html = render('```\n' + long + '\n```');
  assert.ok(html.includes(long), 'long code body lost');
  // Only the rendered <pre> tag matters here: a CSS rule may legitimately use
  // overflow-x elsewhere on the page.
  assert.ok(!/<pre[^>]*overflow-x/.test(html), 'code block must wrap instead of overflowing');
  const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  assert.ok(
    /\.code-block code\s*\{[^}]*white-space:\s*pre-wrap/.test(css),
    'code block CSS must wrap long lines'
  );
});

check('inline code still renders', () => {
  const html = render('use `npm test` now');
  assert.ok(html.includes('<code class="code-inline">npm test</code>'), 'inline code broken');
});

check('stashed emoji tokens survive italics (no placeholder leak)', () => {
  // Regression: the storefront banner starts with "# _ _ <a:emoji:id> [name](url)
  // <a:emoji:id>" and the italic rule used to eat the underscore of the internal
  // "@@@TOKEN_n@@@" marker, printing the placeholder on the page.
  const html = render('# _ _ <a:71839_white:1556167370651729930> [Pade Store](https://discord.gg/rsANNHwE64) <a:71839_white:1556167370651729930>');
  assert.ok(!/@@@TOKEN|@@TOKEN/.test(html), 'internal placeholder leaked into the page');
  assert.ok(!/[\uE000\uE001]/.test(html), 'internal token marker leaked into the page');
  assert.strictEqual(
    (html.match(/class="custom-emoji"/g) || []).length,
    2,
    'both custom emojis must render'
  );
  assert.ok(html.includes('>Pade Store</a>'), 'banner link must render');
});

check('timestamps are rendered in the store time zone', () => {
  // 2026-01-01T00:05:00Z is 07:05 in Asia/Ho_Chi_Minh. Rendering with the host
  // time zone showed 00:05 on Vercel (UTC), which is what shipped before.
  const html = render('hello');
  assert.ok(html.includes('01/01/2026 07:05'), 'message time must use Asia/Ho_Chi_Minh');
  assert.ok(html.includes('Mở lúc</span>'), 'intro must show the open-date stat');
  assert.ok(html.includes('01/01/2026 07:00'), 'open date must use Asia/Ho_Chi_Minh');
  assert.ok(html.includes('Đóng 01/01/2026 07:10'), 'close time must use Asia/Ho_Chi_Minh');
});

check('channel intro shows exactly the three requested facts', () => {
  const html = render('hello');
  assert.strictEqual(
    (html.match(/class="ci-stat"/g) || []).length,
    3,
    'intro must render exactly three stats'
  );
  assert.ok(html.includes('#contract-1'), 'ticket name stat missing');
  assert.ok(html.includes('Tin nhắn</span>'), 'message-count stat missing');
  assert.ok(html.includes('Mở lúc</span>'), 'open-date stat missing');
  assert.ok(!html.includes('ci-chip'), 'legacy chip row must be gone');
});

check('member rail has no role-icon badges and neutralises decorative roles', () => {
  const payload = {
    transcript: {
      public_id: 'tr_rail',
      ticket_name: 'rail-1',
      guild_id: '1',
      opened_at: new Date('2026-01-01T00:00:00Z'),
      closed_at: new Date('2026-01-01T00:10:00Z')
    },
    users: {
      u1: {
        username: 'decorated',
        guild_display_name: 'Decorated',
        avatar_url: '',
        display_color_role: '~1',
        display_color: 0x6ed3cc,
        display_icon_role: '~1',
        display_icon_url: 'https://cdn.discordapp.com/emojis/1.png',
        is_bot: false
      },
      u2: {
        username: 'director',
        guild_display_name: 'Director',
        avatar_url: '',
        display_color_role: 'director',
        is_bot: false
      }
    },
    roles: {},
    channels: {},
    messages: [
      { discord_message_id: 'm1', author_id: 'u1', content_original: 'a', timestamp: new Date('2026-01-01T00:01:00Z'), message_type: 0 },
      { discord_message_id: 'm2', author_id: 'u2', content_original: 'b', timestamp: new Date('2026-01-01T00:02:00Z'), message_type: 0 }
    ]
  };
  const html = renderPadeTranscriptPage(payload);
  assert.ok(!html.includes('class="rail-role-icon"'), 'member rows must not carry role icons');
  assert.ok(!html.includes('rail-group-count'), 'role groups must not show a count');
  assert.ok(!html.includes('>~1<'), 'decorative role names must be neutralised');
  assert.ok(html.includes('>Thành viên</div>'), 'decorative role must fall back to the neutral group');
  assert.ok(html.includes('>DIRECTOR</div>') || html.includes('>director</div>'), 'readable role name kept');
});

check('components v2 render container, section, gallery, file and buttons', () => {
  const html = renderMessages([
    {
      discord_message_id: 'm1',
      author_id: 'u1',
      content_original: '',
      timestamp: new Date('2026-01-01T00:01:00Z'),
      message_type: 0,
      components: [
        {
          type: 17,
          accent_color: 0x5865f2,
          components: [
            { type: 10, content: '## Welcome' },
            { type: 14, divider: true, spacing: 2 },
            {
              type: 9,
              components: [{ type: 10, content: 'section body' }],
              accessory: { type: 11, media: { url: 'https://cdn.discordapp.com/attachments/1/2/pic.png' } }
            },
            {
              type: 12,
              items: [
                { media: { url: 'https://cdn.discordapp.com/attachments/1/2/clip.mp4', content_type: 'video/mp4' } },
                { media: { url: 'https://cdn.discordapp.com/attachments/1/2/pic.png' } }
              ]
            },
            { type: 13, file: { name: 'report.pdf', size: 2048, url: 'https://cdn.discordapp.com/attachments/1/2/report.pdf' } },
            { type: 1, components: [{ type: 2, style: 5, label: 'Docs', url: 'https://example.com' }] }
          ]
        }
      ]
    }
  ]);
  assert.ok(html.includes('--dvc-accent: #5865f2'), 'container accent must be applied');
  assert.ok(html.includes('discord-component-separator divider spacing-large'), 'separator options lost');
  assert.ok(html.includes('<video'), 'video gallery item must use a player');
  assert.ok(html.includes('class="dvc-file"'), 'file component card missing');
  assert.ok(html.includes('report.pdf'), 'file component name missing');
  assert.ok(html.includes('btn-link'), 'link button style missing');
});

check('offline export inlines archived media and drops external fonts', () => {
  const payload = {
    transcript: {
      public_id: 'tr_export',
      ticket_name: 'export-1',
      guild_id: '1',
      opened_at: new Date('2026-01-01T00:00:00Z'),
      closed_at: new Date('2026-01-01T00:10:00Z')
    },
    users: { u1: { username: 'tester', global_name: 'Tester', avatar_url: '' } },
    roles: {},
    channels: {},
    assets: ['att-1', 'att-2'],
    messages: [
      {
        discord_message_id: 'm1',
        author_id: 'u1',
        content_original: 'media',
        timestamp: new Date('2026-01-01T00:01:00Z'),
        message_type: 0,
        attachments: [
          {
            filename: 'pic.png',
            content_type: 'image/png',
            size_bytes: 1024,
            source_url: 'https://cdn.discordapp.com/attachments/1/1/pic.png',
            r2_url: 'https://transcript.sorae.tokyo/t/tr_export/media/att-1'
          },
          {
            filename: 'clip.mp4',
            content_type: 'video/mp4',
            size_bytes: 4096,
            source_url: 'https://cdn.discordapp.com/attachments/1/1/clip.mp4',
            r2_url: 'https://transcript.sorae.tokyo/t/tr_export/media/att-2'
          }
        ]
      }
    ]
  };
  const inlineMedia = new Map([
    ['att-1', 'data:image/png;base64,AAAA'],
    ['att-2', 'data:video/mp4;base64,BBBB']
  ]);
  const html = renderPadeTranscriptPage(payload, { exportMode: true, inlineMedia });
  assert.ok(!html.includes('fonts.googleapis.com'), 'export must not depend on Google Fonts');
  assert.ok(html.includes('data:image/png;base64,AAAA'), 'image must be inlined');
  assert.ok(html.includes('data:video/mp4;base64,BBBB'), 'video must be inlined');
});

check('offline export keeps absolute URLs for media above the budget', () => {
  const payload = {
    transcript: {
      public_id: 'tr_export2',
      ticket_name: 'export-2',
      guild_id: '1',
      opened_at: new Date('2026-01-01T00:00:00Z'),
      closed_at: new Date('2026-01-01T00:10:00Z')
    },
    users: { u1: { username: 'tester', global_name: 'Tester', avatar_url: 'https://cdn.discordapp.com/avatars/123456789012345678/hash.png' } },
    roles: {},
    channels: {},
    assets: ['avatar-123456789012345678'],
    messages: [
      { discord_message_id: 'm1', author_id: 'u1', content_original: 'hello', timestamp: new Date('2026-01-01T00:01:00Z'), message_type: 0 }
    ]
  };
  const html = renderPadeTranscriptPage(payload, { exportMode: true, inlineMedia: new Map() });
  assert.ok(html.includes('https://transcript.sorae.tokyo/t/tr_export2/media/avatar-123456789012345678'), 'export must absolutise archive URLs');
});

check('custom emoji carry a readable fallback and an emoji font stack', () => {
  const html = render('<:wave:123456789012345678>');
  assert.ok(html.includes('class="custom-emoji"'), 'custom emoji image missing');
  assert.ok(html.includes('data-emoji=":wave:"'), 'custom emoji must carry its :name: for the fallback');
  assert.ok(html.includes('emoji-fallback'), 'fallback chip style missing');
  assert.ok(html.includes("'Apple Color Emoji'") && html.includes("'Noto Color Emoji'"), 'emoji font families missing');
});

check('spoiler content is wrapped for hiding', () => {
  const html = render('||@everyone @here||');
  assert.ok(html.includes('<span class="spoiler"'), 'spoiler wrapper missing');
  assert.ok(!html.includes('||@everyone'), 'opening spoiler marker leaked');
  assert.ok(!html.includes('@here||'), 'closing spoiler marker leaked');
});

check('reply preview stays inline', () => {
  const html = renderMessages([
    {
      discord_message_id: 'm2',
      author_id: 'u1',
      content_original: 'reply body',
      timestamp: new Date('2026-01-01T00:06:00Z'),
      message_type: 0,
      reference: { referenced_message_id: 'm1', referenced_author_id: 'u1', content_preview: '# not a heading' }
    }
  ]);
  assert.ok(!html.includes('markdown-h1">not a heading'), 'preview must not grow block markup');
  assert.ok(html.includes('# not a heading'), 'preview text lost');
});

check('unresolvable mentions fall back to Discord wording', () => {
  const html = render(['<@999999999999999999>', '<@&999999999999999999>', '<#999999999999999999>'].join(' '));
  assert.ok(html.includes('@unknown-user'), 'unknown user fallback missing');
  assert.ok(html.includes('@deleted-role'), 'unknown role fallback missing');
  assert.ok(html.includes('#deleted-channel'), 'unknown channel fallback missing');
  assert.ok(!html.includes('>@user<'), 'bare @user placeholder must be gone');
});

check('never nests block markup inside a heading', () => {
  const html = render('# Head ```\ncode body\n```');
  assert.ok(!/<h[1-3][^>]*><pre/.test(html), 'block markup must not be nested inside a heading');
  assert.ok(html.includes('code body'), 'code body lost');
});

check('the reported regression message renders end to end', () => {
  const content = [
    '| ANH EM HO LONG | 401',
    '# Cam dau lu du ',
    '# Gap lu ngu la giet k tha ',
    '```',
    'Server nay dung len bang cai TINH va cai NGHIA.',
    '```',
    '||@everyone @here ||',
    '# Cha de sv <@1270627041607286847>  ',
    'dai dien:<@1516353117292335190>',
    'https://discord.gg/UjxeNvZFfr'
  ].join('\n');
  const html = render(content);
  const headings = html.match(/class="markdown-heading markdown-h1"/g) || [];
  assert.strictEqual(headings.length, 3, `expected 3 headings, got ${headings.length}`);
  assert.ok(html.includes('<pre class="code-block"><code>Server nay dung len'), 'code block missing');
  assert.ok(!/^# /m.test(content) || true, 'sanity');
});

console.log(`\n${passed} passed`);
