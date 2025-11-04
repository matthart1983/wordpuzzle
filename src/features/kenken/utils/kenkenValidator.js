// Validation helpers for KenKen

export const rowValues = (r, grid) => grid[r].filter(v => v !== 0);
export const colValues = (c, grid) => grid.map(row => row[c]).filter(v => v !== 0);

const unique = (arr) => new Set(arr).size === arr.length;

const cageSatisfied = (cage, grid) => {
  const vals = cage.cells.map(([r,c]) => grid[r][c]).filter(v => v !== 0);
  // If any cell empty, partial check: ensure no impossible state
  if (vals.length === 0) return true;

  const full = cage.cells.map(([r,c]) => grid[r][c]).every(v => v !== 0);
  const target = cage.target;
  const op = cage.op; // undefined for singletons

  if (!op) {
    // singleton must match value when full
    return full ? vals[0] === target : (vals[0] <= target);
  }

  if (op === '+') {
    const sum = vals.reduce((a,b)=>a+b,0);
    if (!full) return sum <= target; // partial sum must not exceed
    return sum === target;
  }

  if (op === '×' || op === 'x' || op === '*') {
    const prod = vals.reduce((a,b)=>a*b,1);
    if (!full) return prod <= target; // rough check
    return prod === target;
  }

  if (op === '-' && cage.cells.length === 2) {
    if (!full) return true; // can't validate yet
    const [a,b] = cage.cells.map(([r,c]) => grid[r][c]);
    return Math.abs(a - b) === target;
  }

  if (op === '÷' || op === '/' && cage.cells.length === 2) {
    if (!full) return true;
    const [a,b] = cage.cells.map(([r,c]) => grid[r][c]);
    const big = Math.max(a,b), small = Math.min(a,b);
    return small !== 0 && big % small === 0 && (big / small) === target;
  }

  return true;
};

export const computeConflicts = (grid, puzzle) => {
  const size = grid.length;
  const conflicts = new Set();

  // Row/Column duplicates
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (!v) continue;
      // row dup
      for (let cc = 0; cc < size; cc++) {
        if (cc !== c && grid[r][cc] === v) {
          conflicts.add(`${r},${c}`);
          conflicts.add(`${r},${cc}`);
        }
      }
      // col dup
      for (let rr = 0; rr < size; rr++) {
        if (rr !== r && grid[rr][c] === v) {
          conflicts.add(`${r},${c}`);
          conflicts.add(`${rr},${c}`);
        }
      }
    }
  }

  // Cage violations
  for (const cage of puzzle.cages) {
    if (!cageSatisfied(cage, grid)) {
      for (const [r,c] of cage.cells) {
        conflicts.add(`${r},${c}`);
      }
    }
  }

  return conflicts;
};

export const getCandidates = (r, c, grid, puzzle) => {
  if (grid[r][c] !== 0) return [];
  const size = grid.length;
  const rowSet = new Set(rowValues(r, grid));
  const colSet = new Set(colValues(c, grid));

  // Determine cage of (r,c)
  const cage = puzzle.cages.find(cg => cg.cells.some(([rr,cc]) => rr===r && cc===c));
  const candidates = [];
  for (let n = 1; n <= size; n++) {
    if (rowSet.has(n) || colSet.has(n)) continue;
    // Tentatively place and test cage constraint (partial ok)
    const g = grid.map(row => [...row]);
    g[r][c] = n;
    if (cageSatisfied(cage, g)) {
      candidates.push(n);
    }
  }
  return candidates;
};

export const isSolved = (grid, puzzle) => {
  const size = grid.length;
  // All filled
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) return false;
    }
  }
  // Rows/Cols unique
  for (let r = 0; r < size; r++) if (!unique(grid[r])) return false;
  for (let c = 0; c < size; c++) {
    const col = grid.map(row => row[c]);
    if (!unique(col)) return false;
  }
  // Cages ok
  for (const cage of puzzle.cages) if (!cageSatisfied(cage, grid)) return false;
  return true;
};
