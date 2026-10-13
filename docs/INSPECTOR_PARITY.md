# Inspector parity with Figma

Reference: observed Figma desktop on 2026-10-13, frame with vertical Auto layout and text child. Opened width sizing and font-size menus. Existing designs were not edited.

## Implemented and verified

- Width/height show the rendered size alongside CSS / Fixed / Hug / Fill controls.
- CSS mode restores stylesheet sizing. Custom CSS lengths remain editable.
- Flex main-axis Fill uses remaining space; Hug uses intrinsic content; Fixed preserves the measured border-box size.
- Resizing preserves the imported box model and the other axis.
- Min/max constraints are available on demand (CSS box-model values).
- Padding, individual sides, gap, alignment, direction and clipping live together under Layout / Auto layout.
- Named font weights, font-family suggestions and font-size suggestions; free-form size/family input remains available.
- Individual corner radii; one reset for appearance overrides.
- Frame height uses the same inline Hug / Fixed pattern.

Browser checks ran on a separate origin, 127.0.0.1:5181, to avoid editing the active document on port 5180. A padded content-box flex child measured 192 x 132 before editing, 464 x 132 in Fill, 200 x 132 in Fixed, 183 x 132 in Hug, and 192 x 132 after CSS reset. Font 32/500 rendered; Undo restored size 24 and retained weight 500. Parent Fill remained within the frame after padding changed. Max-width and clipping applied. TypeScript and Vite build passed.

## Appearance and resizing pass

- Color swatch, hex and independent alpha work for fill, text, stroke and shadow. Hex with alpha and rgb/rgba are supported; typed CSS colors remain valid.
- Fill is a separate section, with a raw image/gradient value and background sizing/position.
- Stroke supports individual side widths without adding borders on other sides.
- Shadows support multiple layers, drop/inner type, X/Y, blur, spread, color and alpha. Raw CSS remains editable; unsupported expressions are preserved until edited.
- Pointer resize fixes the resized flex main axis, so Fill no longer absorbs a drag without visibly resizing.
- Persistent aspect-ratio lock for elements and frames; Shift constrains pointer resizing temporarily. Switching an element to a dynamic sizing mode releases the lock.

Browser evidence: fill alpha 50% rendered rgba(..., 0.5); two shadows rendered independently at 30% and 15%, including an inset shadow. Removing a shadow and Undo restored both. Width 192 -> 288 with lock changed height 132 -> 198. A Fill element dragged from 344 -> 294 retained height 198 without lock; Undo restored Fill and width 344. With lock the same drag yielded 294 x 169 (rounded), preserving the original 344/198 ratio. An individual bottom stroke rendered 4px solid with the top remaining 0px. Frame ratio lock changed 640 x 281 to 800 x 351; Undo restored the preceding frame state.

## Remaining work in this goal

- Give numeric labels drag-to-adjust behavior with one undo transaction.
- Make sizing constraints communicate CSS versus visual box sizes clearly.
- Improve font selectors and keyboard navigation beyond native datalist suggestions.
- Further refine stroke controls for per-side colors and styles.
- Add visual gradient editing alongside the existing arbitrary background-image CSS field.
- Clarify flow placement versus absolute position; contextual controls.
- Verify grid alignment and reverse/RTL flex behavior with representative documents.
- Review frame selection, nested navigation, and selection bounds after sizing changes.
- Recheck the full panel on text, frame, block, flex, grid and SVG at narrow and wide viewports.

Compatibility: outside a flex main axis, Fill uses CSS stretch when available, with a percentage fallback. Vertical Fill depends on the containing block having a definite height. The editor does not infer authored sizing modes from resolved computed pixels; CSS mode explicitly represents stylesheet ownership.
