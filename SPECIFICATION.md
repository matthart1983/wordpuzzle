# Word Guess Game - Game Specification

## Table of Contents
1. [Overview](#overview)
2. [Game Rules](#game-rules)
3. [User Interface](#user-interface)
4. [Technical Requirements](#technical-requirements)
5. [Features](#features)
6. [Data Management](#data-management)
7. [Performance Requirements](#performance-requirements)
8. [Future Enhancements](#future-enhancements)

## Overview

### Project Description
A web-based word puzzle game where players attempt to guess a 5-letter word within 6 attempts. The game provides feedback through color-coded tiles to guide players toward the correct answer.

### Target Audience
- Casual puzzle game enthusiasts
- Word game lovers
- Players of all ages (8+)

### Platform
- Web application (responsive design)
- Compatible with desktop and mobile browsers

## Game Rules

### Core Gameplay
1. **Objective**: Guess the hidden 5-letter word in 6 attempts or fewer
2. **Word Constraints**: 
   - Must be exactly 5 letters long
   - Must be a valid English word
   - Case-insensitive input
3. **Attempt Limit**: Maximum of 6 guesses per game
4. **Daily Challenge**: One puzzle per day with consistent word selection

### Feedback System
After each guess, tiles change color to provide feedback:
- **Green**: Letter is in the word and in the correct position
- **Yellow**: Letter is in the word but in the wrong position  
- **Gray**: Letter is not in the word at all

### Game States
- **Playing**: Game in progress, attempts remaining
- **Won**: Player guessed the word correctly
- **Lost**: Player exhausted all 6 attempts without success
- **Invalid**: Player entered an invalid word

## User Interface

### Game Board Layout
```
┌─────────────────────────────────┐
│           WORD GUESS            │
├─────────────────────────────────┤
│  [_] [_] [_] [_] [_]  Attempt 1 │
│  [_] [_] [_] [_] [_]  Attempt 2 │
│  [_] [_] [_] [_] [_]  Attempt 3 │
│  [_] [_] [_] [_] [_]  Attempt 4 │
│  [_] [_] [_] [_] [_]  Attempt 5 │
│  [_] [_] [_] [_] [_]  Attempt 6 │
├─────────────────────────────────┤
│  Q W E R T Y U I O P            │
│   A S D F G H J K L             │
│    Z X C V B N M [⌫]            │
│        [ENTER]                  │
└─────────────────────────────────┘
```

### Visual Elements
1. **Game Grid**: 6 rows × 5 columns of letter tiles
2. **Virtual Keyboard**: QWERTY layout with:
   - Letter keys that show color feedback
   - Enter key for submitting guesses
   - Backspace key for corrections
3. **Header**: Game title and navigation
4. **Stats Panel**: Win rate, streak, guess distribution
5. **Settings**: Dark mode toggle, accessibility options

### Color Scheme
- **Primary Colors**:
  - Green: #6AAA64 (correct position)
  - Yellow: #C9B458 (wrong position)
  - Gray: #787C7E (not in word)
  - Dark Gray: #3A3A3C (unused letters)
- **Background**: #121213 (dark mode) / #FFFFFF (light mode)
- **Text**: #FFFFFF (dark mode) / #000000 (light mode)

### Responsive Design
- **Desktop**: Full keyboard layout, larger tiles
- **Mobile**: Touch-optimized keyboard, appropriately sized tiles
- **Tablet**: Hybrid layout optimizing for touch and screen space

## Technical Requirements

### Frontend Technology Stack
- **Framework**: React.js or Vue.js
- **Styling**: CSS3 with Flexbox/Grid, or Tailwind CSS
- **State Management**: Context API or Vuex/Pinia
- **Build Tool**: Vite or Create React App
- **Testing**: Jest + Testing Library

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance Targets
- **Load Time**: < 2 seconds on 3G connection
- **First Contentful Paint**: < 1.5 seconds
- **Lighthouse Score**: 90+ across all categories

### Accessibility
- **WCAG 2.1 AA compliance**
- Screen reader support
- Keyboard navigation
- High contrast mode
- Focus indicators

## Features

### Core Features (MVP)
1. **Game Logic**
   - Word validation against dictionary
   - Guess evaluation and feedback
   - Win/loss detection
   - Attempt tracking

2. **User Interface**
   - Interactive game board
   - Virtual keyboard with feedback
   - Responsive design
   - Dark/light mode toggle

3. **Game State**
   - Local storage for game progress
   - Statistics tracking
   - Daily puzzle rotation

### Enhanced Features (Phase 2)
1. **Statistics Dashboard**
   - Games played counter
   - Win percentage
   - Current streak
   - Maximum streak
   - Guess distribution chart

2. **Social Features**
   - Share results (emoji grid)
   - Copy to clipboard functionality
   - Social media integration

3. **Accessibility**
   - High contrast mode
   - Screen reader support
   - Keyboard-only navigation
   - Font size options

### Advanced Features (Phase 3)
1. **Game Modes**
   - Hard mode (revealed letters must be used)
   - Practice mode (unlimited games)
   - Custom word length options
   - Time attack mode

2. **Customization**
   - Theme selection
   - Custom word lists
   - Difficulty settings
   - Animation preferences

## Data Management

### Word Database
- **Primary List**: ~2,500 common 5-letter words for answers
- **Extended List**: ~12,000 valid 5-letter words for guesses
- **Filtering**: Remove offensive, proper nouns, archaic words
- **Format**: JSON array or SQLite database

### Local Storage Schema
```javascript
{
  "gameState": {
    "currentWord": "REACT",
    "guesses": ["STARE", "PILOT"],
    "currentGuess": "",
    "gameStatus": "playing", // playing, won, lost
    "currentRow": 2,
    "currentCol": 0
  },
  "statistics": {
    "gamesPlayed": 15,
    "gamesWon": 12,
    "currentStreak": 3,
    "maxStreak": 7,
    "guessDistribution": [0, 2, 4, 3, 2, 1]
  },
  "settings": {
    "darkMode": true,
    "hardMode": false,
    "colorBlindMode": false,
    "highContrastMode": false
  },
  "dailyChallenge": {
    "lastPlayedDate": "2025-11-03",
    "completedToday": false
  }
}
```

### Word Selection Algorithm
1. **Daily Seed**: Use current date as seed for reproducible randomness
2. **Rotation**: Cycle through curated answer list
3. **Difficulty**: Maintain consistent difficulty level
4. **Uniqueness**: Ensure no repeated words for extended periods

## Performance Requirements

### Loading Performance
- **Initial Bundle Size**: < 100KB gzipped
- **Time to Interactive**: < 3 seconds
- **Lazy Loading**: Non-critical features loaded on demand

### Runtime Performance
- **Animation Frame Rate**: 60 FPS for transitions
- **Memory Usage**: < 50MB peak
- **Battery Impact**: Minimal (no continuous animations)

### Offline Support
- **Service Worker**: Cache app shell and word lists
- **Offline Play**: Allow gameplay without internet
- **Sync**: Upload statistics when connection restored

## Future Enhancements

### Potential Additions
1. **Multiplayer Features**
   - Head-to-head competitions
   - Leaderboards
   - Tournament mode

2. **Educational Features**
   - Word definitions and etymology
   - Vocabulary building exercises
   - Language learning mode

3. **Monetization (Optional)**
   - Premium themes
   - Advanced statistics
   - Ad-free experience
   - Custom game modes

4. **Platform Expansion**
   - Progressive Web App (PWA)
   - Mobile app (React Native)
   - Desktop app (Electron)

### Technical Improvements
1. **Advanced Analytics**
   - Player behavior tracking
   - A/B testing framework
   - Performance monitoring

2. **Internationalization**
   - Multiple language support
   - Localized word lists
   - Cultural adaptations

## Implementation Timeline

### Phase 1: Core Game (4-6 weeks)
- [ ] Basic game logic and word validation
- [ ] UI/UX implementation
- [ ] Local storage and statistics
- [ ] Responsive design
- [ ] Basic testing

### Phase 2: Polish & Features (2-3 weeks)
- [ ] Enhanced statistics dashboard
- [ ] Social sharing features
- [ ] Accessibility improvements
- [ ] Performance optimization

### Phase 3: Advanced Features (3-4 weeks)
- [ ] Additional game modes
- [ ] Customization options
- [ ] Offline support
- [ ] Advanced analytics

## Success Metrics

### User Engagement
- **Daily Active Users**: Target 1000+ after 3 months
- **Session Duration**: Average 5+ minutes
- **Return Rate**: 60%+ daily return rate
- **Completion Rate**: 70%+ of started games completed

### Technical Metrics
- **Page Load Speed**: < 2 seconds
- **Error Rate**: < 1% of sessions
- **Uptime**: 99.9% availability
- **Performance Score**: 90+ Lighthouse rating

---

## Appendix

### Word List Criteria
- Common English words
- No proper nouns
- No offensive language
- No archaic or obsolete terms
- Balanced difficulty distribution

### Accessibility Guidelines
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- Color contrast ratios > 4.5:1
- Focus indicators clearly visible

### Browser Testing Matrix
| Browser | Desktop | Mobile | Tablet |
|---------|---------|--------|--------|
| Chrome  | ✓       | ✓      | ✓      |
| Firefox | ✓       | ✓      | ✓      |
| Safari  | ✓       | ✓      | ✓      |
| Edge    | ✓       | ✓      | ✓      |

---

## KenKen Feature Specification

### Game Overview

**KenKen®** (also known as "Calcudoku" or "MathDoku") is an arithmetic-based logic puzzle that combines elements of Sudoku with basic mathematical operations. Created by Japanese math teacher Tetsuya Miyamoto in 2004, KenKen means "wisdom squared" in Japanese.

**Core Concept**: Fill an N×N grid with numbers 1 through N such that:
1. No number repeats in any row
2. No number repeats in any column  
3. Groups of cells ("cages") satisfy arithmetic constraints

**What Makes KenKen Special**:
- Mathematical reasoning combined with logical deduction
- Self-contained puzzles requiring no prior knowledge
- Progressive difficulty from simple addition to complex operations
- Suitable for ages 6+ (3×3) through adult enthusiasts (9×9+)

### Target Experience

**Primary Audience**:
- Logic puzzle enthusiasts seeking variety beyond Sudoku
- Math educators and students (K-12 through adult)
- Mobile puzzle gamers looking for quick 5-15 minute sessions
- Crossword and number puzzle veterans

**Session Goals**:
- 3×3/4×4: 2-5 minutes (quick coffee break)
- 5×5/6×6: 5-12 minutes (commute-friendly)
- Sense of accomplishment through pure logic
- No guessing required—every puzzle has one unique solution

**Platform Priority**: Mobile-first with desktop support (touchscreen-optimized)

### Game Rules

**Grid Constraints** (identical to Sudoku):
- Fill an N×N grid with numbers 1 through N
- Each row must contain 1-N exactly once (no duplicates)
- Each column must contain 1-N exactly once (no duplicates)
- Unlike Sudoku: **no boxes/regions**—only rows and columns matter

**Cage Rules** (the unique KenKen element):
- Grid is divided into outlined groups called "cages" (typically 1-4 cells)
- Each cage displays a **target number** and **operation** (+, −, ×, ÷) in its top-left corner
- Numbers in a cage must combine via that operation to equal the target
- **Single-cell cages**: Show only the target number (that cell's fixed value)
- **Operation Order**: 
  - **Addition (+)**: Sum all numbers in the cage
  - **Multiplication (×)**: Multiply all numbers in the cage
  - **Subtraction (−)**: Only 2-cell cages; either order equals target (e.g., 3− can be 4,1 or 5,2)
  - **Division (÷)**: Only 2-cell cages; larger ÷ smaller = target (e.g., 2÷ can be 6,3 or 4,2)

**Valid Puzzle Requirements**:
- Exactly one unique solution achievable through pure logic
- No guessing required at any step
- All cages solvable using basic arithmetic (no calculators needed)

### Size & Difficulty System

**Grid Sizes** (MVP Launch):
| Size | Typical Time | Target Skill Level | Operators Used |
|------|--------------|-------------------|----------------|
| 3×3 | 2-4 min | Beginner/Kids (Age 6+) | + only |
| 4×4 | 3-7 min | Easy/Learning | +, −, × |
| 5×5 | 6-12 min | Medium | +, −, ×, ÷ |
| 6×6 | 10-20 min | Hard/Expert | +, −, ×, ÷ |

**Difficulty Factors**:
1. **Cage complexity**: Larger cages (3-4 cells) harder than pairs
2. **Operator mix**: Division requires more trial-and-error than addition
3. **Cage shapes**: L-shapes and scattered cages increase difficulty
4. **Singleton givens**: Fewer fixed numbers = harder
5. **Initial deductions**: Easy puzzles have obvious first moves

**Phase 2 Sizes** (Future):
- 7×7, 8×8, 9×9 for advanced players (20-45 minutes)

### User Interface Design

**Visual Hierarchy** (inspired by NYT Games and Conceptis):
```
┌─────────────────────────────────────┐
│  ← KENKEN 4×4         [Stats] [⋮]   │
├─────────────────────────────────────┤
│  Time: 04:32     Hints: 0           │
│  [Undo] [Redo] [Hint] [Check]       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────┬─────┬─────┬─────┐         │
│  │6+   │     │3−   │     │         │
│  │  1  │  2  ├─────┤  4  │         │
│  ├─────┼─────┤ 4×  │     │         │
│  │2−   │     │     │     │         │
│  │  3  │  4  │  2  │  1  │         │
│  ├─────┴─────┼─────┼─────┤         │
│  │  4   │ 1  │12+  │     │         │
│  │      │    │     │  2  │         │
│  ├──────┼────┼─────┴─────┤         │
│  │      │ 3  │    5+     │         │
│  │   2  │    │           │         │
│  └──────┴────┴───────────┘         │
│                                     │
│  1   2   3   4   [Clear] [Notes]   │
└─────────────────────────────────────┘
```

**Grid Display Requirements**:
1. **Cage Boundaries**:
   - **3px bold borders** separate cages (using `var(--color-border)`)
   - **1px thin borders** for internal cell divisions
   - Rounded corners (8px) on outer grid
2. **Cage Labels**:
   - Position: **Top-left corner** of first cell in reading order
   - Format: `"12+"`, `"3−"`, `"8×"`, `"2÷"` or just `"5"` for singletons
   - Font: **Bold, 0.75-0.85rem**, `var(--color-text)`
   - Must not overlap with user input

3. **Cell Sizing**:
   - Desktop: 60px × 60px; Mobile: 50px × 50px; Tablet: 55px × 55px
   - Value font: 1.5rem bold; Pencil marks: 0.65rem in 3×3 grid

4. **States & Colors**:
   - Empty: `var(--color-background)`
   - Selected: `var(--color-correct)` + white text + scale(1.05)
   - Hover: `var(--color-key-hover)`
   - Error: `var(--color-tile-absent)` + shake animation

**Input Methods**:
- **Number Entry**: Tap cell → tap number button or press 1-N key
- **Pencil Marks**: Toggle "Notes" button; shows 3×3 grid of candidates
- **Keyboard**: 1-N (enter), Delete (clear), N (notes), H (hint), Ctrl+Z (undo), arrows (navigate)

**Controls**:
```
[Undo] [Redo]  |  [Hint]  |  [Check]  |  [New] [Size▾]
```### Integration Points

- Feature flag: `SHOW_KENKEN` (default false until release). Used in:
   - `src/shared/components/GameSelector` to show/hide the KenKen card.
   - `src/App` route registration (e.g., `/kenken`).
   - `src/features/high-scores` to hide or show KenKen tabs and data.
- High Scores: Track best time per size and difficulty, with penalties for hint usage.
- Persistence: Save in-progress puzzle state, notes, and timer in `localStorage` under a namespaced key.

### Data Model

Puzzle JSON (importable and shippable) format:

```json
{
   "id": "kenken-6x6-easy-001",
   "size": 6,
   "title": "6x6 Easy #1",
   "cages": [
      { "cells": [[0,0],[0,1]], "op": "+", "target": 7 },
      { "cells": [[0,2],[1,2]], "op": "÷", "target": 2 },
      { "cells": [[0,3],[0,4],[1,4]], "op": "×", "target": 24 },
      { "cells": [[0,5]], "target": 5 },
      { "cells": [[1,0],[2,0]], "op": "-", "target": 1 }
      // ...
   ],
   "givens": [
      // Optional fixed cells, rarely used in standard KenKen
      // { "r": 5, "c": 5, "value": 3 }
   ],
   "metadata": { "difficulty": "easy", "author": "", "source": "built-in" }
}
```

Notes:
- Coordinates are zero-based `[row, col]`.
- `op` omitted for singletons; `target` is required for all cages.
- MVP restricts `op` in cages with 3+ cells to `+` or `×`.

### Architecture

Proposed folder structure:

```
src/
   features/
      kenken/
         components/
            KenKenBoard.tsx
            KenKenCell.tsx
            KenKenToolbar.tsx
         hooks/
            useKenKenGame.ts
         utils/
            kenkenValidator.ts
            kenkenSolver.ts
            kenkenHint.ts
            kenkenParsers.ts
         data/
            bank-4x4.json
            bank-5x5.json
            bank-6x6.json
         index.ts
```

Key modules:
- `kenkenValidator.ts`: Pure functions to validate row/column uniqueness and cage satisfaction.
- `kenkenSolver.ts`: Backtracking solver with constraint propagation (row/col candidates, cage domain pruning).
- `kenkenHint.ts`: Logic-first hints (singles, cage forced sums/products, unique candidate in row/col) with solver fallback.
- `kenkenParsers.ts`: Parse/validate puzzle JSON, generate internal types.
- `useKenKenGame.ts`: State machine, timer, undo/redo stack, persistence.

### Algorithms and Logic

Constraint propagation primitives:
- Row/Column elimination: if a digit d exists in row r, remove d from other candidates in r; similarly for columns.
- Cage pruning:
   - `+` cages: candidate combos of k cells from $\{1..N\}$ whose sum = target, respecting row/col uniqueness.
   - `×` cages: candidate combos whose product = target.
   - `-`/`÷` cages (2-cell): enforce absolute difference = target or quotient = target (integer division, larger ÷ smaller).
- Singles:
   - Naked single: a cell has exactly one candidate.
   - Hidden single: only one cell in a row/column/cage can take digit d.

Solver:
- Depth-first backtracking using MRV heuristic (choose cell with minimum remaining candidates) and forward-checking via the above pruning.
- Early failure on cage impossibility or row/column duplication.
- Determinism: Ensure a unique solution for all shipped puzzles; solver verifies uniqueness during import/build time (Phase 2).

### Hint System

Hint tiers (first applicable is used):
1. Explain a naked single (cell X must be Y).
2. Explain a hidden single in a row/column/cage.
3. Explain a cage-specific deduction (e.g., only {1,6} fit a 7+ in two cells, and 6 is blocked in row, so 1 must go here).
4. Gentle solver step: pick a cell with smallest domain and suggest the most constrained value, marking as a "solver hint" that adds a time penalty.

Each hint increments a counter and adds a configurable time penalty (e.g., +20 seconds for tiers 1–3, +40 seconds for tier 4).

### Scoring and Persistence

- Timer starts on first input; pauses when the window/tab is hidden.
- Score = completion time + hint penalties.
- Save schema (per active puzzle key):

```json
{
   "puzzleId": "kenken-6x6-easy-001",
   "size": 6,
   "grid": [[0,0,0,0,0,0], ...],
   "notes": { "r,c": [1,3,5] },
   "elapsedMs": 123456,
   "hintsUsed": 2,
   "validationOn": false,
   "lastUpdated": "2025-11-05T12:34:56.000Z"
}
```

### Accessibility

- Full keyboard support: arrow keys to move, 1..N to enter, 0/Backspace to clear, Shift for notes mode.
- ARIA labels for cells: announce row/col, current value, candidates, and cage info.
- High-contrast mode and large touch targets on mobile.

### Acceptance Criteria (MVP)

- Users can select KenKen from the game selector when `SHOW_KENKEN` is true and start a 4×4, 5×5, or 6×6 puzzle.
- Grid renders with cage outlines and targets; input via keyboard and touch works on desktop and mobile.
- Validation correctly detects row/column duplicates and cage violations.
- Puzzles from built-in banks load; progress persists across reloads.
- Undo/Redo works for at least 100 steps; Clear Cell and Clear Notes work.
- Hint button provides at least tiers 1–2; tier 4 fallback is acceptable if tiers 1–3 aren’t applicable.
- Completion screen shows time, hints used, and allows saving to High Scores.

### Milestones

1. Skeleton and UI (3–4 days)
    - Feature flag and route wiring, basic board/cage rendering, input, persistence stub.
2. Validation and basic logic (3–4 days)
    - Row/column uniqueness, cage validation, pencil marks, undo/redo.
3. Puzzle banks and loading (2–3 days)
    - Curate/import 10 puzzles per size×difficulty; verify with solver.
4. Hint tiers 1–2 and scoring (2–3 days)
    - Implement hints and integrate High Scores.
5. Polish pass (2–3 days)
    - Accessibility, animations, mobile tuning, QA.

Optional Phase 2
- Procedural generator, advanced hints, larger sizes, and daily rotation.

### Risks and Mitigations

- Generator complexity: Defer to Phase 2; rely on curated banks first.
- Solver performance on 6×6 hard: Use MRV + forward-checking; memoize cage candidate sets.
- Cage UI density on small screens: Use zoom or condensed label rendering; allow tap to expand cage info.
- JSON integrity: Validate against schema on import; add runtime guards in `kenkenParsers.ts`.

### JSON Schema (informal)

```ts
type Cell = [number, number];
type Cage = { cells: Cell[]; target: number; op?: "+" | "-" | "×" | "÷" };
type KenKenPuzzle = {
   id: string;
   size: number; // 4..9
   title?: string;
   cages: Cage[];
   givens?: { r: number; c: number; value: number }[];
   metadata?: { difficulty?: "easy" | "medium" | "hard"; author?: string; source?: string };
};
```

---

Implementation note: Start with `SHOW_KENKEN = false` and land UI + validation behind the flag. Once puzzle banks and hints tiers 1–2 are stable, flip the flag to ship.
