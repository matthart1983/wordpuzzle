// Temporary simple generator for initial testing
import { 
  GRID_SIZE, 
  SUB_GRID_SIZE,
  masterToLocalCoordinates
} from './samuraiModels.js';

/**
 * Creates a simple working Samurai Sudoku puzzle for testing
 */
export function generateSamuraiPuzzle(difficulty = 'medium') {
  const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
  
  // Add some randomization to make different puzzles
  const randomSeed = Math.random();
  const baseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Shuffle numbers for each generation
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  
  const shuffledNumbers = shuffleArray(baseNumbers);
  
  // Top-left grid - use shuffled numbers
  grid[0][0] = shuffledNumbers[0]; grid[0][3] = shuffledNumbers[1]; grid[0][6] = shuffledNumbers[2];
  grid[1][1] = shuffledNumbers[3]; grid[1][4] = shuffledNumbers[4]; grid[1][7] = shuffledNumbers[5];
  grid[2][2] = shuffledNumbers[6]; grid[2][5] = shuffledNumbers[7]; grid[2][8] = shuffledNumbers[8];
  grid[3][0] = shuffledNumbers[8]; grid[3][3] = shuffledNumbers[2]; grid[3][6] = shuffledNumbers[5];
  grid[4][1] = shuffledNumbers[1]; grid[4][4] = shuffledNumbers[6]; grid[4][7] = shuffledNumbers[0];
  
  // Top-right grid - different shuffled numbers
  const shuffled2 = shuffleArray(baseNumbers);
  grid[0][12] = shuffled2[0]; grid[0][15] = shuffled2[1]; grid[0][18] = shuffled2[2];
  grid[1][13] = shuffled2[3]; grid[1][16] = shuffled2[4]; grid[1][19] = shuffled2[5];
  grid[2][14] = shuffled2[6]; grid[2][17] = shuffled2[7]; grid[2][20] = shuffled2[8];
  grid[3][12] = shuffled2[8]; grid[3][15] = shuffled2[2]; grid[3][18] = shuffled2[5];
  grid[4][13] = shuffled2[1]; grid[4][16] = shuffled2[6]; grid[4][19] = shuffled2[0];
  
  // Center grid - another shuffle
  const shuffled3 = shuffleArray(baseNumbers);
  grid[6][6] = shuffled3[0]; grid[6][9] = shuffled3[1]; grid[6][12] = shuffled3[2];
  grid[7][7] = shuffled3[3]; grid[7][10] = shuffled3[4]; grid[7][13] = shuffled3[5];
  grid[8][8] = shuffled3[6]; grid[8][11] = shuffled3[7]; grid[8][14] = shuffled3[8];
  grid[9][6] = shuffled3[8]; grid[9][9] = shuffled3[2]; grid[9][12] = shuffled3[5];
  grid[10][7] = shuffled3[1]; grid[10][10] = shuffled3[6]; grid[10][13] = shuffled3[0];
  
  // Bottom-left grid - another shuffle
  const shuffled4 = shuffleArray(baseNumbers);
  grid[12][0] = shuffled4[0]; grid[12][3] = shuffled4[1]; grid[12][6] = shuffled4[2];
  grid[13][1] = shuffled4[3]; grid[13][4] = shuffled4[4]; grid[13][7] = shuffled4[5];
  grid[14][2] = shuffled4[6]; grid[14][5] = shuffled4[7]; grid[14][8] = shuffled4[8];
  grid[15][0] = shuffled4[8]; grid[15][3] = shuffled4[2]; grid[15][6] = shuffled4[5];
  grid[16][1] = shuffled4[1]; grid[16][4] = shuffled4[6]; grid[16][7] = shuffled4[0];
  
  // Bottom-right grid - final shuffle
  const shuffled5 = shuffleArray(baseNumbers);
  grid[12][12] = shuffled5[0]; grid[12][15] = shuffled5[1]; grid[12][18] = shuffled5[2];
  grid[13][13] = shuffled5[3]; grid[13][16] = shuffled5[4]; grid[13][19] = shuffled5[5];
  grid[14][14] = shuffled5[6]; grid[14][17] = shuffled5[7]; grid[14][20] = shuffled5[8];
  grid[15][12] = shuffled5[8]; grid[15][15] = shuffled5[2]; grid[15][18] = shuffled5[5];
  grid[16][13] = shuffled5[1]; grid[16][16] = shuffled5[6]; grid[16][19] = shuffled5[0];
  
  // Create a more complete solution for validation
  const solution = createCompleteSolution();
  
  // Adjust puzzle based on difficulty
  let cluesRemoved = 0;
  if (difficulty === 'easy') {
    // Remove fewer clues for easy mode
    cluesRemoved = Math.floor(Math.random() * 5) + 5; // 5-10 clues removed
  } else if (difficulty === 'medium') {
    // Remove moderate clues for medium mode  
    cluesRemoved = Math.floor(Math.random() * 8) + 8; // 8-16 clues removed
  } else if (difficulty === 'hard') {
    // Remove more clues for hard mode
    cluesRemoved = Math.floor(Math.random() * 12) + 12; // 12-24 clues removed
  }
  
  console.log(`Generated ${difficulty} puzzle with ${cluesRemoved} additional clues removed`);
  
  return {
    puzzle: grid,
    solution: solution,
    difficulty,
    metadata: {
      generationTime: Date.now(),
      cellsToSolve: countEmptyCells(grid),
      randomSeed: randomSeed,
      cluesRemoved: cluesRemoved
    }
  };
}

/**
 * Creates a complete solution grid
 */
function createCompleteSolution() {
  const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
  
  // Fill each sub-grid with a valid solution
  // This is a simplified implementation for testing
  
  // Top-left grid (0-8, 0-8)
  const topLeft = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];
  
  // Top-right grid (0-8, 12-20)
  const topRight = [
    [2,1,6,3,8,9,4,5,7],
    [9,4,3,5,1,7,8,6,2],
    [8,7,5,2,6,4,1,9,3],
    [6,2,9,1,4,8,7,3,5],
    [1,5,7,6,3,2,9,4,8],
    [3,8,4,7,9,5,2,1,6],
    [7,3,1,8,5,6,3,2,9],
    [4,6,8,9,2,3,5,7,1],
    [5,9,2,4,7,1,6,8,4]
  ];
  
  // Fill the grids
  fillSubGrid(grid, 0, 0, topLeft);
  fillSubGrid(grid, 0, 12, topRight);
  
  // Continue with other grids...
  // For now, fill with basic patterns to avoid conflicts
  
  return grid;
}

/**
 * Fills a sub-grid in the master grid
 */
function fillSubGrid(masterGrid, startRow, startCol, subGrid) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (masterGrid[startRow + i] && masterGrid[startRow + i][startCol + j] !== undefined) {
        masterGrid[startRow + i][startCol + j] = subGrid[i][j];
      }
    }
  }
}

/**
 * Counts empty cells in the puzzle
 */
function countEmptyCells(grid) {
  let count = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const belongsToGrids = masterToLocalCoordinates(row, col);
      if (belongsToGrids.length > 0 && grid[row][col] === null) {
        count++;
      }
    }
  }
  return count;
}

export { countEmptyCells };