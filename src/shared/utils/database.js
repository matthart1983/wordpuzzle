import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '..', '..', 'highscores.db');

// Initialize database
let db;

export const initDatabase = () => {
  try {
    db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 30000');
    
    // Create tables
    createTables();
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

const createTables = () => {
  // High scores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS high_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      grid_size TEXT DEFAULT 'MINI',
      time_seconds INTEGER NOT NULL,
      hints_used INTEGER DEFAULT 0,
      mistakes INTEGER DEFAULT 0,
      date_played TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Game statistics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_type TEXT NOT NULL,
      total_games INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0,
      best_time INTEGER DEFAULT NULL,
      average_time INTEGER DEFAULT NULL,
      total_hints INTEGER DEFAULT 0,
      total_mistakes INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(game_type)
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_high_scores_game_type ON high_scores(game_type);
    CREATE INDEX IF NOT EXISTS idx_high_scores_time ON high_scores(time_seconds);
    CREATE INDEX IF NOT EXISTS idx_high_scores_date ON high_scores(date_played);
  `);
};

// Save a high score
export const saveHighScore = (gameData) => {
  if (!db) return false;

  try {
    const stmt = db.prepare(`
      INSERT INTO high_scores (
        game_type, difficulty, grid_size, time_seconds, 
        hints_used, mistakes, date_played
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      gameData.gameType,
      gameData.difficulty,
      gameData.gridSize || 'MINI',
      gameData.timeSeconds,
      gameData.hintsUsed || 0,
      gameData.mistakes || 0,
      new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    );

    // Update game statistics
    updateGameStats(gameData);

    return result.lastInsertRowid;
  } catch (error) {
    console.error('Failed to save high score:', error);
    return false;
  }
};

// Update game statistics
const updateGameStats = (gameData) => {
  try {
    // Get current stats
    const currentStats = db.prepare(`
      SELECT * FROM game_stats WHERE game_type = ?
    `).get(gameData.gameType);

    if (currentStats) {
      // Update existing stats
      const newGamesWon = currentStats.games_won + 1;
      const newTotalGames = currentStats.total_games + 1;
      const newBestTime = currentStats.best_time 
        ? Math.min(currentStats.best_time, gameData.timeSeconds)
        : gameData.timeSeconds;
      
      // Calculate new average time
      const totalTime = (currentStats.average_time || 0) * currentStats.games_won + gameData.timeSeconds;
      const newAverageTime = Math.round(totalTime / newGamesWon);

      db.prepare(`
        UPDATE game_stats SET
          total_games = ?,
          games_won = ?,
          best_time = ?,
          average_time = ?,
          total_hints = total_hints + ?,
          total_mistakes = total_mistakes + ?,
          last_updated = CURRENT_TIMESTAMP
        WHERE game_type = ?
      `).run(
        newTotalGames,
        newGamesWon,
        newBestTime,
        newAverageTime,
        gameData.hintsUsed || 0,
        gameData.mistakes || 0,
        gameData.gameType
      );
    } else {
      // Insert new stats
      db.prepare(`
        INSERT INTO game_stats (
          game_type, total_games, games_won, best_time, 
          average_time, total_hints, total_mistakes
        ) VALUES (?, 1, 1, ?, ?, ?, ?)
      `).run(
        gameData.gameType,
        gameData.timeSeconds,
        gameData.timeSeconds,
        gameData.hintsUsed || 0,
        gameData.mistakes || 0
      );
    }
  } catch (error) {
    console.error('Failed to update game stats:', error);
  }
};

// Get high scores for a specific game
export const getHighScores = (gameType, limit = 10) => {
  if (!db) return [];

  try {
    const stmt = db.prepare(`
      SELECT * FROM high_scores 
      WHERE game_type = ? 
      ORDER BY time_seconds ASC, hints_used ASC, mistakes ASC
      LIMIT ?
    `);

    return stmt.all(gameType, limit);
  } catch (error) {
    console.error('Failed to get high scores:', error);
    return [];
  }
};

// Get game statistics
export const getGameStats = (gameType) => {
  if (!db) return null;

  try {
    const stmt = db.prepare(`
      SELECT * FROM game_stats WHERE game_type = ?
    `);

    return stmt.get(gameType);
  } catch (error) {
    console.error('Failed to get game stats:', error);
    return null;
  }
};

// Get all-time leaderboard across all games
export const getLeaderboard = (limit = 20) => {
  if (!db) return [];

  try {
    const stmt = db.prepare(`
      SELECT 
        game_type,
        difficulty,
        grid_size,
        time_seconds,
        hints_used,
        mistakes,
        date_played,
        ROW_NUMBER() OVER (
          PARTITION BY game_type, difficulty, grid_size 
          ORDER BY time_seconds ASC, hints_used ASC, mistakes ASC
        ) as rank
      FROM high_scores
      ORDER BY time_seconds ASC
      LIMIT ?
    `);

    return stmt.all(limit);
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return [];
  }
};

// Record a game attempt (including losses)
export const recordGameAttempt = (gameData) => {
  if (!db) return false;

  try {
    // Get current stats
    const currentStats = db.prepare(`
      SELECT * FROM game_stats WHERE game_type = ?
    `).get(gameData.gameType);

    if (currentStats) {
      // Update total games count
      db.prepare(`
        UPDATE game_stats SET
          total_games = total_games + 1,
          total_hints = total_hints + ?,
          total_mistakes = total_mistakes + ?,
          last_updated = CURRENT_TIMESTAMP
        WHERE game_type = ?
      `).run(
        gameData.hintsUsed || 0,
        gameData.mistakes || 0,
        gameData.gameType
      );
    } else {
      // Insert new stats for losses
      db.prepare(`
        INSERT INTO game_stats (
          game_type, total_games, games_won, total_hints, total_mistakes
        ) VALUES (?, 1, 0, ?, ?)
      `).run(
        gameData.gameType,
        gameData.hintsUsed || 0,
        gameData.mistakes || 0
      );
    }

    return true;
  } catch (error) {
    console.error('Failed to record game attempt:', error);
    return false;
  }
};

// Clean up old records (optional maintenance)
export const cleanupOldRecords = (daysToKeep = 365) => {
  if (!db) return false;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const result = db.prepare(`
      DELETE FROM high_scores 
      WHERE date_played < ? 
      AND id NOT IN (
        SELECT id FROM high_scores 
        WHERE game_type = high_scores.game_type 
        ORDER BY time_seconds ASC 
        LIMIT 10
      )
    `).run(cutoffDateStr);

    console.log(`Cleaned up ${result.changes} old high score records`);
    return true;
  } catch (error) {
    console.error('Failed to cleanup old records:', error);
    return false;
  }
};

// Close database connection
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};

// Initialize database when module is imported
initDatabase();