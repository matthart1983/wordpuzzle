/**
 * Sudoku Logic - Supports both 4x4 (Mini) and 9x9 (Classic) Sudoku puzzles
 */

// Game constants
export const GRID_SIZES = {
  MINI: { size: 4, subgridSize: 2, maxNum: 4 },
  CLASSIC: { size: 9, subgridSize: 3, maxNum: 9 }
};

export const EMPTY_CELL = 0;

// Difficulty levels for different grid sizes
export const DIFFICULTY = {
  MINI: {
    EASY: { name: 'Easy', cellsToRemove: 6 },
    MEDIUM: { name: 'Medium', cellsToRemove: 8 },
    HARD: { name: 'Hard', cellsToRemove: 10 }
  },
  CLASSIC: {
    EASY: { name: 'Easy', cellsToRemove: 35 },
    MEDIUM: { name: 'Medium', cellsToRemove: 45 },
    HARD: { name: 'Hard', cellsToRemove: 55 }
  }
};

/**
 * Create an empty grid of specified size
 */
export const createEmptyGrid = (gridType = 'MINI') => {
  const size = GRID_SIZES[gridType].size;
  return Array(size).fill().map(() => Array(size).fill(EMPTY_CELL));
};

/**
 * Check if a number is valid in a given position
 */
export const isValidMove = (grid, row, col, num, gridType = 'MINI') => {
  const { size, subgridSize } = GRID_SIZES[gridType];
  
  // Check if number already exists in row
  for (let x = 0; x < size; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check if number already exists in column
  for (let x = 0; x < size; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check if number already exists in subgrid
  const subgridRow = Math.floor(row / subgridSize) * subgridSize;
  const subgridCol = Math.floor(col / subgridSize) * subgridSize;
  
  for (let i = 0; i < subgridSize; i++) {
    for (let j = 0; j < subgridSize; j++) {
      if (grid[subgridRow + i][subgridCol + j] === num) return false;
    }
  }

  return true;
};

/**
 * Solve sudoku using backtracking algorithm
 */
export const solveSudoku = (grid, gridType = 'MINI') => {
  const { size, maxNum } = GRID_SIZES[gridType];
  const newGrid = grid.map(row => [...row]);
  
  const solve = () => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (newGrid[row][col] === EMPTY_CELL) {
          for (let num = 1; num <= maxNum; num++) {
            if (isValidMove(newGrid, row, col, num, gridType)) {
              newGrid[row][col] = num;
              
              if (solve()) {
                return true;
              }
              
              newGrid[row][col] = EMPTY_CELL;
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  
  return solve() ? newGrid : null;
};

/**
 * Generate a complete valid sudoku grid
 */
export const generateCompleteGrid = (gridType = 'MINI') => {
  const { size, maxNum } = GRID_SIZES[gridType];
  
  // For 9x9 grids, use a more efficient approach
  if (gridType === 'CLASSIC') {
    return generateClassicGrid();
  }
  
  // Original algorithm for 4x4 grids
  const grid = createEmptyGrid(gridType);
  
  // Fill grid with valid numbers using randomization
  const fillGrid = () => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === EMPTY_CELL) {
          // Try numbers in random order
          const numbers = Array.from({length: maxNum}, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5);
          
          for (const num of numbers) {
            if (isValidMove(grid, row, col, num, gridType)) {
              grid[row][col] = num;
              
              if (fillGrid()) {
                return true;
              }
              
              grid[row][col] = EMPTY_CELL;
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  
  fillGrid();
  return grid;
};

/**
 * Generate a 9x9 classic Sudoku grid using a more efficient algorithm
 */
const generateClassicGrid = () => {
  // Start with a valid base pattern
  const baseGrid = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8]
  ];
  
  // Apply random transformations to create variety
  let grid = baseGrid.map(row => [...row]);
  
  // Randomly swap rows within same 3x3 blocks
  for (let block = 0; block < 3; block++) {
    const rows = [block * 3, block * 3 + 1, block * 3 + 2];
    for (let i = 0; i < 10; i++) {
      const row1 = rows[Math.floor(Math.random() * 3)];
      const row2 = rows[Math.floor(Math.random() * 3)];
      [grid[row1], grid[row2]] = [grid[row2], grid[row1]];
    }
  }
  
  // Randomly swap columns within same 3x3 blocks
  for (let block = 0; block < 3; block++) {
    const cols = [block * 3, block * 3 + 1, block * 3 + 2];
    for (let i = 0; i < 10; i++) {
      const col1 = cols[Math.floor(Math.random() * 3)];
      const col2 = cols[Math.floor(Math.random() * 3)];
      for (let row = 0; row < 9; row++) {
        [grid[row][col1], grid[row][col2]] = [grid[row][col2], grid[row][col1]];
      }
    }
  }
  
  // Randomly swap 3x3 row blocks
  for (let i = 0; i < 5; i++) {
    const block1 = Math.floor(Math.random() * 3);
    const block2 = Math.floor(Math.random() * 3);
    for (let row = 0; row < 3; row++) {
      [grid[block1 * 3 + row], grid[block2 * 3 + row]] = 
      [grid[block2 * 3 + row], grid[block1 * 3 + row]];
    }
  }
  
  // Randomly swap 3x3 column blocks
  for (let i = 0; i < 5; i++) {
    const block1 = Math.floor(Math.random() * 3);
    const block2 = Math.floor(Math.random() * 3);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 3; col++) {
        [grid[row][block1 * 3 + col], grid[row][block2 * 3 + col]] = 
        [grid[row][block2 * 3 + col], grid[row][block1 * 3 + col]];
      }
    }
  }
  
  return grid;
};

/**
 * Remove cells from complete grid to create puzzle
 */
export const createPuzzle = (completeGrid, difficulty, gridType = 'MINI') => {
  const { size } = GRID_SIZES[gridType];
  const puzzle = completeGrid.map(row => [...row]);
  const cellsToRemove = difficulty.cellsToRemove;
  
  // For 9x9 grids, use a simpler approach that's more reliable
  if (gridType === 'CLASSIC') {
    return createClassicPuzzle(puzzle, cellsToRemove);
  }
  
  // Use simpler approach for 4x4 grids too - the unique solution checking is too strict
  const totalCells = size * size;
  const cellIndices = Array.from({length: totalCells}, (_, i) => i);
  
  // Shuffle the cell indices
  for (let i = cellIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
  }
  
  // Remove cells randomly until we reach the target
  let removed = 0;
  for (const index of cellIndices) {
    if (removed >= cellsToRemove) break;
    
    const row = Math.floor(index / size);
    const col = index % size;
    
    if (puzzle[row][col] !== EMPTY_CELL) {
      puzzle[row][col] = EMPTY_CELL;
      removed++;
    }
  }
  
  return puzzle;
};

/**
 * Create a 9x9 puzzle using a simpler approach
 */
const createClassicPuzzle = (completeGrid, cellsToRemove) => {
  const puzzle = completeGrid.map(row => [...row]);
  const totalCells = 81;
  const cellIndices = Array.from({length: totalCells}, (_, i) => i);
  
  // Shuffle the cell indices
  for (let i = cellIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
  }
  
  // Remove cells randomly until we reach the target
  let removed = 0;
  for (const index of cellIndices) {
    if (removed >= cellsToRemove) break;
    
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    if (puzzle[row][col] !== EMPTY_CELL) {
      puzzle[row][col] = EMPTY_CELL;
      removed++;
    }
  }
  
  return puzzle;
};

/**
 * Generate a new sudoku puzzle
 */
export const generateSudokuPuzzle = (difficulty, gridType = 'MINI') => {
  const completeGrid = generateCompleteGrid(gridType);
  const puzzle = createPuzzle(completeGrid, difficulty, gridType);
  const solution = completeGrid;
  
  return {
    puzzle,
    solution,
    difficulty: difficulty.name
  };
};

/**
 * Get today's sudoku puzzle (deterministic based on date)
 */
export const getTodaysSudoku = (difficulty, gridType = 'MINI') => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Use date as seed for consistent daily puzzle
  const random = () => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Override Math.random temporarily
  const originalRandom = Math.random;
  Math.random = random;
  
  const result = generateSudokuPuzzle(difficulty, gridType);
  
  // Restore original Math.random
  Math.random = originalRandom;
  
  return result;
};

/**
 * Get a random sudoku puzzle for practice/reset mode
 */
export const getRandomSudoku = (difficulty, gridType = 'MINI') => {
  return generateSudokuPuzzle(difficulty, gridType);
};

/**
 * Check if the current grid is complete and correct
 */
export const isGridComplete = (grid, gridType = 'MINI') => {
  const { size } = GRID_SIZES[gridType];
  
  // Check if all cells are filled
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        return false;
      }
    }
  }
  
  // Check if all constraints are satisfied
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const num = grid[row][col];
      const tempGrid = grid.map(r => [...r]);
      tempGrid[row][col] = EMPTY_CELL;
      
      if (!isValidMove(tempGrid, row, col, num, gridType)) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Get possible numbers for a specific cell
 */
export const getPossibleNumbers = (grid, row, col, gridType = 'MINI') => {
  const { maxNum } = GRID_SIZES[gridType];
  
  if (grid[row][col] !== EMPTY_CELL) {
    return [];
  }
  
  const possible = [];
  for (let num = 1; num <= maxNum; num++) {
    if (isValidMove(grid, row, col, num, gridType)) {
      possible.push(num);
    }
  }
  
  return possible;
};

/**
 * Get a hint (find a cell with only one possible number)
 */
export const getHint = (grid, gridType = 'MINI') => {
  const { size } = GRID_SIZES[gridType];
  
  // Find cells with only one possible number
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        const possible = getPossibleNumbers(grid, row, col, gridType);
        if (possible.length === 1) {
          return {
            row,
            col,
            number: possible[0],
            type: 'logical'
          };
        }
      }
    }
  }
  
  // If no logical hint, find any empty cell
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        const possible = getPossibleNumbers(grid, row, col, gridType);
        if (possible.length > 0) {
          return {
            row,
            col,
            number: possible[0],
            type: 'guess'
          };
        }
      }
    }
  }
  
  return null;
};

/**
 * Validate user input for a specific cell
 */
export const validateInput = (grid, row, col, num, gridType = 'MINI') => {
  const { maxNum } = GRID_SIZES[gridType];
  
  if (num < 1 || num > maxNum) {
    return { valid: false, error: `Number must be between 1 and ${maxNum}` };
  }
  
  if (!isValidMove(grid, row, col, num, gridType)) {
    return { valid: false, error: 'Number conflicts with row, column, or box' };
  }
  
  return { valid: true };
};