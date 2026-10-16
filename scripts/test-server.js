const http = require('http');
const zlib = require('zlib');
const app = require('../server');

const testPort = 3899;
const mockBotPort = 3898;

const mockBotServer = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://127.0.0.1:${mockBotPort}`);
  const user = parsed.searchParams.get('user');
  const id = parsed.searchParams.get('id');
  const token = parsed.searchParams.get('token');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (token === 'forbidden-token') {
    res.statusCode = 403;
    return res.end('<!DOCTYPE html><html><body><h1>403 Forbidden: Invalid Token</h1></body></html>');
  }

  if (id === 'non-existent') {
    res.statusCode = 404;
    return res.end('<!DOCTYPE html><html><body><h1>404 Ticket Not Found</h1></body></html>');
  }

  res.statusCode = 200;
  return res.end(`<!DOCTYPE html><html><head><title>Transcript ${id}</title></head><body><div id="discord-transcript">Transcript for ticket: ${id}, user: ${user}, token: ${token}</div></body></html>`);
});

mockBotServer.listen(mockBotPort, '127.0.0.1');

const server = app.listen(testPort, '127.0.0.1', async () => {
  console.log(`\n======================================================`);
  console.log(` 🧪 SORA COMPREHENSIVE TEST SUITE - PORT ${testPort}`);
  console.log(`======================================================\n`);

  const tests = [
    // 1. Core Page Routes & Content Integrity
    {
      name: 'Root Page (/)',
      path: '/',
      expectedStatus: 200,
      headers: { 'Accept-Encoding': 'gzip' },
      validate: (res, body) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('text/html')) return 'Content-Type must be text/html';
        if (!body.includes('<title>Sora — Portfolio</title>')) return 'Missing <title>Sora — Portfolio</title>';
        if (!body.includes('<link rel="canonical" href="https://sorastation.vercel.app/">')) return 'Missing canonical link';
        if (!body.includes('id="sora-bg-engine"')) return 'Missing WebGL GLSL shader engine';
        if (!body.includes('/js/sora-performance-x2.js')) return 'Missing sora-performance-x2.js tag';
        if (!body.includes('/js/sora-devtools-guard.js')) return 'Missing sora-devtools-guard.js tag';
        if (!body.includes('GMT+7 Vietnam')) return 'Missing contact info in rendered SPA';
        return null;
      }
    },
    {
      name: 'Intro Route (/intro)',
      path: '/intro',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('Sora')) return 'Missing Sora content';
        return null;
      }
    },
    {
      name: 'Skills Route (/skills)',
      path: '/skills',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('skills')) return 'Missing skills content';
        return null;
      }
    },
    {
      name: 'Contact Route (/contact)',
      path: '/contact',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('@ixzplr') && !body.includes('@ixplr')) return 'Missing contact handles';
        return null;
      }
    },
    {
      name: 'Discord Subdomain Host Routing (/ with Host: discord.sorae.tokyo)',
      path: '/',
      expectedStatus: 200,
      headers: { 'Host': 'discord.sorae.tokyo' },
      validate: (res, body) => {
        if (!body.includes("Sora&#39;s Station") && !body.includes("Sora's Station")) return "Missing Sora's Station title";
        if (!body.includes('https://discord.gg/YzEaab34kV')) return 'Missing Discord server invite link';
        if (!body.includes('https://discord.sorae.tokyo/')) return 'Missing canonical discord URL';
        return null;
      }
    },
    {
      name: 'Main Domain Host Routing (/ with Host: sorae.tokyo)',
      path: '/',
      expectedStatus: 200,
      headers: { 'Host': 'sorae.tokyo' },
      validate: (res, body) => {
        if (!body.includes('<title>Sora — Portfolio</title>')) return 'Main domain must serve Sora Portfolio';
        return null;
      }
    },
    {
      name: 'Discord Clean Route (/discord)',
      path: '/discord',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes("Sora&#39;s Station") && !body.includes("Sora's Station")) return "Missing Sora's Station";
        return null;
      }
    },
    {
      name: 'Timework Subdomain Host Routing (/ with Host: timework.sorae.tokyo)',
      path: '/',
      expectedStatus: 200,
      headers: { 'Host': 'timework.sorae.tokyo' },
      validate: (res, body) => {
        if (!body.includes('TimeWork Sora Station')) return 'Missing TimeWork heading';
        if (!body.includes('cdHours')) return 'Missing countdown hours element';
        if (!body.includes('07:00 — 23:00')) return 'Missing weekday hours';
        return null;
      }
    },
    {
      name: 'Timework Clean Route (/timework)',
      path: '/timework',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes("Khung Giờ Hoạt Động")) return "Missing Time Works heading";
        return null;
      }
    },
    {
      name: 'Pay Subdomain Host Routing (/ with Host: pay.sorae.tokyo)',
      path: '/',
      expectedStatus: 200,
      headers: { 'Host': 'payment.sorae.tokyo' },
      validate: (res, body) => {
        if (!body.includes('Thanh Toán Đơn Hàng')) return 'Missing payment title';
        if (!body.includes('TRAN DANG KHOA')) return 'Missing account holder';
        return null;
      }
    },
    {
      name: 'Pay Clean Route (/pay/SR192)',
      path: '/pay/SR192',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('Thanh Toán Đơn Hàng')) return 'Missing payment page content';
        return null;
      }
    },
    {
      name: 'Menu Subdomain Host Routing (/ with Host: menu.sorae.tokyo)',
      path: '/',
      expectedStatus: 200,
      headers: { 'Host': 'menu.sorae.tokyo' },
      validate: (res, body) => {
        if (!body.includes('Bảng giá') && !body.includes('Pade Store')) return 'Missing Menu heading or Pade Store title';
        if (!body.includes('Khám phá các sản phẩm và dịch vụ')) return 'Missing Menu subtitle';
        return null;
      }
    },
    {
      name: 'Menu Clean Route (/menu)',
      path: '/menu',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('Bảng giá') && !body.includes('Pade Store')) return 'Missing Menu heading';
        return null;
      }
    },
    {
      name: 'Payment API Status (/api/pay/status/SR192)',
      path: '/api/pay/status/SR192',
      expectedStatus: 200,
      validate: (res, body) => {
        const json = JSON.parse(body);
        if (json.ok !== true) return 'Payment API status ok must be true';
        if (json.srCode !== 'SR192') return 'Payment API srCode must match';
        return null;
      }
    },
    {
      name: 'Health API (/health)',
      path: '/health',
      expectedStatus: 200,
      validate: (res, body) => {
        const json = JSON.parse(body);
        if (json.status !== 'ok') return 'Health status not ok';
        if (!json.app) return 'Missing app name in health check';
        return null;
      }
    },

    // 1b. Discord Ticket Transcript Reverse Proxy Tests
    {
      name: 'Ticket Transcript (/tickets/transcript) - Unconfigured Backend (503 / Safe Degraded Mode)',
      path: '/tickets/transcript?user=123&id=ticket-01&token=xyz',
      expectedStatus: 503,
      before: () => {
        delete process.env.BOT_BACKEND_URL;
        delete process.env.DATABASE_URL;
      },
      validate: (res, body) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('text/html')) return 'Content-Type must be text/html';
        if (!body.includes('PADE STORE') && !body.includes('Pade Store')) return 'Must include Pade Store brand';
        if (!body.includes('Transcript')) return 'Must explain transcript status';
        if (body.includes('BOT_BACKEND_URL')) return 'Must NOT leak BOT_BACKEND_URL to customer (Spec §6)';
        return null;
      }
    },
    {
      name: 'Ticket Transcript Full Proxy Flow (/tickets/transcript?user=...&id=...&token=...)',
      path: '/tickets/transcript?user=1265702432701284395&id=ticket-sora-01&token=secret-token-ok',
      expectedStatus: 200,
      before: () => {
        process.env.BOT_BACKEND_URL = `http://127.0.0.1:${mockBotPort}`;
      },
      validate: (res, body) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('text/html')) return 'Content-Type must be text/html';
        if (!body.includes('Transcript for ticket: ticket-sora-01')) return 'Missing ticket ID in transcript body';
        if (!body.includes('user: 1265702432701284395')) return 'Missing user ID in transcript body';
        if (!body.includes('token: secret-token-ok')) return 'Missing token in transcript body';
        return null;
      }
    },
    {
      name: 'Ticket Shortlink Proxy (/t/:id?user=...&token=...)',
      path: '/t/ticket-shortlink-99?user=1265702432701284395&token=secret-token-ok',
      expectedStatus: 200,
      validate: (res, body) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('text/html')) return 'Content-Type must be text/html';
        if (!body.includes('Transcript for ticket: ticket-shortlink-99')) return 'Shortlink must forward ticket ID';
        return null;
      }
    },
    {
      name: 'Transcript Subdomain Host Routing (Host: transcript.sorae.tokyo)',
      path: '/tickets/transcript?user=1265702432701284395&id=subdomain-ticket&token=secret-token-ok',
      expectedStatus: 200,
      headers: { 'Host': 'transcript.sorae.tokyo' },
      validate: (res, body) => {
        if (!body.includes('Transcript for ticket: subdomain-ticket')) return 'Subdomain must proxy ticket transcript';
        return null;
      }
    },
    {
      name: 'Ticket Transcript Bot 403 Forbidden Preservation',
      path: '/tickets/transcript?user=123&id=ticket-01&token=forbidden-token',
      expectedStatus: 403,
      validate: (res, body) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('text/html')) return 'Content-Type must be text/html';
        if (!body.includes('403 Forbidden: Invalid Token')) return 'Must preserve 403 body from bot';
        return null;
      }
    },
    {
      name: 'Ticket Transcript Bot 404 Not Found Preservation',
      path: '/tickets/transcript?user=123&id=non-existent&token=xyz',
      expectedStatus: 404,
      validate: (res, body) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('text/html')) return 'Content-Type must be text/html';
        if (!body.includes('404 Ticket Not Found')) return 'Must preserve 404 body from bot';
        return null;
      }
    },

    // 2. Strict CSP Validation (Must NOT have 'unsafe-eval')
    {
      name: 'CSP Header Hardening',
      path: '/',
      expectedStatus: 200,
      validate: (res) => {
        const csp = res.headers['content-security-policy'] || '';
        if (!csp) return 'Missing Content-Security-Policy header';
        if (csp.includes("'unsafe-eval'")) {
          return "CRITICAL SECURITY FLAW: CSP still contains 'unsafe-eval'!";
        }
        if (!csp.includes("default-src 'self'")) return "CSP missing default-src 'self'";
        if (!csp.includes("frame-ancestors 'none'")) return "CSP missing frame-ancestors 'none'";
        return null;
      }
    },

    // 3. Cache-Control Freshness Verification
    {
      name: 'Cache-Control Validation (HTML & Assets)',
      path: '/',
      expectedStatus: 200,
      validate: (res) => {
        const cc = res.headers['cache-control'] || '';
        if (!cc.includes('must-revalidate')) {
          return 'HTML Cache-Control must require revalidation';
        }
        return null;
      }
    },

    // 4. Source Shielding & Anti-Leak Protection (Root Isolation)
    {
      name: 'Shield /server.js (Must be 403 or 404, NEVER 200)',
      path: '/server.js',
      expectedStatus: [403, 404],
      validate: (res) => {
        if (res.statusCode === 200) {
          return 'CRITICAL LEAK: /server.js returned 200! Source code is exposed!';
        }
        return null;
      }
    },
    {
      name: 'Shield /index.js',
      path: '/index.js',
      expectedStatus: [403, 404],
      validate: (res) => {
        if (res.statusCode === 200) return 'LEAK: /index.js returned 200';
        return null;
      }
    },
    {
      name: 'Shield /package.json',
      path: '/package.json',
      expectedStatus: [403, 404],
      validate: (res) => {
        if (res.statusCode === 200) return 'LEAK: /package.json returned 200';
        return null;
      }
    },
    {
      name: 'Shield /vercel.json',
      path: '/vercel.json',
      expectedStatus: [403, 404],
      validate: (res) => {
        if (res.statusCode === 200) return 'LEAK: /vercel.json returned 200';
        return null;
      }
    },
    {
      name: 'Shield /README.md',
      path: '/README.md',
      expectedStatus: [403, 404],
      validate: (res) => {
        if (res.statusCode === 200) return 'LEAK: /README.md returned 200';
        return null;
      }
    },
    {
      name: 'Shield /.git/config',
      path: '/.git/config',
      expectedStatus: 403,
      validate: (res) => {
        if (res.statusCode !== 403) return `Expected 403 for git config, got ${res.statusCode}`;
        return null;
      }
    },

    // 5. Favicon & Media Endpoints
    {
      name: 'Favicon ICO (/favicon.ico)',
      path: '/favicon.ico',
      expectedStatus: 200,
      validate: (res) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('image/x-icon') && !ct.includes('image/vnd.microsoft.icon')) {
          return `Wrong content-type for favicon.ico: ${ct}`;
        }
        return null;
      }
    },
    {
      name: 'Favicon PNG (/favicon.png)',
      path: '/favicon.png',
      expectedStatus: 200,
      validate: (res) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('image/png')) return `Wrong content-type for favicon.png: ${ct}`;
        return null;
      }
    },
    {
      name: 'Luminous Flow Asset (/assets/luminous-flow.png)',
      path: '/assets/luminous-flow.png',
      expectedStatus: 200,
      validate: (res) => {
        const cc = res.headers['cache-control'] || '';
        if (!cc.includes('stale-while-revalidate')) {
          return `Expected stale-while-revalidate cache header on assets, got: ${cc}`;
        }
        return null;
      }
    },

    // 6. Public JS Endpoints
    {
      name: 'Performance Script (/js/sora-performance-x2.js)',
      path: '/js/sora-performance-x2.js',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('SORA PERFORMANCE ENGINE')) return 'Invalid performance script content';
        return null;
      }
    },
    {
      name: 'DevTools Guard Script (/js/sora-devtools-guard.js)',
      path: '/js/sora-devtools-guard.js',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('SORA DEVTOOLS GUARD')) return 'Invalid devtools guard script content';
        return null;
      }
    },

    // 7. SEO Directives & Sitemap
    {
      name: 'Robots TXT (/robots.txt)',
      path: '/robots.txt',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('Sitemap: https://sorastation.vercel.app/sitemap.xml')) return 'Missing sitemap reference';
        return null;
      }
    },
    {
      name: 'XML Sitemap (/sitemap.xml)',
      path: '/sitemap.xml',
      expectedStatus: 200,
      validate: (res, body) => {
        if (!body.includes('<loc>https://sorastation.vercel.app/</loc>')) return 'Missing root URL in sitemap';
        if (!body.includes('<loc>https://sorastation.vercel.app/contact</loc>')) return 'Missing contact URL in sitemap';
        return null;
      }
    },

    // 8. PWA Manifest & Adaptive Audio Streams
    {
      name: 'Web App Manifest (/manifest.json)',
      path: '/manifest.json',
      expectedStatus: 200,
      validate: (res, body) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('json')) return `Expected JSON content-type for manifest, got: ${ct}`;
        if (!body.includes('Sora')) return 'Missing app name in manifest.json';
        if (!body.includes('standalone')) return 'Missing standalone display in manifest.json';
        return null;
      }
    },
    {
      name: 'Adaptive Audio Stream WebM (/music/crush.webm)',
      path: '/music/crush.webm',
      expectedStatus: 200,
      validate: (res) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('webm')) return `Expected audio/webm content-type, got: ${ct}`;
        return null;
      }
    },
    {
      name: 'Universal Audio Stream MP3 (/music/crush.mp3)',
      path: '/music/crush.mp3',
      expectedStatus: 200,
      validate: (res) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('mpeg') && !ct.includes('mp3')) return `Expected audio/mpeg content-type, got: ${ct}`;
        return null;
      }
    },
    {
      name: 'OpenGraph Rich Banner (/banner.png)',
      path: '/banner.png',
      expectedStatus: 200,
      validate: (res) => {
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('png') && !ct.includes('image')) return `Expected image/png content-type, got: ${ct}`;
        return null;
      }
    },

    // 9. Non-existent Asset 404
    {
      name: 'Missing Asset Fast 404',
      path: '/assets/non-existent-image.png',
      expectedStatus: 404,
      validate: (res, body) => {
        if (!body.includes('404')) return 'Missing 404 text in asset response';
        return null;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    if (typeof t.before === 'function') {
      t.before();
    }
    const start = Date.now();
    await new Promise((resolve) => {
      http.get({
        hostname: '127.0.0.1',
        port: testPort,
        path: t.path,
        headers: t.headers || {}
      }, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const duration = Date.now() - start;
          const expectedArr = Array.isArray(t.expectedStatus) ? t.expectedStatus : [t.expectedStatus];
          const statusMatch = expectedArr.includes(res.statusCode);

          const rawBuffer = Buffer.concat(chunks);
          let body = '';
          const encoding = res.headers['content-encoding'];
          if (encoding === 'gzip') {
            body = zlib.gunzipSync(rawBuffer).toString('utf8');
          } else if (encoding === 'deflate') {
            body = zlib.inflateSync(rawBuffer).toString('utf8');
          } else {
            body = rawBuffer.toString('utf8');
          }

          let errorMsg = null;
          if (!statusMatch) {
            errorMsg = `Status ${res.statusCode} (Expected ${expectedArr.join(' or ')})`;
          } else if (t.validate) {
            errorMsg = t.validate(res, body);
          }

          if (!errorMsg) {
            passed++;
            console.log(`  ✅ [PASS] ${t.name} (${duration}ms)`);
          } else {
            failed++;
            console.error(`  ❌ [FAIL] ${t.name}: ${errorMsg} (${duration}ms)`);
          }
          resolve();
        });
      }).on('error', (err) => {
        failed++;
        console.error(`  ❌ [FAIL] ${t.name}: Network error: ${err.message}`);
        resolve();
      });
    });
  }

  server.close(() => {
    try { mockBotServer.close(); } catch {}
    console.log(`\n======================================================`);
    console.log(` 📊 Test Results: ${passed} passed, ${failed} failed (${tests.length} total)`);
    console.log(`======================================================\n`);

    if (failed === 0) {
      console.log('🎉 ALL INTEGRATION & SECURITY TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error(`💥 ${failed} test(s) failed.\n`);
      process.exit(1);
    }
  });
});
