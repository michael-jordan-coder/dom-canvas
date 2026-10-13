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
- Full documents preserve body style/class/id and body direction/language, falling back to `html` direction/language. Quoted style values and attribute entities survive import.
- Paste a URL, or use the link button in the toolbar, to snapshot a real website.
- Draw frames, rectangles and text with the toolbar tools. Double-click text to edit it.
- Click to select, drag to move, drag the handles to resize. Double-click a layer to rename it.
- Select a frame by its canvas label, the Layers list, or Cmd/Ctrl-click inside it. Frame outlines are purple; element outlines are blue. Alt-click or use the selection breadcrumb to move to a parent.
- Choose Mobile (390px), Tablet (768px), or Desktop (1440px) frame widths, and fit height to content. These presets change the frame width; they do not emulate viewport media queries.
- Open a background layer to edit its own size, position and repeat mode. Custom image/gradient layers also expose their individual CSS source. The whole background list remains available under CSS value.
- Background layers can move up/down in Fill. Adding, removing or reordering a layer also remaps its size, position, repeat, origin, clip, attachment and blend mode in one Undo step. Variable-backed lists use their current resolved values for structural edits; Undo restores the source.
- Effects lists shadows as compact expandable rows. Open one to edit its color and geometry; move it up/down to change paint order, or remove it. New shadows open automatically, and document Undo restores edits.
- Flip horizontally or vertically beside Rotation. Flips use individual CSS scale around the transform origin and preserve existing transform/rotate values. CSS positioning also exposes Scale and its stylesheet reset.
- Six compact alignment buttons move an HTML element to the frame’s left, center, right, top, middle or bottom using its visual bounds. They preserve CSS flow and support Undo; hidden elements cannot be aligned.
- Position and rotation sit at the top of the Design panel. Expand CSS positioning for flow mode, insets and transform origin; the disclosure remembers your preference.
- Edit Flex/Grid layout, position, overflow, size, fill and typography in the Design panel. "Copy code" exports the frame back to HTML and CSS.
- Open the CSS tab to edit the selected element’s inline declarations or its frame stylesheet, including selectors, custom properties, nested rules and keyframes supported by the browser. Use `:host` to target the frame. Existing imported styles have already been scoped to it.
- CSS drafts preview live without entering history. Apply CSS (Cmd/Ctrl+Enter) saves one undo step; Discard restores the saved stylesheet. Drafts are kept per frame while switching tabs and selections during the current session. Refreshing the page discards unapplied drafts. Inline styles from Design may override stylesheet rules; invalid CSS is ignored by the browser.
- In either CSS editor, Tab/Shift+Tab indent, Enter continues indentation, and Cmd/Ctrl+Z undoes draft edits locally. Press Escape then Tab to leave the editor. CSS help and keyboard shortcuts expand below the editor; Position help is available from its info button.
- The document and camera are saved to localStorage automatically.
- Save canvas file (download icon above Layers) exports all frames, applied HTML/CSS, font CSS and camera to `.domcanvas.json`. Open canvas file replaces the document; Undo restores its previous content. Unapplied CSS drafts and undo history are not included. External images/fonts remain URL references, so the file is not an offline asset bundle. Imported executable markup is removed.
- Pasting the text of a DOM Canvas JSON file onto the canvas also opens it. Invalid project data is rejected without changing the document; ordinary HTML/CSS paste keeps its existing behavior.

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
- Children of Flex/Grid expose contextual item controls: grow/shrink/basis for Flex, row/column placement for Grid, plus self-alignment and CSS order. Direct children of a frame and children through `display: contents` wrappers are recognized; out-of-flow elements are excluded.
- Edit padding together or per side. CSS values such as percentages, `auto`, `calc()` and variables are preserved in supported fields. Invalid values are marked without changing the element.
- Numeric fields support Up/Down, Shift for steps of 10, and Alt for steps of 0.1. Escape cancels an unfinished field edit.
- Blue markers identify inline overrides. Reset a single value or section to fall back to the stylesheet; these changes support Undo/Redo.
- Canvas controls expose zoom, Fit all and Fit selection. Selecting an offscreen layer reveals its frame.
- Enter an exact zoom percentage (2–800%) in the navigation bar. Up/Down changes it by 10 percentage points, Shift by 25 and Alt by 1. Enter or blur applies; Escape cancels an unfinished edit. Shift+0 returns to 100%.
- The Layers tree supports arrow-key navigation, Home/End, Enter/Space selection and F2 renaming. Arrow keys in the tree do not move canvas objects.
- Space activates focused panel buttons and disclosures. Canvas delete/tool shortcuts do not run from focused controls; dialogs and menus also isolate document shortcuts and canvas paste.
- Search layers by name, direct text, tag, class or ID. Matching layers retain their ancestor paths; Enter/Down from search selects the first visible match, and Escape or Clear restores the unfiltered tree. Search expansion is separate from the normal tree.
- Right-click a layer or open the inspector’s Selection actions menu to duplicate, delete, zoom to selection or select its parent. Arrow keys and Home/End navigate the menu; Escape returns focus to its trigger. Duplicate and Delete support Undo.
- Element actions also move a layer earlier/later or first/last among its siblings. These change HTML order, so normal flow, Flex/Grid and order-dependent selectors update naturally; explicit CSS `order` and `z-index` still apply. Undo/Redo restores both order and selection.
- Copy frame exports the selected frame with applied CSS. Pending CSS drafts are not exported. Save status reports successful local storage writes or storage failures.

## Editing behavior

- The inspector uses a 241px Design panel with 24px fields. CSS mode opens a wider code editor.
- Open/closed sections, individual padding/corners/strokes, constraints and Layout options are remembered across selection changes, Undo, inspector tabs and reloads. Frame, HTML and SVG section preferences are separate and do not enter document history.
- Width/height support CSS, Fixed, Hug and Fill, plus constraints and ratio locking.
- Numeric labels scrub with one undo step. Colors, gradients, shadows and SVG properties have contextual controls.
- Selecting an HTML image shows Fill/Fit/Stretch/Original/Shrink modes, nine-point alignment, precise object position, original dimensions and editable alt text. Fitting changes the image inside its existing box; Image reset restores stylesheet fit/position.
- The remembered Image source disclosure replaces an image by URL while keeping its styles and alt text. Replacing a responsive image clears image/picture source candidates so the new URL is used at every size; Undo restores them. HTTP(S), relative, blob and image data URLs are supported. Images sized automatically can follow the new source's natural dimensions.
- HTML typography includes remembered Type options for italic, independent underline/strikethrough, case, wrapping and word spacing. Case changes appearance without rewriting the text content. Typography reset restores stylesheet values and supports Undo.
- Type options also expose LTR/RTL direction (Default removes the local override) and long-word wrapping. Fit width allows long words to wrap within the available width; No wrap still takes precedence.
- Numeric property fields accept arithmetic such as `320 / 2` or `(24 + 8) * 2` on Enter/blur. Use plain numbers in the expression; the field's current unit is retained. Division by zero and incomplete expressions are rejected. Existing CSS expressions still use browser validation.
- Frame selection includes a Fill color/alpha control with picker preview, Cancel, Reset and Undo. Reset returns to the frame stylesheet. Frame fill is saved in project files and included in copied HTML/CSS. It sets the background color beneath any existing background image or child content.
- Frame Clip content toggles whether children can paint outside the frame bounds. It supports Reset to the stylesheet, Undo, project-file persistence and copied HTML/CSS. Turning clipping off does not resize the frame.
- Element rows have a Hide/Show eye control, also available from Selection actions. Hidden layers leave the layout but stay in the layer tree; showing restores the previous inline display and priority. Visibility changes support Undo and persist with the document. Frame visibility is not yet included.
- Typography is available when text is nested inside child tags, such as spans in a heading or button. Parent edits use normal CSS inheritance and preserve child overrides and markup; direct content editing is available only for text without child elements.
- Position includes individual CSS rotation and transform origin. Bare angles use degrees; `deg`, `rad`, `grad`, `turn`, explicit axes and browser-supported CSS expressions are accepted. Rotation adds to any existing `transform` rule; invalid input leaves the element unchanged.
- Selection outlines and resize handles follow affine 2D transforms. Rotated resizing keeps the opposite corner anchored; perspective and fragmented inline boxes use an axis-aligned fallback.
- Selected-element CSS uses explicit Apply/Discard. If Design changes while a draft is open, the editor shows a comparison before an explicit replacement. Element drafts survive tab/selection changes for the same live DOM node, but not reloads or document remounts.
- See [inspector verification notes](docs/INSPECTOR_PARITY.md) for browser evidence and remaining QA limits.

- Element rows also offer canvas locking. Locked elements and their descendants ignore canvas selection, dragging, resizing, double-click text editing, keyboard nudges and deletion/reordering. Select them in Layers to unlock or edit properties intentionally. Locks support Undo and survive reload; moving/removing an unlocked ancestor can still affect its locked children.
- Imported links/buttons/forms are design elements on the canvas: native click, auxiliary-click, submit and reset activation are suppressed. Double-click editable text to edit it in place; ending the edit commits through normal history.
