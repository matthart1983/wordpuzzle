import React, { memo } from 'react';
import './SamuraiCell.css';

const SamuraiCell = memo(({
  row,
  col,
  cell,
  isSelected,
  isInputMode,
  className,
  onClick,
  onDoubleClick,
  showNotes
}) => {
  const handleClick = (event) => {
    event.preventDefault();
    onClick(row, col);
  };

  const handleDoubleClick = (event) => {
    event.preventDefault();
    onDoubleClick(row, col);
  };

  const renderCellContent = () => {
    // Show value if present
    if (cell.value) {
      return (
        <span className="cell-value">
          {cell.value}
        </span>
      );
    }
    
    // Show notes if enabled and present
    if (showNotes && cell.notes.size > 0) {
      return (
        <div className="cell-notes">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <span
              key={num}
              className={`note ${cell.notes.has(num) ? 'visible' : 'hidden'}`}
            >
              {num}
            </span>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ gridArea: `${row + 1} / ${col + 1}` }}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      aria-label={`Cell ${row + 1}, ${col + 1}${cell.value ? `, value ${cell.value}` : ', empty'}`}
      aria-selected={isSelected}
    >
      {renderCellContent()}
      {isSelected && (
        <div className="cell-selection-indicator" />
      )}
    </div>
  );
});

SamuraiCell.displayName = 'SamuraiCell';

export default SamuraiCell;