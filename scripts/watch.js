const fs = require('fs');
const path = require('path');
const build = require('./build');

const projectRoot = path.join(__dirname, '..');
const watchTargets = [
  path.join(projectRoot, 'style.css'),
  path.join(projectRoot, '.src'),
  path.join(projectRoot, 'views')
];

let isBuilding = false;
let debounceTimer = null;
let lastBuildTime = Date.now();

async function triggerBuild(changedFile) {
  if (isBuilding) return;

  isBuilding = true;
  console.log(`\n⚡ [Auto-Watch] Change detected in: ${changedFile ? path.basename(changedFile) : 'project'}`);
  console.log('🔄 Re-compiling & inlining all website pages automatically...');

  try {
    const start = Date.now();
    await build();
    lastBuildTime = Date.now();
    console.log(`✅ [Auto-Watch] All website pages updated in ${Date.now() - start}ms!`);
  } catch (err) {
    console.error('❌ [Auto-Watch] Rebuild failed:', err);
  } finally {
    setTimeout(() => {
      isBuilding = false;
    }, 500);
  }
}

function startWatching() {
  console.log('🛡️ SORA Automatic Live-Watcher is ACTIVE');
  console.log('👀 Watching: style.css, .src/script.js, views/**/*');
  console.log('✨ Any file save will automatically recompile and inline the entire site.');

  // Initial build
  build().then(() => {
    lastBuildTime = Date.now();
    console.log('🚀 Initial stealth build ready. Waiting for edits...');
  });

  watchTargets.forEach((targetPath) => {
    if (!fs.existsSync(targetPath)) return;

    fs.watch(targetPath, { recursive: true }, (eventType, filename) => {
      if (isBuilding) return;
      if (filename && (filename.endsWith('.html') || filename.includes('.git') || filename.includes('node_modules') || filename.startsWith('.'))) {
        return;
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        triggerBuild(filename || targetPath);
      }, 300);
    });
  });
}

if (require.main === module) {
  startWatching();
}

module.exports = startWatching;
