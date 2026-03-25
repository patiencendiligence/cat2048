/**
 * Derives cat_4 … cat_2048 from assets/cats/cat_2.png (user-edited base).
 * Does not overwrite cat_2.png.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CAT2 = path.join(ROOT, 'assets/cats/cat_2.png');
const OUT_DIR = path.join(ROOT, 'assets/cats');

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r;
  let g;
  let b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

async function loadBase() {
  const buf = fs.readFileSync(CAT2);
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}

function svgBuffer(svg) {
  return Buffer.from(svg);
}

async function writePng(name, pipeline) {
  const out = path.join(OUT_DIR, name);
  await pipeline.toFile(out);
  console.log('wrote', name);
}

async function main() {
  if (!fs.existsSync(CAT2)) {
    console.error('Missing', CAT2);
    process.exit(1);
  }

  const { buf, width: w, height: h } = await loadBase();

  const stripeV = svgBuffer(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="v" width="36" height="100%" patternUnits="userSpaceOnUse">
      <rect width="14" height="100%" fill="rgba(120,80,0,0.42)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);

  const stripeH = svgBuffer(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="h" width="100%" height="28" patternUnits="userSpaceOnUse">
      <rect width="100%" height="10" fill="rgba(20,20,20,0.5)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#h)"/>
</svg>`);

  const spotsYellow = svgBuffer(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${Math.round(w * 0.28)}" cy="${Math.round(h * 0.35)}" r="12" fill="rgba(200,150,20,0.55)"/>
  <circle cx="${Math.round(w * 0.72)}" cy="${Math.round(h * 0.38)}" r="10" fill="rgba(210,160,30,0.5)"/>
  <circle cx="${Math.round(w * 0.5)}" cy="${Math.round(h * 0.62)}" r="14" fill="rgba(190,140,25,0.48)"/>
  <circle cx="${Math.round(w * 0.35)}" cy="${Math.round(h * 0.72)}" r="8" fill="rgba(200,145,20,0.5)"/>
</svg>`);

  const spotsBlack = svgBuffer(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${Math.round(w * 0.3)}" cy="${Math.round(h * 0.34)}" r="9" fill="rgba(15,15,15,0.55)"/>
  <circle cx="${Math.round(w * 0.68)}" cy="${Math.round(h * 0.36)}" r="8" fill="rgba(20,20,20,0.5)"/>
  <circle cx="${Math.round(w * 0.52)}" cy="${Math.round(h * 0.58)}" r="11" fill="rgba(10,10,10,0.52)"/>
  <circle cx="${Math.round(w * 0.4)}" cy="${Math.round(h * 0.7)}" r="7" fill="rgba(25,25,25,0.48)"/>
  <circle cx="${Math.round(w * 0.75)}" cy="${Math.round(h * 0.65)}" r="6" fill="rgba(18,18,18,0.5)"/>
</svg>`);

  // 4 — butter / yellow
  await writePng(
    'cat_4.png',
    sharp(buf)
      .ensureAlpha()
      .modulate({ saturation: 1.15, brightness: 1.06, hue: 42 })
      .tint({ r: 255, g: 218, b: 120 })
  );

  // 8 — yellow + vertical stripes (from cat_4-like tone)
  const yellowBase = await sharp(buf)
    .ensureAlpha()
    .modulate({ saturation: 1.12, brightness: 1.05, hue: 40 })
    .tint({ r: 255, g: 215, b: 110 })
    .toBuffer();

  await writePng(
    'cat_8.png',
    sharp(yellowBase).composite([{ input: await sharp(stripeV).png().toBuffer(), blend: 'multiply' }])
  );

  // 16 — white-ish + yellow spots
  await writePng(
    'cat_16.png',
    sharp(buf)
      .ensureAlpha()
      .modulate({ saturation: 0.92, brightness: 1.05 })
      .composite([{ input: await sharp(spotsYellow).png().toBuffer(), blend: 'multiply' }])
  );

  // 32 — gray
  await writePng('cat_32.png', sharp(buf).ensureAlpha().grayscale().modulate({ brightness: 1.02, saturation: 0 }));

  // 64 — white + black horizontal stripes
  await writePng(
    'cat_64.png',
    sharp(buf)
      .ensureAlpha()
      .modulate({ saturation: 0.88, brightness: 1.04 })
      .composite([{ input: await sharp(stripeH).png().toBuffer(), blend: 'multiply' }])
  );

  // 128 — white + black spots
  await writePng(
    'cat_128.png',
    sharp(buf)
      .ensureAlpha()
      .modulate({ saturation: 0.9, brightness: 1.03 })
      .composite([{ input: await sharp(spotsBlack).png().toBuffer(), blend: 'multiply' }])
  );

  // 256 — dark / void
  await writePng(
    'cat_256.png',
    sharp(buf).ensureAlpha().grayscale().modulate({ brightness: 0.32, saturation: 0.45 }).tint({ r: 40, g: 38, b: 44 })
  );

  // 512 — pink
  await writePng(
    'cat_512.png',
    sharp(buf).ensureAlpha().modulate({ saturation: 1.1, brightness: 1.05 }).tint({ r: 255, g: 190, b: 220 })
  );

  // 1024 — lime
  await writePng(
    'cat_1024.png',
    sharp(buf).ensureAlpha().modulate({ saturation: 1.2, brightness: 1.04, hue: 85 }).tint({ r: 200, g: 240, b: 120 })
  );

  // 2048 — rainbow (per-pixel hue from coordinates)
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const px = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = px[i + 3];
      if (a < 8) continue;
      let [hr, hg, hb] = [px[i], px[i + 1], px[i + 2]];
      let [H, S, L] = rgbToHsl(hr, hg, hb);
      H = (x * 2.1 + y * 2.7 + (x * y) / (width + height)) % 360;
      S = Math.min(92, S * 1.08 + 8);
      L = Math.min(78, Math.max(22, L));
      const [nr, ng, nb] = hslToRgb(H, S, L);
      px[i] = nr;
      px[i + 1] = ng;
      px[i + 2] = nb;
    }
  }
  await writePng(
    'cat_2048.png',
    sharp(Buffer.from(px), {
      raw: { width, height, channels: 4 },
    }).png()
  );

  console.log('Done (cat_2.png unchanged).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
