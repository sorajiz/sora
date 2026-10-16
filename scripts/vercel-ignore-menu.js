#!/usr/bin/env node
const { execSync } = require('child_process');

/**
 * Vercel Ignored Build Step for pade-menu
 * Exit code 1: Changes detected in apps/menu or contracts/menu -> PROCEED WITH BUILD
 * Exit code 0: No changes detected -> SKIP BUILD
 */

try {
  const commitRange = process.env.VERCEL_GIT_COMMIT_REF || 'HEAD^';
  const diffOutput = execSync(`git diff ${commitRange} HEAD --name-only`, { encoding: 'utf8' });
  const changedFiles = diffOutput.split('\n').filter(Boolean);

  const affectsMenu = changedFiles.some(file => 
    file.startsWith('apps/menu/') || 
    file.startsWith('contracts/menu/') ||
    file.startsWith('scripts/verify-menu-contract')
  );

  if (affectsMenu) {
    console.log('[VERCEL-IGNORE]: Changes detected in apps/menu or contracts/menu. Proceeding with build.');
    process.exit(1);
  } else {
    console.log('[VERCEL-IGNORE]: No relevant changes for pade-menu. Skipping build.');
    process.exit(0);
  }
} catch (err) {
  // If git diff fails (e.g. shallow clone or initial commit), default to building
  console.log('[VERCEL-IGNORE]: Error calculating git diff. Defaulting to build. Error:', err.message);
  process.exit(1);
}
