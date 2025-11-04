// High scores utility for browser environment using localStorage
// This will serve as a fallback when SQLite is not available

const STORAGE_KEYS = {
  HIGH_SCORES: 'puzzle_high_scores',
  GAME_STATS: 'puzzle_game_stats'
};

// Generate unique ID for scores
let scoreIdCounter = 0;
const generateScoreId = () => {
  return `${Date.now()}-${++scoreIdCounter}`;
};

// Get high scores from localStorage
export const getHighScores = (gameType, limit = 10) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    const allScores = stored ? JSON.parse(stored) : {};
    const gameScores = allScores[gameType] || [];
    
    // Sort by time (ascending), then by hints used, then by mistakes
    return gameScores
      .sort((a, b) => {
        if (a.time_seconds !== b.time_seconds) {
          return a.time_seconds - b.time_seconds;
        }
        if (a.hints_used !== b.hints_used) {
          return a.hints_used - b.hints_used;
        }
        return a.mistakes - b.mistakes;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get high scores:', error);
    return [];
  }
};

// Track recent saves to prevent immediate duplicates (in-memory cache)
let recentSaves = new Map();

// Clean up old entries from recent saves (older than 30 seconds)
const cleanupRecentSaves = () => {
  const now = Date.now();
  for (const [key, timestamp] of recentSaves.entries()) {
    if (now - timestamp > 30000) {
      recentSaves.delete(key);
    }
  }
};

// Save a high score
export const saveHighScore = (gameData) => {
  try {
    cleanupRecentSaves();
    
    // Create a unique key for this game attempt
    const gameKey = `${gameData.gameType}-${gameData.playerName || 'Player'}-${gameData.difficulty}-${gameData.gridSize}-${gameData.timeSeconds}`;
    
    // Check if we just saved this exact same score
    if (recentSaves.has(gameKey)) {
      console.log('🚫 Immediate duplicate detected (in-memory), skipping save:', gameData);
      return null;
    }
    
    // Mark this save as recent
    recentSaves.set(gameKey, Date.now());
    
    const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    const allScores = stored ? JSON.parse(stored) : {};
    
    if (!allScores[gameData.gameType]) {
      allScores[gameData.gameType] = [];
    }
    
    // Check for potential duplicate based on time and player (more strict)
    const now = Date.now();
    const currentDateString = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    
    const recentDuplicate = allScores[gameData.gameType].find(score => {
      const scoreCreated = score.id ? parseInt(score.id.split('-')[0]) : 0;
      const timeDiff = Math.abs(now - scoreCreated);
      
      return (
        score.player_name === (gameData.playerName || gameData.player_name || 'Player') &&
        Math.abs(score.time_seconds - (gameData.timeSeconds || gameData.time_seconds || 0)) <= 1 && // Within 1 second
        score.difficulty === gameData.difficulty &&
        score.grid_size === gameData.gridSize &&
        timeDiff < 10000 // Within 10 seconds of creation
      );
    });
    
    if (recentDuplicate) {
      console.log('🚫 Duplicate score detected, skipping save:', {
        existing: recentDuplicate,
        attempted: gameData
      });
      return recentDuplicate.id;
    }
    
    // Add new score with timestamp (using local date)
    const newScore = {
      ...gameData,
      date_played: currentDateString, // Use local date instead of UTC
      player_name: gameData.playerName || gameData.player_name || 'Player',
      player_avatar: gameData.playerAvatar || gameData.player_avatar || '👤',
      time_seconds: gameData.timeSeconds || gameData.time_seconds || 0,
      hints_used: gameData.hintsUsed || gameData.hints_used || 0,
      mistakes: gameData.mistakes || 0,
      id: generateScoreId() // Unique ID with timestamp and counter
    };
    
    console.log('💾 Adding new score to localStorage:', newScore);
    
    allScores[gameData.gameType].push(newScore);
    
    // Keep only top 50 scores per game to prevent localStorage bloat
    allScores[gameData.gameType] = allScores[gameData.gameType]
      .sort((a, b) => {
        if (a.time_seconds !== b.time_seconds) {
          return a.time_seconds - b.time_seconds;
        }
        if (a.hints_used !== b.hints_used) {
          return a.hints_used - b.hints_used;
        }
        return a.mistakes - b.mistakes;
      })
      .slice(0, 50);
    
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(allScores));
    
    // Update game statistics
    updateGameStats(gameData);
    
    return newScore.id;
  } catch (error) {
    console.error('Failed to save high score:', error);
    return false;
  }
};

// Get game statistics
export const getGameStats = (gameType) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    const allStats = stored ? JSON.parse(stored) : {};
    return allStats[gameType] || null;
  } catch (error) {
    console.error('Failed to get game stats:', error);
    return null;
  }
};

// Update game statistics
const updateGameStats = (gameData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    const allStats = stored ? JSON.parse(stored) : {};
    
    const currentStats = allStats[gameData.gameType] || {
      total_games: 0,
      games_won: 0,
      best_time: null,
      average_time: null,
      total_hints: 0,
      total_mistakes: 0
    };
    
    // Update stats
    const newGamesWon = currentStats.games_won + 1;
    const newTotalGames = currentStats.total_games + 1;
    const newBestTime = currentStats.best_time 
      ? Math.min(currentStats.best_time, gameData.timeSeconds)
      : gameData.timeSeconds;
    
    // Calculate new average time
    const totalTime = (currentStats.average_time || 0) * currentStats.games_won + gameData.timeSeconds;
    const newAverageTime = Math.round(totalTime / newGamesWon);
    
    allStats[gameData.gameType] = {
      total_games: newTotalGames,
      games_won: newGamesWon,
      best_time: newBestTime,
      average_time: newAverageTime,
      total_hints: currentStats.total_hints + (gameData.hintsUsed || 0),
      total_mistakes: currentStats.total_mistakes + (gameData.mistakes || 0),
      last_updated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(allStats));
  } catch (error) {
    console.error('Failed to update game stats:', error);
  }
};

// Record a game attempt (including losses)
export const recordGameAttempt = (gameData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    const allStats = stored ? JSON.parse(stored) : {};
    
    const currentStats = allStats[gameData.gameType] || {
      total_games: 0,
      games_won: 0,
      best_time: null,
      average_time: null,
      total_hints: 0,
      total_mistakes: 0
    };
    
    // Update only game attempt stats (no win)
    allStats[gameData.gameType] = {
      ...currentStats,
      total_games: currentStats.total_games + 1,
      total_hints: currentStats.total_hints + (gameData.hintsUsed || 0),
      total_mistakes: currentStats.total_mistakes + (gameData.mistakes || 0),
      last_updated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(allStats));
    return true;
  } catch (error) {
    console.error('Failed to record game attempt:', error);
    return false;
  }
};

// Get leaderboard across all games
export const getLeaderboard = (limit = 20) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    const allScores = stored ? JSON.parse(stored) : {};
    
    // Combine all game scores
    const allGameScores = [];
    Object.entries(allScores).forEach(([gameType, scores]) => {
      scores.forEach(score => {
        allGameScores.push({
          ...score,
          game_type: gameType
        });
      });
    });
    
    // Sort by time and return top scores
    return allGameScores
      .sort((a, b) => {
        if (a.time_seconds !== b.time_seconds) {
          return a.time_seconds - b.time_seconds;
        }
        if (a.hints_used !== b.hints_used) {
          return a.hints_used - b.hints_used;
        }
        return a.mistakes - b.mistakes;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return [];
  }
};

// Clear all high scores (for testing or reset)
export const clearAllHighScores = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATS);
    return true;
  } catch (error) {
    console.error('Failed to clear high scores:', error);
    return false;
  }
};