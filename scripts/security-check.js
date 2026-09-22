/**
 * SORA ANTI-SECURITY LOCAL SCANNER
 * Scans project files for leaked secrets, API keys, and insecure code patterns
 */

const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  { name: 'Discord Bot Token', regex: /[MNO][a-zA-Z\d_-]{23,25}\.[a-zA-Z\d_-]{6}\.[a-zA-Z\d_-]{27}/ },
  { name: 'Generic API Key', regex: /(api[_-]?key|secret[_-]?key)[\s]*[=:][\s]*['"][0-9a-zA-Z]{20,}['"]/i },
  { name: 'Private Key Block', regex: /-----BEGIN (RSA|EC|DSA|OPENSSH|PRIVATE) KEY-----/ },
  { name: 'GitHub Personal Token', regex: /gh[pousr]_[0-9a-zA-Z]{36}/ }
];

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'assets'];

function scanDirectory(dir) {
  let issues = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (IGNORE_DIRS.includes(file)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      issues += scanDirectory(fullPath);
    } else if (stat.isFile() && !file.endsWith('.min.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(content)) {
          console.error(`🚨 [SECURITY ALERT] Potential ${pattern.name} found in: ${fullPath}`);
          issues++;
        }
      }
    }
  }

  return issues;
}

console.log('🔍 Starting Sora Anti-Security Local Scanner...');
const issuesFound = scanDirectory(path.join(__dirname, '..'));

if (issuesFound > 0) {
  console.error(`❌ Security scan failed! ${issuesFound} potential secret leak(s) detected.`);
  process.exit(1);
} else {
  console.log('✅ Security scan passed! No leaked secrets detected.');
}
