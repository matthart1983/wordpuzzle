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

## Don’ts

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
