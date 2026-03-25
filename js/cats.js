/**
 * Sprite paths — generated via `npm run build-sprites` (see scripts/generate-sprites.cjs).
 */
(function (global) {
  /** @type {Readonly<Record<number, string>>} */
  const TILE_MAP = Object.freeze({
    2: 'assets/cats/cat_2.png',
    4: 'assets/cats/cat_4.png',
    8: 'assets/cats/cat_8.png',
    16: 'assets/cats/cat_16.png',
    32: 'assets/cats/cat_32.png',
    64: 'assets/cats/cat_64.png',
    128: 'assets/cats/cat_128.png',
    256: 'assets/cats/cat_256.png',
    512: 'assets/cats/cat_512.png',
    1024: 'assets/cats/cat_1024.png',
    2048: 'assets/cats/cat_2048.png',
  });

  function tileUrl(value) {
    return TILE_MAP[value] || '';
  }

  function tileBackground(value) {
    const map = {
      2: '#f3ebe0',
      4: '#fff3d4',
      8: '#ffe8a8',
      16: '#fff8ec',
      32: '#e8e6e4',
      64: '#f0ebe6',
      128: '#faf6f0',
      256: '#4a4540',
      512: '#ffe8f2',
      1024: '#eefad8',
      2048: '#f0e8ff',
    };
    return map[value] || '#ece8e4';
  }

  function tierLabel(value) {
    const labels = {
      2: 'Snow',
      4: 'Butter',
      8: 'Tiger',
      16: 'Leopard',
      32: 'Ash',
      64: 'Zebra',
      128: 'Ink Spot',
      256: 'Void',
      512: 'Sakura',
      1024: 'Lime',
      2048: 'Prism',
    };
    return labels[value] || String(value);
  }

  global.CAT2048_TILE_MAP = TILE_MAP;
  global.Cat2048Cats = {
    TILE_MAP,
    tileUrl,
    tileBackground,
    tierLabel,
  };
})(typeof window !== 'undefined' ? window : globalThis);
