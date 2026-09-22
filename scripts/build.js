const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const viewsDir = path.join(projectRoot, 'views');
const pagesDir = path.join(viewsDir, 'pages');

const pages = [
  {
    name: 'index',
    path: '/',
    title: 'Sora — Portfolio',
    description: 'Sora - Nơi để mình giới thiệu về bản thân và khám phá các AI (Vibe AI), phát triển Bot Discord và Website.',
    activePage: 'home'
  },
  {
    name: 'intro',
    path: '/intro',
    title: 'Giới thiệu | Sora',
    description: 'Đam mê với Vibe AI, website design, interaction và phát triển Node.js, Python, Bot Discord',
    activePage: 'intro'
  },
  {
    name: 'skills',
    path: '/skills',
    title: 'Kỹ năng | Sora',
    description: 'Tổng hợp những kỹ năng và công nghệ mình đã tích lũy và ứng dụng trong các dự án thực tế.',
    activePage: 'skills'
  },
  {
    name: 'contact',
    path: '/contact',
    title: 'Liên hệ | Sora',
    description: 'Nếu bạn muốn trò chuyện hoặc tìm hiểu thêm về mình, hãy ghé qua các trang mạng xã hội và website cá nhân, hoặc nhắn tin cho mình bất cứ lúc nào nha',
    activePage: 'contact'
  }
];

const sharedData = {
  author: 'Sora',
  siteUrl: 'https://sorae.tokyo',
  telegramUrl: 'https://t.me/ixzplr',
  telegramUsername: '@ixzplr',
  discordUrl: 'https://discord.com/users/1265702432701284395',
  discordUsername: '@ixplr',
  discordUserId: '1265702432701284395',
  discordCommunityUrl: 'https://discord.gg/CZrQ4gPEDV',
  discordCommunityDisplay: 'discord.gg/sorastation',
  location: 'GMT+7 Vietnam'
};

const obfuscate = require('./obfuscate');

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // strip comments
    .replace(/\r\n|\r|\n/g, ' ')       // remove line breaks
    .replace(/\s+/g, ' ')             // collapse spaces
    .replace(/\s*([{}:;,>~])\s*/g, '$1') // trim around symbols
    .replace(/;}/g, '}')             // remove redundant semicolon
    .trim();
}

function copyFileIfExists(src, dest) {
  if (fs.existsSync(src)) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

function resetDistDirectory() {
  const resolvedRoot = path.resolve(projectRoot);
  const resolvedDist = path.resolve(distDir);
  const expectedDist = path.join(resolvedRoot, 'dist');

  if (resolvedDist !== expectedDist || path.dirname(resolvedDist) !== resolvedRoot) {
    throw new Error(`Refusing to clean unsafe build directory: ${resolvedDist}`);
  }

  fs.rmSync(resolvedDist, { recursive: true, force: true });
  fs.mkdirSync(resolvedDist, { recursive: true });
}

async function build() {
  const buildHash = 'sora-prod-v2'; // Fixed hash for 100% deterministic build reproducibility
  console.log(`⚡ Compiling Production Distribution into dist/ (Deterministic buildHash: ${buildHash})...`);

  // Step 1: Recreate a clean dist directory tree
  const distAssetsDir = path.join(distDir, 'assets');
  const distJsDir = path.join(distDir, 'js');
  const distMusicDir = path.join(distDir, 'music');

  resetDistDirectory();
  [distDir, distAssetsDir, distJsDir, distMusicDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Step 2: Obfuscate JavaScript without dynamic eval (deterministic AST)
  const inlineJs = await obfuscate();

  // Step 3: Read & minify CSS (Inline luminous-flow.png as Base64 for instant 0ms render)
  const rawCssPath = path.join(projectRoot, 'style.css');
  let rawCss = fs.readFileSync(rawCssPath, 'utf8');

  const luminousImgPath = path.join(projectRoot, 'assets', 'luminous-flow.png');
  if (fs.existsSync(luminousImgPath)) {
    const bgBase64 = fs.readFileSync(luminousImgPath).toString('base64');
    const dataUri = `data:image/png;base64,${bgBase64}`;
    rawCss = rawCss
      .replace(/url\(['"]?assets\/luminous-flow\.png['"]?\)/g, `url("${dataUri}")`)
      .replace(/url\(['"]?assets\/silk-bg\.png['"]?\)/g, `url("${dataUri}")`);
    console.log(`  ✓ Inlined luminous flow background (${(bgBase64.length / 1024).toFixed(1)} KB Base64)`);
  }

  const faviconPath = path.join(projectRoot, 'assets', 'favicon.png');
  let faviconDataUri = '/assets/favicon.png';
  if (fs.existsSync(faviconPath)) {
    const favBase64 = fs.readFileSync(faviconPath).toString('base64');
    faviconDataUri = `data:image/png;base64,${favBase64}`;
    console.log(`  ✓ Inlined gothic chrome heart cross favicon (${(favBase64.length / 1024).toFixed(1)} KB Base64)`);
  }

  const inlineCss = minifyCss(rawCss);
  console.log(`✨ Minified CSS bundle: ${(inlineCss.length / 1024).toFixed(1)} KB (Inlined into <head>)`);

  // Step 4: Render Unified SPA Pages strictly into dist/
  const spaMasterTemplate = path.join(pagesDir, 'index.ejs');

  for (const page of pages) {
    const data = {
      ...sharedData,
      ...page,
      canonicalUrl: new URL(page.path, `${sharedData.siteUrl}/`).toString(),
      buildHash,
      inlineCss,
      inlineJs,
      faviconDataUri
    };

    const rendered = await ejs.renderFile(spaMasterTemplate, data, {
      root: viewsDir
    });

    // Write strictly to dist/
    fs.writeFileSync(path.join(distDir, `${page.name}.html`), rendered, 'utf8');
    console.log(`  ✓ Built dist/${page.name}.html`);
  }

  // Step 5: Copy static assets to dist/assets
  const assetFiles = ['favicon.ico', 'favicon.png', 'luminous-flow.png'];
  assetFiles.forEach(file => {
    const src = path.join(projectRoot, 'assets', file);
    if (fs.existsSync(src)) {
      copyFileIfExists(src, path.join(distAssetsDir, file));
    }
  });

  // Direct root favicon copies in dist/
  copyFileIfExists(path.join(projectRoot, 'assets', 'favicon.ico'), path.join(distDir, 'favicon.ico'));
  copyFileIfExists(path.join(projectRoot, 'assets', 'favicon.png'), path.join(distDir, 'favicon.png'));

  // Step 6: Pipeline for performance and devtools guard scripts (Source of truth: .src/ -> dist/js/)
  const srcPerf = path.join(projectRoot, '.src', 'sora-performance-x2.js');
  const srcGuard = path.join(projectRoot, '.src', 'sora-devtools-guard.js');

  if (fs.existsSync(srcPerf)) {
    copyFileIfExists(srcPerf, path.join(distJsDir, 'sora-performance-x2.js'));
    console.log('  ✓ Compiled sora-performance-x2.js -> dist/js/');
  }

  if (fs.existsSync(srcGuard)) {
    copyFileIfExists(srcGuard, path.join(distJsDir, 'sora-devtools-guard.js'));
    console.log('  ✓ Compiled sora-devtools-guard.js -> dist/js/');
  }

  // Step 7: Copy audio assets
  const audioFiles = ['crush.mp3', 'crush.webm'];
  audioFiles.forEach((file) => {
    const srcMusic = path.join(projectRoot, 'music', file);
    if (fs.existsSync(srcMusic)) {
      copyFileIfExists(srcMusic, path.join(distMusicDir, file));
      console.log(`  ✓ Copied ${file} -> dist/music/`);
    }
  });

  // Step 8: Copy deployment rules & PWA manifest to dist
  copyFileIfExists(path.join(projectRoot, '_redirects'), path.join(distDir, '_redirects'));
  copyFileIfExists(path.join(projectRoot, '_routes.json'), path.join(distDir, '_routes.json'));
  copyFileIfExists(path.join(projectRoot, 'robots.txt'), path.join(distDir, 'robots.txt'));
  copyFileIfExists(path.join(projectRoot, 'sitemap.xml'), path.join(distDir, 'sitemap.xml'));
  copyFileIfExists(path.join(projectRoot, 'manifest.json'), path.join(distDir, 'manifest.json'));
  console.log('  ✓ Copied manifest.json (PWA) -> dist/');

  // Step 9: Honeypot script and style to dist
  const honeypotCode = `/* 🚫 [SECURITY HONEYPOT] Direct file inspection strictly prohibited. */
(function(){
  try {
    document.documentElement.innerHTML = '<div style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:22px;font-weight:700;">🚫 Access Denied: Direct script access is strictly forbidden.</div>';
    window.location.replace('about:blank');
  } catch(e) {}
})();`;
  fs.writeFileSync(path.join(distDir, 'script.js'), honeypotCode, 'utf8');
  copyFileIfExists(path.join(projectRoot, 'style.css'), path.join(distDir, 'style.css'));

  console.log('✨ Build finished successfully! Output generated exclusively in dist/.');
}

if (require.main === module) {
  build().catch((err) => {
    console.error('Error compiling build:', err);
    process.exit(1);
  });
}

module.exports = build;
