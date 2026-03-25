/**
 * Shared 16×16 cat pixel grid — used by sprite generator (Node) and optional tooling.
 * @returns {string[][] | null[][]} row-major hex or hsl color strings; null = transparent
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CatPixelCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function catPixelCoreFactory() {
  const SIZE = 16;

  const COL = {
    eyeTop: '#243a6e',
    eyeBot: '#7a9ee8',
  };

  function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  }

  function fillFace(g, face, ox, oy, w, h) {
    const cx = ox + w / 2;
    const cy = oy + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    for (let y = oy; y < oy + h; y++) {
      for (let x = ox; x < ox + w; x++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        if (nx * nx + ny * ny <= 1.08) g[y][x] = face;
      }
    }
  }

  function setEyes(g, eyeTop, eyeBot) {
    g[7][6] = eyeTop;
    g[8][6] = eyeBot;
    g[7][9] = eyeTop;
    g[8][9] = eyeBot;
  }

  function earsDefault(g, earOut, earInL, earInR) {
    const L = [
      [4, 2],
      [5, 2],
      [3, 3],
      [4, 3],
      [5, 3],
    ];
    const R = [
      [10, 2],
      [11, 2],
      [12, 3],
      [11, 3],
      [10, 3],
    ];
    L.forEach(([x, y]) => {
      g[y][x] = earOut;
    });
    R.forEach(([x, y]) => {
      g[y][x] = earOut;
    });
    g[3][4] = earInL;
    g[3][11] = earInR;
  }

  function addStripesV(g, stripe, base, cols) {
    for (let y = 5; y <= 10; y++) {
      cols.forEach((x) => {
        if (g[y][x] === base) g[y][x] = stripe;
      });
    }
  }

  function addStripesH(g, stripe, base, rows) {
    rows.forEach((y) => {
      for (let x = 4; x <= 11; x++) {
        if (g[y][x] === base) g[y][x] = stripe;
      }
    });
  }

  function addSpots(g, spot, base, coords) {
    coords.forEach(([x, y]) => {
      if (y >= 0 && y < SIZE && x >= 0 && x < SIZE && g[y][x] === base) g[y][x] = spot;
    });
  }

  function buildTier(value) {
    const g = emptyGrid();
    let face;
    let earOut;
    let earInL;
    let earInR;
    let eyeTop = COL.eyeTop;
    let eyeBot = COL.eyeBot;

    switch (value) {
      case 2: {
        face = '#faf8f5';
        earOut = '#8a7a70';
        earInL = '#6a5a50';
        earInR = '#f0c4c8';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        addSpots(g, '#9a8a7e', face, [
          [4, 10],
          [5, 11],
          [11, 10],
          [10, 11],
        ]);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 4: {
        face = '#f4d35e';
        earOut = '#c9a030';
        earInL = '#a07020';
        earInR = '#f8e0a0';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 8: {
        face = '#f4d35e';
        const stripe = '#d4a820';
        earOut = '#b89028';
        earInL = '#8a6020';
        earInR = '#f8e8b0';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        addStripesV(g, stripe, face, [5, 7, 9]);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 16: {
        face = '#faf8f5';
        const spot = '#e8b820';
        earOut = '#9a8a80';
        earInL = '#6a5a50';
        earInR = '#f0c4c8';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        addSpots(g, spot, face, [
          [5, 6],
          [10, 6],
          [7, 9],
          [8, 10],
          [5, 11],
          [11, 9],
        ]);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 32: {
        face = '#b8b4b0';
        earOut = '#8a8680';
        earInL = '#5a5048';
        earInR = '#d8d0d0';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 64: {
        face = '#faf8f5';
        const stripe = '#2a2a2a';
        earOut = '#5a5048';
        earInL = '#3a3028';
        earInR = '#d8c8c8';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        addStripesH(g, stripe, face, [6, 8, 10]);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 128: {
        face = '#faf8f5';
        const spot = '#1a1a1a';
        earOut = '#7a7068';
        earInL = '#4a4038';
        earInR = '#e8c0c8';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        addSpots(g, spot, face, [
          [5, 5],
          [10, 5],
          [6, 8],
          [10, 8],
          [5, 10],
          [11, 10],
          [8, 6],
        ]);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 256: {
        face = '#2a2826';
        earOut = '#1a1816';
        earInL = '#0a0806';
        earInR = '#4a3838';
        eyeTop = '#f8e880';
        eyeBot = '#f0c040';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 512: {
        face = '#f8b8d8';
        earOut = '#d080b0';
        earInL = '#a05088';
        earInR = '#ffe0f0';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        setEyes(g, COL.eyeTop, COL.eyeBot);
        break;
      }
      case 1024: {
        face = '#c8f070';
        earOut = '#88b030';
        earInL = '#508020';
        earInR = '#e8ffa8';
        fillFace(g, face, 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        setEyes(g, eyeTop, eyeBot);
        break;
      }
      case 2048: {
        earOut = '#8860c8';
        earInL = '#5030a0';
        earInR = '#f0a0ff';
        fillFace(g, '#ffffff', 3, 4, 10, 9);
        earsDefault(g, earOut, earInL, earInR);
        for (let y = 4; y <= 12; y++) {
          for (let x = 3; x <= 12; x++) {
            if (!g[y][x]) continue;
            const hue = ((x * 37 + y * 53) % 360 + 360) % 360;
            const sat = 72 + (x % 8);
            const light = 48 + (y % 6) * 3;
            g[y][x] = `hsl(${hue},${sat}%,${Math.min(68, light)}%)`;
          }
        }
        setEyes(g, '#ffffff', '#ffd0ff');
        break;
      }
      default:
        fillFace(g, '#ccc', 3, 4, 10, 9);
        setEyes(g, eyeTop, eyeBot);
    }

    return g;
  }

  return { SIZE, buildTier };
});
