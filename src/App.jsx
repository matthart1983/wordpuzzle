import React, { useState, useEffect, useCallback } from 'react';
import { GameProvider, useGame } from './features/wordle/context/GameContext';
import { SpellingBeeProvider } from './features/spelling-bee/context/SpellingBeeContext';
import { SudokuProvider } from './features/sudoku/context/SudokuContext';
import { SamuraiSudokuProvider } from './features/samurai-sudoku/context/SamuraiSudokuContext';
import { Game2048Provider } from './features/game2048/context/Game2048Context';
import { getUserDisplayName, getUserProfile } from './shared/utils/userProfile.js';
import GameSelector from './shared/components/GameSelector';
import SpellingBeeGame from './features/spelling-bee/components/SpellingBeeGame';
import SudokuGame from './features/sudoku/components/SudokuGame';
import SamuraiSudokuGame from './features/samurai-sudoku/components/SamuraiSudokuGame';
import SamuraiSudokuTest from './features/samurai-sudoku/components/SamuraiSudokuTest';
import Game2048 from './features/game2048/components/Game2048';
import Header from './shared/components/Header';
import GameBoard from './features/wordle/components/GameBoard';
import Keyboard from './features/wordle/components/Keyboard';
import HighScores from './features/high-scores/components/HighScores';
import UserProfile from './features/user-profile/components/UserProfile';
import { StatisticsModal, SettingsModal } from './shared/components/Modal';
import { GAME_STATES } from './features/wordle/utils/gameLogic';
import './styles/App.css';

const GameContent = ({ onBackToMenu }) => {
  const {
    guesses,
    currentGuess,
    gameState,
    message,
    statistics,
    settings,
    evaluations,
    keyboardStates,
    isLoading,
    addLetter,
    removeLetter,
    submitGuess,
    newGame,
    updateSettings,
    targetWord
  } = useGame();
  
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userName, setUserName] = useState(getUserDisplayName());
  const [userAvatar, setUserAvatar] = useState(getUserProfile().avatar);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (showStats || showSettings || showHighScores) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        removeLetter();
      } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [addLetter, removeLetter, submitGuess, showStats, showSettings]);
  
  // Handle virtual keyboard
  const handleKeyPress = (key) => {
    if (key === 'Enter') {
      submitGuess();
    } else if (key === 'Backspace') {
      removeLetter();
    } else {
      addLetter(key);
    }
  };

  // Handle user profile updates
  const handleUserProfileUpdate = useCallback(() => {
    const profile = getUserProfile();
    setUserName(getUserDisplayName());
    setUserAvatar(profile.avatar);
  }, []);
  
  // Apply theme classes
  useEffect(() => {
    const root = document.documentElement;
    root.className = '';
    
    if (settings.darkMode) root.classList.add('dark-theme');
    if (settings.highContrast) root.classList.add('high-contrast');
    if (settings.colorBlindMode) root.classList.add('color-blind');
  }, [settings]);
  
  // Show stats modal when game ends
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING && guesses.length > 0) {
      const timer = setTimeout(() => {
        setShowStats(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, guesses.length]);
  
  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="app">
      <Header
        userName={userName}
        userAvatar={userAvatar}
        onStatsClick={() => setShowStats(true)}
        onSettingsClick={() => setShowSettings(true)}
        onHighScoresClick={() => setShowHighScores(true)}
        onUserProfileClick={() => setShowUserProfile(true)}
        onBackClick={onBackToMenu}
        onResetClick={newGame}
        gameState={gameState}
        guesses={guesses}
        showBackButton={true}
        showResetButton={true}
        showHighScores={true}
      />
      
      <main className="main-content">
        {message && (
          <div className="message-banner">
            {message}
          </div>
        )}
        
        <GameBoard
          guesses={guesses}
          currentGuess={currentGuess}
          evaluations={evaluations}
          animations={{}} // Add animations later if needed
        />
        
        <Keyboard
          onKeyPress={handleKeyPress}
          keyboardStates={keyboardStates}
        />
      </main>
      
      <StatisticsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        statistics={statistics}
        guesses={guesses}
        targetWord={targetWord}
        gameState={gameState}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />
      
      {/* High Scores Modal */}
      {showHighScores && (
        <HighScores
          gameType="wordle"
          onClose={() => setShowHighScores(false)}
        />
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile
          gameType="wordle"
          onClose={() => setShowUserProfile(false)}
          onProfileUpdate={handleUserProfileUpdate}
        />
      )}
    </div>
  );
};

const App = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  
  const handleGameSelect = (gameType) => {
    setSelectedGame(gameType);
  };
  
  const handleBackToMenu = () => {
    setSelectedGame(null);
  };
  
  if (selectedGame === 'wordguess') {
    return (
      <GameProvider>
        <GameContent onBackToMenu={handleBackToMenu} />
      </GameProvider>
    );
  }
  
  if (selectedGame === 'letter-hunt') {
    try {
      return (
        <SpellingBeeProvider>
          <SpellingBeeGame onBackToMenu={handleBackToMenu} />
        </SpellingBeeProvider>
      );
    } catch (error) {
      console.error('Error loading Letter Hunt:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Error loading Letter Hunt</h2>
          <p>Error: {error.message}</p>
          <button onClick={handleBackToMenu}>Back to Games</button>
        </div>
      );
    }
  }
  
  if (selectedGame === 'sudoku-mini') {
    try {
      return (
        <SudokuProvider>
          <SudokuGame onBackToMenu={handleBackToMenu} />
        </SudokuProvider>
      );
    } catch (error) {
      console.error('Error loading Sudoku Mini:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Error loading Sudoku Mini</h2>
          <p>Error: {error.message}</p>
          <button onClick={handleBackToMenu}>Back to Games</button>
        </div>
      );
    }
  }

  if (selectedGame === 'samurai-sudoku') {
    try {
      return (
        <SamuraiSudokuGame onBackToMenu={handleBackToMenu} />
      );
    } catch (error) {
      console.error('Error loading Samurai Sudoku:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Error loading Samurai Sudoku</h2>
          <p>Error: {error.message}</p>
          <button onClick={handleBackToMenu}>Back to Games</button>
        </div>
      );
    }
  }
  
  
  if (selectedGame === '2048') {
    try {
      return (
        <Game2048Provider>
          <Game2048 onBackToMenu={handleBackToMenu} />
        </Game2048Provider>
      );
    } catch (error) {
      console.error('Error loading 2048:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Error loading 2048</h2>
          <p>Error: {error.message}</p>
          <button onClick={handleBackToMenu}>Back to Games</button>
        </div>
      );
    }
  }
  
  return <GameSelector onSelectGame={handleGameSelect} />;
};

export default App;