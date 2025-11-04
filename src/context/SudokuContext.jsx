import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getTodaysSudoku,
  getRandomSudoku,
  isGridComplete,
  validateInput,
  getHint,
  DIFFICULTY,
  GRID_SIZES,
  EMPTY_CELL,
  createEmptyGrid
} from '../utils/sudokuLogic';
import { saveHighScore, recordGameAttempt } from '../utils/highScores';
import { getUserDisplayName, getUserProfile } from '../utils/userProfile';

// Game states
export const GAME_STATES = {
  PLAYING: 'playing',
  WON: 'won',
  PAUSED: 'paused'
};

// Action types
const ACTIONS = {
  SET_CELL: 'SET_CELL',
  CLEAR_CELL: 'CLEAR_CELL',
  NEW_GAME: 'NEW_GAME',
  RESET_GAME: 'RESET_GAME',
  USE_HINT: 'USE_HINT',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  SET_GRID_TYPE: 'SET_GRID_TYPE',
  PAUSE_GAME: 'PAUSE_GAME',
  RESUME_GAME: 'RESUME_GAME',
  INCREMENT_TIME: 'INCREMENT_TIME',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SELECTED_CELL: 'SET_SELECTED_CELL'
};

// Initial state
const initialState = {
  // Game grid state
  puzzle: createEmptyGrid('MINI'),
  currentGrid: createEmptyGrid('MINI'),
  solution: createEmptyGrid('MINI'),
  
  // Game configuration
  gridType: 'MINI', // 'MINI' for 4x4, 'CLASSIC' for 9x9
  gameState: GAME_STATES.PLAYING,
  difficulty: DIFFICULTY.MINI.MEDIUM,
  
  // Game tracking
  startTime: null,
  elapsedTime: 0,
  hintsUsed: 0,
  mistakes: 0,
  scoreSaved: false, // Flag to prevent duplicate score saves
  
  // UI state
  selectedCell: null,
  errorMessage: '',
  showErrors: true,
  
  // Statistics
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: null,
  averageTime: null
};

// Reducer function
const sudokuReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_CELL: {
      const { row, col, value } = action.payload;
      const newGrid = state.currentGrid.map(r => [...r]);
      
      // Validate the input
      const validation = validateInput(newGrid, row, col, value, state.gridType);
      
      if (!validation.valid) {
        return {
          ...state,
          errorMessage: validation.error,
          mistakes: state.mistakes + 1
        };
      }
      
      newGrid[row][col] = value;
      
      // Check if game is complete
      const isComplete = isGridComplete(newGrid, state.gridType);
      const newGameState = isComplete ? GAME_STATES.WON : state.gameState;
      
      // Save high score if game is won (and not already saved)
      // Only save if transitioning TO won state AND haven't saved yet
      if (isComplete && state.gameState === GAME_STATES.PLAYING && newGameState === GAME_STATES.WON && !state.scoreSaved) {
        const playerName = getUserDisplayName();
        const playerProfile = getUserProfile();
        
        if (!state.startTime) {
          console.error('ERROR: startTime is null! Cannot calculate game time.');
          return {
            ...state,
            currentGrid: newGrid,
            gameState: newGameState,
            errorMessage: '',
            selectedCell: isComplete ? null : state.selectedCell
          };
        }
        
        const timeSeconds = Math.floor((Date.now() - state.startTime) / 1000);
        
        const gameData = {
          gameType: 'sudoku',
          difficulty: state.difficulty.name,
          gridSize: state.gridType,
          timeSeconds: timeSeconds,
          hintsUsed: state.hintsUsed,
          mistakes: state.mistakes,
          playerName: playerName,
          playerAvatar: playerProfile.avatar || '👤'
        };
        
        console.log('🎯 Game completed! Saving score for', playerName, 'in', timeSeconds, 'seconds');
        
        try {
          saveHighScore(gameData);
        } catch (error) {
          console.error('Failed to save high score:', error);
        }
      }

      return {
        ...state,
        currentGrid: newGrid,
        gameState: newGameState,
        scoreSaved: isComplete && state.gameState === GAME_STATES.PLAYING && newGameState === GAME_STATES.WON ? true : state.scoreSaved,
        errorMessage: '',
        selectedCell: isComplete ? null : state.selectedCell
      };
    }
    
    case ACTIONS.CLEAR_CELL: {
      const { row, col } = action.payload;
      
      // Only clear if not a given cell (puzzle cell)
      if (state.puzzle[row][col] !== EMPTY_CELL) {
        return state;
      }
      
      const newGrid = state.currentGrid.map(r => [...r]);
      newGrid[row][col] = EMPTY_CELL;
      
      return {
        ...state,
        currentGrid: newGrid,
        errorMessage: ''
      };
    }
    
    case ACTIONS.NEW_GAME: {
      const difficulty = action.payload.difficulty || DIFFICULTY[state.gridType].MEDIUM;
      const { puzzle, solution } = action.payload.isRandom 
        ? getRandomSudoku(difficulty, state.gridType)
        : getTodaysSudoku(difficulty, state.gridType);
      
      return {
        ...state,
        puzzle,
        currentGrid: puzzle.map(row => [...row]),
        solution,
        difficulty,
        gameState: GAME_STATES.PLAYING,
        startTime: Date.now(),
        elapsedTime: 0,
        hintsUsed: 0,
        mistakes: 0,
        scoreSaved: false, // Reset score saved flag for new game
        selectedCell: null,
        errorMessage: ''
      };
    }
    
    case ACTIONS.RESET_GAME: {
      return {
        ...state,
        currentGrid: state.puzzle.map(row => [...row]),
        gameState: GAME_STATES.PLAYING,
        startTime: Date.now(),
        elapsedTime: 0,
        hintsUsed: 0,
        mistakes: 0,
        scoreSaved: false, // Reset score saved flag for reset game
        selectedCell: null,
        errorMessage: ''
      };
    }
    
    case ACTIONS.USE_HINT: {
      const hint = getHint(state.currentGrid, state.gridType);
      
      if (!hint) {
        return {
          ...state,
          errorMessage: 'No hints available'
        };
      }
      
      const newGrid = state.currentGrid.map(r => [...r]);
      newGrid[hint.row][hint.col] = hint.number;
      
      const isComplete = isGridComplete(newGrid);
      
      return {
        ...state,
        currentGrid: newGrid,
        hintsUsed: state.hintsUsed + 1,
        gameState: isComplete ? GAME_STATES.WON : state.gameState,
        selectedCell: { row: hint.row, col: hint.col },
        errorMessage: ''
      };
    }
    
    case ACTIONS.SET_DIFFICULTY: {
      return {
        ...state,
        difficulty: action.payload
      };
    }
    
    case ACTIONS.SET_GRID_TYPE: {
      const newGridType = action.payload;
      const defaultDifficulty = DIFFICULTY[newGridType].MEDIUM;
      
      return {
        ...state,
        gridType: newGridType,
        difficulty: defaultDifficulty,
        puzzle: createEmptyGrid(newGridType),
        currentGrid: createEmptyGrid(newGridType),
        solution: createEmptyGrid(newGridType),
        gameState: GAME_STATES.PLAYING,
        startTime: null,
        elapsedTime: 0,
        hintsUsed: 0,
        mistakes: 0,
        scoreSaved: false, // Reset score saved flag for grid type change
        selectedCell: null,
        errorMessage: ''
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
    
    case ACTIONS.INCREMENT_TIME: {
      if (state.gameState === GAME_STATES.PLAYING && state.startTime) {
        return {
          ...state,
          elapsedTime: Math.floor((Date.now() - state.startTime) / 1000)
        };
      }
      return state;
    }
    
    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        errorMessage: action.payload
      };
    }
    
    case ACTIONS.CLEAR_ERROR: {
      return {
        ...state,
        errorMessage: ''
      };
    }
    
    case ACTIONS.SET_SELECTED_CELL: {
      return {
        ...state,
        selectedCell: action.payload
      };
    }
    
    default:
      return state;
  }
};

// Create context
const SudokuContext = createContext();

// Context provider component
export const SudokuProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sudokuReducer, initialState);
  
  // Timer effect
  useEffect(() => {
    let interval;
    
    if (state.gameState === GAME_STATES.PLAYING && state.startTime) {
      interval = setInterval(() => {
        dispatch({ type: ACTIONS.INCREMENT_TIME });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.gameState, state.startTime]);
  
  // Initialize game on mount
  useEffect(() => {
    const initGame = () => {
      const savedGame = loadGameState();
      const today = new Date().toDateString();
      
      // Check if saved game is from today and is sudoku
      const isToday = savedGame && 
        savedGame.date === today && 
        savedGame.gameType === 'sudoku-mini';
      
      if (isToday) {
        // Restore saved game
        dispatch({
          type: ACTIONS.NEW_GAME,
          payload: {
            ...savedGame,
            isRandom: false
          }
        });
      } else {
        // Start new daily game
        startNewGame();
      }
    };
    
    initGame();
  }, []);
  
  // Save game state when it changes
  useEffect(() => {
    if (state.puzzle && state.currentGrid) {
      saveGameState({
        puzzle: state.puzzle,
        currentGrid: state.currentGrid,
        solution: state.solution,
        difficulty: state.difficulty,
        gameState: state.gameState,
        startTime: state.startTime,
        elapsedTime: state.elapsedTime,
        hintsUsed: state.hintsUsed,
        mistakes: state.mistakes,
        gameType: 'sudoku-mini',
        date: new Date().toDateString()
      });
    }
  }, [state]);
  
  // Action creators
  const setCell = (row, col, value) => {
    dispatch({
      type: ACTIONS.SET_CELL,
      payload: { row, col, value }
    });
  };
  
  const clearCell = (row, col) => {
    dispatch({
      type: ACTIONS.CLEAR_CELL,
      payload: { row, col }
    });
  };
  
  const startNewGame = (difficulty = null, isRandom = false) => {
    dispatch({
      type: ACTIONS.NEW_GAME,
      payload: { difficulty, isRandom }
    });
  };
  
  const resetGame = () => {
    dispatch({ type: ACTIONS.RESET_GAME });
  };
  
  const useHint = () => {
    dispatch({ type: ACTIONS.USE_HINT });
  };
  
  const setDifficulty = (difficulty) => {
    dispatch({
      type: ACTIONS.SET_DIFFICULTY,
      payload: difficulty
    });
  };
  
  const setGridType = (gridType) => {
    dispatch({
      type: ACTIONS.SET_GRID_TYPE,
      payload: gridType
    });
  };
  
  const pauseGame = () => {
    dispatch({ type: ACTIONS.PAUSE_GAME });
  };
  
  const resumeGame = () => {
    dispatch({ type: ACTIONS.RESUME_GAME });
  };
  
  const setSelectedCell = (row, col) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_CELL,
      payload: row !== null && col !== null ? { row, col } : null
    });
  };
  
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Check if cell is given (part of original puzzle)
  const isCellGiven = (row, col) => {
    return state.puzzle[row][col] !== EMPTY_CELL;
  };
  
  // Check if cell has error
  const hasCellError = (row, col) => {
    const value = state.currentGrid[row][col];
    if (value === EMPTY_CELL) return false;
    
    const testGrid = state.currentGrid.map(r => [...r]);
    testGrid[row][col] = EMPTY_CELL;
    
    const validation = validateInput(testGrid, row, col, value, state.gridType);
    return !validation.valid;
  };
  
  const value = {
    // State
    ...state,
    
    // Actions
    setCell,
    clearCell,
    startNewGame,
    resetGame,
    useHint,
    setDifficulty,
    setGridType,
    pauseGame,
    resumeGame,
    setSelectedCell,
    clearError,
    
    // Utilities
    formatTime,
    isCellGiven,
    hasCellError,
    
    // Constants
    GRID_SIZES,
    DIFFICULTY
  };
  
  return (
    <SudokuContext.Provider value={value}>
      {children}
    </SudokuContext.Provider>
  );
};

// Hook to use sudoku context
export const useSudoku = () => {
  const context = useContext(SudokuContext);
  if (!context) {
    throw new Error('useSudoku must be used within a SudokuProvider');
  }
  return context;
};

// Storage utilities
const STORAGE_KEY = 'sudoku-game-state';

const saveGameState = (gameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

const loadGameState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};