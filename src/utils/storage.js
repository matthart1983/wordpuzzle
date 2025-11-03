/**
 * Local storage utilities for persisting game state
 */

const STORAGE_KEYS = {
  GAME_STATE: 'wordguess-game-state',
  STATISTICS: 'wordguess-statistics',
  SETTINGS: 'wordguess-settings'
};

/**
 * Save game state to localStorage
 */
export const saveGameState = (gameState) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

/**
 * Load game state from localStorage
 */
export const loadGameState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

/**
 * Clear game state from localStorage
 */
export const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

/**
 * Save statistics to localStorage
 */
export const saveStatistics = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save statistics:', error);
  }
};

/**
 * Load statistics from localStorage
 */
export const loadStatistics = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STATISTICS);
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0] // Index 0 = 1 guess, etc.
    };
  } catch (error) {
    console.error('Failed to load statistics:', error);
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };
  }
};

/**
 * Save settings to localStorage
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

/**
 * Load settings from localStorage
 */
export const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      darkMode: true,
      highContrast: false,
      colorBlindMode: false
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      darkMode: true,
      highContrast: false,
      colorBlindMode: false
    };
  }
};

/**
 * Update statistics after a game
 */
export const updateStatistics = (won, guessCount) => {
  const stats = loadStatistics();
  
  stats.gamesPlayed++;
  
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    
    // Update guess distribution (guessCount is 1-6, array is 0-indexed)
    if (guessCount >= 1 && guessCount <= 6) {
      stats.guessDistribution[guessCount - 1]++;
    }
  } else {
    stats.currentStreak = 0;
  }
  
  saveStatistics(stats);
  return stats;
};

/**
 * Get formatted statistics for display
 */
export const getFormattedStatistics = () => {
  const stats = loadStatistics();
  
  return {
    ...stats,
    winPercentage: stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0
  };
};