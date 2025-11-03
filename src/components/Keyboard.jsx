import React from 'react';
import './Keyboard.css';

const Keyboard = ({ onKeyPress, keyboardStates = {} }) => {
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  
  const handleKeyClick = (key) => {
    onKeyPress(key);
  };
  
  const KeyButton = ({ letter }) => {
    const state = keyboardStates[letter] || 'unknown';
    return (
      <button
        className={`key ${state}`}
        onClick={() => handleKeyClick(letter)}
        data-key={letter}
      >
        {letter}
      </button>
    );
  };
  
  const SpecialKey = ({ text, action, className = '' }) => (
    <button
      className={`key special-key ${className}`}
      onClick={() => handleKeyClick(action)}
      data-key={action}
    >
      {text}
    </button>
  );
  
  return (
    <div className="keyboard">
      <div className="keyboard-row">
        {topRow.map(letter => (
          <KeyButton key={letter} letter={letter} />
        ))}
      </div>
      
      <div className="keyboard-row">
        {middleRow.map(letter => (
          <KeyButton key={letter} letter={letter} />
        ))}
      </div>
      
      <div className="keyboard-row">
        <SpecialKey text="ENTER" action="Enter" className="enter-key" />
        {bottomRow.map(letter => (
          <KeyButton key={letter} letter={letter} />
        ))}
        <SpecialKey text="⌫" action="Backspace" className="backspace-key" />
      </div>
    </div>
  );
};

export default Keyboard;