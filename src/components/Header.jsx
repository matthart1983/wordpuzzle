import React from 'react';
import './Header.css';

const Header = ({ onStatsClick, onSettingsClick, onBackClick, onResetClick, gameState, guesses, showBackButton = false, showResetButton = false, title = "WORD GUESS" }) => {
  const handleReset = () => {
    if (window.confirm('Start a new puzzle? Your current progress will be lost.')) {
      onResetClick();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        {showBackButton && (
          <button className="icon-button back-button" onClick={onBackClick} title="Back to Games">
            ←
          </button>
        )}
        <button className="icon-button" onClick={onStatsClick} title="Statistics">
          📊
        </button>
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
        <button className="icon-button" onClick={onSettingsClick} title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
};

export default Header;