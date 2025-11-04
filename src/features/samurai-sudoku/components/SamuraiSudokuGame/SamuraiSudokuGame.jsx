import React, { useEffect, useState, useCallback } from 'react';
import { SamuraiSudokuProvider, useSamuraiSudoku } from '../../context/SamuraiSudokuContext.jsx';
import { getUserDisplayName, getUserProfile } from '../../../../shared/utils/userProfile.js';
import { getSettings, updateSettings, initializeSettings } from '../../../../shared/utils/settings.js';
import Header from '../../../../shared/components/Header';
import HighScores from '../../../high-scores/components/HighScores';
import UserProfile from '../../../user-profile/components/UserProfile';
import { SettingsModal } from '../../../../shared/components/Modal';
import SamuraiGrid from '../SamuraiGrid';
import SamuraiControls from '../SamuraiControls';
import '../../SamuraiSudoku.css';
import './SamuraiSudokuGame.css';

const SamuraiSudokuContent = ({ onBackToMenu }) => {
  const {
    gameState,
    difficulty,
    timer,
    moves,
    hintsUsed,
    errors,
    canUndo,
    canRedo,
    isGenerating,
    settings,
    startNewGame,
    pauseGame,
    resumeGame,
    undoMove,
    redoMove,
    useHint,
    toggleSetting
  } = useSamuraiSudoku();

  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [gameSettings, setGameSettings] = useState(getSettings('samurai-sudoku') || {});
  const [userProfile, setUserProfile] = useState(getUserProfile());

  // Initialize settings on mount
  useEffect(() => {
    initializeSettings('samurai-sudoku', {
      difficulty: 'medium',
      showTimer: true,
      highlightRelated: true,
      soundEnabled: true
    });
  }, []);

  // Format timer display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle new game
  const handleNewGame = useCallback((selectedDifficulty) => {
    startNewGame(selectedDifficulty || difficulty);
  }, [startNewGame, difficulty]);

  // Handle settings change
  const handleSettingsChange = useCallback((key, value) => {
    const newSettings = { ...gameSettings, [key]: value };
    setGameSettings(newSettings);
    updateSettings('samurai-sudoku', newSettings);
    
    // Update game settings if applicable
    if (key in settings) {
      toggleSetting(key);
    }
  }, [gameSettings, settings, toggleSetting]);

  // Handle profile update
  const handleProfileUpdate = useCallback(() => {
    setUserProfile(getUserProfile());
  }, []);

  const gameStats = {
    time: formatTime(timer),
    moves,
    hintsUsed,
    errors,
    difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  };

  return (
    <div className="samurai-sudoku-feature">
      <Header 
        title="Samurai Sudoku"
        subtitle={`${gameStats.difficulty} • ${gameStats.time}`}
        userName={getUserDisplayName()}
        userAvatar={getUserProfile().avatar}
        onBackClick={onBackToMenu}
        onSettingsClick={() => setShowSettings(true)}
        onHighScoresClick={() => setShowHighScores(true)}
        onUserProfileClick={() => setShowUserProfile(true)}
        showBackButton={true}
        showResetButton={true}
        showHighScores={true}
        onResetClick={() => startNewGame(difficulty)}
      />

      <div className="samurai-game-layout">
        <div className="samurai-game-controls">
          <SamuraiControls />
        </div>
        
        <div className="samurai-game-grid">
          {isGenerating ? (
            <div className="samurai-loading">
              Generating Samurai Sudoku puzzle...
            </div>
          ) : (
            <SamuraiGrid />
          )}
        </div>
      </div>

      {gameState === 'completed' && (
        <div className="samurai-completion-modal">
          <div className="completion-content">
            <h2>🏯 Samurai Sudoku Complete!</h2>
            <div className="completion-stats">
              <p><strong>Difficulty:</strong> {gameStats.difficulty}</p>
              <p><strong>Time:</strong> {gameStats.time}</p>
              <p><strong>Moves:</strong> {gameStats.moves}</p>
              <p><strong>Hints Used:</strong> {gameStats.hintsUsed}</p>
              <p><strong>Errors:</strong> {gameStats.errors}</p>
            </div>
            <div className="completion-actions">
              <button onClick={() => handleNewGame(difficulty)}>
                New Game
              </button>
              <button onClick={() => setShowHighScores(true)}>
                View High Scores
              </button>
              <button onClick={onBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          gameType="samurai-sudoku"
          settings={gameSettings}
          onSettingChange={handleSettingsChange}
          customSettings={[
            {
              key: 'showTimer',
              label: 'Show Timer',
              type: 'boolean'
            },
            {
              key: 'highlightRelated',
              label: 'Highlight Related Cells',
              type: 'boolean'
            },
            {
              key: 'showNotes',
              label: 'Show Pencil Marks',
              type: 'boolean'
            },
            {
              key: 'autoSave',
              label: 'Auto Save Progress',
              type: 'boolean'
            }
          ]}
        />
      )}

      {showHighScores && (
        <HighScores
          gameType="samurai-sudoku"
          onClose={() => setShowHighScores(false)}
        />
      )}

      {showUserProfile && (
        <UserProfile
          onClose={() => setShowUserProfile(false)}
          gameType="samurai-sudoku"
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

const SamuraiSudokuGame = ({ onBackToMenu }) => {
  return (
    <SamuraiSudokuProvider>
      <SamuraiSudokuContent onBackToMenu={onBackToMenu} />
    </SamuraiSudokuProvider>
  );
};

export default SamuraiSudokuGame;