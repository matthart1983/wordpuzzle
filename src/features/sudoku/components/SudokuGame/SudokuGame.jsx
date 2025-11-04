import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSudoku } from '../../context/SudokuContext';
import { getUserDisplayName, getUserProfile } from '../../../../shared/utils/userProfile.js';
import { getSettings, updateSettings, initializeSettings } from '../../../../shared/utils/settings.js';
import Header from '../../../../shared/components/Header';
import HighScores from '../../../high-scores/components/HighScores';
import UserProfile from '../../../user-profile/components/UserProfile';
import { SettingsModal } from '../../../../shared/components/Modal';
import { EMPTY_CELL, DIFFICULTY, GRID_SIZES } from '../../utils/sudokuLogic';
import './SudokuGame.css';

const SudokuGame = ({ onBackToMenu }) => {
  const {
    puzzle,
    currentGrid,
    gameState,
    gridType,
    difficulty,
    elapsedTime,
    hintsUsed,
    mistakes,
    selectedCell,
    errorMessage,
    setCell,
    clearCell,
    startNewGame,
    resetGame,
    useHint,
    setDifficulty,
    setGridType,
    setSelectedCell,
    clearError,
    formatTime,
    isCellGiven,
    hasCellError,
    GRID_SIZES,
    DIFFICULTY
  } = useSudoku();
  
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getSettings);
  const [userName, setUserName] = useState(getUserDisplayName());
  const [userAvatar, setUserAvatar] = useState(getUserProfile().avatar);
  const previousGridType = useRef(gridType);

  // Stable click handler for new game button
  const handleNewGameClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDifficultyModal(true);
  }, []);

  // Function to update user name when profile changes
  const handleUserProfileUpdate = useCallback(() => {
    const profile = getUserProfile();
    setUserName(getUserDisplayName());
    setUserAvatar(profile.avatar);
  }, []);

  // Handle settings changes
  const handleSettingsChange = (newSettings) => {
    const updatedSettings = updateSettings(newSettings);
    setSettings(updatedSettings);
  };

  // Initialize settings on mount
  useEffect(() => {
    const initialSettings = initializeSettings();
    setSettings(initialSettings);
  }, []);

  // Start new game when grid type changes (but not on initial mount)
  useEffect(() => {
    if (previousGridType.current !== gridType) {
      const currentDifficulty = DIFFICULTY[gridType].MEDIUM;
      startNewGame(currentDifficulty, true);
      previousGridType.current = gridType;
    }
  }, [gridType]); // Only depend on gridType, not startNewGame
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameState === 'won') return;
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedCell(null, null);
    } else {
      setSelectedCell(row, col);
    }
    
    if (errorMessage) {
      clearError();
    }
  };
  
  // Handle number input
  const handleNumberInput = (number) => {
    if (!selectedCell || gameState === 'won') return;
    
    const { row, col } = selectedCell;
    
    // Don't allow changes to given cells
    if (isCellGiven(row, col)) return;
    
    if (currentGrid[row][col] === number) {
      clearCell(row, col);
    } else {
      setCell(row, col, number);
    }
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedCell || gameState === 'won') return;
      
      const maxNum = GRID_SIZES[gridType].maxNum;
      const num = parseInt(e.key);
      if (num >= 1 && num <= maxNum) {
        e.preventDefault();
        handleNumberInput(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        const { row, col } = selectedCell;
        if (!isCellGiven(row, col)) {
          clearCell(row, col);
        }
      } else if (e.key === 'Escape') {
        setSelectedCell(null, null);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, gameState, gridType, clearCell, setSelectedCell]);
  
  // Handle new game with difficulty
  const handleNewGame = (newDifficulty) => {
    setDifficulty(newDifficulty);
    startNewGame(newDifficulty, true);
    setShowDifficultyModal(false);
  };
  
  // Handle reset current game
  const handleReset = () => {
    if (window.confirm('Reset current puzzle? Your progress will be lost.')) {
      resetGame();
    }
  };
  
  // Get cell CSS classes
  const getCellClasses = (row, col) => {
    const classes = ['sudoku-cell'];
    
    if (isCellGiven(row, col)) {
      classes.push('given');
    }
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      classes.push('selected');
    }
    
    if (hasCellError(row, col)) {
      classes.push('error');
    }
    
    // Highlight same numbers
    if (selectedCell && currentGrid[row][col] !== EMPTY_CELL && 
        currentGrid[row][col] === currentGrid[selectedCell.row][selectedCell.col]) {
      classes.push('highlighted');
    }
    
    // Subgrid borders
    const gridSize = GRID_SIZES[gridType].size;
    const subgridSize = GRID_SIZES[gridType].subgridSize;
    
    if ((row + 1) % subgridSize === 0 && row < gridSize - 1) {
      classes.push('border-bottom');
    }
    if ((col + 1) % subgridSize === 0 && col < gridSize - 1) {
      classes.push('border-right');
    }
    
    return classes.join(' ');
  };
  
  // Render game grid
  const renderGrid = () => {
    const gridSize = GRID_SIZES[gridType].size;
    
    return (
      <div className={`sudoku-grid grid-${gridSize}x${gridSize}`}>
        {currentGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClasses(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell !== EMPTY_CELL ? cell : ''}
            </div>
          ))
        )}
      </div>
    );
  };
  
  // Render number input buttons
  const renderNumberButtons = () => {
    const maxNum = GRID_SIZES[gridType].maxNum;
    const numbers = Array.from({length: maxNum}, (_, i) => i + 1);
    const gridSize = GRID_SIZES[gridType].size;
    
    return (
      <div className={`number-buttons grid-${gridSize}x${gridSize}-buttons`}>
        {numbers.map(num => (
          <button
            key={num}
            className={`number-btn ${
              selectedCell && 
              currentGrid[selectedCell.row][selectedCell.col] === num ? 'active' : ''
            }`}
            onClick={() => handleNumberInput(num)}
            disabled={!selectedCell || gameState === 'won'}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };
  
  // Render game controls
  const renderControls = () => {
    return (
      <div className="game-controls">
        <button 
          className="control-btn"
          onClick={handleNewGameClick}
        >
          New Game
        </button>
        <button 
          className="control-btn"
          onClick={handleReset}
          disabled={gameState === 'won'}
        >
          Reset
        </button>
        <button 
          className="control-btn"
          onClick={useHint}
          disabled={gameState === 'won'}
        >
          Hint
        </button>
        <button 
          className="control-btn"
          onClick={() => setShowHowToPlay(true)}
        >
          How to Play
        </button>
      </div>
    );
  };
  
  // Render game stats
  const renderStats = () => {
    return (
      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Difficulty:</span>
          <span className="stat-value">{difficulty.name}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Hints:</span>
          <span className="stat-value">{hintsUsed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Mistakes:</span>
          <span className="stat-value">{mistakes}</span>
        </div>
      </div>
    );
  };
  
  // Render grid size selector
  const renderGridSelector = () => {
    return (
      <div className="grid-selector">
        <label htmlFor="grid-size">Grid Size:</label>
        <select 
          id="grid-size"
          value={gridType} 
          onChange={(e) => setGridType(e.target.value)}
          disabled={gameState === 'playing' && !isGridEmpty()}
        >
          <option value="MINI">4×4 Mini</option>
          <option value="CLASSIC">9×9 Classic</option>
        </select>
      </div>
    );
  };

  // Check if grid is empty (no moves made)
  const isGridEmpty = () => {
    return currentGrid.every(row => 
      row.every((cell, colIndex) => 
        cell === puzzle[currentGrid.indexOf(row)][colIndex]
      )
    );
  };

  return (
    <div className="sudoku-game">
      <Header 
        title={gridType === 'MINI' ? "SUDOKU MINI" : "SUDOKU CLASSIC"}
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
        {renderGridSelector()}
        {renderStats()}
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
            <button onClick={clearError}>×</button>
          </div>
        )}
        
        {gameState === 'won' && (
          <div className="win-message">
            🎉 Congratulations! Puzzle solved in {formatTime(elapsedTime)}!
          </div>
        )}
        
        {renderGrid()}
        {renderNumberButtons()}
        {renderControls()}
      </div>
      
      {/* Difficulty Selection Modal */}
      {showDifficultyModal && (
        <div className="modal-overlay" onClick={() => setShowDifficultyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Select Difficulty</h3>
            <div className="difficulty-options">
              {Object.values(DIFFICULTY[gridType]).map(diff => (
                <button
                  key={diff.name}
                  className={`difficulty-btn ${difficulty.name === diff.name ? 'active' : ''}`}
                  onClick={() => handleNewGame(diff)}
                >
                  <div className="difficulty-name">{diff.name}</div>
                  <div className="difficulty-desc">
                    {diff.cellsToRemove} empty cells
                  </div>
                </button>
              ))}
            </div>
            <button 
              className="close-btn"
              onClick={() => setShowDifficultyModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="modal how-to-play" onClick={e => e.stopPropagation()}>
            <h3>How to Play Sudoku Mini</h3>
            <div className="instructions">
              <p><strong>Goal:</strong> Fill the 4×4 grid with numbers 1-4</p>
              <div className="rule">
                <strong>Rules:</strong>
                <ul>
                  <li>Each row must contain numbers 1, 2, 3, and 4</li>
                  <li>Each column must contain numbers 1, 2, 3, and 4</li>
                  <li>Each 2×2 box must contain numbers 1, 2, 3, and 4</li>
                  <li>No number can repeat in any row, column, or 2×2 box</li>
                </ul>
              </div>
              <div className="tips">
                <strong>Tips:</strong>
                <ul>
                  <li>Click a cell to select it, then click a number button</li>
                  <li>Use keyboard numbers 1-4 to fill cells</li>
                  <li>Press Backspace or Delete to clear a cell</li>
                  <li>Use hints when stuck, but try to solve logically first</li>
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
          gameType="sudoku"
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
          gameType="sudoku"
          onClose={() => setShowUserProfile(false)}
          onProfileUpdate={handleUserProfileUpdate}
        />
      )}
    </div>
  );
};

export default SudokuGame;