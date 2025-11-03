import React from 'react';
import Tile from './Tile';
import { WORD_LENGTH, MAX_ATTEMPTS, LETTER_STATES } from '../utils/gameLogic';
import './GameBoard.css';

const GameBoard = ({ guesses, currentGuess, evaluations, animations }) => {
  const rows = [];
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const tiles = [];
    
    for (let j = 0; j < WORD_LENGTH; j++) {
      let letter = '';
      let state = LETTER_STATES.UNKNOWN;
      let animation = '';
      
      if (i < guesses.length) {
        // Completed guess
        letter = guesses[i][j] || '';
        state = evaluations[i] ? evaluations[i][j] : LETTER_STATES.UNKNOWN;
        animation = animations[i] && animations[i][j] ? animations[i][j] : '';
      } else if (i === guesses.length) {
        // Current guess being typed
        letter = currentGuess[j] || '';
        state = LETTER_STATES.UNKNOWN;
        animation = letter && !currentGuess[j + 1] ? 'typing' : '';
      }
      
      tiles.push(
        <Tile
          key={`${i}-${j}`}
          letter={letter}
          state={state}
          animation={animation}
        />
      );
    }
    
    rows.push(
      <div key={i} className="board-row">
        {tiles}
      </div>
    );
  }
  
  return (
    <div className="game-board">
      {rows}
    </div>
  );
};

export default GameBoard;