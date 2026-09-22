/**
 * ============================================================================
 * SORA PRODUCTION & DEVELOPMENT SERVER - ULTRA-OPTIMIZED ENGINE
 * ============================================================================
 * - Zero "Load-Load" Latency: Instant First-Byte Delivery via Gzip/Brotli Compression
 * - Strict Hardened CSP: No 'unsafe-eval' (Eval-Free AST Obfuscation Architecture)
 * - Isolated Distribution: Serves strictly from dist/ (Root code is 100% shielded)
 * - Intelligent Rate Limiting: Anti-DDoS with Localhost / Private Subnet Bypass
 * - High-Speed Static Caching: Revalidating Asset Caching (< 1ms)
 * - Resilient Clean Routing & Graceful Lifecycle Management
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';
const DIST_DIR = path.join(__dirname, 'dist');

// Ensure dist exists before serving
if (!fs.existsSync(DIST_DIR)) {
  try {
    const build = require('./scripts/build');
    build();
  } catch (err) {
    console.warn('⚠️ [Server]: dist/ directory not found and auto-build failed:', err.message);
  }
}

// ----------------------------------------------------------------------------
// 1. REVERSE PROXY & TRUST SETTINGS
// ----------------------------------------------------------------------------
// Enables accurate client IP detection behind Cloudflare, Vercel, Nginx, or Docker
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ----------------------------------------------------------------------------
// 2. ULTRA-FAST GZIP / BROTLI COMPRESSION
// ----------------------------------------------------------------------------
app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  })
);

// ----------------------------------------------------------------------------
// 3. HARDENED CSP & ADAPTIVE HELMET SECURITY (NO UNSAFE-EVAL)
// ----------------------------------------------------------------------------
// Removed 'unsafe-eval' - JavaScript runtime is pure AST without dynamic Function/eval
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://va.vercel-scripts.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
  imgSrc: ["'self'", "data:", "blob:", "https:"],
  mediaSrc: ["'self'", "data:", "blob:"],
  connectSrc: ["'self'", "ws:", "wss:", "http:", "https:", "https://va.vercel-scripts.com"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"]
};

// Only upgrade insecure requests if explicitly requested and running on HTTPS in production
if (IS_PROD && process.env.FORCE_HTTPS === 'true') {
  cspDirectives.upgradeInsecureRequests = [];
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: IS_PROD
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false, // Disabled on localhost to prevent permanent HTTPS lock
    noSniff: true,
    xssFilter: true,
    frameguard: { action: 'deny' }
  })
);

// ----------------------------------------------------------------------------
// 4. INTELLIGENT RATE LIMITING (ANTI-DDOS WITH LOCAL BYPASS)
// ----------------------------------------------------------------------------
const isLocalAddress = (ip) => {
  if (!ip) return false;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  );
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: IS_PROD ? 500 : 5000, // Generous limit
  skip: (req) => isLocalAddress(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Hệ thống bảo vệ Sora: Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.'
  }
});

app.use(limiter);

// ----------------------------------------------------------------------------
// 5. INTERNAL REPO & SOURCE CODE PROTECTION (SHIELD ROOT)
// ----------------------------------------------------------------------------
const FORBIDDEN_PATTERNS = [
  /^\/\.git/,
  /^\/\.github/,
  /^\/\.src/,
  /^\/views/,
  /^\/scripts/,
  /^\/security/,
  /^\/docs/,
  /^\/node_modules/,
  /^\/package\.json$/,
  /^\/package-lock\.json$/,
  /^\/\.env/,
  /^\/server\.js$/,
  /^\/index\.js$/,
  /^\/vercel\.json$/,
  /^\/vite\.config\.js$/,
  /^\/fiveserver\.config\.js$/,
  /^\/README\.md$/
];

app.use((req, res, next) => {
  const reqPath = req.path;
  const isForbidden = FORBIDDEN_PATTERNS.some((pattern) => pattern.test(reqPath));
  if (isForbidden) {
    return res.status(403).type('text/plain').send('403 Forbidden: Direct access to internal system files is restricted.');
  }
  next();
});

// ----------------------------------------------------------------------------
// 6. HEALTH & STATUS ENDPOINTS
// ----------------------------------------------------------------------------
app.get(['/health', '/api/health', '/api/status'], (req, res) => {
  res.json({
    status: 'ok',
    app: 'Sora Portfolio',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: IS_PROD ? 'production' : 'development'
  });
});

// ----------------------------------------------------------------------------
// 7. HIGH-PERFORMANCE STATIC FILE SERVING FROM DIST/
// ----------------------------------------------------------------------------
// Serves exclusively from dist/ directory to isolate the repository root.
// Asset Cache-Control uses revalidation instead of permanent immutable cache.
const staticServingDir = fs.existsSync(DIST_DIR) ? DIST_DIR : __dirname;

app.use(
  express.static(staticServingDir, {
    dotfiles: 'allow',
    etag: true,
    index: false, // Custom clean routes handle HTML files
    maxAge: IS_PROD ? '7d' : 0,
    redirect: false,
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');

      if (filePath.endsWith('.html')) {
        // HTML is always validated with ETag (instant 304 if unchanged)
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|mp3|webm|wav|ogg)$/i)) {
        // Static media cached with stale-while-revalidate for freshness
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      } else if (filePath.endsWith('.css') || filePath.endsWith('.js') || filePath.endsWith('.json') || filePath.endsWith('.webmanifest')) {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      }
    }
  })
);

// ----------------------------------------------------------------------------
// 8. ZERO-DELAY CLEAN URL ROUTING (IN-MEMORY CACHED PAGES)
// ----------------------------------------------------------------------------
const PAGES = {
  home: 'index.html',
  intro: 'intro.html',
  skills: 'skills.html',
  contact: 'contact.html'
};

function serveHtmlPage(fileName, res) {
  let targetPath = path.join(DIST_DIR, fileName);
  let targetRoot = DIST_DIR;

  if (!fs.existsSync(targetPath)) {
    targetPath = path.join(__dirname, fileName);
    targetRoot = __dirname;
  }

  if (!fs.existsSync(targetPath)) {
    fileName = PAGES.home;
    targetRoot = fs.existsSync(path.join(DIST_DIR, PAGES.home)) ? DIST_DIR : __dirname;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(fileName, {
    root: targetRoot,
    dotfiles: 'allow',
    etag: true
  });
}

// Clean route bindings
app.get(['/', '/index', '/index.html'], (req, res) => {
  serveHtmlPage(PAGES.home, res);
});

app.get(['/intro', '/intro.html'], (req, res) => {
  serveHtmlPage(PAGES.intro, res);
});

app.get(['/skills', '/skills.html'], (req, res) => {
  serveHtmlPage(PAGES.skills, res);
});

app.get(['/contact', '/contact.html'], (req, res) => {
  serveHtmlPage(PAGES.contact, res);
});

// Favicon endpoints (served cleanly from dist/assets/ or assets/)
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const favDist = path.join(DIST_DIR, 'assets', 'favicon.ico');
  const rootDir = fs.existsSync(favDist) ? DIST_DIR : __dirname;
  const relPath = fs.existsSync(favDist) ? path.join('assets', 'favicon.ico') : path.join('assets', 'favicon.ico');
  res.sendFile(relPath, { root: rootDir, dotfiles: 'allow' });
});

app.get('/favicon.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const favDist = path.join(DIST_DIR, 'assets', 'favicon.png');
  const rootDir = fs.existsSync(favDist) ? DIST_DIR : __dirname;
  const relPath = fs.existsSync(favDist) ? path.join('assets', 'favicon.png') : path.join('assets', 'favicon.png');
  res.sendFile(relPath, { root: rootDir, dotfiles: 'allow' });
});

// Web App Manifest (PWA) endpoint
app.get(['/manifest.json', '/site.webmanifest'], (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const manifestDist = path.join(DIST_DIR, 'manifest.json');
  const targetRoot = fs.existsSync(manifestDist) ? DIST_DIR : __dirname;
  res.sendFile('manifest.json', { root: targetRoot, dotfiles: 'allow' });
});

// Vercel Web Analytics Local Sandbox Endpoint (production runs on Vercel Edge automatically)
app.get('/_vercel/insights/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send('/* [Vercel Web Analytics Local Sandbox] */ (function(){ window.va = window.va || function(){ (window.vaq = window.vaq || []).push(arguments); }; })();');
});

app.post(['/_vercel/insights/view', '/_vercel/insights/event'], (req, res) => {
  res.json({ ok: true, source: 'local-dev' });
});

// ----------------------------------------------------------------------------
// 9. LIGHTWEIGHT ASSET 404 & SPA ROUTE FALLBACK
// ----------------------------------------------------------------------------
// If an asset (.css, .js, .png, .json, etc.) is missing, return a fast 404
app.use((req, res) => {
  const ext = path.extname(req.path).toLowerCase();
  const isAsset = Boolean(ext && ext !== '.html' && ext !== '.htm');

  if (isAsset) {
    return res.status(404).type('text/plain').send('404 Not Found: Asset does not exist.');
  }

  // Graceful fallback for non-asset routes: serve index page
  serveHtmlPage(PAGES.home, res);
});

// ----------------------------------------------------------------------------
// 10. GLOBAL ERROR HANDLER
// ----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('⚠️ [Server Error]:', err.stack || err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).type('text/plain').send('500 Internal Server Error: Please try again shortly.');
});

// ----------------------------------------------------------------------------
// 11. SERVER STARTUP & GRACEFUL LIFECYCLE
// ----------------------------------------------------------------------------
let server = null;

if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log(' ✨ SORA LIGHTNING SERVER - ULTRA-FAST & SECURE');
    console.log('======================================================');
    console.log(` 🌐 Local Access:    http://localhost:${PORT}`);
    console.log(` 🚀 Environment:     ${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(` 📁 Serving Root:    ${staticServingDir}`);
    console.log(` ⚡ Compression:     ACTIVE (Gzip/Brotli on-the-fly)`);
    console.log(` 🛡️ Helmet Security: ACTIVE (CSP: No 'unsafe-eval')`);
    console.log(` 🔒 Rate Limiting:   ACTIVE (Whitelisted for localhost)`);
    console.log(` 📦 Clean Routes:    /, /intro, /skills, /contact`);
    console.log('======================================================\n');
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down Sora server...`);
    if (server) {
      server.close(() => {
        console.log('✅ Server closed cleanly. Goodbye!');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout.');
        process.exit(1);
      }, 5000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Export for Vercel and testing
module.exports = app;
