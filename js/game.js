/**
 * @typedef {{ value: number, id: string, merged?: boolean }} TileCell
 */
(function (global) {
  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function emptyGrid() {
    return [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.map((c) => (c ? { ...c } : null)));
  }

  class Game2048 {
    constructor() {
      this.size = 4;
      this.grid = emptyGrid();
      this.score = 0;
      this.best = 0;
      this.won = false;
      this.over = false;
      this.maxMergedThisMove = 0;
      this.loadBest();
      this.spawn();
      this.spawn();
    }

    loadBest() {
      try {
        const v = localStorage.getItem(window.CAT2048_STORAGE_KEYS.bestScore);
        this.best = v ? parseInt(v, 10) || 0 : 0;
      } catch {
        this.best = 0;
      }
    }

    saveBest() {
      try {
        if (this.score > this.best) {
          this.best = this.score;
          localStorage.setItem(window.CAT2048_STORAGE_KEYS.bestScore, String(this.best));
        }
      } catch {
        /* ignore */
      }
    }

    recordUnlock(value) {
      try {
        const k = window.CAT2048_STORAGE_KEYS.unlocked;
        const prev = parseInt(localStorage.getItem(k) || '0', 10) || 0;
        if (value > prev) localStorage.setItem(k, String(value));
      } catch {
        /* ignore */
      }
    }

    getUnlockedMax() {
      try {
        return parseInt(localStorage.getItem(window.CAT2048_STORAGE_KEYS.unlocked) || '0', 10) || 0;
      } catch {
        return 0;
      }
    }

    /** @returns {TileCell | null} */
    spawn() {
      const empty = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!this.grid[r][c]) empty.push([r, c]);
        }
      }
      if (empty.length === 0) return null;
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      const cell = { value, id: uid() };
      this.grid[r][c] = cell;
      this.recordUnlock(value);
      return cell;
    }

    /**
     * @param {'up'|'down'|'left'|'right'} dir
     * @returns {{ moved: boolean, mergedMax: number }}
     */
    move(dir) {
      if (this.over) return { moved: false, mergedMax: 0 };

      this.maxMergedThisMove = 0;
      const prev = cloneGrid(this.grid);
      let moved = false;

      const mergeLine = (line) => {
        const nums = line.filter(Boolean);
        const out = [];
        let i = 0;
        while (i < nums.length) {
          if (i + 1 < nums.length && nums[i].value === nums[i + 1].value) {
            const v = nums[i].value * 2;
            const merged = {
              value: v,
              id: uid(),
              merged: true,
            };
            out.push(merged);
            this.score += v;
            this.maxMergedThisMove = Math.max(this.maxMergedThisMove, v);
            if (v === 2048) this.won = true;
            this.recordUnlock(v);
            i += 2;
          } else {
            out.push({ ...nums[i], id: nums[i].id, merged: false });
            i += 1;
          }
        }
        while (out.length < 4) out.push(null);
        return out;
      };

      if (dir === 'left') {
        for (let r = 0; r < 4; r++) {
          const line = mergeLine(this.grid[r]);
          for (let c = 0; c < 4; c++) {
            if (JSON.stringify(prev[r][c]) !== JSON.stringify(line[c])) moved = true;
            this.grid[r][c] = line[c];
          }
        }
      } else if (dir === 'right') {
        for (let r = 0; r < 4; r++) {
          const line = mergeLine([...this.grid[r]].reverse()).reverse();
          for (let c = 0; c < 4; c++) {
            if (JSON.stringify(prev[r][c]) !== JSON.stringify(line[c])) moved = true;
            this.grid[r][c] = line[c];
          }
        }
      } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
          const col = [0, 1, 2, 3].map((r) => this.grid[r][c]);
          const line = mergeLine(col);
          for (let r = 0; r < 4; r++) {
            if (JSON.stringify(prev[r][c]) !== JSON.stringify(line[r])) moved = true;
            this.grid[r][c] = line[r];
          }
        }
      } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
          const col = [3, 2, 1, 0].map((r) => this.grid[r][c]);
          const merged = mergeLine(col);
          for (let r = 0; r < 4; r++) {
            if (JSON.stringify(prev[r][c]) !== JSON.stringify(merged[r])) moved = true;
            this.grid[3 - r][c] = merged[r];
          }
        }
      }

      if (moved) {
        this.saveBest();
        this.spawn();
        if (!this.canMove()) this.over = true;
      }

      return { moved, mergedMax: this.maxMergedThisMove };
    }

    canMove() {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!this.grid[r][c]) return true;
          const v = this.grid[r][c].value;
          if (c < 3 && this.grid[r][c + 1] && this.grid[r][c + 1].value === v) return true;
          if (r < 3 && this.grid[r + 1][c] && this.grid[r + 1][c].value === v) return true;
        }
      }
      return false;
    }

    reset() {
      this.grid = emptyGrid();
      this.score = 0;
      this.won = false;
      this.over = false;
      this.maxMergedThisMove = 0;
      this.spawn();
      this.spawn();
    }
  }

  global.Game2048 = Game2048;
})(typeof window !== 'undefined' ? window : globalThis);
