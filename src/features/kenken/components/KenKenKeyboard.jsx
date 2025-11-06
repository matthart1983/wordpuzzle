import React from 'react';
import './KenKenKeyboard.css';

const KenKenKeyboard = ({ size, onNumberInput, onClear, selectedCell, disabled = false }) => {
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  const handleNumberClick = (num) => {
    if (!disabled && onNumberInput) {
      onNumberInput(num);
    }
  };

  const handleClearClick = () => {
    if (!disabled && onClear) {
      onClear();
    }
  };

  return (
    <div className="kenken-keyboard">
      <div className="kenken-keyboard-numbers">
        {numbers.map(num => (
          <button
            key={num}
            className="kenken-key number-key"
            onClick={() => handleNumberClick(num)}
            disabled={disabled || !selectedCell}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        className="kenken-key clear-key"
        onClick={handleClearClick}
        disabled={disabled || !selectedCell}
      >
        Clear
      </button>
    </div>
  );
};

export default KenKenKeyboard;
