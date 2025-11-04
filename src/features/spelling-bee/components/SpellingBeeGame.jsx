import React, { useEffect, useState, useCallback } from 'react';
import { SpellingBeeProvider, useSpellingBee } from '../context/SpellingBeeContext';
import { getUserDisplayName, getUserProfile } from '../../../shared/utils/userProfile.js';
import { getSettings, updateSettings, initializeSettings } from '../../../shared/utils/settings.js';
import LetterHexagon from './LetterHexagon';
import WordInput from './WordInput';
import ScorePanel from './ScorePanel';
import FoundWords from './FoundWords';
import Header from '../../../shared/components/Header';
import HighScores from '../../high-scores/components/HighScores';
import UserProfile from '../../user-profile/components/UserProfile';
import { SettingsModal } from '../../../shared/components/Modal';
import '../styles/SpellingBeeGame.css';

const SpellingBeeContent = ({ onBackToMenu }) => {
  const [showHighScores, setShowHighScores] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
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
        
        <button 
          className="how-to-play-btn"
          onClick={() => setShowHowToPlay(true)}
        >
          How to Play
        </button>
        
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

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="modal how-to-play" onClick={e => e.stopPropagation()}>
            <h3>How to Play Letter Hunt</h3>
            <div className="instructions">
              <p><strong>Goal:</strong> Create words using the 7 given letters to earn points and achieve ranks</p>
              
              <div className="rule">
                <strong>Rules:</strong>
                <ul>
                  <li>Words must be at least 4 letters long</li>
                  <li>Every word must include the center letter (yellow hexagon)</li>
                  <li>Letters can be used more than once in a word</li>
                  <li>Only valid English words are accepted</li>
                </ul>
              </div>
              
              <div className="scoring">
                <strong>Scoring:</strong>
                <ul>
                  <li>4-letter words: 1 point</li>
                  <li>Longer words: 1 point per letter</li>
                  <li>Pangrams (use all 7 letters): 7 extra points!</li>
                  <li>Earn ranks from Beginner to Queen Bee based on total points</li>
                </ul>
              </div>
              
              <div className="tips">
                <strong>Tips:</strong>
                <ul>
                  <li>Click hexagon letters or use your keyboard to spell words</li>
                  <li>Press Spacebar to shuffle the outer letters</li>
                  <li>Look for common prefixes and suffixes</li>
                  <li>Try to find the pangram for maximum points!</li>
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