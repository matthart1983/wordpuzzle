import React, { useEffect, useState, useCallback } from 'react';
import { SpellingBeeProvider, useSpellingBee } from '../context/SpellingBeeContext';
import { getUserDisplayName, getUserProfile } from '../utils/userProfile';
import { getSettings, updateSettings, initializeSettings } from '../utils/settings';
import LetterHexagon from '../components/LetterHexagon';
import WordInput from '../components/WordInput';
import ScorePanel from '../components/ScorePanel';
import FoundWords from '../components/FoundWords';
import Header from '../components/Header';
import HighScores from '../components/HighScores';
import UserProfile from '../components/UserProfile';
import { SettingsModal } from '../components/Modal';
import './SpellingBeeGame.css';

const SpellingBeeContent = ({ onBackToMenu }) => {
  const [showHighScores, setShowHighScores] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [settings, setSettings] = useState(getSettings);
  const [userName, setUserName] = useState(getUserDisplayName());
  const [userAvatar, setUserAvatar] = useState(getUserProfile().avatar);
  
  const {
    letters,
    centerLetter,
    shuffledLetters,
    currentWord,
    foundWords,
    currentPoints,
    totalPossible,
    currentRank,
    nextRankProgress,
    message,
    isLoading,
    addLetter,
    deleteLetter,
    submitWord,
    shuffleLetters,
    newGame
  } = useSpellingBee();

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
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        submitWord();
      } else if (key === 'BACKSPACE') {
        deleteLetter();
      } else if (key === ' ') {
        event.preventDefault();
        shuffleLetters();
      } else if (/^[A-Z]$/.test(key) && letters.includes(key)) {
        addLetter(key);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [letters, addLetter, deleteLetter, submitWord, shuffleLetters]);
  
  if (isLoading) {
    return (
      <div className="spelling-bee-game loading">
        <div className="loading-spinner">Loading Letter Hunt...</div>
      </div>
    );
  }
  
  // Create display letters array (center + shuffled others)
  const displayLetters = [centerLetter, ...shuffledLetters];
  
  return (
    <div className="spelling-bee-game">
      <Header
        title="LETTER HUNT"
        userName={userName}
        userAvatar={userAvatar}
        onStatsClick={() => {}} // TODO: Implement stats modal
        onSettingsClick={() => setShowSettings(true)}
        onHighScoresClick={() => setShowHighScores(true)}
        onUserProfileClick={() => setShowUserProfile(true)}
        onBackClick={onBackToMenu}
        onResetClick={newGame}
        gameState="playing"
        guesses={[]}
        showBackButton={true}
        showResetButton={true}
        showHighScores={true}
      />
      
      <main className="main-content">
        <ScorePanel
          currentPoints={currentPoints}
          totalPossible={totalPossible}
          currentRank={currentRank}
          nextRankProgress={nextRankProgress}
          foundWords={foundWords}
        />
        
        <WordInput
          currentWord={currentWord}
          onSubmit={submitWord}
          onDelete={deleteLetter}
          onShuffle={shuffleLetters}
          message={message}
        />
        
        <LetterHexagon
          letters={displayLetters}
          centerLetter={centerLetter}
          onLetterClick={addLetter}
          currentWord={currentWord}
        />
        
        <div className="game-instructions">
          <p>Find words using these letters. Every word must include the center letter (yellow).</p>
          <p>Words must be at least 4 letters long. Click letters or use your keyboard!</p>
          <p><strong>Tip:</strong> Press spacebar to shuffle the outer letters.</p>
        </div>
        
        <FoundWords
          words={foundWords}
          letters={letters}
        />
      </main>
      
      {/* High Scores Modal */}
      {showHighScores && (
        <HighScores
          gameType="spelling-bee"
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
          gameType="spelling-bee"
          onClose={() => setShowUserProfile(false)}
          onProfileUpdate={handleUserProfileUpdate}
        />
      )}
    </div>
  );
};

const SpellingBeeGame = ({ onBackToMenu }) => {
  return (
    <SpellingBeeProvider>
      <SpellingBeeContent onBackToMenu={onBackToMenu} />
    </SpellingBeeProvider>
  );
};

export default SpellingBeeGame;