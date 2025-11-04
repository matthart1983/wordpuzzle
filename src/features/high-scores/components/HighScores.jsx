import React, { useState, useEffect } from 'react';
import { getHighScores, getGameStats, getLeaderboard } from '../utils/highScores';
import '../styles/HighScores.css';

const HighScores = ({ gameType, onClose }) => {
  const [activeGameTab, setActiveGameTab] = useState(gameType || 'sudoku');
  const [activeDifficultyTab, setActiveDifficultyTab] = useState('easy');
  const [currentGameScores, setCurrentGameScores] = useState([]);
  const [easyScores, setEasyScores] = useState([]);
  const [mediumScores, setMediumScores] = useState([]);
  const [hardScores, setHardScores] = useState([]);
  const [gameStats, setGameStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighScores();
  }, [activeGameTab]);

  const loadHighScores = () => {
    setLoading(true);
    try {
      // Load all high scores for current game
      const allScores = getHighScores(activeGameTab, 50); // Get more scores to group by difficulty
      
      if (activeGameTab === 'sudoku') {
        // Group Sudoku scores by difficulty
        const easy = allScores.filter(score => score.difficulty === 'Easy').slice(0, 10);
        const medium = allScores.filter(score => score.difficulty === 'Medium').slice(0, 10);
        const hard = allScores.filter(score => score.difficulty === 'Hard').slice(0, 10);
        
        setEasyScores(easy);
        setMediumScores(medium);
        setHardScores(hard);
      } else {
        // For other games, just show all scores (they'll be grouped differently)
        setEasyScores(allScores.slice(0, 10));
        setMediumScores([]);
        setHardScores([]);
      }
      
      setCurrentGameScores(allScores.slice(0, 10)); // Keep overall top 10 for comparison

      // Load game statistics
      const stats = getGameStats(activeGameTab);
      setGameStats(stats);

      // Load overall leaderboard (grouped by difficulty)
      const leaderboardData = getLeaderboard(30);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load high scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    // Ensure seconds is a valid number
    const timeInSeconds = Number(seconds);
    if (isNaN(timeInSeconds) || timeInSeconds < 0) {
      return '0:00';
    }
    
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getGridSizeDisplay = (gridSize) => {
    const gridDisplayNames = {
      'MINI': '4×4 Mini',
      'CLASSIC': '9×9 Classic'
    };
    return gridDisplayNames[gridSize] || gridSize || 'Default';
  };

  const formatGameScore = (score) => {
    switch (activeGameTab) {
      case 'sudoku':
        return {
          primaryValue: formatTime(score.time_seconds),
          meta: `${score.difficulty} • ${getGridSizeDisplay(score.grid_size)}${score.hints_used > 0 ? ` • ${score.hints_used} hints` : ''}${score.mistakes > 0 ? ` • ${score.mistakes} mistakes` : ''}`,
          sortValue: score.time_seconds
        };
      case 'wordle':
        return {
          primaryValue: `${score.attempts}/${score.maxAttempts} attempts`,
          meta: `${formatTime(score.timeSeconds)} • ${score.wordLength} letters`,
          sortValue: score.attempts * 1000 + score.timeSeconds // Sort by attempts first, then time
        };
      case '2048':
        return {
          primaryValue: score.finalScore?.toLocaleString() || '0',
          meta: `${formatTime(score.timeSeconds)} • ${score.highestTile} tile • ${score.totalMoves} moves`,
          sortValue: -(score.finalScore || 0) // Negative for descending order (higher scores first)
        };
      case 'spelling-bee':
        return {
          primaryValue: `${score.finalScore} pts (${score.completionPercentage}%)`,
          meta: `${score.difficulty} • ${score.wordsFound} words • ${formatTime(score.timeSeconds)}${score.isQueenBee ? ' • 🐝 Queen Bee!' : ''}`,
          sortValue: -(score.finalScore || 0) // Negative for descending order (higher scores first)
        };
      default:
        return {
          primaryValue: formatTime(score.time_seconds),
          meta: score.difficulty || 'Standard',
          sortValue: score.time_seconds
        };
    }
  };

  const getGameDisplayName = (gameType) => {
    const gameNames = {
      'sudoku': 'Sudoku',
      'wordle': 'Wordle',
      '2048': '2048',
      'spelling-bee': 'Spelling Bee'
    };
    return gameNames[gameType] || gameType;
  };

  const renderCurrentGameScores = () => (
    <div className="scores-section">
      <h3>{getGameDisplayName(activeGameTab)} - Best Scores</h3>
      {currentGameScores.length === 0 ? (
        <div className="no-scores">
          <p>No high scores yet!</p>
          <p>Complete a game to see your best scores here.</p>
        </div>
      ) : (
        <div className="scores-list">
          {currentGameScores.map((score, index) => {
            const formattedScore = formatGameScore(score);
            return (
              <div key={score.id} className={`score-item ${index === 0 ? 'best-score' : ''}`}>
                <div className="score-rank">#{index + 1}</div>
                <div className="score-details">
                  <div className="score-time">{formattedScore.primaryValue}</div>
                  <div className="score-meta">{formattedScore.meta}</div>
                  <div className="score-player">
                    <span className="player-avatar">{score.player_avatar || '👤'}</span>
                    <span className="player-name">{score.player_name || 'Anonymous'}</span>
                  </div>
                  <div className="score-date">{formatDate(score.date_played)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderDifficultyScores = (scores, difficulty) => (
    <div className="scores-section">
      <h3>{difficulty} - Best Times</h3>
      {scores.length === 0 ? (
        <div className="no-scores">
          <p>No {difficulty.toLowerCase()} scores yet!</p>
          <p>Complete a {difficulty.toLowerCase()} game to see your best times here.</p>
        </div>
      ) : (
        <div className="scores-list">
          {scores.map((score, index) => (
            <div key={score.id} className={`score-item ${index === 0 ? 'best-score' : ''}`}>
              <div className="score-rank">#{index + 1}</div>
              <div className="score-details">
                <div className="score-time">{formatTime(score.time_seconds)}</div>
                <div className="score-meta">
                  {getGridSizeDisplay(score.grid_size)}
                  {score.hints_used > 0 && ` • ${score.hints_used} hints`}
                  {score.mistakes > 0 && ` • ${score.mistakes} mistakes`}
                </div>
                <div className="score-player">
                  <span className="player-avatar">{score.player_avatar || '👤'}</span>
                  <span className="player-name">{score.player_name || 'Anonymous'}</span>
                </div>
                <div className="score-date">{formatDate(score.date_played)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGameStats = () => (
    <div className="stats-section">
      <h3>Game Statistics</h3>
      {gameStats ? (
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Games Played</span>
            <span className="stat-value">{gameStats.total_games}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Games Won</span>
            <span className="stat-value">{gameStats.games_won}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">
              {gameStats.total_games > 0 
                ? Math.round((gameStats.games_won / gameStats.total_games) * 100) 
                : 0}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Best Time</span>
            <span className="stat-value">
              {gameStats.best_time ? formatTime(gameStats.best_time) : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Time</span>
            <span className="stat-value">
              {gameStats.average_time ? formatTime(gameStats.average_time) : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Hints</span>
            <span className="stat-value">{gameStats.total_hints}</span>
          </div>
        </div>
      ) : (
        <div className="no-stats">
          <p>No statistics available yet.</p>
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => (
    <div className="scores-section">
      <h3>Global Leaderboard</h3>
      {leaderboard.length === 0 ? (
        <div className="no-scores">
          <p>No scores on the leaderboard yet!</p>
        </div>
      ) : (
        <div className="scores-list">
          {leaderboard.map((score, index) => (
            <div key={score.id || `leaderboard-${index}`} className="score-item leaderboard-item">
              <div className="score-rank">#{index + 1}</div>
              <div className="score-details">
                <div className="score-game">Sudoku {getGridSizeDisplay(score.grid_size)}</div>
                <div className="score-time">{formatTime(score.time_seconds)}</div>
                <div className="score-meta">
                  {score.difficulty} • {getGridSizeDisplay(score.grid_size)}
                  {score.hints_used > 0 && ` • ${score.hints_used} hints`}
                </div>
                <div className="score-player">
                  <span className="player-avatar">{score.player_avatar || '👤'}</span>
                  <span className="player-name">{score.player_name || 'Anonymous'}</span>
                </div>
                <div className="score-date">{formatDate(score.date_played)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal high-scores-modal">
          <div className="modal-header">
            <h2>High Scores</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading">Loading scores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal high-scores-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>High Scores</h2>
          <button className="high-scores-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Game Tabs */}
        <div className="tabs game-tabs">
          <button 
            className={`tab ${activeGameTab === 'sudoku' ? 'active' : ''}`}
            onClick={() => setActiveGameTab('sudoku')}
          >
            🧩 Sudoku
          </button>
          <button 
            className={`tab ${activeGameTab === 'wordle' ? 'active' : ''}`}
            onClick={() => setActiveGameTab('wordle')}
          >
            📝 Wordle
          </button>
          <button 
            className={`tab ${activeGameTab === '2048' ? 'active' : ''}`}
            onClick={() => setActiveGameTab('2048')}
          >
            🎮 2048
          </button>
          <button 
            className={`tab ${activeGameTab === 'spelling-bee' ? 'active' : ''}`}
            onClick={() => setActiveGameTab('spelling-bee')}
          >
            🐝 Spelling Bee
          </button>
        </div>

        {/* Difficulty Tabs (only for Sudoku) */}
        {activeGameTab === 'sudoku' && (
          <div className="tabs difficulty-tabs">
            <button 
              className={`tab ${activeDifficultyTab === 'easy' ? 'active' : ''}`}
              onClick={() => setActiveDifficultyTab('easy')}
            >
              Easy
            </button>
            <button 
              className={`tab ${activeDifficultyTab === 'medium' ? 'active' : ''}`}
              onClick={() => setActiveDifficultyTab('medium')}
            >
              Medium
            </button>
            <button 
              className={`tab ${activeDifficultyTab === 'hard' ? 'active' : ''}`}
              onClick={() => setActiveDifficultyTab('hard')}
            >
              Hard
            </button>
            <button 
              className={`tab ${activeDifficultyTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveDifficultyTab('stats')}
            >
              Statistics
            </button>
          </div>
        )}

        <div className="tab-content">
          {activeGameTab === 'sudoku' && activeDifficultyTab === 'easy' && renderDifficultyScores(easyScores, 'Easy')}
          {activeGameTab === 'sudoku' && activeDifficultyTab === 'medium' && renderDifficultyScores(mediumScores, 'Medium')}
          {activeGameTab === 'sudoku' && activeDifficultyTab === 'hard' && renderDifficultyScores(hardScores, 'Hard')}
          {activeGameTab === 'sudoku' && activeDifficultyTab === 'stats' && renderGameStats()}
          {activeGameTab !== 'sudoku' && renderCurrentGameScores()}
        </div>
      </div>
    </div>
  );
};

export default HighScores;