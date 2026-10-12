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
- Open the CSS tab to edit the selected frame stylesheet, including selectors, custom properties, nested rules and keyframes supported by the browser. Use `:host` to target the frame. Existing imported styles have already been scoped to it.
- CSS drafts preview live without entering history. Apply CSS (Cmd/Ctrl+Enter) saves one undo step; Discard or Escape restores the saved stylesheet. Leaving the editor discards an unapplied draft. Inline styles from Design may override stylesheet rules; invalid CSS is ignored by the browser.
- The document and camera are saved to localStorage automatically.

| Shortcut | Action |
| --- | --- |
| V / F / R / T / H | Move, Frame, Rectangle, Text, Hand |
| Cmd+Z / Cmd+Shift+Z | Undo / redo |
| Cmd+D | Duplicate |
| Backspace | Delete |
| Arrows (Shift for 10px) | Nudge |
| Esc | Select parent |
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
