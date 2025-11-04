import React from 'react';
import { useSamuraiSudoku } from '../../context/SamuraiSudokuContext';
import './SamuraiControls.css';

const SamuraiControls = () => {
  const {
    gameState,
    difficulty,
    timer,
    moves,
    hintsUsed,
    errors,
    startNewGame,
    pauseGame,
    resumeGame,
    undoMove,
    redoMove,
    useHint,
    canUndo,
    canRedo
  } = useSamuraiSudoku();

  const handleNewGame = (difficulty) => {
    if (window.confirm('Start a new game? Current progress will be lost.')) {
      startNewGame(difficulty);
    }
  };

  const handleAutoSolve = () => {
    if (window.confirm('Auto-solve the puzzle? This will complete the entire game.')) {
      // Auto-solve functionality to be implemented
      console.log('Auto-solve not yet implemented');
    }
  };

  const handleHint = () => {
    const hintUsed = useHint();
    if (!hintUsed) {
      alert('No hints available for the current position.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="samurai-controls">
      <div className="controls-section game-info">
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{formatTime(timer || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Moves:</span>
            <span className="stat-value">{moves || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Hints:</span>
            <span className="stat-value">{hintsUsed || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Errors:</span>
            <span className="stat-value">{errors || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Difficulty:</span>
            <span className="stat-value difficulty">{difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Medium'}</span>
          </div>
        </div>
      </div>

      <div className="controls-section game-actions">
        <div className="action-group">
          <button
            className="control-btn primary"
            onClick={() => handleNewGame('easy')}
            title="Start new easy game"
          >
            Easy Game
          </button>
          <button
            className="control-btn primary"
            onClick={() => handleNewGame('medium')}
            title="Start new medium game"
          >
            Medium Game
          </button>
          <button
            className="control-btn primary"
            onClick={() => handleNewGame('hard')}
            title="Start new hard game"
          >
            Hard Game
          </button>
          <button
            className="control-btn primary"
            onClick={() => handleNewGame('expert')}
            title="Start new expert game"
          >
            Expert Game
          </button>
        </div>

        <div className="action-group">
          {gameState === 'playing' ? (
            <button
              className="control-btn secondary"
              onClick={pauseGame}
              title="Pause game"
            >
              ⏸️ Pause
            </button>
          ) : gameState === 'paused' ? (
            <button
              className="control-btn secondary"
              onClick={resumeGame}
              title="Resume game"
            >
              ▶️ Resume
            </button>
          ) : null}
        </div>

        <div className="action-group">
          <button
            className="control-btn secondary"
            onClick={undoMove}
            disabled={!canUndo}
            title="Undo last move"
          >
            ↶ Undo
          </button>
          <button
            className="control-btn secondary"
            onClick={redoMove}
            disabled={!canRedo}
            title="Redo move"
          >
            ↷ Redo
          </button>
        </div>

        <div className="action-group">
          <button
            className="control-btn tertiary"
            onClick={handleHint}
            disabled={gameState?.status !== 'playing'}
            title="Get a hint"
          >
            💡 Hint
          </button>
          <button
            className="control-btn tertiary"
            onClick={handleAutoSolve}
            disabled={gameState?.status !== 'playing'}
            title="Auto-solve puzzle"
          >
            🤖 Auto-Solve
          </button>
        </div>
      </div>

      <div className="controls-section progress-info">
        <div className="progress-stats">
          <div className="progress-item">
            <span className="progress-label">Completed:</span>
            <span className="progress-value">
              {gameState?.cellsCompleted || 0} / {21 * 21}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${((gameState?.cellsCompleted || 0) / (21 * 21)) * 100}%` 
                }}
              />
            </div>
          </div>
          
          <div className="progress-item">
            <span className="progress-label">Accuracy:</span>
            <span className="progress-value">
              {(gameState?.totalMoves || 0) > 0 
                ? Math.round((1 - (gameState?.mistakes || 0) / (gameState?.totalMoves || 1)) * 100)
                : 100}%
            </span>
          </div>
          
          <div className="progress-item">
            <span className="progress-label">Mistakes:</span>
            <span className="progress-value mistakes">
              {gameState?.mistakes || 0}
            </span>
          </div>
        </div>
      </div>

      {gameState?.status === 'completed' && (
        <div className="controls-section completion-message">
          <div className="completion-content">
            <h3>🎉 Congratulations!</h3>
            <p>You completed the Samurai Sudoku!</p>
            <div className="final-stats">
              <span>Time: {formatTime(gameState?.gameTime || 0)}</span>
              <span>Score: {(gameState?.score || 0).toLocaleString()}</span>
              <span>Hints: {gameState?.hintsUsed || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SamuraiControls;