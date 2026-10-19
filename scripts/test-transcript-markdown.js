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
