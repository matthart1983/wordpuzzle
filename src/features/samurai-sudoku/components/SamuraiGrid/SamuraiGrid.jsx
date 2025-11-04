import React, { useCallback, useEffect, useState } from 'react';
import { useSamuraiSudoku } from '../../context/SamuraiSudokuContext.jsx';
import { 
  GRID_SIZE, 
  GRID_POSITIONS, 
  masterToLocalCoordinates,
  isOverlapCell 
} from '../../utils/samuraiModels.js';
import SamuraiCell from '../SamuraiCell';
import './SamuraiGrid.css';

const SamuraiGrid = () => {
  const {
    masterGrid,
    selectedCell,
    relatedCells,
    conflicts,
    settings,
    gameState,
    gameId,
    selectCell,
    setCellValue,
    addNote,
    removeNote
  } = useSamuraiSudoku();

  const [inputMode, setInputMode] = useState('value'); // 'value' or 'notes'

  // Keyboard event handler
  const handleKeyDown = useCallback((event) => {
    if (!selectedCell || gameState !== 'playing') return;

    const { row, col } = selectedCell;
    const cell = masterGrid[row][col];

    if (cell.isGiven) return;

    const key = event.key;

    // Number input (1-9)
    if (/^[1-9]$/.test(key)) {
      const num = parseInt(key);
      
      if (inputMode === 'notes' || event.ctrlKey || event.metaKey) {
        // Add/remove note
        if (cell.notes.has(num)) {
          removeNote(row, col, num);
        } else {
          addNote(row, col, num);
        }
      } else {
        // Set cell value
        setCellValue(row, col, num);
      }
      event.preventDefault();
    }
    
    // Delete/Backspace - clear cell
    else if (key === 'Delete' || key === 'Backspace') {
      setCellValue(row, col, null);
      event.preventDefault();
    }
    
    // Arrow key navigation
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      let newRow = row;
      let newCol = col;
      
      switch (key) {
        case 'ArrowUp':
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(GRID_SIZE - 1, row + 1);
          break;
        case 'ArrowLeft':
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          newCol = Math.min(GRID_SIZE - 1, col + 1);
          break;
      }
      
      // Make sure new position belongs to a grid
      const belongsToGrids = masterToLocalCoordinates(newRow, newCol);
      if (belongsToGrids.length > 0) {
        selectCell(newRow, newCol);
      }
      
      event.preventDefault();
    }
    
    // Toggle input mode
    else if (key === 'Tab') {
      setInputMode(inputMode === 'value' ? 'notes' : 'value');
      event.preventDefault();
    }
  }, [selectedCell, masterGrid, gameState, inputMode, setCellValue, addNote, removeNote, selectCell]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle cell click
  const handleCellClick = useCallback((row, col) => {
    selectCell(row, col);
  }, [selectCell]);

  // Handle cell double click - toggle between value and notes mode
  const handleCellDoubleClick = useCallback((row, col) => {
    setInputMode(inputMode === 'value' ? 'notes' : 'value');
  }, [inputMode]);

  // Get cell CSS classes
  const getCellClasses = useCallback((row, col) => {
    const classes = ['samurai-cell'];
    const cell = masterGrid[row][col];
    const belongsToGrids = masterToLocalCoordinates(row, col);
    
    // Empty space (not part of any grid)
    if (belongsToGrids.length === 0) {
      return 'non-playable-cell';
    }
    
    // Grid membership - add primary grid class
    const primaryGrid = belongsToGrids[0];
    classes.push(`grid-${primaryGrid.gridId}`);
    
    // Overlap regions
    if (belongsToGrids.length > 1) {
      classes.push('overlap');
    }
    
    // Cell state classes
    if (cell.isGiven) {
      classes.push('given');
    } else if (cell.state === 'error') {
      classes.push('error');
    } else if (cell.state === 'user') {
      classes.push('user-input');
    } else if (cell.state === 'hint') {
      classes.push('hint-input');
    }
    
    // Selection and highlighting
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      classes.push('selected');
    }
    
    // Related cells highlighting
    if (settings?.highlightRelatedCells && relatedCells && selectedCell) {
      const isRelated = 
        relatedCells.sameRow?.some(([r, c]) => r === row && c === col) ||
        relatedCells.sameColumn?.some(([r, c]) => r === row && c === col) ||
        relatedCells.sameBox?.some(([r, c]) => r === row && c === col);
      
      if (isRelated) {
        classes.push('highlighted');
      }
    }
    
    // Same number highlighting
    if (settings?.highlightSameNumbers && selectedCell && cell.value) {
      const selectedCellValue = masterGrid[selectedCell.row][selectedCell.col]?.value;
      if (selectedCellValue === cell.value) {
        classes.push('same-number');
      }
    }
    
    // Conflicts
    if (conflicts?.some(([r, c]) => r === row && c === col)) {
      classes.push('conflict');
    }
    
    // Visual borders for grid structure
    const { localRow, localCol } = primaryGrid;
    
    // 3x3 box borders within sub-grids
    if (localCol % 3 === 2 && localCol !== 8) classes.push('box-border-right');
    if (localRow % 3 === 2 && localRow !== 8) classes.push('box-border-bottom');
    
    // Major grid borders to separate the 5 sub-grids
    if (col === 8 || col === 11) classes.push('major-border-right');
    if (col === 9 || col === 12) classes.push('major-border-left');
    if (row === 8 || row === 11) classes.push('major-border-bottom');
    if (row === 9 || row === 12) classes.push('major-border-top');
    
    return classes.join(' ');
  }, [masterGrid, selectedCell, relatedCells, conflicts, settings]);

  // Render grid cells
  const renderCells = () => {
    const cells = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const belongsToGrids = masterToLocalCoordinates(row, col);
        
        if (belongsToGrids.length === 0) {
          // Non-playable area - render invisible placeholder
          cells.push(
            <div
              key={`${gameId}-${row}-${col}`}
              className="non-playable-cell"
            />
          );
        } else {
          // Active cell - render the playable cell
          const cell = masterGrid[row][col];
          const cellClasses = getCellClasses(row, col);
          
          cells.push(
            <SamuraiCell
              key={`${gameId}-${row}-${col}`}
              row={row}
              col={col}
              cell={cell}
              isSelected={selectedCell?.row === row && selectedCell?.col === col}
              isInputMode={inputMode}
              className={cellClasses}
              onClick={handleCellClick}
              onDoubleClick={handleCellDoubleClick}
              showNotes={settings?.showNotes}
            />
          );
        }
      }
    }
    
    return cells;
  };

  return (
    <div className="samurai-grid-container">
      <div className="samurai-grid">
        {renderCells()}
      </div>
    </div>
  );
};

export default SamuraiGrid;