// Samurai Sudoku Constants and Data Models

// Grid configuration
export const GRID_SIZE = 21;
export const SUB_GRID_SIZE = 9;
export const OVERLAP_SIZE = 3;

// Sub-grid positions in the 21x21 master grid
export const GRID_POSITIONS = {
  topLeft: { startRow: 0, startCol: 0, id: 'topLeft' },
  topRight: { startRow: 0, startCol: 12, id: 'topRight' },
  center: { startRow: 6, startCol: 6, id: 'center' },
  bottomLeft: { startRow: 12, startCol: 0, id: 'bottomLeft' },
  bottomRight: { startRow: 12, startCol: 12, id: 'bottomRight' }
};

// Overlap regions - where sub-grids share cells
export const OVERLAP_REGIONS = {
  topLeftCenter: {
    // Top-left grid (bottom-right corner) overlaps with center grid (top-left corner)
    grid1: 'topLeft',
    grid2: 'center',
    grid1Cells: generateCellRange(6, 8, 6, 8), // rows 6-8, cols 6-8 in topLeft
    grid2Cells: generateCellRange(0, 2, 0, 2)  // rows 0-2, cols 0-2 in center
  },
  topRightCenter: {
    // Top-right grid (bottom-left corner) overlaps with center grid (top-right corner)
    grid1: 'topRight',
    grid2: 'center',
    grid1Cells: generateCellRange(6, 8, 0, 2), // rows 6-8, cols 0-2 in topRight
    grid2Cells: generateCellRange(0, 2, 6, 8)  // rows 0-2, cols 6-8 in center
  },
  bottomLeftCenter: {
    // Bottom-left grid (top-right corner) overlaps with center grid (bottom-left corner)
    grid1: 'bottomLeft',
    grid2: 'center',
    grid1Cells: generateCellRange(0, 2, 6, 8), // rows 0-2, cols 6-8 in bottomLeft
    grid2Cells: generateCellRange(6, 8, 0, 2)  // rows 6-8, cols 0-2 in center
  },
  bottomRightCenter: {
    // Bottom-right grid (top-left corner) overlaps with center grid (bottom-right corner)
    grid1: 'bottomRight',
    grid2: 'center',
    grid1Cells: generateCellRange(0, 2, 0, 2), // rows 0-2, cols 0-2 in bottomRight
    grid2Cells: generateCellRange(6, 8, 6, 8)  // rows 6-8, cols 6-8 in center
  }
};

// Helper function to generate cell coordinate ranges
function generateCellRange(startRow, endRow, startCol, endCol) {
  const cells = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cells.push([row, col]);
    }
  }
  return cells;
}

// Convert local grid coordinates to master grid coordinates
export function localToMasterCoordinates(gridId, localRow, localCol) {
  const gridPosition = GRID_POSITIONS[gridId];
  return {
    row: gridPosition.startRow + localRow,
    col: gridPosition.startCol + localCol
  };
}

// Convert master grid coordinates to local grid coordinates
export function masterToLocalCoordinates(masterRow, masterCol) {
  const grids = [];
  
  for (const [gridId, position] of Object.entries(GRID_POSITIONS)) {
    const localRow = masterRow - position.startRow;
    const localCol = masterCol - position.startCol;
    
    // Check if coordinates fall within this sub-grid
    if (localRow >= 0 && localRow < SUB_GRID_SIZE && 
        localCol >= 0 && localCol < SUB_GRID_SIZE) {
      grids.push({
        gridId,
        localRow,
        localCol
      });
    }
  }
  
  return grids;
}

// Check if a cell is in an overlap region
export function isOverlapCell(masterRow, masterCol) {
  for (const overlapRegion of Object.values(OVERLAP_REGIONS)) {
    const { grid1, grid2 } = overlapRegion;
    const grid1Pos = GRID_POSITIONS[grid1];
    const grid2Pos = GRID_POSITIONS[grid2];
    
    // Check if cell belongs to this overlap region
    const inGrid1 = masterRow >= grid1Pos.startRow && 
                   masterRow < grid1Pos.startRow + SUB_GRID_SIZE &&
                   masterCol >= grid1Pos.startCol && 
                   masterCol < grid1Pos.startCol + SUB_GRID_SIZE;
                   
    const inGrid2 = masterRow >= grid2Pos.startRow && 
                   masterRow < grid2Pos.startRow + SUB_GRID_SIZE &&
                   masterCol >= grid2Pos.startCol && 
                   masterCol < grid2Pos.startCol + SUB_GRID_SIZE;
    
    if (inGrid1 && inGrid2) {
      return overlapRegion;
    }
  }
  
  return null;
}

// Get all cells that are not part of any grid (empty spaces in cross pattern)
export function getEmptySpaceCells() {
  const emptyCells = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const belongsToGrid = masterToLocalCoordinates(row, col).length > 0;
      if (!belongsToGrid) {
        emptyCells.push([row, col]);
      }
    }
  }
  
  return emptyCells;
}

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Easy',
    cellsToRemove: 120, // Leave ~250 cells filled
    description: 'Good for beginners'
  },
  medium: {
    name: 'Medium', 
    cellsToRemove: 150, // Leave ~220 cells filled
    description: 'Moderate challenge'
  },
  hard: {
    name: 'Hard',
    cellsToRemove: 180, // Leave ~190 cells filled
    description: 'For experienced solvers'
  },
  expert: {
    name: 'Expert',
    cellsToRemove: 210, // Leave ~160 cells filled
    description: 'Ultimate challenge'
  }
};

// Game states
export const GAME_STATES = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Cell states
export const CELL_STATES = {
  EMPTY: null,
  GIVEN: 'given',      // Pre-filled cell from puzzle
  USER: 'user',        // User-entered value
  HINT: 'hint',        // Value filled by hint system
  ERROR: 'error',      // Invalid user entry
  HIGHLIGHT: 'highlight' // Currently selected or related
};

// Initial game state structure
export const createInitialGameState = () => ({
  // 21x21 master grid
  masterGrid: Array(GRID_SIZE).fill().map(() => 
    Array(GRID_SIZE).fill().map(() => ({
      value: null,
      state: CELL_STATES.EMPTY,
      notes: new Set(),
      isGiven: false,
      belongsToGrids: []
    }))
  ),
  
  // Solution grid
  solution: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)),
  
  // Initial puzzle state for reset
  initialPuzzle: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)),
  
  // Game metadata
  selectedCell: null,
  gameState: GAME_STATES.PLAYING,
  status: 'playing',
  difficulty: 'medium',
  timer: 0,
  gameTime: 0,
  moveHistory: [],
  currentMoveIndex: -1,
  
  // Statistics
  moves: 0,
  totalMoves: 0,
  hintsUsed: 0,
  errors: 0,
  mistakes: 0,
  score: 0,
  cellsCompleted: 0,
  
  // UI state
  showNotes: false,
  highlightSameNumbers: true,
  highlightRelatedCells: true
});

export default {
  GRID_SIZE,
  SUB_GRID_SIZE,
  OVERLAP_SIZE,
  GRID_POSITIONS,
  OVERLAP_REGIONS,
  DIFFICULTY_LEVELS,
  GAME_STATES,
  CELL_STATES,
  localToMasterCoordinates,
  masterToLocalCoordinates,
  isOverlapCell,
  getEmptySpaceCells,
  createInitialGameState
};