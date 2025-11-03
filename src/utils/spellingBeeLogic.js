import words from 'an-array-of-english-words';

// Spelling Bee configuration
export const MIN_WORD_LENGTH = 4;
export const HEXAGON_LETTERS = 7;
export const CENTER_LETTER_INDEX = 0; // Center letter is first in array

// Points system
export const POINTS = {
  FOUR_LETTER: 1,
  FIVE_PLUS_LETTER: 1, // 1 point per letter for words 5+ letters
  PANGRAM: 7 // Extra points for using all letters
};

// Ranks based on percentage of total possible points
export const RANKS = [
  { name: 'Beginner', threshold: 0 },
  { name: 'Good Start', threshold: 2 },
  { name: 'Moving Up', threshold: 5 },
  { name: 'Good', threshold: 8 },
  { name: 'Solid', threshold: 15 },
  { name: 'Nice', threshold: 25 },
  { name: 'Great', threshold: 40 },
  { name: 'Amazing', threshold: 50 },
  { name: 'Genius', threshold: 70 },
  { name: 'Queen Bee', threshold: 100 }
];

/**
 * Generate today's Spelling Bee puzzle
 */
export const getTodaysSpellingBee = () => {
  // Use date as seed for reproducible daily puzzles
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Sample puzzle sets (in real implementation, these would be curated)
  const puzzleSets = [
    ['G', 'R', 'O', 'U', 'N', 'D', 'S'], // CENTER: G
    ['A', 'L', 'M', 'O', 'S', 'T', 'R'], // CENTER: A
    ['C', 'H', 'A', 'I', 'R', 'S', 'T'], // CENTER: C
    ['P', 'L', 'A', 'N', 'T', 'S', 'E'], // CENTER: P
    ['F', 'L', 'O', 'W', 'E', 'R', 'S'], // CENTER: F
    ['B', 'R', 'I', 'G', 'H', 'T', 'S'], // CENTER: B
    ['M', 'O', 'R', 'N', 'I', 'G', 'T'], // CENTER: M
    ['W', 'I', 'N', 'T', 'E', 'R', 'S'], // CENTER: W
  ];
  
  const puzzleIndex = seed % puzzleSets.length;
  return puzzleSets[puzzleIndex];
};

/**
 * Check if a word is valid for the current Spelling Bee
 */
export const isValidSpellingBeeWord = (word, letters) => {
  if (!word || word.length < MIN_WORD_LENGTH) return false;
  
  const upperWord = word.toUpperCase();
  const upperLetters = letters.map(l => l.toUpperCase());
  const centerLetter = upperLetters[CENTER_LETTER_INDEX];
  
  // Must contain center letter
  if (!upperWord.includes(centerLetter)) return false;
  
  // All letters must be from the available set
  for (const char of upperWord) {
    if (!upperLetters.includes(char)) return false;
  }
  
  // Must be a real English word
  const validWords = words.filter(w => w.length >= MIN_WORD_LENGTH);
  return validWords.map(w => w.toUpperCase()).includes(upperWord);
};

/**
 * Calculate points for a word
 */
export const calculateWordPoints = (word, letters) => {
  if (!isValidSpellingBeeWord(word, letters)) return 0;
  
  const upperWord = word.toUpperCase();
  const upperLetters = letters.map(l => l.toUpperCase());
  
  let points = 0;
  
  // Base points
  if (upperWord.length === 4) {
    points = POINTS.FOUR_LETTER;
  } else {
    points = upperWord.length * POINTS.FIVE_PLUS_LETTER;
  }
  
  // Pangram bonus (uses all letters)
  const uniqueLettersUsed = new Set(upperWord.split(''));
  const allLettersUsed = upperLetters.every(letter => uniqueLettersUsed.has(letter));
  if (allLettersUsed) {
    points += POINTS.PANGRAM;
  }
  
  return points;
};

/**
 * Check if a word is a pangram (uses all letters)
 */
export const isPangram = (word, letters) => {
  const upperWord = word.toUpperCase();
  const upperLetters = letters.map(l => l.toUpperCase());
  const uniqueLettersUsed = new Set(upperWord.split(''));
  return upperLetters.every(letter => uniqueLettersUsed.has(letter));
};

/**
 * Find all possible words for a letter set
 */
export const findAllPossibleWords = (letters) => {
  const validWords = words.filter(w => w.length >= MIN_WORD_LENGTH);
  return validWords.filter(word => isValidSpellingBeeWord(word, letters));
};

/**
 * Calculate total possible points for a letter set
 */
export const calculateTotalPossiblePoints = (letters) => {
  const allWords = findAllPossibleWords(letters);
  return allWords.reduce((total, word) => total + calculateWordPoints(word, letters), 0);
};

/**
 * Get current rank based on points and total possible
 */
export const getCurrentRank = (currentPoints, totalPossible) => {
  const percentage = totalPossible > 0 ? (currentPoints / totalPossible) * 100 : 0;
  
  // Find the highest rank threshold that the player has achieved
  const achievedRanks = RANKS.filter(rank => percentage >= rank.threshold);
  return achievedRanks[achievedRanks.length - 1] || RANKS[0];
};

/**
 * Get next rank and progress towards it
 */
export const getNextRankProgress = (currentPoints, totalPossible) => {
  const percentage = totalPossible > 0 ? (currentPoints / totalPossible) * 100 : 0;
  const currentRank = getCurrentRank(currentPoints, totalPossible);
  
  // Find next rank
  const currentRankIndex = RANKS.findIndex(rank => rank.name === currentRank.name);
  const nextRank = RANKS[currentRankIndex + 1];
  
  if (!nextRank) {
    return { nextRank: null, progress: 100, pointsNeeded: 0 };
  }
  
  const pointsForNextRank = Math.ceil((nextRank.threshold / 100) * totalPossible);
  const pointsNeeded = pointsForNextRank - currentPoints;
  const progressToNext = currentRankIndex === 0 ? percentage / nextRank.threshold * 100 :
    ((percentage - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100;
  
  return {
    nextRank,
    progress: Math.min(progressToNext, 100),
    pointsNeeded: Math.max(pointsNeeded, 0)
  };
};

/**
 * Shuffle array for displaying letters
 */
export const shuffleLetters = (letters, centerLetter) => {
  const otherLetters = letters.filter(l => l !== centerLetter);
  const shuffled = [...otherLetters].sort(() => Math.random() - 0.5);
  return shuffled;
};