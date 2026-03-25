(function (global) {
  let ctx;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  }

  /** Short merge blip — tier scales with value */
  function playMerge(mergedValue) {
    const c = getCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();

    const idx = Math.log2(mergedValue) - 1;
    const base = 220 + idx * 35;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = idx > 8 ? 'square' : 'sine';
    osc.frequency.value = Math.min(880, base);
    g.gain.value = 0.05;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.11);
  }

  /**
   * “Meow” — pitch & length scale with tier (higher = slightly richer).
   * @param {number} mergedValue 2, 4, … 2048
   */
  function playMeow(mergedValue) {
    const c = getCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();

    const idx = Math.min(10, Math.max(0, Math.log2(mergedValue) - 1));
    const t0 = c.currentTime;
    const dur = 0.12 + idx * 0.018;
    const fStart = 520 + idx * 55;
    const fEnd = 280 + idx * 25;

    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(fStart, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(120, fEnd), t0 + dur);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);

    if (mergedValue >= 512) {
      const osc2 = c.createOscillator();
      const g2 = c.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(fStart * 1.6, t0 + 0.03);
      osc2.frequency.exponentialRampToValueAtTime(fEnd * 1.4, t0 + dur * 0.8);
      g2.gain.setValueAtTime(0.0001, t0 + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.04, t0 + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc2.connect(g2);
      g2.connect(c.destination);
      osc2.start(t0 + 0.03);
      osc2.stop(t0 + dur + 0.05);
    }
  }

  function playMergeWithMeow(mergedValue) {
    playMerge(mergedValue);
    playMeow(mergedValue);
  }

  global.Cat2048Sounds = {
    playMerge,
    playMeow,
    playMergeWithMeow,
  };
})(typeof window !== 'undefined' ? window : globalThis);
