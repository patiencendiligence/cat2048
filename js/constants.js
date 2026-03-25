/** @type {readonly number[]} */
window.CAT2048_TILE_VALUES = Object.freeze([
  2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
]);

window.CAT2048_STORAGE_KEYS = Object.freeze({
  bestScore: 'cat2048_best',
  displayMode: 'cat2048_mode',
  /** Highest tile value ever seen (도감 / 최고 레벨 고양이) */
  unlocked: 'cat2048_unlocked_max',
});
