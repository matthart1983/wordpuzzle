import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../../shared/components/Header';
import HighScores from '../../high-scores/components/HighScores';
import { useKenKenGame } from '../hooks/useKenKenGame';
import { saveHighScore } from '../../high-scores/utils/highScores';
import './kenken.css';

const SHOW_KENKEN = false; // feature flag; flip to true to expose in UI

const KenKenCell = ({
  value,
  notes,
  selected,
  onClick,
  topBorder,
  leftBorder,
  rightBorder,
  bottomBorder,
  isConflict,
  size
}) => {
  const display = value || '';
  const className = [
    'kenken-cell',
    selected ? 'selected' : '',
    isConflict ? 'conflict' : ''
  ].filter(Boolean).join(' ');

  const borderStyles = {
    borderTopWidth: topBorder ? 3 : 1,
    borderLeftWidth: leftBorder ? 3 : 1,
    borderRightWidth: rightBorder ? 3 : 1,
    borderBottomWidth: bottomBorder ? 3 : 1
  };

  return (
    <div className={className} style={borderStyles} onClick={onClick}>
      {display ? (
        <div className="cell-value">{display}</div>
      ) : (
        <div className="cell-notes">
          {Array.from({ length: size }, (_, i) => i + 1).map(n => (
            <span key={n} className={notes?.includes(n) ? 'note-on' : 'note-off'}>{n}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const KenKenBoard = ({ state, actions }) => {
  const { grid, size, cageMap, selected, conflicts } = state;
  const { setSelected, inputNumber, clearCell } = actions;

  const isBoundary = (r1, c1, r2, c2) => {
    const a = cageMap[`${r1},${c1}`];
    const b = cageMap[`${r2},${c2}`];
    return a && b && a !== b;
  };

  return (
    <div className="kenken-board" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {grid.map((row, r) => row.map((val, c) => {
        const key = `${r},${c}`;
        const sel = selected && selected.r === r && selected.c === c;
        const conf = conflicts.has(key);
        const topBorder = r === 0 || isBoundary(r, c, r - 1, c);
        const leftBorder = c === 0 || isBoundary(r, c, r, c - 1);
        const rightBorder = c === size - 1 || isBoundary(r, c, r, c + 1);
        const bottomBorder = r === size - 1 || isBoundary(r, c, r + 1, c);
        const notes = state.notes[key] || [];
        return (
          <div key={key} className="kenken-cell-wrapper">
            {/* Cage label on the first cell of the cage */}
            {state.cageLabels[key] && (
              <div className="cage-label">{state.cageLabels[key]}</div>
            )}
            <KenKenCell
              value={val}
              notes={notes}
              selected={sel}
              isConflict={conf}
              size={size}
              topBorder={topBorder}
              leftBorder={leftBorder}
              rightBorder={rightBorder}
              bottomBorder={bottomBorder}
              onClick={() => setSelected({ r, c })}
            />
          </div>
        );
      }))}
    </div>
  );
};

const KenKenToolbar = ({ state, actions }) => {
  const { size, notesMode, validationOn, canUndo, canRedo, difficulties } = state;
  const { setSize, toggleNotesMode, toggleValidation, undo, redo, newPuzzle, hint } = actions;

  return (
    <div className="kenken-toolbar">
      <div className="group">
        <button onClick={() => newPuzzle()}>New</button>
        <button onClick={hint}>Hint</button>
      </div>
      <div className="group">
        <label>
          Size:
          <select value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))}>
            {[3,4,5,6].map(s => <option key={s} value={s}>{s}×{s}</option>)}
          </select>
        </label>
      </div>
      <div className="group">
        <label>
          Difficulty:
          <select value={state.difficulty} onChange={(e) => state.setDifficulty(e.target.value)}>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>
      <div className="group">
        <button onClick={toggleNotesMode} className={notesMode ? 'active' : ''}>Notes</button>
        <button onClick={toggleValidation} className={validationOn ? 'active' : ''}>Validation</button>
      </div>
      <div className="group">
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
      </div>
    </div>
  );
};

const KenKenGame = ({ onBackToMenu }) => {
  const {
    state,
    actions,
    isSolved,
    elapsedSeconds,
    hintsUsed,
    mistakes,
    resetTimer
  } = useKenKenGame();

  const [showHighScores, setShowHighScores] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        actions.clearCell();
        e.preventDefault();
        return;
      }
      const n = parseInt(e.key, 10);
      if (!isNaN(n)) {
        actions.inputNumber(n);
      }
      if (e.key === 'n' || e.key === 'N') actions.toggleNotesMode();
      if (e.key === 'h' || e.key === 'H') actions.hint();
      if (e.ctrlKey && e.key === 'z') actions.undo();
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) actions.redo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  useEffect(() => {
    if (isSolved) {
      // Save high score
      saveHighScore({
        gameType: 'kenken',
        playerName: undefined,
        playerAvatar: undefined,
        difficulty: state.difficultyLabel,
        gridSize: `${state.size}x${state.size}`,
        timeSeconds: elapsedSeconds,
        hintsUsed,
        mistakes
      });
    }
  }, [isSolved]);

  const headerTitle = useMemo(() => `KENKEN ${state.size}×${state.size}` , [state.size]);

  return (
    <div className="kenken-root">
      <Header
        title={headerTitle}
        showBackButton
        onBackClick={onBackToMenu}
        showResetButton
        onResetClick={() => { actions.newPuzzle(); resetTimer(); }}
        showHighScores
        onHighScoresClick={() => setShowHighScores(true)}
        onSettingsClick={() => {}}
        onUserProfileClick={() => {}}
      />

      <div className="game-container">
        <KenKenToolbar state={state} actions={actions} />
        <KenKenBoard state={state} actions={actions} />
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{elapsedSeconds}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">Hints</span>
            <span className="stat-value">{hintsUsed}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Mistakes</span>
            <span className="stat-value">{mistakes}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Mode</span>
            <span className="stat-value">{state.notesMode ? 'Notes' : 'Values'}</span>
          </div>
        </div>
      </div>

      {showHighScores && (
        <HighScores gameType="kenken" onClose={() => setShowHighScores(false)} />
      )}
    </div>
  );
};

export default KenKenGame;
