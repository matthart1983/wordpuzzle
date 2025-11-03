import words from 'an-array-of-english-words';
import answers from '../data/answers.json';

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

// Filter dictionary to only 5-letter words and convert to uppercase
const fiveLetterWords = words
  .filter(word => word.length === WORD_LENGTH)
  .map(word => word.toUpperCase());

// Log some info about our dictionary
console.log(`Loaded ${fiveLetterWords.length} five-letter words from dictionary`);
console.log(`Loaded ${answers.length} answer words`);
console.log('Sample valid words:', fiveLetterWords.slice(0, 10));

// Letter states for feedback
export const LETTER_STATES = {
  CORRECT: 'correct',     // Green - right letter, right position
  PRESENT: 'present',     // Yellow - right letter, wrong position
  ABSENT: 'absent',       // Gray - letter not in word
  UNKNOWN: 'unknown'      // Default state
};

// Game states
export const GAME_STATES = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

/**
 * Get the word for today based on the current date
 */
export const getTodaysWord = () => {
  const today = new Date();
  const start = new Date('2025-01-01'); // Start date for word rotation
  const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const wordIndex = daysSinceStart % answers.length;
  return answers[wordIndex].toUpperCase();
};

/**
 * Check if a word is valid (in our comprehensive dictionary)
 */
export const isValidWord = (word) => {
  const upperWord = word.toUpperCase();
  const isValid = answers.includes(upperWord) || fiveLetterWords.includes(upperWord);
  return isValid;
};

/**
 * Get total number of valid 5-letter words available
 */
export const getTotalValidWords = () => {
  const uniqueWords = new Set([...answers, ...fiveLetterWords]);
  return uniqueWords.size;
};

/**
 * Evaluate a guess against the target word
 * Returns an array of letter states
 */
export const evaluateGuess = (guess, targetWord) => {
  const guessArray = guess.toUpperCase().split('');
  const targetArray = targetWord.toUpperCase().split('');
  const result = new Array(WORD_LENGTH).fill(LETTER_STATES.ABSENT);
  
  // Track which letters in target have been used
  const targetLetterCounts = {};
  targetArray.forEach(letter => {
    targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
  });
  
  // First pass: mark correct letters (green)
  guessArray.forEach((letter, index) => {
    if (letter === targetArray[index]) {
      result[index] = LETTER_STATES.CORRECT;
      targetLetterCounts[letter]--;
    }
  });
  
  // Second pass: mark present letters (yellow)
  guessArray.forEach((letter, index) => {
    if (result[index] === LETTER_STATES.ABSENT && targetLetterCounts[letter] > 0) {
      result[index] = LETTER_STATES.PRESENT;
      targetLetterCounts[letter]--;
    }
  });
  
  return result;
};

/**
 * Check if the game is won
 */
export const isGameWon = (guesses, targetWord) => {
  if (guesses.length === 0) return false;
  const lastGuess = guesses[guesses.length - 1];
  return lastGuess.toUpperCase() === targetWord.toUpperCase();
};

/**
 * Check if the game is lost
 */
export const isGameLost = (guesses) => {
  return guesses.length >= MAX_ATTEMPTS;
};

/**
 * Get the current game state
 */
export const getGameState = (guesses, targetWord) => {
  if (isGameWon(guesses, targetWord)) {
    return GAME_STATES.WON;
  }
  if (isGameLost(guesses)) {
    return GAME_STATES.LOST;
  }
  return GAME_STATES.PLAYING;
};

/**
 * Get keyboard letter states based on all guesses
 */
export const getKeyboardStates = (guesses, targetWord) => {
  const keyboardStates = {};
  
  guesses.forEach(guess => {
    const evaluation = evaluateGuess(guess, targetWord);
    guess.toUpperCase().split('').forEach((letter, index) => {
      const currentState = evaluation[index];
      
      // Only update if we don't have a state or if new state is better
      if (!keyboardStates[letter] || 
          (currentState === LETTER_STATES.CORRECT) ||
          (currentState === LETTER_STATES.PRESENT && keyboardStates[letter] === LETTER_STATES.ABSENT)) {
        keyboardStates[letter] = currentState;
      }
    });
  });
  
  return keyboardStates;
};

/**
 * Generate shareable emoji grid
 */
export const generateShareText = (guesses, targetWord, gameState) => {
  const today = new Date();
  const dayNumber = Math.floor((today - new Date('2025-01-01')) / (1000 * 60 * 60 * 24)) + 1;
  
  let shareText = `Wordle Clone ${dayNumber} `;
  
  if (gameState === GAME_STATES.WON) {
    shareText += `${guesses.length}/${MAX_ATTEMPTS}\n\n`;
  } else {
    shareText += `X/${MAX_ATTEMPTS}\n\n`;
  }
  
  guesses.forEach(guess => {
    const evaluation = evaluateGuess(guess, targetWord);
    const emojiRow = evaluation.map(state => {
      switch (state) {
        case LETTER_STATES.CORRECT: return '🟩';
        case LETTER_STATES.PRESENT: return '🟨';
        case LETTER_STATES.ABSENT: return '⬛';
        default: return '⬛';
      }
    }).join('');
    shareText += emojiRow + '\n';
  });
  
  return shareText.trim();
};