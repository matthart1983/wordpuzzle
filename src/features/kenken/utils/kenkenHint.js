import { getCandidates } from './kenkenValidator';

export const findNakedSingle = (grid, puzzle) => {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 0) continue;
      const cand = getCandidates(r, c, grid, puzzle);
      if (cand.length === 1) return { r, c, value: cand[0], type: 'naked-single' };
    }
  }
  return null;
};
