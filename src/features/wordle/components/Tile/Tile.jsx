import React from 'react';
import './Tile.css';

const Tile = ({ letter, state, animation }) => {
  return (
    <div 
      className={`tile ${state} ${animation ? `tile-${animation}` : ''}`}
      data-letter={letter}
    >
      {letter}
    </div>
  );
};

export default Tile;