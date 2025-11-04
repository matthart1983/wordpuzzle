import React from 'react';
import { generateShareText } from '../../../features/wordle/utils/gameLogic';
import './Modal.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export const StatisticsModal = ({ isOpen, onClose, statistics, guesses, targetWord, gameState }) => {
  const handleShare = async () => {
    const shareText = generateShareText(guesses, targetWord, gameState);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Word Guess Game',
          text: shareText
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Results copied to clipboard!');
    }
  };
  
  const maxGuesses = Math.max(...statistics.guessDistribution);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Statistics">
      <div className="statistics">
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value">{statistics.gamesPlayed}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat">
            <div className="stat-value">{statistics.winPercentage}</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat">
            <div className="stat-value">{statistics.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat">
            <div className="stat-value">{statistics.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>
        
        <div className="guess-distribution">
          <h3>Guess Distribution</h3>
          {statistics.guessDistribution.map((count, index) => (
            <div key={index} className="distribution-row">
              <div className="guess-number">{index + 1}</div>
              <div className="distribution-bar">
                <div 
                  className="bar-fill"
                  style={{
                    width: `${maxGuesses > 0 ? (count / maxGuesses) * 100 : 0}%`,
                    minWidth: count > 0 ? '10%' : '0%'
                  }}
                >
                  {count > 0 && <span className="bar-count">{count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="modal-actions">
          <button className="share-button" onClick={handleShare}>
            Share Results
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const handleToggle = (setting) => {
    onSettingsChange({
      ...settings,
      [setting]: !settings[setting]
    });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="settings">
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">Dark Mode</div>
            <div className="setting-description">Use dark theme</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">High Contrast</div>
            <div className="setting-description">Increase color contrast</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={() => handleToggle('highContrast')}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">Color Blind Mode</div>
            <div className="setting-description">Use alternative colors</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.colorBlindMode}
              onChange={() => handleToggle('colorBlindMode')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;