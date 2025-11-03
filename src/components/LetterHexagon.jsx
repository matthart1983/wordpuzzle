import React from 'react';
import './LetterHexagon.css';

const LetterHexagon = ({ letters, centerLetter, onLetterClick, currentWord = '' }) => {
  // Arrange letters: center letter in middle, others around it
  const outerLetters = letters.filter(letter => letter !== centerLetter);
  
  const positions = [
    { className: 'hex-top', index: 0 },
    { className: 'hex-top-right', index: 1 },
    { className: 'hex-bottom-right', index: 2 },
    { className: 'hex-bottom', index: 3 },
    { className: 'hex-bottom-left', index: 4 },
    { className: 'hex-top-left', index: 5 }
  ];
  
  return (
    <div className="letter-hexagon">
      <div className="hex-container">
        {/* Center letter */}
        <button
          className="hex-letter hex-center"
          onClick={() => onLetterClick(centerLetter)}
          data-letter={centerLetter}
        >
          {centerLetter}
        </button>
        
        {/* Outer letters */}
        {positions.map((pos, i) => (
          <button
            key={i}
            className={`hex-letter hex-outer ${pos.className}`}
            onClick={() => onLetterClick(outerLetters[pos.index])}
            data-letter={outerLetters[pos.index]}
          >
            {outerLetters[pos.index]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LetterHexagon;