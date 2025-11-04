// Samurai Sudoku Grid Generation Algorithm

import {
  GRID_SIZE,
  SUB_GRID_SIZE,
  GRID_POSITIONS,
  OVERLAP_REGIONS,
  DIFFICULTY_LEVELS,
  createInitialGameState,
  localToMasterCoordinates,
  masterToLocalCoordinates
} from './samuraiModels.js';

import {
  validateSamuraiMove,
  isPuzzleComplete
} from './samuraiValidator.js';

/**
 * Generates a complete valid Samurai Sudoku puzzle
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'expert')
 * @returns {Object} - Generated puzzle with solution and initial state
 */
export function generateSamuraiPuzzle(difficulty = 'medium') {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      // Step 1: Generate a complete solution
      const solution = generateCompleteSolution();
      
      if (!solution) {
        attempts++;
        continue;
      }
      
      // Step 2: Create puzzle by removing cells
      const puzzle = createPuzzleFromSolution(solution, difficulty);
      
      // Step 3: Verify puzzle has unique solution
      if (hasUniqueSolution(puzzle)) {
        return {
          puzzle,
          solution,
          difficulty,
          metadata: {
            generationAttempts: attempts + 1,
            cellsGiven: countFilledCells(puzzle),
            cellsToSolve: countEmptyCells(puzzle)
          }
        };
      }
      
      attempts++;
    } catch (error) {
      console.warn(`Generation attempt ${attempts + 1} failed:`, error);
      attempts++;
    }
  }
  
  throw new Error(`Failed to generate valid Samurai Sudoku after ${maxAttempts} attempts`);
}

/**
 * Generates a complete valid Samurai Sudoku solution
 * @returns {Array|null} - 21x21 grid with complete solution or null if failed
 */
function generateCompleteSolution() {
  // Initialize empty 21x21 grid
  const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
  
  // Strategy: Generate center grid first, then outer grids
  // This ensures overlap regions are consistent
  
  // Step 1: Generate center grid (most constrained due to overlaps)
  if (!fillSubGrid(grid, 'center')) {
    return null;
  }
  
  // Step 2: Generate outer grids (constrained by center overlaps)
  const outerGrids = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
  
  for (const gridId of outerGrids) {
    if (!fillSubGrid(grid, gridId)) {
      return null;
    }
  }
  
  return grid;
}

/**
 * Fills a specific sub-grid using backtracking with constraint propagation
 * @param {Array} grid - The master 21x21 grid
 * @param {string} gridId - ID of the sub-grid to fill
 * @returns {boolean} - True if successfully filled
 */
function fillSubGrid(grid, gridId) {
  const gridPosition = GRID_POSITIONS[gridId];
  const cells = [];
  
  // Collect all empty cells in this sub-grid
  for (let row = 0; row < SUB_GRID_SIZE; row++) {
    for (let col = 0; col < SUB_GRID_SIZE; col++) {
      const masterRow = gridPosition.startRow + row;
      const masterCol = gridPosition.startCol + col;
      
      if (!grid[masterRow][masterCol]) {
        cells.push([masterRow, masterCol]);
      }
    }
  }
  
  // Shuffle cells for randomization
  shuffleArray(cells);
  
  return fillCellsRecursively(grid, cells, 0);
}

/**
 * Recursive backtracking to fill cells
 * @param {Array} grid - The master grid
 * @param {Array} cells - Array of cell coordinates to fill
 * @param {number} index - Current cell index
 * @returns {boolean} - True if all cells filled successfully
 */
function fillCellsRecursively(grid, cells, index) {
  // Base case: all cells filled
  if (index >= cells.length) {
    return true;
  }
  
  const [row, col] = cells[index];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);
  
  for (const num of numbers) {
    if (validateSamuraiMove(grid, row, col, num)) {
      grid[row][col] = num;
      
      if (fillCellsRecursively(grid, cells, index + 1)) {
        return true;
      }
      
      grid[row][col] = null; // Backtrack
    }
  }
  
  return false;
}

/**
 * Creates a puzzle by removing cells from a complete solution
 * @param {Array} solution - Complete 21x21 solution grid
 * @param {string} difficulty - Difficulty level
 * @returns {Array} - Puzzle grid with some cells removed
 */
function createPuzzleFromSolution(solution, difficulty) {
  const puzzle = solution.map(row => [...row]);
  const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
  const cellsToRemove = difficultyConfig.cellsToRemove;
  
  // Get all filled cells
  const filledCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (solution[row][col] !== null) {
        filledCells.push([row, col]);
      }
    }
  }
  
  shuffleArray(filledCells);
  
  let removed = 0;
  for (const [row, col] of filledCells) {
    if (removed >= cellsToRemove) break;
    
    const originalValue = puzzle[row][col];
    puzzle[row][col] = null;
    
    // Check if puzzle still has unique solution
    if (!hasUniqueSolution(puzzle)) {
      puzzle[row][col] = originalValue; // Restore cell
    } else {
      removed++;
    }
  }
  
  return puzzle;
}

/**
 * Checks if a puzzle has a unique solution
 * @param {Array} puzzle - Partial puzzle grid
 * @returns {boolean} - True if puzzle has exactly one solution
 */
function hasUniqueSolution(puzzle) {
  const solutions = [];
  const maxSolutions = 2; // We only need to find if there are 2+ solutions
  
  const grid = puzzle.map(row => [...row]);
  
  function solve(row = 0, col = 0) {
    if (solutions.length >= maxSolutions) return; // Early exit
    
    // Find next empty cell
    while (row < GRID_SIZE) {
      while (col < GRID_SIZE && grid[row][col] !== null) {
        col++;
      }
      if (col === GRID_SIZE) {
        row++;
        col = 0;
      } else {
        break;
      }
    }
    
    // If no empty cell found, we have a solution
    if (row === GRID_SIZE) {
      solutions.push(grid.map(r => [...r]));
      return;
    }
    
    // Try numbers 1-9
    for (let num = 1; num <= 9; num++) {
      if (validateSamuraiMove(grid, row, col, num)) {
        grid[row][col] = num;
        solve(row, col + 1);
        grid[row][col] = null;
      }
    }
  }
  
  solve();
  return solutions.length === 1;
}

/**
 * Solves a Samurai Sudoku puzzle
 * @param {Array} puzzle - Partial puzzle grid
 * @returns {Array|null} - Solution grid or null if unsolvable
 */
export function solveSamuraiPuzzle(puzzle) {
  const grid = puzzle.map(row => [...row]);
  
  if (solveRecursively(grid)) {
    return grid;
  }
  
  return null;
}

/**
 * Recursive solver with optimizations
 */
function solveRecursively(grid) {
  // Find cell with minimum possible values (most constrained first)
  let bestCell = null;
  let minPossibilities = 10;
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) {
        const belongsToGrids = masterToLocalCoordinates(row, col);
        if (belongsToGrids.length === 0) continue; // Skip empty spaces
        
        const possibilities = [];
        for (let num = 1; num <= 9; num++) {
          if (validateSamuraiMove(grid, row, col, num)) {
            possibilities.push(num);
          }
        }
        
        if (possibilities.length === 0) {
          return false; // No valid moves, backtrack
        }
        
        if (possibilities.length < minPossibilities) {
          minPossibilities = possibilities.length;
          bestCell = { row, col, possibilities };
        }
      }
    }
  }
  
  // If no empty cell found, puzzle is solved
  if (!bestCell) {
    return true;
  }
  
  // Try each possibility for the most constrained cell
  for (const num of bestCell.possibilities) {
    grid[bestCell.row][bestCell.col] = num;
    
    if (solveRecursively(grid)) {
      return true;
    }
    
    grid[bestCell.row][bestCell.col] = null;
  }
  
  return false;
}

/**
 * Utility function to shuffle an array in place
 * @param {Array} array - Array to shuffle
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Counts filled cells in a grid
 * @param {Array} grid - Grid to count
 * @returns {number} - Number of filled cells
 */
function countFilledCells(grid) {
  let count = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] !== null) {
        const belongsToGrids = masterToLocalCoordinates(row, col);
        if (belongsToGrids.length > 0) {
          count++;
        }
      }
    }
  }
  return count;
}

/**
 * Counts empty cells in a grid
 * @param {Array} grid - Grid to count
 * @returns {number} - Number of empty cells
 */
function countEmptyCells(grid) {
  let count = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) {
        const belongsToGrids = masterToLocalCoordinates(row, col);
        if (belongsToGrids.length > 0) {
          count++;
        }
      }
    }
  }
  return count;
}

/**
 * Generates a hint for the current puzzle state
 * @param {Array} puzzle - Current puzzle state
 * @param {Array} solution - Complete solution
 * @returns {Object|null} - Hint object or null if no hint available
 */
export function generateHint(puzzle, solution) {
  // Find empty cells
  const emptyCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (puzzle[row][col] === null && solution[row][col] !== null) {
        emptyCells.push([row, col]);
      }
    }
  }
  
  if (emptyCells.length === 0) {
    return null; // Puzzle is complete
  }
  
  // Select a random empty cell
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  
  return {
    row,
    col,
    value: solution[row][col],
    type: 'direct', // Could be extended to include solving techniques
    explanation: `Place ${solution[row][col]} at row ${row + 1}, column ${col + 1}`
  };
}

export default {
  generateSamuraiPuzzle,
  solveSamuraiPuzzle,
  generateHint,
  hasUniqueSolution
};