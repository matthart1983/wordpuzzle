import React from 'react';
import '../styles/WordInput.css';

const WordInput = ({ 
  currentWord, 
  onSubmit, 
  onDelete, 
  onShuffle, 
  isValid, 
  message 
}) => {
  return (
    <div className="word-input">
      <div className="input-container">
        <div className={`word-display ${isValid === false ? 'invalid' : ''}`}>
          {currentWord || <span className="placeholder">Type or click letters</span>}
        </div>
        {message && <div className="input-message">{message}</div>}
      </div>
      
      <div className="input-controls">
        <button 
          className="control-button delete-button"
          onClick={onDelete}
          disabled={!currentWord}
          title="Delete last letter"
        >
          Delete
        </button>
        
        <button 
          className="control-button shuffle-button"
          onClick={onShuffle}
          title="Shuffle letters"
        >
          ↻ Shuffle
        </button>
        
        <button 
          className="control-button submit-button"
          onClick={onSubmit}
          disabled={!currentWord || currentWord.length < 4}
          title="Submit word"
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default WordInput;