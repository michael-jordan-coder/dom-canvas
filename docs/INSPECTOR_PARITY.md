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

- Affine 2D resize is implemented and verified below. Perspective/3D and fragmented inline boxes retain the axis-aligned fallback.
- Transform-aware movement is verified for 2D transforms, not perspective/3D projections.
- Vector path point editing and visual editing of SVG paint-server gradients are not implemented; authored data is retained.

Compatibility: outside a flex main axis, Fill uses CSS stretch when available, with a percentage fallback. Vertical Fill depends on the containing block having a definite height. The editor does not infer authored sizing modes from resolved computed pixels; CSS mode explicitly represents stylesheet ownership.

## Density correction after user review

Re-inspected the actual Figma desktop sidebar on 2026-10-13: 241px sidebar and approximately 24px property fields at logical pixel scale. Corrected the oversized 288px/30px implementation: right panel 241px, fields/selects/swatches 24px, smaller section gaps and 28px layer rows. Removed the redundant Inspector header, moved Copy to a compact header action, replaced the Resizing action row with an inline ratio icon and a constraints icon in the section heading. Fixed/CSS sizing uses an unobtrusive dropdown arrow; Hug/Fill remain labeled and all modes retain accessible names and tooltips. Removed prominent blue override rails.

Browser checks on isolated port 5181: the reported 687.31 and 491.88 values fit without horizontal input scrolling; panel measured 241px and field outer height 24px. Mode changes, ratio pressed state and constraint disclosure worked. Also corrected stale numeric drafts when CSS constraints resolve an entered dimension back to the same prior measured value (687.31 request clamped to 484 by the imported max-width). Main document was inspected without editing its content. Screenshot: /tmp/dom-canvas-compact-inspector.png.

### Compact contextual controls

Frame dimensions now share the inline ratio control used for elements. Appearance's individual-corner control sits in the section header. Padding has horizontal/vertical fields and an individual-side disclosure; unequal values display Mixed without changing the document. Typography uses 16px line-height, tracking and alignment icons, with accessible labels/tooltips; logical start/end icons follow RTL and physical left/right imported styles resolve to the appropriate active control. Justify is also available.

Verified in the isolated browser: horizontal padding 20 applied to left/right while top/bottom stayed 32; changing left to 12 produced Mixed in the collapsed pair. Text Justify computed as justify. Frame control names and sizing menu were checked. Visual screenshot: /tmp/dom-canvas-compact-typography.png. These changes retain the 241px panel and 24px controls.

## Selected-element CSS editing

CSS mode now offers Selected element / Frame stylesheet scopes. The selected-element editor replaces only that element's inline declaration block, supports custom properties and priorities, keeps unsupported raw declarations, and commits Apply as one undo operation. A read-only Browser interpretation disclosure shows parsed declarations. Element drafts survive switching inspector tabs and selecting other live elements; the Design tab and CSS badge indicate a pending draft. Drafts are tied to live DOM element identity and are not persisted across reloads or document remounts.

Verified on isolated port 5181: typed color #7c3aed, font-size 36px, a custom property and an unsupported property. Switching Design/CSS kept the draft without changing the canvas. Apply computed purple/36px and retained the unsupported declaration in the raw style attribute. Undo restored the original 28px dark text and text-align declaration; Redo restored the applied source. Browser interpretation omitted only the unsupported declaration. Screenshot: /tmp/dom-canvas-element-css.png.

### CSS draft conflicts

Element drafts retain their starting inline source. If Design changes that source while a draft is pending, ordinary Apply and Cmd/Ctrl+Enter are disabled. A comparison disclosure offers Use current styles or explicit Replace with draft. Browser verification: a pending blue/40px draft did not overwrite a later Design font-size change to 48px through the shortcut; explicit replacement applied blue/40px, and one Undo restored purple/48px. Screenshot: /tmp/dom-canvas-css-conflict.png.

### Compact Auto layout group

Direction icons and both gap fields now sit beside the alignment grid. Distribution, stretch/baseline alignment, reverse order, wrap and reading direction are grouped under Layout options. Active RTL/reverse/wrap states remain summarized when collapsed. Grid has its own Grid layout heading and cell-alignment label. All controls retain accessible names.

Browser check on port 5181: opened Layout options on the existing RTL/column-reverse/wrap-reverse fixture; changed it to LTR/nowrap/normal order, closed options, selected Horizontal, set column gap 20 and middle-center alignment. Computed styles were row, 20px, center/center; panel had no horizontal overflow. Screenshot: /tmp/dom-canvas-compact-autolayout.png.

## Transform-aware selection and resize

Selection outlines and handles follow the local 2D basis, including nested rotation, nonuniform scale and canvas zoom. Dimensions report local border-box size. Resize projects screen movement onto that basis and compensates translation using the actual post-layout opposite anchor, accounting for transform-origin and constraints. Handle cursors follow their screen direction.

Verified on isolated port 5181 with parent rotate(-12deg) scale(.9) and child rotate(30deg) scale(1.1,.8), center origin and a 4px border: SE drag by (60,30) screen pixels resized 180x120 to 195.359x123.18, moved the dragged corner by approximately (60.011,30.013), and kept NW within 0.016px. One Undo restored 180x120 and removed inline overrides. With ratio lock, NW resize produced 193.156x128.766 while SE moved only 0.027px. Ordinary untransformed east-edge resize retained height 100 and exactly retained the west edge. Screenshot: /tmp/dom-canvas-rotated-resize.png.

## Canvas gesture cancellation

Canvas gestures now capture the original inline style or frame geometry. Escape in capture phase, pointer cancellation, lost pointer capture and window blur restore that snapshot without committing history; pan cancellation restores its initial camera and drawing cancellation removes the preview. Pointer IDs isolate the active gesture. Normal pointer-up clears rollback state before releasing capture so lost-capture cannot cancel a completed gesture.

Build and diff review passed. Browser regression: an ordinary east-edge drag changed width 376.625 to 359.023, and one Undo restored 376.625 with history then empty. The available UI automation performs drags atomically, so Escape/blur during a held pointer gesture remains a manual QA item; restoration and event ordering were code-reviewed, not claimed as directly exercised.

### Canvas-axis keyboard movement

Keyboard nudge now uses the same parent-coordinate inverse as pointer dragging, with the camera scale removed so arrow steps remain document pixels. On the nested affine fixture, Shift+Right produced a measured canvas delta (10.00145, -0.000425); Undo restored the exact original screen position. README now reflects element CSS, conflict handling, compact inspector controls and gesture cancellation.

## In-product color picker

Replaced the OS color input with a compact 240px popover: saturation/value surface, hue and alpha sliders, keyboard-editable saturation/brightness and hex. Preview stays in one InspectorEdits transaction; Done/outside dismissal commits once, Cancel/Escape restores the original attributes. No-change closes do not enter history. Focus is contained within the dialog and returns to the swatch on explicit close. The portal avoids inspector clipping; cleanup handles StrictMode remount checks without prematurely closing.

Browser checks on port 5181: blue at 1% alpha rendered rgba(37,99,235,.01), Cancel restored white with Undo still disabled. Hex plus SV dragging produced #562BB8; Done followed by one Undo restored white and left history empty. Opening/closing without changing color added no history. Escape after a red preview closed the dialog, restored white, and left Undo disabled. Screenshot: /tmp/dom-canvas-color-picker.png.

## Keyboard history grouping

Repeated arrow keydowns share a history group until release, direction/target change, another edit, Undo/Redo or blur. Separate key presses remain separate undo steps. Four Node tests cover a 120-update group, separate edits, branching/group boundaries and bounded history (`node --test tests/history.test.mjs`, Node 24).

Browser check on port 5181: two Right presses moved frame X from 80 to 82; Undo returned 81 then 80 with history empty. The native held-key call emitted only one movement, so physical auto-repeat integration remains a manual check; repeated snapshot grouping passed the automated test. Measured rendered inspector width 241px and field heights 24px. Screenshot: /tmp/dom-canvas-compact-inspector-current.png.

## Selection actions menu

Added a 24px inspector header trigger and layer right-click entry point for Duplicate, Zoom to selection, Select parent and Delete. The 208px menu uses a portal, viewport clamping, first-item focus, arrow/Home/End navigation and Escape/Tab dismissal with focus restoration. Outside clicks, resize and window blur dismiss it. Right-click explicitly selects its target before exposing actions.

Browser check on port 5181: right-clicking flex-qa selected it and focused Duplicate. Enter created a second layer; Undo returned to one. End focused Delete; Enter removed the selected layer and Undo restored it. Escape closed the menu and returned focus to Selection actions. Screenshot: /tmp/dom-canvas-selection-menu.png. Build passed.

### Sibling ordering

Element actions now include Move earlier/later and Move to first/last. They reorder the actual sibling DOM nodes without changing parent, inline styles or CSS stacking values. Boundary commands are disabled; menu keyboard navigation skips disabled items. Document snapshot addresses preserve selection across reordering and history traversal. Combined the two selection restoration effects after browser QA exposed one overriding the other.

Verified on port 5181: moving flex-qa to first updated layer order; Undo restored its second position and kept flex-qa selected, Redo restored first position with the same selection. Earlier/first were disabled at the boundary and ArrowDown skipped to Move later. Move to last produced matching DOM and screen order (grid, SVG, transformed box, flex); Undo restored the fixtures. Screenshot: /tmp/dom-canvas-layer-order.png. CSS order/z-index can override the visual consequences of DOM ordering, as documented in README.
