import React, { useCallback } from 'react';
import './GameSelector.css';

const games = [
  {
    id: 'wordle',
    title: 'Wordle',
    description: 'Guess the 5-letter word in 6 tries',
    icon: '🔤',
    color: '#6aaa64'
  },
  {
    id: 'spelling-bee',
    title: 'Spelling Bee',
    description: 'Find words using the given letters',
    icon: '🐝',
    color: '#f7da21'
  }
];

const GameSelector = ({ onSelectGame }) => {
  const handleGameSelect = useCallback((gameId) => {
    if (onSelectGame && typeof onSelectGame === 'function') {
      onSelectGame(gameId);
    }
  }, [onSelectGame]);

  const handleButtonClick = useCallback((gameId, event) => {
    event.preventDefault();
    event.stopPropagation();
    handleGameSelect(gameId);
  }, [handleGameSelect]);

  return (
    <div className="game-selector">
      <header className="selector-header">
        <h1 className="selector-title">NYT Games Clone</h1>
        <p className="selector-subtitle">Choose your puzzle</p>
      </header>
      
      <div className="games-grid">
        {games.map(game => (
          <div 
            key={game.id}
            className="game-card"
            style={{ '--accent-color': game.color }}
          >
            <div className="game-icon">{game.icon}</div>
            <h2 className="game-title">{game.title}</h2>
            <p className="game-description">{game.description}</p>
            <button 
              className="play-button"
              onClick={(e) => handleButtonClick(game.id, e)}
              type="button"
            >
              Play
            </button>
          </div>
        ))}
      </div>
      
      <footer className="selector-footer">
        <p>Built as educational clones of New York Times games</p>
      </footer>
    </div>
  );
};

export default GameSelector;