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

- Paste HTML (with or without `<style>`) with Cmd+V to create an artboard.
- Paste a URL, or use the import field, to snapshot a real website.
- Scroll to pan, Cmd+scroll or pinch to zoom, drag empty space or hold Space to pan.
- Click an element to select it, drag to move, Backspace to delete.
- Edit text and styles in the inspector. "Copy code" exports the artboard back to HTML and CSS.

## How it works

- Each artboard is a Shadow DOM root in the same document. `body` and `:root`
  selectors become `:host`, viewport units become container units.
- URL import goes through a Vite dev middleware (`/__proxy`) that strips
  scripts and rewrites stylesheet and font links, loads the page in a hidden
  same-origin iframe, and serializes the DOM with computed styles diffed
  against UA defaults.
