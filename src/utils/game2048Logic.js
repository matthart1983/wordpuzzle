/**
 * 2048 Game Logic - Grid movement, tile merging, and game state management
 */

// Game constants
export const GRID_SIZE = 4;
export const WIN_TILE = 2048;
export const INITIAL_TILES = 2;

// Game states
export const GAME_STATES = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

// Movement directions
export const DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

/**
 * Create an empty 4x4 grid
 */
export const createEmptyGrid = () => {
  return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
};

/**
 * Get all empty cells in the grid
 */
export const getEmptyCells = (grid) => {
  if (!grid || !Array.isArray(grid) || grid.length !== GRID_SIZE) {
    console.error('Invalid grid passed to getEmptyCells:', grid);
    return [];
  }
  
  const emptyCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    if (!grid[row] || !Array.isArray(grid[row]) || grid[row].length !== GRID_SIZE) {
      console.error(`Invalid row ${row} in grid:`, grid[row]);
      continue;
    }
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
};

/**
 * Add a random tile (2 or 4) to an empty cell
 * Returns { grid, newTilePosition } where newTilePosition is { row, col } of the new tile
 */
export const addRandomTile = (grid) => {
  if (!grid || !Array.isArray(grid)) {
    console.error('Invalid grid passed to addRandomTile:', grid);
    return { grid: createEmptyGrid(), newTilePosition: null };
  }
  
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) {
    return { grid, newTilePosition: null };
  }
  
  const newGrid = grid.map(row => [...row]);
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const randomCell = emptyCells[randomIndex];
  const value = Math.random() < 0.9 ? 2 : 4; // 90% chance for 2, 10% for 4
  
  newGrid[randomCell.row][randomCell.col] = value;
  
  return { 
    grid: newGrid, 
    newTilePosition: { row: randomCell.row, col: randomCell.col } 
  };
};

/**
 * Initialize a new game grid with starting tiles
 */
export const initializeGrid = () => {
  let grid = createEmptyGrid();
  
  // Add initial tiles
  for (let i = 0; i < INITIAL_TILES; i++) {
    const result = addRandomTile(grid);
    grid = result.grid;
  }
  
  return grid;
};

/**
 * Move and merge tiles in a single row/column
 */
const moveAndMergeArray = (array) => {
  // Filter out zeros and move tiles to the left
  let filtered = array.filter(val => val !== 0);
  let merged = [];
  let score = 0;
  let i = 0;
  
  while (i < filtered.length) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      // Merge identical adjacent tiles
      const mergedValue = filtered[i] * 2;
      merged.push(mergedValue);
      score += mergedValue;
      i += 2; // Skip the next tile as it's been merged
    } else {
      // No merge, just move the tile
      merged.push(filtered[i]);
      i++;
    }
  }
  
  // Fill the rest with zeros
  while (merged.length < GRID_SIZE) {
    merged.push(0);
  }
  
  return { array: merged, score };
};

/**
 * Move tiles in the specified direction
 */
export const moveTiles = (grid, direction) => {
  let newGrid = grid.map(row => [...row]);
  let totalScore = 0;
  let moved = false;
  
  switch (direction) {
    case DIRECTIONS.LEFT:
      for (let row = 0; row < GRID_SIZE; row++) {
        const result = moveAndMergeArray(newGrid[row]);
        if (JSON.stringify(result.array) !== JSON.stringify(newGrid[row])) {
          moved = true;
        }
        newGrid[row] = result.array;
        totalScore += result.score;
      }
      break;
      
    case DIRECTIONS.RIGHT:
      for (let row = 0; row < GRID_SIZE; row++) {
        const reversed = [...newGrid[row]].reverse();
        const result = moveAndMergeArray(reversed);
        const finalRow = result.array.reverse();
        if (JSON.stringify(finalRow) !== JSON.stringify(newGrid[row])) {
          moved = true;
        }
        newGrid[row] = finalRow;
        totalScore += result.score;
      }
      break;
      
    case DIRECTIONS.UP:
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        for (let row = 0; row < GRID_SIZE; row++) {
          column.push(newGrid[row][col]);
        }
        const result = moveAndMergeArray(column);
        const originalColumn = grid.map(row => row[col]);
        if (JSON.stringify(result.array) !== JSON.stringify(originalColumn)) {
          moved = true;
        }
        for (let row = 0; row < GRID_SIZE; row++) {
          newGrid[row][col] = result.array[row];
        }
        totalScore += result.score;
      }
      break;
      
    case DIRECTIONS.DOWN:
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        for (let row = 0; row < GRID_SIZE; row++) {
          column.push(newGrid[row][col]);
        }
        const reversed = [...column].reverse();
        const result = moveAndMergeArray(reversed);
        const finalColumn = result.array.reverse();
        const originalColumn = grid.map(row => row[col]);
        if (JSON.stringify(finalColumn) !== JSON.stringify(originalColumn)) {
          moved = true;
        }
        for (let row = 0; row < GRID_SIZE; row++) {
          newGrid[row][col] = finalColumn[row];
        }
        totalScore += result.score;
      }
      break;
  }
  
  return { grid: newGrid, score: totalScore, moved };
};

/**
 * Check if the player has won (reached 2048)
 */
export const hasWon = (grid) => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] >= WIN_TILE) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Check if any moves are possible
 */
export const canMove = (grid) => {
  // Check for empty cells
  if (getEmptyCells(grid).length > 0) {
    return true;
  }
  
  // Check for possible merges (horizontal and vertical)
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = grid[row][col];
      
      // Check right neighbor
      if (col < GRID_SIZE - 1 && current === grid[row][col + 1]) {
        return true;
      }
      
      // Check bottom neighbor
      if (row < GRID_SIZE - 1 && current === grid[row + 1][col]) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Get game state based on current grid
 */
export const getGameState = (grid, hasWonBefore = false) => {
  if (hasWon(grid) && !hasWonBefore) {
    return GAME_STATES.WON;
  }
  
  if (!canMove(grid)) {
    return GAME_STATES.LOST;
  }
  
  return GAME_STATES.PLAYING;
};

/**
 * Calculate the highest tile value
 */
export const getHighestTile = (grid) => {
  let highest = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      highest = Math.max(highest, grid[row][col]);
    }
  }
  return highest;
};

/**
 * Format score with commas
 */
export const formatScore = (score) => {
  return score.toLocaleString();
};

/**
 * Get tile color based on value
 */
export const getTileColor = (value) => {
  const colors = {
    0: { bg: '#cdc1b4', text: '#776e65' },
    2: { bg: '#eee4da', text: '#776e65' },
    4: { bg: '#ede0c8', text: '#776e65' },
    8: { bg: '#f2b179', text: '#f9f6f2' },
    16: { bg: '#f59563', text: '#f9f6f2' },
    32: { bg: '#f67c5f', text: '#f9f6f2' },
    64: { bg: '#f65e3b', text: '#f9f6f2' },
    128: { bg: '#edcf72', text: '#f9f6f2' },
    256: { bg: '#edcc61', text: '#f9f6f2' },
    512: { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' }
  };
  
  return colors[value] || { bg: '#3c3a32', text: '#f9f6f2' };
};

/**
 * Check if a move in the given direction is possible
 */
export const canMoveInDirection = (grid, direction) => {
  const result = moveTiles(grid, direction);
  return result.moved;
};

/**
 * Get all possible moves
 */
export const getPossibleMoves = (grid) => {
  const moves = [];
  
  Object.values(DIRECTIONS).forEach(direction => {
    if (canMoveInDirection(grid, direction)) {
      moves.push(direction);
    }
  });
  
  return moves;
};

/**
 * Get hint for best move (simple heuristic)
 */
export const getHint = (grid) => {
  const possibleMoves = getPossibleMoves(grid);
  
  if (possibleMoves.length === 0) {
    return null;
  }
  
  // Simple heuristic: prefer moves that create the most merges
  let bestMove = possibleMoves[0];
  let bestScore = 0;
  
  possibleMoves.forEach(direction => {
    const result = moveTiles(grid, direction);
    if (result.score > bestScore) {
      bestScore = result.score;
      bestMove = direction;
    }
  });
  
  return {
    direction: bestMove,
    expectedScore: bestScore
  };
};

/**
 * Generate a unique game ID based on date for daily challenges
 */
export const getDailyGameSeed = () => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

/**
 * Get today's challenge grid (deterministic based on date)
 */
export const getTodaysChallenge = () => {
  const seed = getDailyGameSeed();
  
  // Use date as seed for consistent daily puzzle
  const seededRandom = () => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Override Math.random temporarily
  const originalRandom = Math.random;
  Math.random = seededRandom;
  
  const grid = initializeGrid();
  
  // Restore original Math.random
  Math.random = originalRandom;
  
  return grid;
};

/**
 * Deep clone a grid
 */
export const cloneGrid = (grid) => {
  return grid.map(row => [...row]);
};