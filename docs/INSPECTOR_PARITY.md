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

## Numeric editing, fonts and gradients

- Numeric labels scrub with live preview and one document commit on release. A click without movement creates no history entry. Escape restores the original style/frame snapshot; abandoned gestures cancel safely. Pointer speed is applied incrementally, and clamped values are followed without accumulating out-of-range travel.
- Font family/size suggestions are explicit searchable comboboxes. Arrows, Home/End, Enter and Escape navigate them; Shift/Alt+arrows retain numeric stepping. Lists open upward near the viewport edge and scroll their active option into view.
- Linear gradients support angles, color stops, positions, alpha, add/remove, and multiple background layers. Compact gradient summaries disclose detailed controls. Unsupported/custom backgrounds remain editable as raw CSS.
- Layout size readings retain fractional pixels and exclude element transforms. Min/max controls explicitly describe their CSS box-model semantics.

Browser evidence: a numeric-label drag changed width 294 to 324; one Undo returned 294 and disabled Undo in a fresh history. Clicking the label without moving kept history empty. Gradient 90deg with three stops rendered exactly, including green at 35% and 60% opacity. Removing a stop and Undo restored it. Typing Georgia then ArrowDown/Enter applied Georgia, serif. End/Enter in the font-size menu selected 128, and Undo returned 24. Build and diff checks passed. Modifier changes mid-gesture and Escape restoration are code-reviewed, not separately exercised by the available pointer automation.

## Local technical/UI reference

User-approved reference: `/Users/home-daniel/Desktop/Coding-Projects/products/canvas`, read-only. Scope is editing technique and UI.

Inspected `apps/editor/src/ui/NumberField.tsx`, `ColorField.tsx`, `ColorPicker.tsx`, `PropertiesPanel.module.css`, `styles/tokens.css`, and `docs/FIGMA_PARITY.md`. Adapted incremental scrub deltas, boundary feedback, capture-phase Escape handling, neutral control hierarchy and progressive disclosure. The DOM canvas retains its own HTML/CSS document and history implementation. No changes were made to the reference checkout.

## Contextual layout, vectors and selection

- Per-side stroke width, style and color, with individual reset.
- Position mode explains document flow; contextual insets are distinct from visual X/Y transforms.
- Grid alignment targets cells through justify-items/align-items. Flex controls expose reading direction, reverse order and reverse wrap; physical alignment accounts for these combinations.
- Contextual SVG inspector edits viewBox, basic shape geometry, vector fill/stroke, paint opacity, line caps/joins, dashes and non-scaling stroke. SVG text exposes typography. Path data is preserved.
- Dragging maps screen movement through ancestor 2D transforms, including the canvas zoom, and starts from computed translation.
- Selection bounds observe layout, DOM mutations, scrolling and font loading. Disconnected selection references recover after document remounts.

Browser evidence on isolated port 5181: Grid bottom-right placed a 40px child at (160,60) in a 200x100 cell. RTL grid retained physical right/bottom alignment. RTL row-reverse and column-reverse plus wrap-reverse flex aligned physically top-left. Top-only stroke rendered 3px dashed blue while bottom remained 0px. Absolute positioning applied left 30px/top 15px. A child of a rotate(20deg) scale(1.2) container followed a 60x30 screen-pixel drag within 0.03px; Undo restored its stylesheet translation. SVG rect width/fill/stroke edits rendered; circle radius 25->35 survived Undo/Redo and reload. Circle selection bounds matched within 0.007px. Paint opacity 60% computed as 0.6 independently of color alpha. Text, block, frame, flex, grid and SVG panels were inspected at 900px viewport width; no horizontal panel overflow was observed. Viewport override was reset afterward. Build passed.

## Remaining limitations

- Pointer resize handles remain axis-aligned for rotated content; full rotated resize behavior is not implemented.
- Transform-aware movement is verified for 2D transforms, not perspective/3D projections.
- Vector path point editing and visual editing of SVG paint-server gradients are not implemented; authored data is retained.

Compatibility: outside a flex main axis, Fill uses CSS stretch when available, with a percentage fallback. Vertical Fill depends on the containing block having a definite height. The editor does not infer authored sizing modes from resolved computed pixels; CSS mode explicitly represents stylesheet ownership.

## Density correction after user review

Re-inspected the actual Figma desktop sidebar on 2026-10-13: 241px sidebar and approximately 24px property fields at logical pixel scale. Corrected the oversized 288px/30px implementation: right panel 241px, fields/selects/swatches 24px, smaller section gaps and 28px layer rows. Removed the redundant Inspector header, moved Copy to a compact header action, replaced the Resizing action row with an inline ratio icon and a constraints icon in the section heading. Fixed/CSS sizing uses an unobtrusive dropdown arrow; Hug/Fill remain labeled and all modes retain accessible names and tooltips. Removed prominent blue override rails.

Browser checks on isolated port 5181: the reported 687.31 and 491.88 values fit without horizontal input scrolling; panel measured 241px and field outer height 24px. Mode changes, ratio pressed state and constraint disclosure worked. Also corrected stale numeric drafts when CSS constraints resolve an entered dimension back to the same prior measured value (687.31 request clamped to 484 by the imported max-width). Main document was inspected without editing its content. Screenshot: /tmp/dom-canvas-compact-inspector.png.

### Compact contextual controls

Frame dimensions now share the inline ratio control used for elements. Appearance's individual-corner control sits in the section header. Padding has horizontal/vertical fields and an individual-side disclosure; unequal values display Mixed without changing the document. Typography uses 16px line-height, tracking and alignment icons, with accessible labels/tooltips; logical start/end icons follow RTL and physical left/right imported styles resolve to the appropriate active control. Justify is also available.

Verified in the isolated browser: horizontal padding 20 applied to left/right while top/bottom stayed 32; changing left to 12 produced Mixed in the collapsed pair. Text Justify computed as justify. Frame control names and sizing menu were checked. Visual screenshot: /tmp/dom-canvas-compact-typography.png. These changes retain the 241px panel and 24px controls.
