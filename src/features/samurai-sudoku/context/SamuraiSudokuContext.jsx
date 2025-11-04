// Samurai Sudoku Context for React State Management

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  GRID_SIZE,
  GAME_STATES,
  CELL_STATES,
  DIFFICULTY_LEVELS,
  createInitialGameState,
  masterToLocalCoordinates
} from '../utils/samuraiModels.js';

import {
  validateSamuraiMove,
  isPuzzleComplete,
  getRelatedCells,
  findConflicts
} from '../utils/samuraiValidator.js';

import {
  generateSamuraiPuzzle
} from '../utils/samuraiGeneratorSimple.js';

import {
  generateHint
} from '../utils/samuraiGenerator.js';

import { saveHighScore } from '../../high-scores/utils/highScores.js';
import { getUserDisplayName, getUserProfile } from '../../../shared/utils/userProfile.js';

const SamuraiSudokuContext = createContext();

// Action types
const ACTIONS = {
  NEW_GAME: 'NEW_GAME',
  SET_CELL_VALUE: 'SET_CELL_VALUE',
  SELECT_CELL: 'SELECT_CELL',
  TOGGLE_NOTES: 'TOGGLE_NOTES',
  ADD_NOTE: 'ADD_NOTE',
  REMOVE_NOTE: 'REMOVE_NOTE',
  CLEAR_NOTES: 'CLEAR_NOTES',
  UNDO_MOVE: 'UNDO_MOVE',
  REDO_MOVE: 'REDO_MOVE',
  PAUSE_GAME: 'PAUSE_GAME',
  RESUME_GAME: 'RESUME_GAME',
  COMPLETE_GAME: 'COMPLETE_GAME',
  UPDATE_TIMER: 'UPDATE_TIMER',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  USE_HINT: 'USE_HINT',
  AUTO_SOLVE: 'AUTO_SOLVE',
  TOGGLE_SETTING: 'TOGGLE_SETTING',
  LOAD_GAME: 'LOAD_GAME',
  SAVE_GAME: 'SAVE_GAME'
};

// Initial state
const initialState = {
  ...createInitialGameState(),
  isGenerating: false,
  initialized: false,
  lastHint: null,
  gameId: Date.now(),
  settings: {
    showNotes: false,
    highlightSameNumbers: true,
    highlightRelatedCells: true,
    showTimer: true,
    autoSave: true
  }
};

// Reducer function
function samuraiSudokuReducer(state, action) {
  switch (action.type) {
    case ACTIONS.NEW_GAME: {
      const { puzzle, solution, difficulty, metadata } = action.payload;
      
      // Convert solution array to grid with cell objects
      const masterGrid = Array(GRID_SIZE).fill().map(() => 
        Array(GRID_SIZE).fill().map(() => ({
          value: null,
          state: CELL_STATES.EMPTY,
          notes: new Set(),
          isGiven: false,
          belongsToGrids: []
        }))
      );
      
      // Populate grid with puzzle data
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const belongsToGrids = masterToLocalCoordinates(row, col);
          if (belongsToGrids.length > 0) {
            masterGrid[row][col].belongsToGrids = belongsToGrids;
            
            if (puzzle[row][col] !== null) {
              masterGrid[row][col].value = puzzle[row][col];
              masterGrid[row][col].state = CELL_STATES.GIVEN;
              masterGrid[row][col].isGiven = true;
            }
          }
        }
      }
      
      return {
        ...state,
        masterGrid,
        solution,
        initialPuzzle: puzzle,
        difficulty,
        gameState: GAME_STATES.PLAYING,
        timer: 0,
        moves: 0,
        hintsUsed: 0,
        errors: 0,
        moveHistory: [],
        currentMoveIndex: -1,
        selectedCell: null,
        isGenerating: false,
        initialized: true,
        gameId: Date.now(), // Add unique game ID to force re-renders
        metadata
      };
    }
    
    case ACTIONS.SET_CELL_VALUE: {
      const { row, col, value } = action.payload;
      const newGrid = state.masterGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      const cell = newGrid[row][col];
      
      // Don't allow changes to given cells
      if (cell.isGiven) {
        return state;
      }
      
      // Validate move
      const isValid = value === null || validateSamuraiMove(newGrid, row, col, value);
      
      // Create move for history
      const move = {
        row,
        col,
        oldValue: cell.value,
        newValue: value,
        timestamp: Date.now()
      };
      
      // Update cell
      cell.value = value;
      cell.state = value === null ? CELL_STATES.EMPTY : 
                   isValid ? CELL_STATES.USER : CELL_STATES.ERROR;
      
      // Clear notes when value is set
      if (value !== null) {
        cell.notes.clear();
      }
      
      // Update move history
      const newHistory = state.moveHistory.slice(0, state.currentMoveIndex + 1);
      newHistory.push(move);
      
      // Check for completion
      const isComplete = isPuzzleComplete(newGrid);
      const newGameState = isComplete ? GAME_STATES.COMPLETED : state.gameState;
      
      return {
        ...state,
        masterGrid: newGrid,
        gameState: newGameState,
        moves: state.moves + 1,
        errors: isValid ? state.errors : state.errors + 1,
        moveHistory: newHistory,
        currentMoveIndex: newHistory.length - 1
      };
    }
    
    case ACTIONS.SELECT_CELL: {
      const { row, col } = action.payload;
      return {
        ...state,
        selectedCell: { row, col }
      };
    }
    
    case ACTIONS.TOGGLE_NOTES: {
      return {
        ...state,
        settings: {
          ...state.settings,
          showNotes: !state.settings.showNotes
        }
      };
    }
    
    case ACTIONS.ADD_NOTE: {
      const { row, col, note } = action.payload;
      const newGrid = state.masterGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      const cell = newGrid[row][col];
      
      if (!cell.isGiven && cell.value === null) {
        cell.notes.add(note);
      }
      
      return {
        ...state,
        masterGrid: newGrid
      };
    }
    
    case ACTIONS.REMOVE_NOTE: {
      const { row, col, note } = action.payload;
      const newGrid = state.masterGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      const cell = newGrid[row][col];
      
      cell.notes.delete(note);
      
      return {
        ...state,
        masterGrid: newGrid
      };
    }
    
    case ACTIONS.UNDO_MOVE: {
      if (state.currentMoveIndex < 0) return state;
      
      const move = state.moveHistory[state.currentMoveIndex];
      const newGrid = state.masterGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      const cell = newGrid[move.row][move.col];
      
      cell.value = move.oldValue;
      cell.state = move.oldValue === null ? CELL_STATES.EMPTY : CELL_STATES.USER;
      
      return {
        ...state,
        masterGrid: newGrid,
        currentMoveIndex: state.currentMoveIndex - 1,
        gameState: GAME_STATES.PLAYING // Resume if was completed
      };
    }
    
    case ACTIONS.REDO_MOVE: {
      if (state.currentMoveIndex >= state.moveHistory.length - 1) return state;
      
      const move = state.moveHistory[state.currentMoveIndex + 1];
      const newGrid = state.masterGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      const cell = newGrid[move.row][move.col];
      
      cell.value = move.newValue;
      cell.state = move.newValue === null ? CELL_STATES.EMPTY : CELL_STATES.USER;
      
      const isComplete = isPuzzleComplete(newGrid);
      
      return {
        ...state,
        masterGrid: newGrid,
        currentMoveIndex: state.currentMoveIndex + 1,
        gameState: isComplete ? GAME_STATES.COMPLETED : GAME_STATES.PLAYING
      };
    }
    
    case ACTIONS.USE_HINT: {
      const hint = generateHint(
        state.masterGrid.map(row => row.map(cell => cell.value)),
        state.solution
      );
      
      if (!hint) return state;
      
      const newGrid = state.masterGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      const cell = newGrid[hint.row][hint.col];
      
      cell.value = hint.value;
      cell.state = CELL_STATES.HINT;
      cell.notes.clear();
      
      return {
        ...state,
        masterGrid: newGrid,
        hintsUsed: state.hintsUsed + 1,
        lastHint: hint
      };
    }
    
    case ACTIONS.AUTO_SOLVE: {
      if (!state.solution) return state;
      
      const newGrid = state.masterGrid.map(r => r.map(c => ({ ...c, notes: new Set() })));
      
      // Fill in all empty cells with the solution
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const cell = newGrid[row][col];
          if (cell.belongsToGrids.length > 0 && !cell.isGiven && state.solution[row][col]) {
            cell.value = state.solution[row][col];
            cell.state = CELL_STATES.HINT;
            cell.notes.clear();
          }
        }
      }
      
      return {
        ...state,
        masterGrid: newGrid,
        gameState: GAME_STATES.COMPLETED,
        moves: state.moves + 1
      };
    }
    
    case ACTIONS.PAUSE_GAME: {
      return {
        ...state,
        gameState: GAME_STATES.PAUSED
      };
    }
    
    case ACTIONS.RESUME_GAME: {
      return {
        ...state,
        gameState: GAME_STATES.PLAYING
      };
    }
    
    case ACTIONS.UPDATE_TIMER: {
      return {
        ...state,
        timer: state.timer + 1
      };
    }
    
    case ACTIONS.SET_DIFFICULTY: {
      return {
        ...state,
        difficulty: action.payload
      };
    }
    
    case ACTIONS.TOGGLE_SETTING: {
      const { setting } = action.payload;
      return {
        ...state,
        settings: {
          ...state.settings,
          [setting]: !state.settings[setting]
        }
      };
    }
    
    default:
      return state;
  }
}

// Context Provider Component
export function SamuraiSudokuProvider({ children }) {
  const [state, dispatch] = useReducer(samuraiSudokuReducer, initialState);
  
  // Initialize with a new game
  useEffect(() => {
    const initializeGame = () => {
      try {
        console.log('Initializing Samurai Sudoku game...');
        const puzzleData = generateSamuraiPuzzle('medium');
        dispatch({ 
          type: ACTIONS.NEW_GAME, 
          payload: puzzleData 
        });
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };
    
    // Only initialize if not already initialized
    if (!state.initialized) {
      initializeGame();
    }
  }, [state.initialized]); // Only depend on initialized flag
  
  // Timer effect
  useEffect(() => {
    let interval;
    
    if (state.gameState === GAME_STATES.PLAYING && state.settings.showTimer) {
      interval = setInterval(() => {
        dispatch({ type: ACTIONS.UPDATE_TIMER });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.gameState, state.settings.showTimer]);
  
  // Auto-save effect
  useEffect(() => {
    if (state.settings.autoSave && state.gameState === GAME_STATES.PLAYING) {
      localStorage.setItem('samuraiSudoku_save', JSON.stringify({
        masterGrid: state.masterGrid,
        solution: state.solution,
        difficulty: state.difficulty,
        timer: state.timer,
        moves: state.moves,
        hintsUsed: state.hintsUsed,
        errors: state.errors,
        moveHistory: state.moveHistory,
        currentMoveIndex: state.currentMoveIndex
      }));
    }
  }, [state, state.settings.autoSave]);
  
  // Game completion effect
  useEffect(() => {
    if (state.gameState === GAME_STATES.COMPLETED) {
      const user = getUserProfile();
      const score = calculateScore(state);
      
      saveHighScore('samurai-sudoku', {
        score,
        time: state.timer,
        difficulty: state.difficulty,
        moves: state.moves,
        hintsUsed: state.hintsUsed,
        errors: state.errors,
        playerName: getUserDisplayName(),
        date: new Date().toISOString()
      });
    }
  }, [state.gameState]);
  
  // Action creators
  const startNewGame = useCallback((difficulty = 'medium') => {
    dispatch({ type: ACTIONS.SET_DIFFICULTY, payload: difficulty });
    
    try {
      const puzzleData = generateSamuraiPuzzle(difficulty);
      dispatch({ type: ACTIONS.NEW_GAME, payload: puzzleData });
    } catch (error) {
      console.error('Failed to generate puzzle:', error);
      // Fallback to a basic puzzle
      const basicPuzzle = {
        puzzle: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)),
        solution: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)),
        difficulty,
        metadata: { generationTime: Date.now(), cellsToSolve: 0 }
      };
      dispatch({ type: ACTIONS.NEW_GAME, payload: basicPuzzle });
    }
  }, []);
  
  const setCellValue = useCallback((row, col, value) => {
    dispatch({ type: ACTIONS.SET_CELL_VALUE, payload: { row, col, value } });
  }, []);
  
  const selectCell = useCallback((row, col) => {
    dispatch({ type: ACTIONS.SELECT_CELL, payload: { row, col } });
  }, []);
  
  const toggleNotes = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_NOTES });
  }, []);
  
  const addNote = useCallback((row, col, note) => {
    dispatch({ type: ACTIONS.ADD_NOTE, payload: { row, col, note } });
  }, []);
  
  const removeNote = useCallback((row, col, note) => {
    dispatch({ type: ACTIONS.REMOVE_NOTE, payload: { row, col, note } });
  }, []);
  
  const undoMove = useCallback(() => {
    dispatch({ type: ACTIONS.UNDO_MOVE });
  }, []);
  
  const redoMove = useCallback(() => {
    dispatch({ type: ACTIONS.REDO_MOVE });
  }, []);
  
  const useHint = useCallback(() => {
    // Check if there are any empty cells that can be hinted
    const emptyCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = state.masterGrid[row][col];
        if (cell.belongsToGrids.length > 0 && !cell.isGiven && !cell.value && state.solution[row][col]) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) {
      return false; // No hints available
    }
    
    dispatch({ type: ACTIONS.USE_HINT });
    return true;
  }, [state.masterGrid, state.solution]);
  
  const pauseGame = useCallback(() => {
    dispatch({ type: ACTIONS.PAUSE_GAME });
  }, []);
  
  const resumeGame = useCallback(() => {
    dispatch({ type: ACTIONS.RESUME_GAME });
  }, []);
  
  const autoSolve = useCallback(() => {
    dispatch({ type: ACTIONS.AUTO_SOLVE });
  }, []);
  
  const getHint = useCallback(() => {
    dispatch({ type: ACTIONS.USE_HINT });
    return true; // Return true if hint was successfully provided
  }, []);
  
  const newGame = useCallback((difficulty = 'medium') => {
    startNewGame(difficulty);
  }, []);

  const toggleSetting = useCallback((setting) => {
    dispatch({ type: ACTIONS.TOGGLE_SETTING, payload: { setting } });
  }, []);
  
  // Helper functions
  const getRelatedCellsForSelected = useCallback(() => {
    if (!state.selectedCell) return null;
    
    const { row, col } = state.selectedCell;
    const value = state.masterGrid[row][col]?.value;
    
    return getRelatedCells(row, col, value);
  }, [state.selectedCell, state.masterGrid]);
  
  const canUndo = state.currentMoveIndex >= 0;
  const canRedo = state.currentMoveIndex < state.moveHistory.length - 1;
  
  const value = {
    // State
    ...state,
    
    // Additional computed values for compatibility
    difficulty: state.difficulty,
    timer: state.timer,
    moves: state.moves,
    hintsUsed: state.hintsUsed,
    errors: state.errors,
    gameId: state.gameId,
    isGenerating: state.isGenerating || false,
    settings: state.settings,
    
    // Computed values
    canUndo,
    canRedo,
    relatedCells: getRelatedCellsForSelected(),
    conflicts: findConflicts(state.masterGrid),
    
    // Actions
    startNewGame,
    newGame,
    setCellValue,
    selectCell,
    toggleNotes,
    addNote,
    removeNote,
    undoMove,
    redoMove,
    useHint,
    getHint,
    autoSolve,
    pauseGame,
    resumeGame,
    toggleSetting
  };
  
  return (
    <SamuraiSudokuContext.Provider value={value}>
      {children}
    </SamuraiSudokuContext.Provider>
  );
}

// Custom hook to use the context
export function useSamuraiSudoku() {
  const context = useContext(SamuraiSudokuContext);
  
  if (!context) {
    throw new Error('useSamuraiSudoku must be used within a SamuraiSudokuProvider');
  }
  
  return context;
}

// Helper function to calculate score
function calculateScore(state) {
  const baseScore = 1000;
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3
  };
  
  const timeBonus = Math.max(0, 3600 - state.timer); // Bonus for completing under 1 hour
  const movesPenalty = Math.max(0, state.moves - 100) * 2;
  const hintsPenalty = state.hintsUsed * 50;
  const errorsPenalty = state.errors * 25;
  
  const score = Math.round(
    baseScore * difficultyMultiplier[state.difficulty] +
    timeBonus * 0.5 -
    movesPenalty -
    hintsPenalty -
    errorsPenalty
  );
  
  return Math.max(100, score); // Minimum score of 100
}

export default SamuraiSudokuContext;