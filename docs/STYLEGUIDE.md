# UI Style Guide

This guide codifies design patterns and UI conventions used across the puzzle hub (Word Guess, Sudoku, 2048, Spelling Bee, Samurai, KenKen). Apply these guidelines for consistent visuals, UX, and accessibility.

## Design Tokens

Use CSS variables defined in `src/styles/index.css` across all features:

- Colors
  - Background: `var(--color-background)`
  - Text: `var(--color-text)`; Secondary text: `var(--color-text-secondary)`
  - Borders: `var(--color-border)`
  - Keys/Buttons: `var(--color-key-background)`, `var(--color-key-hover)`
  - Accents (Success/Correct): `var(--color-correct)` (+ `--color-correct-dark`)
  - Tiles (Word Guess): `var(--color-tile-correct)`, `var(--color-tile-present)`, `var(--color-tile-absent)`
- Shadows
  - Tile: `var(--shadow-tile)`; Key: `var(--shadow-key)`; Modal: `var(--shadow-modal)`
- Transitions
  - Fast: `var(--transition-fast)`; Normal: `var(--transition-normal)`; Slow: `var(--transition-slow)`

Do not hard-code colors (e.g., `#111`, `#333`) in feature styles. Use tokens to support dark/high-contrast/color-blind themes.

## Typography

- Base font family comes from `body` in `styles/index.css`: `'Clear Sans', 'Helvetica Neue', Arial, sans-serif`.
- Font weights: regular 400, medium 500, semibold 600, bold 700.
- Headings in headers use the shared `Header` component; avoid defining ad-hoc title styles in features.

## Layout

- Root screen: Use a header via `shared/components/Header`.
- Content container: Use `.game-container` for central column layout:
  - Max width ~500px; centered; vertical stack; 16–24px gaps.
  - Sudoku sets this pattern; reuse it so all games align.
- Avoid custom root wrappers with different paddings/margins unless necessary.

## Boards and Grids

- Board wrapper style (match Sudoku):
  - Grid display with small gaps and a framed border:
    - `display: grid; gap: 2px; background: var(--color-border); border: 3px solid var(--color-border); border-radius: 8px; padding: 2px;`
- Cells:
  - `background: var(--color-background); border: 1px solid var(--color-border); color: var(--color-text);`
  - Hover: `background: var(--color-key-hover)`
  - Selected state: `background: var(--color-correct); color: white; transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,0.2)`
  - Error/Conflict state: `background: var(--color-tile-absent)` and white text; use `animation: shake 0.5s` if needed.
- Labels/Annotations:
  - Use `var(--color-text-secondary)` for low-emphasis labels (e.g., cage labels in KenKen).

## Controls

- Buttons (controls/toolbar): match Sudoku styles
  - Background: `var(--color-key-background)`; border: `1–2px solid var(--color-border)`; radius: 6px
  - Hover: `var(--color-key-hover)` with `transform: translateY(-1px)`
  - Active/primary: `background: var(--color-correct); color: white; border-color: var(--color-correct)`
- Selects/Inputs: use `background: var(--color-background)`, `border: 2px solid var(--color-border)`, radius 6px, focus ring via `:focus-visible` (already defined globally).

## Stats and Footers

- Use the Sudoku `.game-stats` grid pattern:
  - 2-column grid of `.stat` cards with `.stat-label` (secondary) and `.stat-value` (semibold) tokens.
- Do not invent new footers when this pattern fits.

## Modals

- Use shared Modal components where possible. When adding unique modals:
  - Overlay: `rgba(0,0,0,0.5)`; content background `var(--color-background)`; border `var(--color-border)`; radius `12px`; shadow `var(--shadow-modal)`.

## Responsiveness

- Aim for comfortable tap targets on mobile (44px+ height).
- Use media queries similar to Sudoku’s to adjust sizes for narrow screens (<= 480px).

## Accessibility

- Respect global focus styles (`:focus-visible`).
- Sufficient contrast (use tokens; avoid hard-coded low-contrast grays).
- Keyboard support for core interactions.
- ARIA labelling for grids/cells where applicable (announce position/value/state).

## Naming & Structure

- Co-locate feature styles: `features/<feature>/components/<Component>.css`.
- Prefer BEM-like lightweight class names scoped by main component (e.g., `.kenken-board`, `.kenken-cell`).
- Reuse shared class names to inherit global styles where helpful (e.g., `.game-container`, `.game-stats`).

## KenKen-specific Notes (for consistency)

- Board should visually match Sudoku grid:
  - Framed grid with rounded corners and subtle gaps
  - Cells adopt the same hover/selected styles
- Cage borders: where cage edges meet, use a thicker border (2–3px) to delineate cages.
- Cage labels: top-left corner, `var(--color-text-secondary)`, small (0.7rem).
- Notes (pencil marks): small grid of digits in dim secondary color; filled values use the main font size.

## Letter Hunt (Spelling Bee) Design Standards

Letter Hunt follows NYT Games aesthetic: clean, minimal, and professional. Key patterns:

### Layout & Structure
- **Container**: Max-width 600px, centered, with 16-20px horizontal padding
- **Vertical rhythm**: 20px gap between major sections (score panel, hexagon, input, found words)
- **Consistent padding**: Content panels use 20px internal padding on desktop, 16px on mobile

### Color Palette
- **Primary accent**: `#f7da21` (yellow/gold) for center hexagon, rank name, points, progress bars
- **Accent hover**: `#e6c914` (darker gold) for interactions
- **Pangram highlight**: Linear gradient `135deg, #f7da21, #e6c914` with black text
- **Error states**: `#dc3545` (red) for invalid word shake/border
- **Success states**: `#28a745` (green) for submit button hover
- Use tokens for all base colors (background, text, borders)

### Hexagon Letter Grid
- **Center hexagon**: 
  - Size: 80px × 80px
  - Background: `#f7da21` with darker `#e6c914` shadow layer
  - Text: Black (#000), 1.8rem, bold
  - Position: Absolute center with `translate(-50%, -50%)`
  - Hover: Scale(1.05) with deeper yellow
- **Outer hexagons**:
  - Size: 80px × 80px
  - Background: `var(--color-tile-empty)`
  - Text: `var(--color-text)`, 1.8rem, bold
  - Clip-path: `polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`
  - Positions: Top, top-right, bottom-right, bottom, bottom-left, top-left (hexagonal arrangement)
  - Hover: `var(--color-border)` background + scale(1.05)
- **Container**: 240px × 240px, fade-in scale animation (0.8s ease-out)

### Score Panel
- **Container**: Framed with 2px border, 8px radius, 20px padding
- **Typography**:
  - Current points: 2rem bold, gold (#f7da21)
  - Max points: 1.2rem, 70% opacity
  - Rank name: 1.2rem bold uppercase, gold, letter-spacing 0.05rem
  - Percentage: 1.5rem bold
- **Progress bar**: 8px height, rounded, gold gradient fill with smooth transition
- **Section dividers**: 1px `var(--color-border)` with 12-16px padding

### Word Input Display
- **Container**: Min 200px width, 60px height
- **Typography**: 1.5rem bold uppercase, letter-spacing 0.1rem
- **States**:
  - Default: 2px `var(--color-border)`, `var(--color-tile-empty)` background
  - Invalid: `#dc3545` border, `rgba(220, 53, 69, 0.1)` background + shake animation
  - Placeholder: 1rem normal weight, 50% opacity, no uppercase/letter-spacing

### Control Buttons
- **Base style**:
  - Padding: 12px 20px
  - Border: 2px solid `var(--color-border)`
  - Background: `var(--color-tile-empty)`
  - Font: 0.9rem bold uppercase, letter-spacing 0.05rem
  - Min-width: 80px, border-radius: 6px
- **Hover interactions**:
  - Default: `var(--color-border)` background + translateY(-2px)
  - Delete: `#dc3545` border + light red background tint
  - Submit: `#28a745` border + light green background tint
  - Shuffle: `#ffc107` border + light yellow background tint
- **Active**: Reset translateY(0)
- **Disabled**: 50% opacity, not-allowed cursor

### Found Words List
- **Grid layout**: 
  - Auto-fill columns, min 120px per word, 8px gap
  - Max-height: 300px with scroll
  - Border: 1px, 8px radius, 8px padding
- **Word items**:
  - Padding: 8px 12px, min-height 36px
  - Font: 0.9rem medium (500) uppercase, letter-spacing 0.05rem
  - Border: 1px solid `var(--color-border)`
  - Hover: `var(--color-border)` background + translateY(-1px)
- **Pangrams** (special highlight):
  - Background: Gold gradient `135deg, #f7da21, #e6c914`
  - Text: Black, bold
  - Hover: Deeper gradient + translateY(-2px) + shadow
  - Indicator: 1.1rem emoji (🌟 or similar)

### Instructions Panel
- **Container**: Centered text, 16px padding, 1px border, 8px radius
- **Typography**: 0.9rem line-height 1.4
- **Emphasis**: First paragraph bold in gold (#f7da21)
- Responsive: 12px padding + 0.8rem font on mobile

### Responsive Breakpoints
- **<= 768px**: Reduce padding to 12px, font-sizes by 10%, gap to 16px
- **<= 480px**: Header stack vertical, smaller hexagons (consider 70px), tighter spacing

### Animation Standards
- **Hexagon entrance**: `fadeInScale` from 80% to 100%, 0.8s ease-out
- **Invalid word shake**: 0.5s ease-in-out horizontal shake (-4px, +4px)
- **Progress bar fill**: Smooth width transition using `var(--transition-normal)`
- **Button interactions**: Fast (150ms) hover transforms + color changes

### Accessibility
- **Contrast**: Gold text (#f7da21) only on light backgrounds or large text
- **Keyboard**: Space shuffles, Enter submits, letters activate hexagons
- **Focus indicators**: Use global `:focus-visible` rings
- **Touch targets**: 80px hexagons exceed 44px minimum

## Don'ts

- Don’t hard-code colors or paddings that bypass tokens.
- Don’t create isolated layout containers that diverge from `.game-container`.
- Don’t redefine font-families in features.

## Example Snippets

- Board wrapper:
```css
.board {
  display: grid;
  gap: 2px;
  background: var(--color-border);
  border: 3px solid var(--color-border);
  border-radius: 8px;
  padding: 2px;
}
```

- Cell states:
```css
.cell { background: var(--color-background); border: 1px solid var(--color-border); }
.cell:hover { background: var(--color-key-hover); }
.cell.selected { background: var(--color-correct); color: #fff; transform: scale(1.05); }
.cell.error { background: var(--color-tile-absent); color: #fff; }
```

- Toolbar button:
```css
.btn { background: var(--color-key-background); border: 1px solid var(--color-border); border-radius: 6px; }
.btn:hover { background: var(--color-key-hover); transform: translateY(-1px); }
.btn.primary { background: var(--color-correct); border-color: var(--color-correct); color: #fff; }
```

- Letter Hunt hexagon (center):
```css
.hex-center {
  width: 80px;
  height: 80px;
  background: #f7da21;
  color: #000;
  font-size: 1.8rem;
  font-weight: bold;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.hex-center:hover {
  background: #f0d018;
  transform: translate(-50%, -50%) scale(1.05);
}
```

- Letter Hunt word input:
```css
.word-display {
  min-height: 60px;
  min-width: 200px;
  padding: 16px 24px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-tile-empty);
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  transition: all var(--transition-normal);
}
.word-display.invalid {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  animation: shake 0.5s ease-in-out;
}
```

- Letter Hunt control button:
```css
.control-button {
  padding: 12px 20px;
  border: 2px solid var(--color-border);
  background: var(--color-tile-empty);
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  border-radius: 6px;
  min-width: 80px;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.control-button:hover:not(:disabled) {
  background: var(--color-border);
  transform: translateY(-2px);
}
.submit-button:hover:not(:disabled) {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}
```

- Letter Hunt pangram word:
```css
.word-item.pangram {
  background: linear-gradient(135deg, #f7da21, #e6c914);
  color: #000;
  border-color: #d4b816;
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 4px;
}
.word-item.pangram:hover {
  background: linear-gradient(135deg, #f0d018, #d9bc12);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```
