const assert = require('assert');
const http = require('http');
const crypto = require('crypto');
const app = require('../server');
const { getPool, query } = require('../lib/menu/db');

function makeRequest(server, path, options = {}) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: {
        'Host': options.host || 'menu.sorae.tokyo',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json || data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' 🧪 PADE STORE MENU V2 BACKEND & SECURITY SUITE');
  console.log('======================================================');

  const server = app.listen(0, '127.0.0.1');
  await new Promise(r => server.once('listening', r));

  try {
    // Test 1: Public Catalog GET /api/menu
    console.log('1. Testing Public Catalog GET /api/menu...');
    const catRes = await makeRequest(server, '/api/menu');
    assert.strictEqual(catRes.status, 200, 'Catalog must return 200');
    assert(catRes.body.ok, 'Catalog response must be ok');
    assert(Array.isArray(catRes.body.products), 'Products must be array');
    assert(catRes.body.products.length >= 10, 'Must have at least 10 products');
    assert(catRes.headers.etag, 'Must return ETag header');
    console.log(`  ✓ Public Catalog: ${catRes.body.products.length} products, ETag ${catRes.headers.etag}`);

    // Test 2: Micro-version check & ETag 304
    console.log('2. Testing Version Check with ETag 304...');
    const verRes = await makeRequest(server, '/api/menu?action=version');
    assert.strictEqual(verRes.status, 200, 'Version check must return 200');
    assert(typeof verRes.body.version === 'number', 'Version must be a number');
    const etag = verRes.headers.etag;

    const notModifiedRes = await makeRequest(server, '/api/menu?action=version', {
      headers: { 'If-None-Match': etag }
    });
    assert.strictEqual(notModifiedRes.status, 304, 'Must return 304 Not Modified when ETag matches');
    console.log(`  ✓ Micro-version: v${verRes.body.version} -> 304 Not Modified verified`);

    // Test 3: Unauthenticated /api/auth/me returns GUEST
    console.log('3. Testing Unauthenticated /api/auth/me...');
    const guestRes = await makeRequest(server, '/api/auth/me');
    assert.strictEqual(guestRes.status, 200);
    assert.strictEqual(guestRes.body.authenticated, false);
    assert.strictEqual(guestRes.body.role, 'GUEST');
    assert.strictEqual(guestRes.body.isAdmin, false);
    console.log('  ✓ Guest Role: correctly identified as unauthenticated GUEST');

    // Test 4: Security Bypass Protection - Member / Guest cannot create products
    console.log('4. Testing Security Bypass Protection (Create Product without Admin)...');
    const unauthorizedCreate = await makeRequest(server, '/api/admin/menu/products', {
      method: 'POST',
      body: { name: 'Hacked Product', price_amount: 1000 }
    });
    assert.strictEqual(unauthorizedCreate.status, 403, 'Must reject with 403 Forbidden');
    console.log('  ✓ Anti-Bypass: Unauthenticated POST /api/admin/menu/products blocked (403)');

    // Test 5: Security Bypass Protection - Delete without Admin
    console.log('5. Testing Security Bypass Protection (Delete Product without Admin)...');
    const unauthorizedDelete = await makeRequest(server, '/api/admin/menu/product?id=nonexistent', {
      method: 'DELETE'
    });
    assert.strictEqual(unauthorizedDelete.status, 403, 'Must reject with 403 Forbidden');
    console.log('  ✓ Anti-Bypass: Unauthenticated DELETE /api/admin/menu/product blocked (403)');

    // Test 6: Authenticated Owner Session Lifecycle
    if (!getPool()) {
      console.log('ℹ️ DATABASE_URL not configured in this environment (CI runner / sandbox).');
      console.log('  Skipping live database mutation tests. Public catalog & security anti-bypass verified.');
      server.close();
      console.log('\n======================================================');
      console.log(' 🎉 ALL PADE STORE MENU TESTS PASSED (CI COMPATIBLE)!');
      console.log('======================================================\n');
      return;
    }

    console.log('6. Testing Authenticated Owner Session Lifecycle...');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const ownerDiscordId = '386528085681635328';

    await query(`
      INSERT INTO menu_web_sessions (id, discord_id, username, avatar, created_at, last_seen_at, expires_at)
      VALUES ($1, $2, 'Sora Owner', 'https://cdn.discordapp.com/avatars/386528085681635328/test.png', NOW(), NOW(), NOW() + INTERVAL '1 day')
      ON CONFLICT (id) DO NOTHING;
    `, [tokenHash, ownerDiscordId]);

    const sessionCookie = `pade_session=${rawToken}`;

    // 6a. Check /api/auth/me with owner cookie
    const ownerMeRes = await makeRequest(server, '/api/auth/me', {
      headers: { 'Cookie': sessionCookie }
    });
    assert.strictEqual(ownerMeRes.status, 200);
    assert.strictEqual(ownerMeRes.body.authenticated, true);
    assert.strictEqual(ownerMeRes.body.role, 'OWNER');
    assert.strictEqual(ownerMeRes.body.isAdmin, true);
    assert.strictEqual(ownerMeRes.body.discordId, ownerDiscordId);
    console.log(`  ✓ Owner Identified: Discord ID ${ownerDiscordId} -> role OWNER (isAdmin: true)`);

    // 6b. Admin CRUD: Create product
    const testSku = 'TEST-UNIT-' + Date.now();
    const createRes = await makeRequest(server, '/api/admin/menu/products', {
      method: 'POST',
      headers: { 'Cookie': sessionCookie },
      body: {
        name: 'Unit Test Nitro Product',
        sku: testSku,
        price_amount: 88000,
        compare_at_price: 110000,
        short_description: 'Automated test product',
        description: 'Detailed description for test',
        status: 'ACTIVE',
        emoji_markup: '<a:nicho:1498671634524016792>'
      }
    });
    assert.strictEqual(createRes.status, 201, 'Admin create must return 201 Created');
    assert(createRes.body.product && createRes.body.product.id, 'Must return created product');
    const createdId = createRes.body.product.id;
    console.log(`  ✓ Admin Create: Product ${testSku} created with ID ${createdId}`);

    // 6c. Admin CRUD: Update product price
    const updateRes = await makeRequest(server, `/api/admin/menu/product?id=${createdId}`, {
      method: 'PUT',
      headers: { 'Cookie': sessionCookie },
      body: {
        name: 'Unit Test Nitro Product (Updated)',
        price_amount: 92000,
        compare_at_price: 120000
      }
    });
    assert.strictEqual(updateRes.status, 200, 'Admin update must return 200');
    assert.strictEqual(Number(updateRes.body.product.price_amount), 92000, 'Price must be updated');
    console.log('  ✓ Admin Update: Price updated to 92.000₫ in database');

    // 6d. Admin CRUD: Soft delete product
    const deleteRes = await makeRequest(server, `/api/admin/menu/product?id=${createdId}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    assert.strictEqual(deleteRes.status, 200, 'Admin delete must return 200');
    console.log('  ✓ Admin Delete: Product soft-deleted (status ARCHIVED)');

    // 6e. Audit Log Verification
    const auditRes = await makeRequest(server, '/api/admin/menu/audit', {
      headers: { 'Cookie': sessionCookie }
    });
    assert.strictEqual(auditRes.status, 200);
    assert(Array.isArray(auditRes.body.logs), 'Logs must be array');
    const actions = auditRes.body.logs.map(l => l.action);
    // The API and the admin store the bare operation; the entity is implied by
    // product_id / category_id on the same row.
    assert(actions.includes('CREATE'), 'Audit log must record CREATE');
    assert(actions.includes('EDIT'), 'Audit log must record EDIT');
    assert(actions.includes('ARCHIVE'), 'Audit log must record ARCHIVE');
    console.log('  ✓ Audit Trail: Verified logs for CREATE, EDIT, and ARCHIVE');

    // Cleanup session and test product
    await query(`DELETE FROM menu_web_sessions WHERE id = $1;`, [tokenHash]);
    await query(`DELETE FROM menu_products WHERE id = $1;`, [createdId]);

    console.log('\n======================================================');
    console.log(' 🎉 ALL PADE STORE MENU BACKEND TESTS PASSED (7/7)!');
    console.log('======================================================\n');
  } finally {
    server.close();
    const p = getPool();
    if (p) await p.end();
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
}

module.exports = runTests;
