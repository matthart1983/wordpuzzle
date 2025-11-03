# NYT Games Clone

A collection of New York Times puzzle games built with React and Vite. Currently includes Wordle and Spelling Bee clones.

## 🎮 Games Included

### Wordle
- Guess the 5-letter word in 6 tries
- Daily puzzles with consistent word selection
- Comprehensive statistics tracking
- Multiple themes (dark mode, high contrast, color blind friendly)
- Share results functionality

### Spelling Bee
- Find words using 7 given letters (must include center letter)
- Scoring system with ranks from Beginner to Queen Bee
- Pangram detection (words using all 7 letters)
- Interactive hexagon interface
- Word discovery tracking

## ✨ Features

- **Multi-game interface**: Easy navigation between different puzzle games
- **Responsive design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Support for keyboard navigation and screen readers
- **Theme support**: Dark mode, high contrast, and color blind friendly options
- **Local storage**: Game progress and statistics are saved locally
- **Modern UI**: Clean, intuitive interface inspired by NYT Games

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nyt-games-clone.git
cd nyt-games-clone
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

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GameSelector.jsx # Game selection interface
│   ├── Header.jsx       # Common header component
│   ├── wordle/          # Wordle-specific components
│   └── spelling-bee/    # Spelling Bee components
├── context/             # React context providers
│   ├── GameContext.jsx  # Wordle game state
│   └── SpellingBeeContext.jsx # Spelling Bee state
├── utils/               # Utility functions
│   ├── gameLogic.js     # Core game logic
│   ├── spellingBeeLogic.js # Spelling Bee logic
│   └── storage.js       # Local storage utilities
└── App.jsx             # Main application component
```

## 🎯 Game Rules

### Wordle
1. Guess the 5-letter word in 6 tries
2. Each guess must be a valid English word
3. Color feedback after each guess:
   - 🟩 Green: Letter is correct and in the right position
   - 🟨 Yellow: Letter is in the word but wrong position
   - ⬜ Gray: Letter is not in the word

### Spelling Bee
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

This project is for educational purposes only. It's a clone of New York Times games and is not affiliated with or endorsed by The New York Times Company.

## 🙏 Acknowledgments

- The New York Times for creating the original games
- The open-source community for the tools and libraries used
- Word list from `an-array-of-english-words` package

## 🔧 Development Notes

- Uses modern React patterns with hooks and context
- Implements responsive design with CSS Grid and Flexbox
- Local storage integration for persistent game state
- Comprehensive error handling and input validation
- Optimized for performance with minimal re-renders