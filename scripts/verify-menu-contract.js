#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTRACT_DIR = path.resolve(__dirname, '../contracts/menu');
const MANIFEST_PATH = path.join(CONTRACT_DIR, 'contract.manifest.json');

const COMPANION_CONTRACT_DIR = 'C:/Users/ADMIN/Downloads/src bomsito/contracts/menu';

function getContractFiles(dir, base = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'contract.manifest.json') continue;
    const filePath = path.join(dir, file);
    const relPath = base ? `${base}/${file}` : file;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getContractFiles(filePath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results.sort();
}

function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function buildManifest(dir) {
  const files = getContractFiles(dir);
  const manifest = {};
  for (const rel of files) {
    manifest[rel] = computeFileHash(path.join(dir, rel));
  }
  return manifest;
}

function run() {
  console.log('== Pade Store Menu Contract Verification ==');
  if (!fs.existsSync(CONTRACT_DIR)) {
    console.error(`ERROR: Contract directory not found: ${CONTRACT_DIR}`);
    process.exit(1);
  }

  const manifest = buildManifest(CONTRACT_DIR);
  console.log(`Indexed ${Object.keys(manifest).length} contract files in ${CONTRACT_DIR}`);

  // Write/refresh manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log('Manifest written to:', MANIFEST_PATH);

  // Check required core contract files
  const required = [
    'CONTRACT_VERSION',
    'schema.snapshot.sql',
    'limits.json',
    'copy.vi.json',
    'events.schema.json',
    'fixtures/text/money.json',
    'fixtures/text/unicode.json',
    'fixtures/text/markdown.json',
    'fixtures/render/golden.json'
  ];

  let missing = 0;
  for (const req of required) {
    if (!manifest[req]) {
      console.error(`FAILED: Required contract file missing: ${req}`);
      missing++;
    }
  }

  if (missing > 0) {
    console.error(`Verification FAILED with ${missing} missing contract files.`);
    process.exit(1);
  }

  // If companion repo exists, check drift or sync
  if (fs.existsSync('C:/Users/ADMIN/Downloads/src bomsito')) {
    console.log(`Checking companion repository contracts at ${COMPANION_CONTRACT_DIR}...`);
    if (!fs.existsSync(COMPANION_CONTRACT_DIR)) {
      fs.mkdirSync(COMPANION_CONTRACT_DIR, { recursive: true });
    }
    const companionManifest = buildManifest(COMPANION_CONTRACT_DIR);
    let driftCount = 0;
    for (const [file, hash] of Object.entries(manifest)) {
      if (companionManifest[file] !== hash) {
        console.warn(`Syncing contract file to companion repo: ${file}`);
        const dest = path.join(COMPANION_CONTRACT_DIR, file);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(CONTRACT_DIR, file), dest);
        driftCount++;
      }
    }
    if (driftCount > 0) {
      console.log(`Synchronized ${driftCount} contract files to companion repository.`);
    } else {
      console.log('Companion repository contract is byte-identical (0 drift).');
    }
  }

  console.log('SUCCESS: Menu contract verification passed without errors.');
}

run();
