import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getTodaysWord,
  isValidWord,
  evaluateGuess,
  getGameState,
  getKeyboardStates,
  WORD_LENGTH,
  MAX_ATTEMPTS,
  GAME_STATES
} from '../utils/gameLogic';
import {
  saveGameState,
  loadGameState,
  clearGameState,
  loadStatistics,
  updateStatistics,
  loadSettings,
  saveSettings
} from '../utils/storage';

const GameContext = createContext();

// Action types
const ACTIONS = {
  SET_GAME_STATE: 'SET_GAME_STATE',
  ADD_LETTER: 'ADD_LETTER',
  REMOVE_LETTER: 'REMOVE_LETTER',
  SUBMIT_GUESS: 'SUBMIT_GUESS',
  SET_MESSAGE: 'SET_MESSAGE',
  CLEAR_MESSAGE: 'CLEAR_MESSAGE',
  NEW_GAME: 'NEW_GAME',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Initial state
const initialState = {
  targetWord: '',
  guesses: [],
  currentGuess: '',
  gameState: GAME_STATES.PLAYING,
  message: '',
  statistics: {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    winPercentage: 0
  },
  settings: {
    darkMode: true,
    highContrast: false,
    colorBlindMode: false
  },
  evaluations: [],
  keyboardStates: {},
  isLoading: true
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_GAME_STATE:
      return {
        ...state,
        ...action.payload,
        isLoading: false
      };
      
    case ACTIONS.ADD_LETTER:
      if (state.currentGuess.length < WORD_LENGTH && state.gameState === GAME_STATES.PLAYING) {
        return {
          ...state,
          currentGuess: state.currentGuess + action.payload.toUpperCase()
        };
      }
      return state;
      
    case ACTIONS.REMOVE_LETTER:
      if (state.currentGuess.length > 0 && state.gameState === GAME_STATES.PLAYING) {
        return {
          ...state,
          currentGuess: state.currentGuess.slice(0, -1)
        };
      }
      return state;
      
    case ACTIONS.SUBMIT_GUESS:
      if (state.currentGuess.length !== WORD_LENGTH || state.gameState !== GAME_STATES.PLAYING) {
        return state;
      }
      
      if (!isValidWord(state.currentGuess)) {
        return {
          ...state,
          message: 'Not a valid word'
        };
      }
      
      const newGuesses = [...state.guesses, state.currentGuess];
      const evaluation = evaluateGuess(state.currentGuess, state.targetWord);
      const newEvaluations = [...state.evaluations, evaluation];
      const newGameState = getGameState(newGuesses, state.targetWord);
      const newKeyboardStates = getKeyboardStates(newGuesses, state.targetWord);
      
      let message = '';
      let updatedStats = state.statistics;
      
      if (newGameState === GAME_STATES.WON) {
        message = 'Congratulations!';
        updatedStats = updateStatistics(true, newGuesses.length);
      } else if (newGameState === GAME_STATES.LOST) {
        message = `The word was ${state.targetWord}`;
        updatedStats = updateStatistics(false, 0);
      }
      
      const newState = {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        gameState: newGameState,
        message,
        evaluations: newEvaluations,
        keyboardStates: newKeyboardStates,
        statistics: {
          ...updatedStats,
          winPercentage: updatedStats.gamesPlayed > 0 ? 
            Math.round((updatedStats.gamesWon / updatedStats.gamesPlayed) * 100) : 0
        }
      };
      
      // Save game state
      if (newGameState === GAME_STATES.PLAYING) {
        saveGameState({
          targetWord: state.targetWord,
          guesses: newGuesses,
          currentGuess: '',
          gameState: newGameState,
          evaluations: newEvaluations,
          date: new Date().toDateString()
        });
      } else {
        clearGameState(); // Clear when game is finished
      }
      
      return newState;
      
    case ACTIONS.SET_MESSAGE:
      return {
        ...state,
        message: action.payload
      };
      
    case ACTIONS.CLEAR_MESSAGE:
      return {
        ...state,
        message: ''
      };
      
    case ACTIONS.NEW_GAME:
      const newWord = getTodaysWord();
      clearGameState();
      return {
        ...state,
        targetWord: newWord,
        guesses: [],
        currentGuess: '',
        gameState: GAME_STATES.PLAYING,
        message: '',
        evaluations: [],
        keyboardStates: {}
      };
      
    case ACTIONS.UPDATE_SETTINGS:
      saveSettings(action.payload);
      return {
        ...state,
        settings: action.payload
      };
      
    default:
      return state;
  }
};

// Provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Initialize game on mount
  useEffect(() => {
    const initializeGame = () => {
      const todaysWord = getTodaysWord();
      const savedGame = loadGameState();
      const statistics = loadStatistics();
      const settings = loadSettings();
      
      // Check if saved game is from today
      const isToday = savedGame && savedGame.date === new Date().toDateString();
      
      if (isToday && savedGame.targetWord === todaysWord) {
        // Restore saved game
        const keyboardStates = getKeyboardStates(savedGame.guesses, savedGame.targetWord);
        
        dispatch({
          type: ACTIONS.SET_GAME_STATE,
          payload: {
            targetWord: savedGame.targetWord,
            guesses: savedGame.guesses,
            currentGuess: savedGame.currentGuess || '',
            gameState: savedGame.gameState,
            evaluations: savedGame.evaluations || [],
            keyboardStates,
            statistics: {
              ...statistics,
              winPercentage: statistics.gamesPlayed > 0 ? 
                Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100) : 0
            },
            settings
          }
        });
      } else {
        // Start new game
        clearGameState();
        dispatch({
          type: ACTIONS.SET_GAME_STATE,
          payload: {
            targetWord: todaysWord,
            guesses: [],
            currentGuess: '',
            gameState: GAME_STATES.PLAYING,
            message: '',
            evaluations: [],
            keyboardStates: {},
            statistics: {
              ...statistics,
              winPercentage: statistics.gamesPlayed > 0 ? 
                Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100) : 0
            },
            settings
          }
        });
      }
    };
    
    initializeGame();
  }, []);
  
  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (state.message) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.CLEAR_MESSAGE });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.message]);
  
  // Actions
  const addLetter = (letter) => {
    dispatch({ type: ACTIONS.ADD_LETTER, payload: letter });
  };
  
  const removeLetter = () => {
    dispatch({ type: ACTIONS.REMOVE_LETTER });
  };
  
  const submitGuess = () => {
    dispatch({ type: ACTIONS.SUBMIT_GUESS });
  };
  
  const newGame = () => {
    dispatch({ type: ACTIONS.NEW_GAME });
  };
  
  const updateSettings = (settings) => {
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings });
  };
  
  const setMessage = (message) => {
    dispatch({ type: ACTIONS.SET_MESSAGE, payload: message });
  };
  
  const value = {
    ...state,
    addLetter,
    removeLetter,
    submitGuess,
    newGame,
    updateSettings,
    setMessage
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};