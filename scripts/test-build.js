const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const build = require('./build');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const staleArtifact = path.join(distDir, 'stale-build-artifact.txt');
const siteUrl = 'https://sorae.tokyo';

const expectedPages = [
  { file: 'index.html', path: '/', title: 'Sora — Portfolio' },
  { file: 'intro.html', path: '/intro', title: 'Giới thiệu | Sora' },
  { file: 'skills.html', path: '/skills', title: 'Kỹ năng | Sora' },
  { file: 'contact.html', path: '/contact', title: 'Liên hệ | Sora' }
];

async function run() {
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(staleArtifact, 'this file must not survive a production build', 'utf8');

  await build();

  assert.equal(
    fs.existsSync(staleArtifact),
    false,
    'production build must remove stale files from dist before writing output'
  );

  for (const page of expectedPages) {
    const html = fs.readFileSync(path.join(distDir, page.file), 'utf8');
    const canonicalUrl = `${siteUrl}${page.path}`;

    assert.ok(html.includes(`<title>${page.title}</title>`), `${page.file} must have a page-specific title`);
    assert.ok(html.includes(`<link rel="canonical" href="${canonicalUrl}">`), `${page.file} must have a canonical URL`);
    assert.ok(html.includes(`<meta property="og:url" content="${canonicalUrl}">`), `${page.file} must expose its Open Graph URL`);
    assert.ok(html.includes(`<meta property="og:title" content="${page.title}">`), `${page.file} must expose its Open Graph title`);
    assert.ok(html.includes('<meta name="twitter:card" content="summary">'), `${page.file} must expose Twitter card metadata`);
    assert.ok(html.includes('<meta name="robots" content="index, follow">'), `${page.file} must allow indexing`);
  }

  const robots = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('Sitemap: https://sorae.tokyo/sitemap.xml'), 'robots.txt must advertise the production sitemap');

  const sitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
  for (const page of expectedPages) {
    assert.ok(sitemap.includes(`<loc>${siteUrl}${page.path}</loc>`), `sitemap.xml must include ${page.path}`);
  }

  const manifest = fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8');
  assert.ok(manifest.includes('"display": "standalone"'), 'manifest.json must have standalone display');
  assert.ok(manifest.includes('"name": "Sora'), 'manifest.json must have app name');

  assert.ok(fs.existsSync(path.join(distDir, 'music', 'crush.webm')), 'crush.webm must exist in dist/music');
  assert.ok(fs.existsSync(path.join(distDir, 'music', 'crush.mp3')), 'crush.mp3 must exist in dist/music');

  const workflow = fs.readFileSync(
    path.join(projectRoot, '.github', 'workflows', 'security-scan.yml'),
    'utf8'
  );
  assert.match(
    workflow,
    /uses:\s*trufflesecurity\/trufflehog@[a-f0-9]{40}/,
    'TruffleHog action must be pinned to an immutable commit SHA'
  );
  assert.doesNotMatch(
    workflow,
    /^\s+(base|head):/m,
    'TruffleHog must derive the commit range from the GitHub event'
  );

  console.log('✅ Build contract tests passed: clean dist, SEO artifacts, PWA manifest, audio assets, and CI security config are valid.');
}

run().catch((error) => {
  console.error(`❌ Build isolation test failed: ${error.message}`);
  process.exit(1);
});
