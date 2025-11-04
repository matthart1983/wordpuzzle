import React from 'react';
import { getUserDisplayName, getUserProfile } from '../utils/userProfile';
import './Header.css';

const Header = ({ 
  onStatsClick, 
  onSettingsClick, 
  onBackClick, 
  onResetClick, 
  onHighScoresClick,
  onUserProfileClick,
  gameState, 
  guesses, 
  showBackButton = false, 
  showResetButton = false, 
  showHighScores = false,
  title = "WORD GUESS",
  userName,
  userAvatar 
}) => {
  const profile = getUserProfile();
  const displayName = userName || getUserDisplayName();
  const displayAvatar = userAvatar || profile.avatar || '👤';
  
  const handleReset = () => {
    if (window.confirm('Start a new puzzle? Your current progress will be lost.')) {
      onResetClick();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        {showBackButton && (
          <button className="icon-button back-button mobile-friendly" onClick={onBackClick} title="Back to Games">
            <span className="back-icon">←</span>
            <span className="back-text">Back</span>
          </button>
        )}
        {showHighScores && (
          <button className="icon-button" onClick={onHighScoresClick} title="High Scores">
            🏆
          </button>
        )}
      </div>
      
      <div className="header-center">
        <h1 className="title">{title}</h1>
      </div>
      
      <div className="header-right">
        {showResetButton && (
          <button className="icon-button reset-button" onClick={handleReset} title="New Puzzle">
            🔄
          </button>
        )}
        <button className="icon-button user-profile" onClick={onUserProfileClick} title={`${displayName} - View Profile`}>
          <span className="user-avatar">{displayAvatar}</span>
          <span className="user-name">{displayName}</span>
        </button>
        <button className="icon-button" onClick={onSettingsClick} title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
};

export default Header;