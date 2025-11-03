/**
 * Sudoku Mini Logic - 4x4 Sudoku puzzle generation and validation
 * Uses numbers 1-4 with 2x2 subgrids
 */

// Game constants
export const GRID_SIZE = 4;
export const SUBGRID_SIZE = 2;
export const EMPTY_CELL = 0;

// Difficulty levels
export const DIFFICULTY = {
  EASY: { name: 'Easy', cellsToRemove: 6 },
  MEDIUM: { name: 'Medium', cellsToRemove: 8 },
  HARD: { name: 'Hard', cellsToRemove: 10 }
};

/**
 * Create an empty 4x4 grid
 */
export const createEmptyGrid = () => {
  return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
};

/**
 * Check if a number is valid in a given position
 */
export const isValidMove = (grid, row, col, num) => {
  // Check if number already exists in row
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check if number already exists in column
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check if number already exists in 2x2 subgrid
  const subgridRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
  const subgridCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;
  
  for (let i = 0; i < SUBGRID_SIZE; i++) {
    for (let j = 0; j < SUBGRID_SIZE; j++) {
      if (grid[subgridRow + i][subgridCol + j] === num) return false;
    }
  }

  return true;
};

/**
 * Solve sudoku using backtracking algorithm
 */
export const solveSudoku = (grid) => {
  const newGrid = grid.map(row => [...row]);
  
  const solve = () => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col] === EMPTY_CELL) {
          for (let num = 1; num <= GRID_SIZE; num++) {
            if (isValidMove(newGrid, row, col, num)) {
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
export const generateCompleteGrid = () => {
  const grid = createEmptyGrid();
  
  // Fill grid with valid numbers using randomization
  const fillGrid = () => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === EMPTY_CELL) {
          // Try numbers 1-4 in random order
          const numbers = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
          
          for (const num of numbers) {
            if (isValidMove(grid, row, col, num)) {
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
 * Remove cells from complete grid to create puzzle
 */
export const createPuzzle = (completeGrid, difficulty = DIFFICULTY.MEDIUM) => {
  const puzzle = completeGrid.map(row => [...row]);
  const cellsToRemove = difficulty.cellsToRemove;
  
  let removed = 0;
  const attempts = 50; // Prevent infinite loop
  let attemptCount = 0;
  
  while (removed < cellsToRemove && attemptCount < attempts) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    
    if (puzzle[row][col] !== EMPTY_CELL) {
      const backup = puzzle[row][col];
      puzzle[row][col] = EMPTY_CELL;
      
      // Ensure puzzle still has unique solution
      const testGrid = puzzle.map(row => [...row]);
      const solution = solveSudoku(testGrid);
      
      if (solution) {
        removed++;
      } else {
        // Restore cell if no unique solution
        puzzle[row][col] = backup;
      }
    }
    attemptCount++;
  }
  
  return puzzle;
};

/**
 * Generate a new sudoku puzzle
 */
export const generateSudokuPuzzle = (difficulty = DIFFICULTY.MEDIUM) => {
  const completeGrid = generateCompleteGrid();
  const puzzle = createPuzzle(completeGrid, difficulty);
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
export const getTodaysSudoku = (difficulty = DIFFICULTY.MEDIUM) => {
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
  
  const result = generateSudokuPuzzle(difficulty);
  
  // Restore original Math.random
  Math.random = originalRandom;
  
  return result;
};

/**
 * Get a random sudoku puzzle for practice/reset mode
 */
export const getRandomSudoku = (difficulty = DIFFICULTY.MEDIUM) => {
  return generateSudokuPuzzle(difficulty);
};

/**
 * Check if the current grid is complete and correct
 */
export const isGridComplete = (grid) => {
  // Check if all cells are filled
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        return false;
      }
    }
  }
  
  // Check if all constraints are satisfied
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const num = grid[row][col];
      const tempGrid = grid.map(r => [...r]);
      tempGrid[row][col] = EMPTY_CELL;
      
      if (!isValidMove(tempGrid, row, col, num)) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Get possible numbers for a specific cell
 */
export const getPossibleNumbers = (grid, row, col) => {
  if (grid[row][col] !== EMPTY_CELL) {
    return [];
  }
  
  const possible = [];
  for (let num = 1; num <= GRID_SIZE; num++) {
    if (isValidMove(grid, row, col, num)) {
      possible.push(num);
    }
  }
  
  return possible;
};

/**
 * Get a hint (find a cell with only one possible number)
 */
export const getHint = (grid) => {
  // Find cells with only one possible number
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        const possible = getPossibleNumbers(grid, row, col);
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
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        const possible = getPossibleNumbers(grid, row, col);
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
export const validateInput = (grid, row, col, num) => {
  if (num < 1 || num > GRID_SIZE) {
    return { valid: false, error: 'Number must be between 1 and 4' };
  }
  
  if (!isValidMove(grid, row, col, num)) {
    return { valid: false, error: 'Number conflicts with row, column, or 2x2 box' };
  }
  
  return { valid: true };
};