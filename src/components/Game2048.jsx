import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGame2048 } from '../context/Game2048Context';
import { getUserDisplayName, getUserProfile } from '../utils/userProfile';
import { getSettings, updateSettings, initializeSettings } from '../utils/settings';
import Header from './Header';
import HighScores from './HighScores';
import UserProfile from './UserProfile';
import { SettingsModal } from './Modal';
import { getTileColor, GRID_SIZE } from '../utils/game2048Logic';
import './Game2048.css';

const Game2048 = ({ onBackToMenu }) => {
  const {
    grid,
    score,
    bestScore,
    gameState,
    hasWonBefore,
    moveCount,
    canUndo,
    newTilePosition,
    lastMoveTime,
    isAnimating,
    makeMove,
    startNewGame,
    continueGame,
    undoMove,
    resetGame,
    getCurrentHint,
    getFormattedScore,
    getFormattedBestScore,
    formatPlayTime,
    getGameStats,
    DIRECTIONS,
    GAME_STATES
  } = useGame2048();
  
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [settings, setSettings] = useState(getSettings);
  const [userName, setUserName] = useState(getUserDisplayName());
  const [userAvatar, setUserAvatar] = useState(getUserProfile().avatar);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Handle keyboard input
  const handleKeyPress = useCallback((e) => {
    if (showWinModal || showLoseModal || showStatsModal || showHowToPlay || showHighScores) return;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        makeMove(DIRECTIONS.UP);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        makeMove(DIRECTIONS.DOWN);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        makeMove(DIRECTIONS.LEFT);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        makeMove(DIRECTIONS.RIGHT);
        break;
      case 'u':
      case 'U':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          undoMove();
        }
        break;
      case 'r':
      case 'R':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleReset();
        }
        break;
    }
  }, [makeMove, undoMove, showWinModal, showLoseModal, showStatsModal, showHowToPlay]);
  
  // Handle touch events for swipe gestures
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;
    const isDownSwipe = distanceY < -50;
    
    // Determine if it's a horizontal or vertical swipe
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe) {
        makeMove(DIRECTIONS.LEFT);
      } else if (isRightSwipe) {
        makeMove(DIRECTIONS.RIGHT);
      }
    } else {
      if (isUpSwipe) {
        makeMove(DIRECTIONS.UP);
      } else if (isDownSwipe) {
        makeMove(DIRECTIONS.DOWN);
      }
    }
  };
  
  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
  
  // Handle game state changes
  useEffect(() => {
    if (gameState === GAME_STATES.WON && !hasWonBefore) {
      setShowWinModal(true);
    } else if (gameState === GAME_STATES.LOST) {
      setShowLoseModal(true);
    }
  }, [gameState, hasWonBefore]);
  
  // Handle reset with confirmation
  const handleReset = () => {
    if (moveCount > 0) {
      if (window.confirm('Start a new game? Your current progress will be lost.')) {
        resetGame();
      }
    } else {
      resetGame();
    }
  };
  
  // Handle new game
  const handleNewGame = () => {
    if (moveCount > 0) {
      if (window.confirm('Start a new game? Your current progress will be lost.')) {
        startNewGame();
      }
    } else {
      startNewGame();
    }
  };
  
  // Handle continue after win
  const handleContinue = () => {
    continueGame();
    setShowWinModal(false);
  };
  
  // Handle try again after loss
  const handleTryAgain = () => {
    startNewGame();
    setShowLoseModal(false);
  };

  // Handle settings changes
  const handleSettingsChange = (newSettings) => {
    const updatedSettings = updateSettings(newSettings);
    setSettings(updatedSettings);
  };

  // Handle user profile updates
  const handleUserProfileUpdate = useCallback(() => {
    const profile = getUserProfile();
    setUserName(getUserDisplayName());
    setUserAvatar(profile.avatar);
  }, []);

  // Initialize settings on mount
  useEffect(() => {
    const initialSettings = initializeSettings();
    setSettings(initialSettings);
  }, []);
  
  // Render grid with performance optimizations
  const renderGrid = useCallback(() => {
    return (
      <div 
        className="game-grid"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            if (value === 0) {
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="tile empty"
                />
              );
            }

            const tileColor = getTileColor(value);
            const isNewTile = newTilePosition?.row === rowIndex && newTilePosition?.col === colIndex;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`tile ${isNewTile ? 'tile-new' : 'tile-slide'}`}
                style={{
                  backgroundColor: tileColor.bg,
                  color: tileColor.text,
                }}
              >
                {value}
              </div>
            );
          })
        )}
      </div>
    );
  }, [grid, newTilePosition, handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  // Render game controls
  const renderControls = () => {
    return (
      <div className="game-controls">
        <button className="control-btn" onClick={handleNewGame}>
          New Game
        </button>
        <button 
          className="control-btn" 
          onClick={undoMove}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button className="control-btn" onClick={handleReset}>
          Reset
        </button>
        <button className="control-btn" onClick={() => setShowStatsModal(true)}>
          Stats
        </button>
        <button className="control-btn" onClick={() => setShowHowToPlay(true)}>
          How to Play
        </button>
      </div>
    );
  };
  
  // Render score section
  const renderScores = () => {
    return (
      <div className="score-section">
        <div className="score-box">
          <div className="score-label">Score</div>
          <div className="score-value">{getFormattedScore()}</div>
        </div>
        <div className="score-box">
          <div className="score-label">Best</div>
          <div className="score-value">{getFormattedBestScore()}</div>
        </div>
      </div>
    );
  };
  
  // Render game info
  const renderGameInfo = () => {
    return (
      <div className="game-info">
        <div className="info-item">
          <span className="info-label">Moves:</span>
          <span className="info-value">{moveCount}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Time:</span>
          <span className="info-value">{formatPlayTime()}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-2048">
      <Header 
        title="2048"
        userName={userName}
        userAvatar={userAvatar}
        onBackClick={onBackToMenu}
        onHighScoresClick={() => setShowHighScores(true)}
        onSettingsClick={() => setShowSettings(true)}
        onUserProfileClick={() => setShowUserProfile(true)}
        showBackButton={true}
        showResetButton={false}
        showHighScores={true}
      />
      
      <div className="game-container">
        {renderScores()}
        {renderGameInfo()}
        {renderGrid()}
        {renderControls()}
        
        <div className="game-instructions">
          <p>Use arrow keys or WASD to move tiles</p>
          <p>Swipe on mobile devices</p>
        </div>
      </div>
      
      {/* Win Modal */}
      {showWinModal && (
        <div className="modal-overlay">
          <div className="modal win-modal">
            <h2>🎉 You Win!</h2>
            <p>You reached 2048!</p>
            <div className="modal-stats">
              <p>Score: {getFormattedScore()}</p>
              <p>Moves: {moveCount}</p>
              <p>Time: {formatPlayTime()}</p>
            </div>
            <div className="modal-buttons">
              <button className="modal-btn primary" onClick={handleContinue}>
                Keep Playing
              </button>
              <button className="modal-btn secondary" onClick={handleTryAgain}>
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lose Modal */}
      {showLoseModal && (
        <div className="modal-overlay">
          <div className="modal lose-modal">
            <h2>😞 Game Over</h2>
            <p>No more moves available!</p>
            <div className="modal-stats">
              <p>Final Score: {getFormattedScore()}</p>
              <p>Best Score: {getFormattedBestScore()}</p>
              <p>Moves: {moveCount}</p>
              <p>Time: {formatPlayTime()}</p>
            </div>
            <div className="modal-buttons">
              <button className="modal-btn primary" onClick={handleTryAgain}>
                Try Again
              </button>
              <button className="modal-btn secondary" onClick={() => setShowLoseModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="modal stats-modal" onClick={e => e.stopPropagation()}>
            <h3>Game Statistics</h3>
            <div className="stats-grid">
              {(() => {
                const stats = getGameStats();
                return (
                  <>
                    <div className="stat-item">
                      <div className="stat-value">{stats.gamesPlayed}</div>
                      <div className="stat-label">Games Played</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.winRate}%</div>
                      <div className="stat-label">Win Rate</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{getFormattedBestScore()}</div>
                      <div className="stat-label">Best Score</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.currentTile}</div>
                      <div className="stat-label">Highest Tile</div>
                    </div>
                  </>
                );
              })()}
            </div>
            <button 
              className="close-btn"
              onClick={() => setShowStatsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="modal how-to-play-modal" onClick={e => e.stopPropagation()}>
            <h3>How to Play 2048</h3>
            <div className="instructions">
              <p><strong>Goal:</strong> Combine tiles to reach the 2048 tile!</p>
              
              <div className="rule">
                <strong>How to Play:</strong>
                <ul>
                  <li>Use arrow keys or WASD to move tiles</li>
                  <li>Swipe in any direction on mobile</li>
                  <li>When two tiles with the same number touch, they merge into one</li>
                  <li>After each move, a new tile (2 or 4) appears randomly</li>
                  <li>Win by creating a 2048 tile</li>
                  <li>Lose when no moves are possible</li>
                </ul>
              </div>
              
              <div className="tips">
                <strong>Tips:</strong>
                <ul>
                  <li>Keep your highest tile in a corner</li>
                  <li>Build up tiles in one direction</li>
                  <li>Don't move randomly - think ahead</li>
                  <li>Use the undo button sparingly</li>
                </ul>
              </div>
              
              <div className="controls">
                <strong>Controls:</strong>
                <ul>
                  <li>Arrow keys or WASD: Move tiles</li>
                  <li>Ctrl+U: Undo last move</li>
                  <li>Ctrl+R: Reset game</li>
                </ul>
              </div>
            </div>
            <button 
              className="close-btn"
              onClick={() => setShowHowToPlay(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
      
      {/* High Scores Modal */}
      {showHighScores && (
        <HighScores
          gameType="2048"
          onClose={() => setShowHighScores(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile
          gameType="2048"
          onClose={() => setShowUserProfile(false)}
          onProfileUpdate={handleUserProfileUpdate}
        />
      )}
    </div>
  );
};

export default Game2048;