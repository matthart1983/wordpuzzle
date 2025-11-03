import React, { useEffect } from 'react';
import { SpellingBeeProvider, useSpellingBee } from '../context/SpellingBeeContext';
import LetterHexagon from '../components/LetterHexagon';
import WordInput from '../components/WordInput';
import ScorePanel from '../components/ScorePanel';
import FoundWords from '../components/FoundWords';
import Header from '../components/Header';
import './SpellingBeeGame.css';

const SpellingBeeContent = ({ onBackToMenu }) => {
  const {
    letters,
    centerLetter,
    shuffledLetters,
    currentWord,
    foundWords,
    currentPoints,
    totalPossible,
    currentRank,
    nextRankProgress,
    message,
    isLoading,
    addLetter,
    deleteLetter,
    submitWord,
    shuffleLetters,
    newGame
  } = useSpellingBee();
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        submitWord();
      } else if (key === 'BACKSPACE') {
        deleteLetter();
      } else if (key === ' ') {
        event.preventDefault();
        shuffleLetters();
      } else if (/^[A-Z]$/.test(key) && letters.includes(key)) {
        addLetter(key);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [letters, addLetter, deleteLetter, submitWord, shuffleLetters]);
  
  if (isLoading) {
    return (
      <div className="spelling-bee-game loading">
        <div className="loading-spinner">Loading Spelling Bee...</div>
      </div>
    );
  }
  
  // Create display letters array (center + shuffled others)
  const displayLetters = [centerLetter, ...shuffledLetters];
  
  return (
    <div className="spelling-bee-game">
      <Header
        onStatsClick={() => {}} // TODO: Implement stats modal
        onSettingsClick={() => {}} // TODO: Implement settings modal
        onBackClick={onBackToMenu}
        onResetClick={newGame}
        title="SPELLING BEE"
        gameState="playing"
        guesses={[]}
        showBackButton={true}
        showResetButton={true}
      />
      
      <main className="main-content">
        <ScorePanel
          currentPoints={currentPoints}
          totalPossible={totalPossible}
          currentRank={currentRank}
          nextRankProgress={nextRankProgress}
          foundWords={foundWords}
        />
        
        <WordInput
          currentWord={currentWord}
          onSubmit={submitWord}
          onDelete={deleteLetter}
          onShuffle={shuffleLetters}
          message={message}
        />
        
        <LetterHexagon
          letters={displayLetters}
          centerLetter={centerLetter}
          onLetterClick={addLetter}
          currentWord={currentWord}
        />
        
        <div className="game-instructions">
          <p>Find words using these letters. Every word must include the center letter (yellow).</p>
          <p>Words must be at least 4 letters long. Click letters or use your keyboard!</p>
          <p><strong>Tip:</strong> Press spacebar to shuffle the outer letters.</p>
        </div>
        
        <FoundWords
          words={foundWords}
          letters={letters}
        />
      </main>
    </div>
  );
};

const SpellingBeeGame = ({ onBackToMenu }) => {
  return (
    <SpellingBeeProvider>
      <SpellingBeeContent onBackToMenu={onBackToMenu} />
    </SpellingBeeProvider>
  );
};

export default SpellingBeeGame;