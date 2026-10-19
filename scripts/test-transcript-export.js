#!/usr/bin/env node
'use strict';

/**
 * Offline export contract tests.
 *
 * A downloaded transcript must open from `file://` with every image, GIF and
 * video available. Repeated media (an avatar used by 40 messages) must cost its
 * bytes once, not 40 times, so the document stays under the serverless response
 * cap while remaining fully self-contained.
 */

const assert = require('assert');
const { dedupeDataUris } = require('../api/tickets/transcript');

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
const MP4 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28y';

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

console.log('offline HTML export contract');

check('repeated media is folded into a single manifest entry', () => {
  const html = `<body>
    <img src="${PNG}"><img src="${PNG}"><img src="${PNG}">
  </body>`;
  const out = dedupeDataUris(html);
  const manifest = out.match(/<script type="application\/json" id="pade-media-manifest">([\s\S]*?)<\/script>/);
  assert.ok(manifest, 'manifest script missing');
  const entries = JSON.parse(manifest[1]);
  assert.strictEqual(Object.keys(entries).length, 1, 'the same image must be stored once');
  assert.strictEqual(Object.values(entries)[0], PNG, 'manifest must hold the original bytes');
});

check('image sources become hydrated placeholders', () => {
  const out = dedupeDataUris(`<body><img src="${PNG}" alt="pic"></body>`);
  assert.ok(/src="data:image\/gif;base64,/.test(out), 'src must hold the transparent placeholder');
  assert.ok(/data-pade-src="m1"/.test(out), 'image must carry its manifest id');
  assert.ok(out.includes('el.src=v'), 'hydration script must restore image sources');
});

check('links and lightbox URLs are hydrated too', () => {
  const out = dedupeDataUris(
    `<body><a href="${PNG}">file</a><div data-full-url="${MP4}"></div></body>`
  );
  assert.ok(out.includes('href="#" data-pade-href="m1"'), 'attachment link must be deferred');
  assert.ok(out.includes('data-full-url="" data-pade-full="m2"'), 'lightbox URL must be deferred');
  assert.ok(out.includes("el.href=v"), 'hydration script must restore links');
  assert.ok(out.includes("setAttribute('data-full-url',v)"), 'hydration script must restore lightbox URLs');
});

check('videos are inlined and rehydrated', () => {
  const out = dedupeDataUris(`<body><video src="${MP4}" controls preload="metadata"></video></body>`);
  assert.ok(out.includes('data-pade-src="m1"'), 'video must carry its manifest id');
  const manifest = JSON.parse(out.match(/id="pade-media-manifest">([\s\S]*?)<\/script>/)[1]);
  assert.strictEqual(manifest.m1, MP4, 'video bytes must travel in the manifest');
});

check('the document keeps no plain data URI in src', () => {
  const out = dedupeDataUris(`<body><img src="${PNG}"><img src="${PNG}"></body>`);
  const sources = [...out.matchAll(/(?:^|\s)src="([^"]+)"/g)].map(m => m[1]);
  assert.strictEqual(sources.length, 2, 'both images must remain');
  assert.ok(
    sources.every(src => src === 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
    'only the tiny placeholder may remain inline'
  );
});

check('html without media is returned untouched', () => {
  const html = '<body><p>hello</p></body>';
  assert.strictEqual(dedupeDataUris(html), html, 'no manifest should be injected');
});

if (process.exitCode) {
  console.error(`\n${passed} passed, some checks failed`);
} else {
  console.log(`\n${passed} passed`);
}
