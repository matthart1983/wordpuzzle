import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getTodaysSpellingBee,
  getRandomSpellingBee,
  isValidSpellingBeeWord,
  calculateWordPoints,
  isPangram,
  calculateTotalPossiblePoints,
  getCurrentRank,
  getNextRankProgress,
  shuffleLetters
} from '../utils/spellingBeeLogic';
import {
  saveGameState,
  loadGameState,
  clearGameState,
  saveSettings,
  loadSettings
} from '../utils/storage';

const SpellingBeeContext = createContext();

// Action types
const ACTIONS = {
  SET_GAME_STATE: 'SET_GAME_STATE',
  ADD_LETTER: 'ADD_LETTER',
  DELETE_LETTER: 'DELETE_LETTER',
  SUBMIT_WORD: 'SUBMIT_WORD',
  SHUFFLE_LETTERS: 'SHUFFLE_LETTERS',
  SET_MESSAGE: 'SET_MESSAGE',
  CLEAR_MESSAGE: 'CLEAR_MESSAGE',
  NEW_GAME: 'NEW_GAME'
};

// Initial state
const initialState = {
  letters: [],
  centerLetter: '',
  shuffledLetters: [],
  currentWord: '',
  foundWords: [],
  currentPoints: 0,
  totalPossible: 0,
  currentRank: { name: 'Beginner', threshold: 0 },
  nextRankProgress: { nextRank: null, progress: 0, pointsNeeded: 0 },
  message: '',
  isLoading: true
};

// Reducer
const spellingBeeReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_GAME_STATE:
      return {
        ...state,
        ...action.payload,
        isLoading: false
      };
      
    case ACTIONS.ADD_LETTER:
      return {
        ...state,
        currentWord: state.currentWord + action.payload.toUpperCase(),
        message: ''
      };
      
    case ACTIONS.DELETE_LETTER:
      if (state.currentWord.length > 0) {
        return {
          ...state,
          currentWord: state.currentWord.slice(0, -1),
          message: ''
        };
      }
      return state;
      
    case ACTIONS.SUBMIT_WORD:
      const word = state.currentWord;
      
      if (word.length < 4) {
        return {
          ...state,
          message: 'Too short'
        };
      }
      
      if (state.foundWords.includes(word)) {
        return {
          ...state,
          message: 'Already found'
        };
      }
      
      if (!isValidSpellingBeeWord(word, state.letters)) {
        return {
          ...state,
          message: 'Not in word list'
        };
      }
      
      const points = calculateWordPoints(word, state.letters);
      const newFoundWords = [...state.foundWords, word];
      const newCurrentPoints = state.currentPoints + points;
      const newCurrentRank = getCurrentRank(newCurrentPoints, state.totalPossible);
      const newNextRankProgress = getNextRankProgress(newCurrentPoints, state.totalPossible);
      
      let message = `+${points} points`;
      if (isPangram(word, state.letters)) {
        message = `Pangram! +${points} points`;
      }
      
      const newState = {
        ...state,
        currentWord: '',
        foundWords: newFoundWords,
        currentPoints: newCurrentPoints,
        currentRank: newCurrentRank,
        nextRankProgress: newNextRankProgress,
        message
      };
      
      // Save game state
      saveGameState({
        gameType: 'letter-hunt',
        letters: state.letters,
        centerLetter: state.centerLetter,
        foundWords: newFoundWords,
        currentPoints: newCurrentPoints,
        date: new Date().toDateString()
      });
      
      return newState;
      
    case ACTIONS.SHUFFLE_LETTERS:
      const newShuffled = shuffleLetters(state.letters, state.centerLetter);
      return {
        ...state,
        shuffledLetters: newShuffled
      };
      
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
      clearGameState();
      const newLetters = getRandomSpellingBee(); // Use random puzzle for reset
      const newCenterLetter = newLetters[0];
      const newShuffledLetters = shuffleLetters(newLetters, newCenterLetter);
      const newTotalPossible = calculateTotalPossiblePoints(newLetters);
      
      return {
        ...state,
        letters: newLetters,
        centerLetter: newCenterLetter,
        shuffledLetters: newShuffledLetters,
        currentWord: '',
        foundWords: [],
        currentPoints: 0,
        totalPossible: newTotalPossible,
        currentRank: getCurrentRank(0, newTotalPossible),
        nextRankProgress: getNextRankProgress(0, newTotalPossible),
        message: ''
      };
      
    default:
      return state;
  }
};

// Provider component
export const SpellingBeeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(spellingBeeReducer, initialState);
  
  // Initialize game on mount
  useEffect(() => {
    const initializeGame = () => {
      const savedGame = loadGameState();
      const todaysLetters = getTodaysSpellingBee();
      const today = new Date().toDateString();
      
      // Check if saved game is from today and is letter hunt
      const isToday = savedGame && 
        savedGame.date === today && 
        savedGame.gameType === 'letter-hunt' &&
        JSON.stringify(savedGame.letters) === JSON.stringify(todaysLetters);
      
      if (isToday) {
        // Restore saved game
        const centerLetter = savedGame.centerLetter;
        const shuffledLetters = shuffleLetters(savedGame.letters, centerLetter);
        const totalPossible = calculateTotalPossiblePoints(savedGame.letters);
        const currentRank = getCurrentRank(savedGame.currentPoints, totalPossible);
        const nextRankProgress = getNextRankProgress(savedGame.currentPoints, totalPossible);
        
        dispatch({
          type: ACTIONS.SET_GAME_STATE,
          payload: {
            letters: savedGame.letters,
            centerLetter,
            shuffledLetters,
            currentWord: '',
            foundWords: savedGame.foundWords || [],
            currentPoints: savedGame.currentPoints || 0,
            totalPossible,
            currentRank,
            nextRankProgress,
            message: ''
          }
        });
      } else {
        // Start new game
        clearGameState();
        const centerLetter = todaysLetters[0];
        const shuffledLetters = shuffleLetters(todaysLetters, centerLetter);
        const totalPossible = calculateTotalPossiblePoints(todaysLetters);
        const currentRank = getCurrentRank(0, totalPossible);
        const nextRankProgress = getNextRankProgress(0, totalPossible);
        
        dispatch({
          type: ACTIONS.SET_GAME_STATE,
          payload: {
            letters: todaysLetters,
            centerLetter,
            shuffledLetters,
            currentWord: '',
            foundWords: [],
            currentPoints: 0,
            totalPossible,
            currentRank,
            nextRankProgress,
            message: ''
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
  
  const deleteLetter = () => {
    dispatch({ type: ACTIONS.DELETE_LETTER });
  };
  
  const submitWord = () => {
    dispatch({ type: ACTIONS.SUBMIT_WORD });
  };
  
  const shuffleLettersAction = () => {
    dispatch({ type: ACTIONS.SHUFFLE_LETTERS });
  };
  
  const newGame = () => {
    dispatch({ type: ACTIONS.NEW_GAME });
  };
  
  const setMessage = (message) => {
    dispatch({ type: ACTIONS.SET_MESSAGE, payload: message });
  };
  
  const value = {
    ...state,
    addLetter,
    deleteLetter,
    submitWord,
    shuffleLetters: shuffleLettersAction,
    newGame,
    setMessage
  };
  
  return (
    <SpellingBeeContext.Provider value={value}>
      {children}
    </SpellingBeeContext.Provider>
  );
};

// Hook to use letter hunt context
export const useSpellingBee = () => {
  const context = useContext(SpellingBeeContext);
  if (!context) {
    throw new Error('useSpellingBee must be used within a SpellingBeeProvider');
  }
  return context;
};