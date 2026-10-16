const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const assets = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'content.js',
  'background.js',
  'icon16.png',
  'icon48.png',
  'icon128.png',
];

for (const asset of assets) {
  const src = path.join(srcDir, asset);
  const dest = path.join(distDir, asset);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

console.log('[Extension Build] All static assets copied to dist.');
