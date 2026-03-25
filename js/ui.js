(function () {
  const VALUES = window.CAT2048_TILE_VALUES;
  const { tileUrl, tileBackground, tierLabel } = window.Cat2048Cats;
  const { playMergeWithMeow } = window.Cat2048Sounds;

  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const bestCatEl = document.getElementById('best-cat');
  const overlayEl = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayMsg = document.getElementById('overlay-msg');
  const btnNew = document.getElementById('btn-new');
  const btnTry = document.getElementById('btn-try-again');
  const btnContinue = document.getElementById('btn-continue');
  const modeToggle = document.getElementById('mode-toggle');
  const btnCollection = document.getElementById('btn-collection');
  const collectionEl = document.getElementById('collection');
  const btnCloseCollection = document.getElementById('btn-close-collection');

  let game = new window.Game2048();
  /** @type {'cat'|'number'} */
  let displayMode = 'cat';

  function loadMode() {
    try {
      const m = localStorage.getItem(window.CAT2048_STORAGE_KEYS.displayMode);
      displayMode = m === 'number' ? 'number' : 'cat';
    } catch {
      displayMode = 'cat';
    }
    modeToggle.checked = displayMode === 'number';
    document.body.classList.toggle('mode-number', displayMode === 'number');
  }

  function saveMode() {
    try {
      localStorage.setItem(window.CAT2048_STORAGE_KEYS.displayMode, displayMode);
    } catch {
      /* ignore */
    }
  }

  modeToggle.addEventListener('change', () => {
    displayMode = modeToggle.checked ? 'number' : 'cat';
    document.body.classList.toggle('mode-number', displayMode === 'number');
    saveMode();
    render();
  });

  function formatBestCat(maxVal) {
    if (!maxVal || maxVal < 2) return '—';
    return `${maxVal} · ${tierLabel(maxVal)}`;
  }

  function renderTile(cell, r, c) {
    if (!cell) {
      const empty = document.createElement('div');
      empty.className = 'grid-cell';
      empty.dataset.r = String(r);
      empty.dataset.c = String(c);
      return empty;
    }

    const wrap = document.createElement('div');
    wrap.className = 'grid-cell';
    wrap.dataset.r = String(r);
    wrap.dataset.c = String(c);

    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.value = String(cell.value);
    if (cell.value === 2048 && displayMode === 'cat') tile.classList.add('tile--rainbow');
    if (cell.merged) tile.classList.add('tile--pop');
    tile.style.setProperty('--tile-bg', tileBackground(cell.value));

    const url = tileUrl(cell.value);
    if (displayMode === 'cat' && url) {
      tile.style.backgroundImage = `url('${url}')`;
    } else {
      tile.style.backgroundImage = 'none';
    }

    const inner = document.createElement('div');
    inner.className = 'tile-inner';

    if (displayMode === 'cat') {
      const num = document.createElement('span');
      num.className = 'tile-number tile-number--ghost';
      num.textContent = String(cell.value);
      inner.appendChild(num);
    } else {
      const num = document.createElement('span');
      num.className = 'tile-number';
      num.textContent = String(cell.value);
      inner.appendChild(num);
      const mini = document.createElement('img');
      mini.className = 'tile-mini-img';
      mini.src = url;
      mini.alt = '';
      mini.width = 48;
      mini.height = 48;
      inner.appendChild(mini);
    }

    tile.appendChild(inner);
    wrap.appendChild(tile);

    if (cell.merged) {
      requestAnimationFrame(() => {
        tile.classList.add('tile--pop-active');
      });
    }

    return wrap;
  }

  function render() {
    const run = () => {
      boardEl.innerHTML = '';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          boardEl.appendChild(renderTile(game.grid[r][c], r, c));
        }
      }
      scoreEl.textContent = String(game.score);
      bestEl.textContent = String(game.best);
      if (bestCatEl) {
        bestCatEl.textContent = formatBestCat(game.getUnlockedMax());
      }

      const showOverlay = game.over || (game.won && !game.wonDismissed);
      overlayEl.hidden = !showOverlay;
      if (game.over) {
        overlayTitle.textContent = 'Game over';
        overlayMsg.textContent = '더 이상 움직일 수 없어요. 다시 도전!';
        btnTry.hidden = false;
        btnContinue.hidden = true;
      } else if (game.won && !game.wonDismissed) {
        overlayTitle.textContent = '프리즘 고양이!';
        overlayMsg.textContent = '2048을 만들었어요. 계속할까요?';
        btnTry.hidden = true;
        btnContinue.hidden = false;
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(run);
    } else {
      run();
    }
  }

  game.wonDismissed = false;

  function doMove(dir) {
    const { moved, mergedMax } = game.move(dir);
    if (!moved) return;
    if (mergedMax > 0) playMergeWithMeow(mergedMax);
    render();
    requestAnimationFrame(() => {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const cell = game.grid[r][c];
          if (cell && cell.merged) delete cell.merged;
        }
      }
    });
  }

  function bindKeys() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      const tag = e.target && e.target.tagName;
      if (tag && ['INPUT', 'TEXTAREA'].includes(tag)) return;
      if (k === 'arrowup' || k === 'w') {
        e.preventDefault();
        doMove('up');
      } else if (k === 'arrowdown' || k === 's') {
        e.preventDefault();
        doMove('down');
      } else if (k === 'arrowleft' || k === 'a') {
        e.preventDefault();
        doMove('left');
      } else if (k === 'arrowright' || k === 'd') {
        e.preventDefault();
        doMove('right');
      }
    });
  }

  let touchStart = null;
  boardEl.addEventListener(
    'touchstart',
    (e) => {
      const t = e.changedTouches[0];
      touchStart = { x: t.clientX, y: t.clientY };
    },
    { passive: true }
  );
  boardEl.addEventListener(
    'touchend',
    (e) => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      const abs = Math.max(Math.abs(dx), Math.abs(dy));
      if (abs < 24) {
        touchStart = null;
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        doMove(dx > 0 ? 'right' : 'left');
      } else {
        doMove(dy > 0 ? 'down' : 'up');
      }
      touchStart = null;
    },
    { passive: true }
  );

  /** 모바일: 보드 위 스와이프가 페이지 스크롤·당겨서 새로고침·가장자리 뒤로가기로 이어지지 않도록 */
  function bindMobileTouchGuards() {
    document.addEventListener(
      'touchmove',
      (e) => {
        const el = e.target;
        if (!el || !el.closest) return;
        if (el.closest('#board')) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  }
  bindMobileTouchGuards();

  btnNew.addEventListener('click', () => {
    game = new window.Game2048();
    game.wonDismissed = false;
    render();
  });

  btnTry.addEventListener('click', () => {
    game = new window.Game2048();
    game.wonDismissed = false;
    render();
  });

  btnContinue.addEventListener('click', () => {
    game.wonDismissed = true;
    overlayEl.hidden = true;
  });

  function renderCollection() {
    const grid = document.getElementById('collection-grid');
    grid.innerHTML = '';
    const unlocked = game.getUnlockedMax();
    VALUES.forEach((v) => {
      const card = document.createElement('div');
      const isUnlocked = unlocked >= v;
      const src = tileUrl(v);
      card.className = `collection-card${isUnlocked ? '' : ' collection-card--locked'}`;
      card.innerHTML = `
        <div class="collection-cat">${
          isUnlocked
            ? `<img class="collection-cat-img" src="${src}" width="96" height="96" alt="" />`
            : '<div class="collection-lock">🔒</div>'
        }</div>
        <div class="collection-meta">
          <strong>${v}</strong>
          <span>${tierLabel(v)}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  btnCollection.addEventListener('click', () => {
    renderCollection();
    collectionEl.hidden = false;
  });

  btnCloseCollection.addEventListener('click', () => {
    collectionEl.hidden = true;
  });

  collectionEl.addEventListener('click', (e) => {
    if (e.target === collectionEl) collectionEl.hidden = true;
  });

  loadMode();
  bindKeys();
  render();
})();
