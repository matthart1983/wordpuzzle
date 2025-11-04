import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadRandomPuzzle } from '../utils/kenkenParsers';
import { computeConflicts, getCandidates, isSolved as checkSolved } from '../utils/kenkenValidator';

const STORAGE_KEY = 'kenken_game_state_v1';

const difficulties = ['easy', 'medium', 'hard'];

export const useKenKenGame = () => {
  const [size, setSize] = useState(4);
  const [difficulty, setDifficulty] = useState('easy');
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState([]);
  const [notes, setNotes] = useState({}); // { 'r,c': [n,...] }
  const [selected, setSelected] = useState(null);
  const [validationOn, setValidationOn] = useState(true);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setStartTime(Date.now());
    setElapsedSeconds(0);
  }, []);

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.size) {
          setSize(saved.size);
          setDifficulty(saved.difficulty || 'easy');
          setPuzzle(saved.puzzle);
          setGrid(saved.grid);
          setNotes(saved.notes || {});
          setSelected(saved.selected || null);
          setValidationOn(saved.validationOn ?? true);
          setNotesMode(saved.notesMode ?? false);
          setStartTime(Date.now() - (saved.elapsedMs || 0));
          setElapsedSeconds(Math.floor((saved.elapsedMs || 0) / 1000));
        }
      }
    } catch (e) {
      console.warn('failed to load kenken state', e);
    }
  }, []);

  // Persist state
  useEffect(() => {
    try {
      const payload = {
        size,
        difficulty,
        puzzle,
        grid,
        notes,
        selected,
        validationOn,
        notesMode,
        elapsedMs: elapsedSeconds * 1000
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [size, difficulty, puzzle, grid, notes, selected, validationOn, notesMode, elapsedSeconds]);

  // Tick timer
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  // Load a puzzle
  const loadPuzzle = useCallback(async (opts) => {
    const { size: s = size, difficulty: d = difficulty } = opts || {};
    const p = await loadRandomPuzzle(s, d);
    const empty = Array.from({ length: s }, () => Array(s).fill(0));
    setPuzzle(p);
    setGrid(empty);
    setNotes({});
    setSelected(null);
    setHistory([]);
    setFuture([]);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  }, [size, difficulty]);

  useEffect(() => {
    if (!puzzle) loadPuzzle({ size, difficulty });
  }, [puzzle, size, difficulty, loadPuzzle]);

  const cageMap = useMemo(() => {
    const map = {};
    const labels = {};
    if (puzzle) {
      puzzle.cages.forEach((cage, idx) => {
        const id = `C${idx}`;
        let anchorKey = null;
        cage.cells.forEach(([r, c], i) => {
          const key = `${r},${c}`;
          map[key] = id;
          if (i === 0) anchorKey = key;
        });
        const label = cage.op ? `${cage.target}${cage.op}` : `${cage.target}`;
        if (anchorKey) labels[anchorKey] = label;
      });
    }
    return { map, labels };
  }, [puzzle]);

  const pushHistory = useCallback((prevGrid, prevNotes) => {
    setHistory(h => [...h, { grid: prevGrid, notes: prevNotes }]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setGrid(last.grid);
      setNotes(last.notes);
      setFuture(f => [{ grid, notes }, ...f]);
      return h.slice(0, -1);
    });
  }, [grid, notes]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      pushHistory(grid, notes);
      setGrid(next.grid);
      setNotes(next.notes);
      return f.slice(1);
    });
  }, [grid, notes, pushHistory]);

  const placeNumber = useCallback((r, c, value) => {
    const prevGrid = grid.map(row => [...row]);
    const prevNotes = { ...notes };
    pushHistory(prevGrid, prevNotes);

    const g = grid.map(row => [...row]);
    g[r][c] = value;
    setGrid(g);
    // Clear notes in that cell
    const key = `${r},${c}`;
    const newNotes = { ...notes };
    delete newNotes[key];
    setNotes(newNotes);
  }, [grid, notes, pushHistory]);

  const toggleNote = useCallback((r, c, value) => {
    const key = `${r},${c}`;
    const prevGrid = grid.map(row => [...row]);
    const prevNotes = { ...notes };
    pushHistory(prevGrid, prevNotes);

    const current = notes[key] || [];
    const exists = current.includes(value);
    const updated = exists ? current.filter(n => n !== value) : [...current, value].sort((a,b)=>a-b);
    setNotes({ ...notes, [key]: updated });
  }, [grid, notes, pushHistory]);

  const clearCell = useCallback(() => {
    if (!selected) return;
    const { r, c } = selected;
    if (grid[r][c] === 0 && !notes[`${r},${c}`]?.length) return;
    const prevGrid = grid.map(row => [...row]);
    const prevNotes = { ...notes };
    pushHistory(prevGrid, prevNotes);
    const g = grid.map(row => [...row]);
    g[r][c] = 0;
    setGrid(g);
    const newNotes = { ...notes };
    delete newNotes[`${r},${c}`];
    setNotes(newNotes);
  }, [selected, grid, notes, pushHistory]);

  const inputNumber = useCallback((n) => {
    if (!selected) return;
    const { r, c } = selected;
    if (n < 1 || n > size) return;
    if (notesMode) {
      toggleNote(r, c, n);
    } else {
      placeNumber(r, c, n);
    }
  }, [selected, notesMode, size, toggleNote, placeNumber]);

  const toggleValidation = useCallback(() => setValidationOn(v => !v), []);
  const toggleNotesMode = useCallback(() => setNotesMode(v => !v), []);

  const newPuzzle = useCallback(() => {
    loadPuzzle({ size, difficulty });
  }, [loadPuzzle, size, difficulty]);

  // Conflicts computation
  const conflicts = useMemo(() => {
    if (!validationOn || !puzzle) return new Set();
    return computeConflicts(grid, puzzle);
  }, [grid, puzzle, validationOn]);

  const isSolved = useMemo(() => {
    const solved = checkSolved(grid, puzzle);
    if (solved) {
      console.log('KenKen puzzle solved!', { grid, puzzle });
    }
    return solved;
  }, [grid, puzzle]);

  const hint = useCallback(() => {
    if (!puzzle) return;
    // Naked single: a cell with exactly one candidate
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== 0) continue;
        const cand = getCandidates(r, c, grid, puzzle);
        if (cand.length === 1) {
          placeNumber(r, c, cand[0]);
          setHintsUsed(h => h + 1);
          return;
        }
      }
    }
    // No simple hint found
  }, [puzzle, grid, size, placeNumber]);

  return {
    state: {
      size,
      setSize,
      difficulty,
      setDifficulty,
      difficultyLabel: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      puzzle,
      grid,
      notes,
      selected,
      setSelected,
      validationOn,
      notesMode,
      cageMap: cageMap.map,
      cageLabels: cageMap.labels,
      conflicts,
      canUndo: history.length > 0,
      canRedo: future.length > 0,
      difficulties
    },
    actions: {
      setSize: (s) => { setSize(s); loadPuzzle({ size: s, difficulty }); },
      setDifficulty: (d) => { setDifficulty(d); loadPuzzle({ size, difficulty: d }); },
      setSelected,
      inputNumber,
      clearCell,
      toggleValidation,
      toggleNotesMode,
      undo,
      redo,
      newPuzzle,
      hint
    },
    isSolved,
    elapsedSeconds,
    hintsUsed,
    mistakes,
    resetTimer
  };
};
