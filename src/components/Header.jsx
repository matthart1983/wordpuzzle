import React from 'react';
import './Header.css';

const Header = ({ onStatsClick, onSettingsClick, onBackClick, gameState, guesses, showBackButton = false, title = "WORDLE" }) => {
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
        <button className="icon-button" onClick={onSettingsClick} title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
};

export default Header;