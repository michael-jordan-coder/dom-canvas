# DOM Canvas

A Figma-like infinite canvas where the design language is HTML and CSS. Paste
code or import a URL, and every element becomes a live, selectable DOM layer.
No iframes, no rasterization: the browser renders the real DOM at any zoom.

## Run

```bash
pnpm install
pnpm dev
```

Open http://localhost:5180.

## Use

- Paste HTML (with or without `<style>`) with Cmd+V to create a frame. The camera fits the new frame automatically.
- Paste a URL, or use the link button in the toolbar, to snapshot a real website.
- Draw frames, rectangles and text with the toolbar tools. Double-click text to edit it.
- Click to select, drag to move, drag the handles to resize. Double-click a layer to rename it.
- Select a frame by its canvas label, the Layers list, or Cmd/Ctrl-click inside it. Frame outlines are purple; element outlines are blue. Alt-click or use the selection breadcrumb to move to a parent.
- Choose Mobile (390px), Tablet (768px), or Desktop (1440px) frame widths, and fit height to content. These presets change the frame width; they do not emulate viewport media queries.
- Edit Flex/Grid layout, position, overflow, size, fill and typography in the Design panel. "Copy code" exports the frame back to HTML and CSS.
- Open the CSS tab to edit the selected element’s inline declarations or its frame stylesheet, including selectors, custom properties, nested rules and keyframes supported by the browser. Use `:host` to target the frame. Existing imported styles have already been scoped to it.
- CSS drafts preview live without entering history. Apply CSS (Cmd/Ctrl+Enter) saves one undo step; Discard restores the saved stylesheet. Drafts are kept per frame while switching tabs and selections during the current session. Refreshing the page discards unapplied drafts. Inline styles from Design may override stylesheet rules; invalid CSS is ignored by the browser.
- The document and camera are saved to localStorage automatically.

| Shortcut | Action |
| --- | --- |
| V / F / R / T / H | Move, Frame, Rectangle, Text, Hand |
| Cmd+Z / Cmd+Shift+Z | Undo / redo |
| Cmd+D | Duplicate |
| Backspace | Delete |
| Arrows (Shift for 10px) | Nudge along canvas axes, including transformed parents |
| Esc | Cancel an active drag; otherwise select parent |
| Shift+0 / Shift+1 / Shift+2 | Zoom to 100% / fit all / fit selection |
| Space + drag, scroll | Pan |
| Cmd+scroll, pinch | Zoom |
| Cmd+\ | Hide UI |

## How it works

- Each artboard is a Shadow DOM root in the same document. `body` and `:root`
  selectors become `:host`, viewport units become container units.
- URL import goes through a Vite dev middleware (`/__proxy`) that strips
  scripts and rewrites stylesheet and font links, loads the page in a hidden
  same-origin iframe, and serializes the DOM with computed styles diffed
  against UA defaults.

## Inspector and navigation

- Design uses collapsible Layout, Spacing, Typography, Appearance, Stroke, Position and Effects sections. Text selections start with Spacing collapsed.
- Flex/Grid controls include a nine-point alignment picker, axis gaps and grid tracks. The alignment picker accounts for RTL and reversed flex directions.
- Edit padding together or per side. CSS values such as percentages, `auto`, `calc()` and variables are preserved in supported fields. Invalid values are marked without changing the element.
- Numeric fields support Up/Down, Shift for steps of 10, and Alt for steps of 0.1. Escape cancels an unfinished field edit.
- Blue markers identify inline overrides. Reset a single value or section to fall back to the stylesheet; these changes support Undo/Redo.
- Canvas controls expose zoom, Fit all and Fit selection. Selecting an offscreen layer reveals its frame.
- Enter an exact zoom percentage (2–800%) in the navigation bar. Up/Down changes it by 10 percentage points, Shift by 25 and Alt by 1. Enter or blur applies; Escape cancels an unfinished edit. Shift+0 returns to 100%.
- The Layers tree supports arrow-key navigation, Home/End, Enter/Space selection and F2 renaming. Arrow keys in the tree do not move canvas objects.
- Right-click a layer or open the inspector’s Selection actions menu to duplicate, delete, zoom to selection or select its parent. Arrow keys and Home/End navigate the menu; Escape returns focus to its trigger. Duplicate and Delete support Undo.
- Element actions also move a layer earlier/later or first/last among its siblings. These change HTML order, so normal flow, Flex/Grid and order-dependent selectors update naturally; explicit CSS `order` and `z-index` still apply. Undo/Redo restores both order and selection.
- Copy frame exports the selected frame with applied CSS. Pending CSS drafts are not exported. Save status reports successful local storage writes or storage failures.

## Editing behavior

- The inspector uses a 241px Design panel with 24px fields. CSS mode opens a wider code editor.
- Open/closed sections, individual padding/corners/strokes, constraints and Layout options are remembered across selection changes, Undo, inspector tabs and reloads. Frame, HTML and SVG section preferences are separate and do not enter document history.
- Width/height support CSS, Fixed, Hug and Fill, plus constraints and ratio locking.
- Numeric labels scrub with one undo step. Colors, gradients, shadows and SVG properties have contextual controls.
- Position includes individual CSS rotation and transform origin. Bare angles use degrees; `deg`, `rad`, `grad`, `turn`, explicit axes and browser-supported CSS expressions are accepted. Rotation adds to any existing `transform` rule; invalid input leaves the element unchanged.
- Selection outlines and resize handles follow affine 2D transforms. Rotated resizing keeps the opposite corner anchored; perspective and fragmented inline boxes use an axis-aligned fallback.
- Selected-element CSS uses explicit Apply/Discard. If Design changes while a draft is open, the editor shows a comparison before an explicit replacement. Element drafts survive tab/selection changes for the same live DOM node, but not reloads or document remounts.
- See [inspector verification notes](docs/INSPECTOR_PARITY.md) for browser evidence and remaining QA limits.
