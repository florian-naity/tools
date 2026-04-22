// Copies large vendor assets from node_modules into public/vendor/ so they are
// served from our own domain (no external CDN requests, better GDPR posture).
// Runs automatically via the "postinstall" npm script after every `npm install`.

import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

function copy(src, dest) {
  copyFileSync(join(root, src), join(root, dest));
  console.log(`  copied ${src} → ${dest}`);
}

// ── Tesseract.js worker ──────────────────────────────────────────────────────
console.log('Copying Tesseract.js vendor files…');
copy(
  'node_modules/tesseract.js/dist/worker.min.js',
  'public/vendor/tesseract-worker.min.js',
);

// ── Tesseract.js WASM core (all variants — worker picks the right one at runtime)
const coreDir = join(root, 'public/vendor/tesseract-core');
mkdirSync(coreDir, { recursive: true });

const srcCore = join(root, 'node_modules/tesseract.js-core');
for (const file of readdirSync(srcCore)) {
  copy(`node_modules/tesseract.js-core/${file}`, `public/vendor/tesseract-core/${file}`);
}

console.log('Done.');
