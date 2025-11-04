import bank3 from '../data/bank-3x3.json';
import bank4 from '../data/bank-4x4.json';
import bank5 from '../data/bank-5x5.json';
import bank6 from '../data/bank-6x6.json';

const BANKS = {
  3: bank3,
  4: bank4,
  5: bank5,
  6: bank6
};

export const loadRandomPuzzle = async (size = 4, difficulty = 'easy') => {
  const bank = BANKS[size] || bank4;
  const pool = (bank.puzzles || []).filter(p => (p.metadata?.difficulty || 'easy') === difficulty);
  const list = pool.length > 0 ? pool : (bank.puzzles || []);
  if (list.length === 0) throw new Error('No puzzles available');
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
};
