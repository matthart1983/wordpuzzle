import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  initializeGrid,
  moveTiles,
  addRandomTile,
  getGameState,
  getHighestTile,
  formatScore,
  getHint,
  getTodaysChallenge,
  cloneGrid,
  GAME_STATES,
  DIRECTIONS
} from '../utils/game2048Logic';
import { saveHighScore } from '../utils/highScores';
import { getUserDisplayName, getUserProfile } from '../utils/userProfile';

// Action types
const ACTIONS = {
  MOVE: 'MOVE',
  ADD_NEW_TILE: 'ADD_NEW_TILE',
  NEW_GAME: 'NEW_GAME',
  CONTINUE_GAME: 'CONTINUE_GAME',
  UNDO_MOVE: 'UNDO_MOVE',
  RESET_GAME: 'RESET_GAME',
  SET_BEST_SCORE: 'SET_BEST_SCORE'
};

// Initial state
const initialState = {
  grid: initializeGrid(),
  score: 0,
  bestScore: 0,
  gameState: GAME_STATES.PLAYING,
  hasWonBefore: false,
  moveCount: 0,
  startTime: Date.now(),
  endTime: null,
  
  // Move history for undo functionality
  previousGrid: null,
  previousScore: 0,
  canUndo: false,
  
  // Game statistics
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  winRate: 0,
  
  // Animation tracking
  newTilePosition: null,
  lastMoveTime: null,
  isAnimating: false,
  pendingNewTile: null
};

// Reducer function
const game2048Reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.MOVE: {
      const { direction } = action.payload;
      const result = moveTiles(state.grid, direction);
      
      if (!result.moved) {
        return state; // No movement occurred
      }
      
      // Don't add new tile immediately, just update the grid with moved tiles
      const newScore = state.score + result.score;
      const newGameState = getGameState(result.grid, state.hasWonBefore);
      const endTime = newGameState !== GAME_STATES.PLAYING ? Date.now() : null;
      
      // Save high score when first achieving victory (reaching 2048)
      if (newGameState === GAME_STATES.WON && state.gameState !== GAME_STATES.WON && !state.hasWonBefore) {
        const playerName = getUserDisplayName();
        const playerProfile = getUserProfile();
        const timeSeconds = Math.floor((endTime - state.startTime) / 1000);
        const highestTile = getHighestTile(result.grid);
        
        const gameData = {
          gameType: '2048',
          difficulty: 'Standard', // 2048 has one difficulty
          gridSize: '4x4',
          timeSeconds: timeSeconds,
          finalScore: newScore,
          highestTile: highestTile,
          totalMoves: state.moveCount + 1,
          playerName: playerName,
          playerAvatar: playerProfile.avatar || '🎮'
        };
        
        console.log('🎯 2048 completed! Saving score for', playerName, 'with score', newScore);
        
        try {
          saveHighScore(gameData);
        } catch (error) {
          console.error('Failed to save 2048 high score:', error);
        }
      }
      
      return {
        ...state,
        previousGrid: cloneGrid(state.grid),
        previousScore: state.score,
        grid: result.grid,
        score: newScore,
        gameState: newGameState,
        moveCount: state.moveCount + 1,
        endTime,
        canUndo: true,
        isAnimating: true,
        lastMoveTime: Date.now(),
        newTilePosition: null // Clear any previous new tile position
      };
    }

    case ACTIONS.ADD_NEW_TILE: {
      // This action is called after the slide animation completes
      const addTileResult = addRandomTile(state.grid);
      const newGrid = addTileResult.grid;
      const newTilePosition = addTileResult.newTilePosition;
      
      // Update game state in case adding the new tile changes it
      const newGameState = getGameState(newGrid, state.hasWonBefore);
      
      return {
        ...state,
        grid: newGrid,
        gameState: newGameState,
        isAnimating: false,
        newTilePosition,
        lastMoveTime: Date.now() // Update time for new tile animation
      };
    }
    
    case ACTIONS.NEW_GAME: {
      const newGrid = action.payload.isDaily ? getTodaysChallenge() : initializeGrid();
      const bestScore = Math.max(state.bestScore, state.score);
      
      return {
        ...initialState,
        grid: newGrid,
        bestScore,
        startTime: Date.now(),
        totalGamesPlayed: state.totalGamesPlayed + (state.moveCount > 0 ? 1 : 0),
        totalGamesWon: state.totalGamesWon + (state.gameState === GAME_STATES.WON ? 1 : 0),
        winRate: calculateWinRate(
          state.totalGamesWon + (state.gameState === GAME_STATES.WON ? 1 : 0),
          state.totalGamesPlayed + (state.moveCount > 0 ? 1 : 0)
        )
      };
    }
    
    case ACTIONS.CONTINUE_GAME: {
      if (state.gameState !== GAME_STATES.WON) {
        return state;
      }
      
      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        hasWonBefore: true
      };
    }
    
    case ACTIONS.UNDO_MOVE: {
      if (!state.canUndo || !state.previousGrid) {
        return state;
      }
      
      return {
        ...state,
        grid: state.previousGrid,
        score: state.previousScore,
        gameState: getGameState(state.previousGrid, state.hasWonBefore),
        moveCount: Math.max(0, state.moveCount - 1),
        previousGrid: null,
        previousScore: 0,
        canUndo: false,
        endTime: null
      };
    }
    
    case ACTIONS.RESET_GAME: {
      return {
        ...state,
        grid: initializeGrid(),
        score: 0,
        gameState: GAME_STATES.PLAYING,
        hasWonBefore: false,
        moveCount: 0,
        startTime: Date.now(),
        endTime: null,
        previousGrid: null,
        previousScore: 0,
        canUndo: false
      };
    }
    
    case ACTIONS.SET_BEST_SCORE: {
      return {
        ...state,
        bestScore: action.payload
      };
    }
    
    default:
      return state;
  }
};

// Helper function to calculate win rate
const calculateWinRate = (won, played) => {
  return played > 0 ? Math.round((won / played) * 100) : 0;
};

// Create context
const Game2048Context = createContext();

// Context provider component
export const Game2048Provider = ({ children }) => {
  const [state, dispatch] = useReducer(game2048Reducer, initialState);
  
  // Load saved data on mount
  useEffect(() => {
    const savedData = loadGameData();
    if (savedData) {
      if (savedData.bestScore > state.bestScore) {
        dispatch({
          type: ACTIONS.SET_BEST_SCORE,
          payload: savedData.bestScore
        });
      }
    }
  }, []);
  
  // Save game data when it changes
  useEffect(() => {
    saveGameData({
      bestScore: state.bestScore,
      totalGamesPlayed: state.totalGamesPlayed,
      totalGamesWon: state.totalGamesWon,
      winRate: state.winRate
    });
  }, [state.bestScore, state.totalGamesPlayed, state.totalGamesWon, state.winRate]);
  
  // Action creators
  const makeMove = (direction) => {
    if (state.gameState === GAME_STATES.LOST || state.isAnimating) return;
    
    dispatch({
      type: ACTIONS.MOVE,
      payload: { direction }
    });
    
    // Schedule new tile addition after slide animation completes
    setTimeout(() => {
      dispatch({
        type: ACTIONS.ADD_NEW_TILE
      });
    }, 200); // 200ms delay to match CSS transition duration + small buffer
  };
  
  const startNewGame = (isDaily = false) => {
    dispatch({
      type: ACTIONS.NEW_GAME,
      payload: { isDaily }
    });
  };
  
  const continueGame = () => {
    dispatch({ type: ACTIONS.CONTINUE_GAME });
  };
  
  const undoMove = () => {
    dispatch({ type: ACTIONS.UNDO_MOVE });
  };
  
  const resetGame = () => {
    dispatch({ type: ACTIONS.RESET_GAME });
  };
  
  // Utility functions
  const getPlayTime = () => {
    const endTime = state.endTime || Date.now();
    return Math.floor((endTime - state.startTime) / 1000);
  };
  
  const formatPlayTime = () => {
    const seconds = getPlayTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getHighestTileValue = () => {
    return getHighestTile(state.grid);
  };
  
  const getCurrentHint = () => {
    return getHint(state.grid);
  };
  
  const getFormattedScore = () => {
    return formatScore(state.score);
  };
  
  const getFormattedBestScore = () => {
    return formatScore(state.bestScore);
  };
  
  // Game statistics
  const getGameStats = () => {
    return {
      gamesPlayed: state.totalGamesPlayed,
      gamesWon: state.totalGamesWon,
      winRate: state.winRate,
      bestScore: state.bestScore,
      currentScore: state.score,
      currentTile: getHighestTileValue(),
      playTime: formatPlayTime(),
      moveCount: state.moveCount
    };
  };
  
  const value = {
    // State
    grid: state.grid,
    score: state.score,
    bestScore: state.bestScore,
    gameState: state.gameState,
    hasWonBefore: state.hasWonBefore,
    moveCount: state.moveCount,
    canUndo: state.canUndo,
    newTilePosition: state.newTilePosition,
    lastMoveTime: state.lastMoveTime,
    isAnimating: state.isAnimating,
    
    // Actions
    makeMove,
    startNewGame,
    continueGame,
    undoMove,
    resetGame,
    
    // Utilities
    getPlayTime,
    formatPlayTime,
    getHighestTileValue,
    getCurrentHint,
    getFormattedScore,
    getFormattedBestScore,
    getGameStats,
    
    // Constants
    DIRECTIONS,
    GAME_STATES
  };
  
  return (
    <Game2048Context.Provider value={value}>
      {children}
    </Game2048Context.Provider>
  );
};

// Hook to use 2048 context
export const useGame2048 = () => {
  const context = useContext(Game2048Context);
  if (!context) {
    throw new Error('useGame2048 must be used within a Game2048Provider');
  }
  return context;
};

// Storage utilities
const STORAGE_KEY = '2048-game-data';

const saveGameData = (gameData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
  } catch (error) {
    console.error('Failed to save game data:', error);
  }
};

const loadGameData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game data:', error);
    return null;
  }
};