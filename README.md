# Word Puzzle Games (Multi‑Game Hub)

A collection of engaging puzzle games built with React and Vite. The app provides a unified launcher, shared UI, per‑game state, high scores, and theming.

## 🎮 Games Included

### Word Guess
- Guess the 5-letter word in 6 tries
- Daily puzzles with consistent word selection
- Comprehensive statistics tracking
- Multiple themes (dark mode, high contrast, color blind friendly)
- Share results functionality

### Letter Hunt
### Sudoku Mini
- 4×4 beginner-friendly Sudoku
- Simple timer and local stats
- Great for quick sessions

### 2048
- Classic 2048 tile-merging gameplay
- Score, highest tile, and move count tracked

### Samurai Sudoku (beta — currently hidden)
- 21×21 Samurai (Gattai-5) with five overlapping 9×9 boards
- React Context-based state management
- Hint and Auto‑solve actions wired in the context and controls
- Validation across overlapping regions
- Feature‑flagged off in UI and routes while in beta
- Find words using 7 given letters (must include center letter)
- Scoring system with ranks from Beginner to Queen Bee
- Pangram detection (words using all 7 letters)
- Interactive hexagon interface
- Word discovery tracking

## ✨ Features

- **Multi-game interface**: Easy navigation between different puzzle games (Game Selector)
- **Responsive design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Support for keyboard navigation and screen readers
- **Theme support**: Dark mode, high contrast, and color blind friendly options
- **Local storage**: Game progress and statistics are saved locally
- **Modern UI**: Clean, intuitive interface for optimal gaming experience
- **High Scores**: Modal with per‑game and per‑difficulty leaderboards
- **User Profile**: Avatar and display name stored locally

## 🧩 Samurai Sudoku details (beta)

- Grid: 21×21 canvas with five 9×9 boards placed at TL(0,0), TR(0,12), C(6,6), BL(12,0), BR(12,12)
- State: `SamuraiSudokuContext.jsx` manages grid, selections, hint, and auto‑solve
- UI: `SamuraiGrid`, `SamuraiCell`, `SamuraiControls`, wrapped by `SamuraiSudokuGame`
- Validation: `samuraiValidator.js` enforces row/column/box rules across overlapping boards
- Generation: `samuraiGenerator.js` and `samuraiGeneratorSimple.js`
   - Simple generator uses pre‑verified patterns for stability in development
- Testing/Dev: `SamuraiSudokuTest.jsx` provides a lightweight integration surface

### Feature flags to show/hide Samurai Sudoku
- Game Selector card: `src/shared/components/GameSelector/GameSelector.jsx` → `SHOW_SAMURAI`
- App route gate: `src/App.jsx` → `SHOW_SAMURAI`
- High Scores tab/content: `src/features/high-scores/components/HighScores.jsx` → `SHOW_SAMURAI`

Set these flags to `true` to make Samurai Sudoku visible to users.

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/matthart1983/wordpuzzle.git
cd wordpuzzle
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🛠️ Tech Stack

- **React**: Frontend framework
- **Vite**: Build tool and development server
- **CSS**: Custom CSS with CSS variables for theming
- **an-array-of-english-words**: Word dictionary for validation
- **Local Storage**: Game state and statistics persistence

## 🧱 Project Architecture

The codebase is organized by feature. Each game lives under `src/features/<game>/` with its own components, context, and utils. Shared UI and cross‑game utilities live under `src/shared/`.

```
src/
├─ features/
│  ├─ wordle/                # Word Guess
│  ├─ spelling-bee/          # Letter Hunt
│  ├─ sudoku/                # Sudoku Mini
│  ├─ samurai-sudoku/        # Samurai Sudoku (beta)
│  │  ├─ components/
│  │  │  ├─ SamuraiSudokuGame/
│  │  │  ├─ SamuraiGrid/
│  │  │  ├─ SamuraiCell/
│  │  │  └─ SamuraiControls/
│  │  ├─ context/
│  │  │  └─ SamuraiSudokuContext.jsx
│  │  └─ utils/
│  │     ├─ samuraiModels.js
│  │     ├─ samuraiValidator.js
│  │     ├─ samuraiGenerator.js
│  │     └─ samuraiGeneratorSimple.js
│  └─ game2048/
├─ shared/
│  ├─ components/
│  │  ├─ GameSelector/
│  │  ├─ Header/
│  │  └─ Modal/
│  └─ utils/
└─ App.jsx
```

### High Scores
- Component: `src/features/high-scores/components/HighScores.jsx`
- Supports per‑game tabs and difficulty breakdowns
- Samurai tab is hidden unless `SHOW_SAMURAI=true`

## 🎯 Game Rules

### Word Guess
1. Guess the 5-letter word in 6 tries
2. Each guess must be a valid English word
3. Color feedback after each guess:
   - 🟩 Green: Letter is correct and in the right position
   - 🟨 Yellow: Letter is in the word but wrong position
   - ⬜ Gray: Letter is not in the word

### Letter Hunt
1. Create words using the 7 given letters
2. Words must be at least 4 letters long
3. Words must include the center letter (highlighted in yellow)
4. Find the pangram (word using all 7 letters) for maximum points
5. Scoring system with ranks from Beginner to Queen Bee

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is an original collection of puzzle games created for educational and entertainment purposes.

## 🙏 Acknowledgments

- The open-source community for the tools and libraries used
- Word list from `an-array-of-english-words` package

## 🔧 Development Notes

- Uses modern React patterns with hooks and context
- Implements responsive design with CSS Grid and Flexbox
- Local storage integration for persistent game state
- Comprehensive error handling and input validation
- Optimized for performance with minimal re-renders

## 🗒️ Change Summary (recent)
- Added Sudoku Mini and 2048 to the game hub
- Implemented Samurai Sudoku (beta): grid, validation, context, controls
- Added hint and auto‑solve actions for Samurai; simplified dev generator
- Introduced feature flags to hide Samurai from selector, routes, and high scores
- High Scores modal with tabs and per‑difficulty breakdown