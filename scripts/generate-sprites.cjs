#!/usr/bin/env node
/**
 * Generates assets/cats/cat_<value>.png from js/pixel-core.js (run: npm run build-sprites)
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { buildTier, SIZE } = require('../js/pixel-core.js');

const VALUES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function parseColor(str) {
  if (!str) return [0, 0, 0, 0];
  if (str.startsWith('hsl')) {
    const m = str.match(/hsl\((\d+),\s*(\d+)%,\s*([\d.]+)%\)/);
    if (m) {
      const rgb = hslToRgb(parseInt(m[1], 10), parseInt(m[2], 10), parseFloat(m[3]));
      return [...rgb, 255];
    }
  }
  let hex = str.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length === 6) {
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), 255];
  }
  return [200, 200, 200, 255];
}

const outDir = path.join(__dirname, '..', 'assets', 'cats');
fs.mkdirSync(outDir, { recursive: true });

for (const v of VALUES) {
  const grid = buildTier(v);
  const png = new PNG({ width: SIZE, height: SIZE });
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (SIZE * y + x) << 2;
      const c = grid[y][x];
      if (!c) {
        png.data[i] = 0;
        png.data[i + 1] = 0;
        png.data[i + 2] = 0;
        png.data[i + 3] = 0;
      } else {
        const [r, g, b, a] = parseColor(c);
        png.data[i] = r;
        png.data[i + 1] = g;
        png.data[i + 2] = b;
        png.data[i + 3] = a;
      }
    }
  }
  const buf = PNG.sync.write(png);
  fs.writeFileSync(path.join(outDir, `cat_${v}.png`), buf);
  console.log('wrote', `cat_${v}.png`);
}
