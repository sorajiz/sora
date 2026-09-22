const fs = require('fs');
const path = require('path');
const terser = require('terser');
const JavaScriptObfuscator = require('javascript-obfuscator');

const projectRoot = path.join(__dirname, '..');
const srcScriptPath = path.join(projectRoot, '.src', 'script.js');
const securityShieldPath = path.join(projectRoot, '.src', 'security-shield.js');

async function obfuscate() {
  console.log('🔒 Building High-Performance Secure Client Script (No-Eval CSP Compliant)...');

  if (!fs.existsSync(srcScriptPath)) {
    throw new Error(`Source script not found: ${srcScriptPath}`);
  }

  // 1. Read components (Silent Stealth Shield + Sora App Runtime)
  const securityShield = fs.existsSync(securityShieldPath) ? fs.readFileSync(securityShieldPath, 'utf8') : '';
  const appScript = fs.readFileSync(srcScriptPath, 'utf8');

  // Wrap inside standard IIFE
  const unifiedSource = `
(function() {
  "use strict";
  ${securityShield}
  ;
  ${appScript}
})();
  `;

  // 2. Pre-minify with Terser
  const terserResult = await terser.minify(unifiedSource, {
    compress: {
      drop_console: false,
      drop_debugger: false,
      passes: 2
    },
    mangle: true,
    format: { comments: false }
  });

  if (terserResult.error) {
    throw terserResult.error;
  }

  // 3. AST Hardening with fixed seed for 100% reproducible builds
  // NOTE: debugProtection & selfDefending are FALSE to guarantee 0ms main thread lock & strict CSP compliance!
  console.log('🛡️ Running High-Speed AST Obfuscation (Eval-free, deterministic reproducible seed)...');
  const obfResult = JavaScriptObfuscator.obfuscate(terserResult.code, {
    seed: 1337, // Fixed seed for 100% deterministic build reproducibility
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    numbersToExpressions: true,
    selfDefending: false,
    splitStrings: true,
    splitStringsChunkLength: 4,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayThreshold: 0.85,
    transformObjectKeys: true
  });

  const finalCode = obfResult.getObfuscatedCode();
  console.log(`✨ Obfuscated Bundle Size: ${(finalCode.length / 1024).toFixed(1)} KB (Reproducible AST - No dynamic eval)`);

  return finalCode;
}

if (require.main === module) {
  obfuscate().then(() => {
    console.log('Obfuscation test complete.');
  }).catch(err => {
    console.error('Obfuscation error:', err);
    process.exit(1);
  });
}

module.exports = obfuscate;
