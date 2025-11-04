import React from 'react';
import '../styles/FoundWords.css';

const FoundWords = ({ words, onWordClick, letters }) => {
  // Check if a word is a pangram (uses all letters)
  const isPangram = (word) => {
    const wordLetters = new Set(word.toUpperCase().split(''));
    const allLetters = new Set(letters.map(l => l.toUpperCase()));
    return letters.every(letter => wordLetters.has(letter.toUpperCase()));
  };
  
  // Sort words: pangrams first, then by length, then alphabetically
  const sortedWords = [...words].sort((a, b) => {
    const aIsPangram = isPangram(a);
    const bIsPangram = isPangram(b);
    
    if (aIsPangram && !bIsPangram) return -1;
    if (!aIsPangram && bIsPangram) return 1;
    
    if (a.length !== b.length) return b.length - a.length;
    return a.localeCompare(b);
  });
  
  return (
    <div className="found-words">
      <h3 className="found-words-title">
        Words Found ({words.length})
      </h3>
      
      {words.length === 0 ? (
        <div className="no-words">
          <p>No words found yet.</p>
          <p>Start typing to find words!</p>
        </div>
      ) : (
        <div className="words-grid">
          {sortedWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              className={`word-item ${isPangram(word) ? 'pangram' : ''}`}
              onClick={() => onWordClick && onWordClick(word)}
              title={isPangram(word) ? 'Pangram! Uses all letters.' : ''}
            >
              <span className="word-text">{word.toUpperCase()}</span>
              {isPangram(word) && <span className="pangram-indicator">★</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoundWords;