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

## Rotation units and transform origin

Rotation now normalizes scalar CSS angle units for degree display and passes CSS expressions/explicit axes through validation instead of coercing invalid text to zero. Added per-property rotation reset, a compact rotation icon and transform-origin field/reset. Existing transform rules remain composed with individual rotation, with a contextual note. The canvas matrix parser now honors named x/y axes instead of treating them as Z; 3D selections still use the documented fallback.

Three Node tests cover quarter-turn equivalence, 3D axis preservation and numeric/expression/invalid input handling. Browser QA on port 5181: 0.25turn computed to 90deg while retaining the original transform matrix; bad input marked aria-invalid without committing a zero angle. x 30deg remained explicit in the field and computed style. Center origin computed to 100px 70px for a 200x140 box; Undo restored 0px 0px, and subsequent undos restored rotate:none. Screenshot: /tmp/dom-canvas-rotation-controls.png. Build passed.

## Inspector continuity

Section disclosures and HTML detail controls use UI preferences outside document history, scoped to frame/HTML/SVG. Local storage retains them across reloads; unavailable storage falls back to session state. The Layout section has one stable preference key across Block/Flex/Grid headings. Default-open behavior still applies until the user explicitly toggles a section.

Browser QA on port 5181: opened Position and individual padding, edited rotation then undid it; both disclosures stayed open. Selecting another HTML layer and switching CSS/Design retained them. Closing HTML Position did not close the frame Position section. Reload retained closed HTML Position, open Layout options and individual padding. Screenshot: /tmp/dom-canvas-inspector-preferences.png. Build and diff check passed.

## Precise canvas zoom

Replaced the percent reset button with an editable spinbutton, supporting percent suffix input, validation, Enter/blur apply, Escape cancellation and keyboard increments. Uses existing 2–800% camera limits; Shift+0 remains the actual-size shortcut. Corrected Design viewport's stale 304px right inset to 257px, matching the compact panel.

Browser QA on port 5181: 125% produced scale(1.25), invalid text was rejected, Escape restored the value, ArrowUp reached 135%, and 999 clamped to 800%. Fit selection centered the frame at x756, exactly the free-space midpoint in Design; CSS mode centered at x686.50003 against midpoint686.5. Screenshot: /tmp/dom-canvas-precise-zoom.png. Build and diff check passed.

## Compact typography options

Added a remembered Type options disclosure for HTML text, with independent italic, underline and strikethrough buttons, case/wrapping selectors and word spacing. The collapsed summary exposes active text styling. Decoration toggles preserve other computed line tokens. Expanded typography reset includes these new properties.

Browser QA on port 5181: italic with underline and line-through computed correctly; toggling underline off preserved line-through, and Undo restored both. Uppercase left the source text unchanged, No wrap computed to nowrap and word spacing 3 computed to 3px. Typography reset restored normal/none/none/0px; Undo restored italic/underline/uppercase/3px. Screenshot: /tmp/dom-canvas-type-options.png. Build and diff check passed.

## Layer search

Added a 24px search field with match count, clear button and empty state. Search indexes frame names, layer names, direct text, tags, IDs and classes; results keep ancestor context, automatically expose matching paths, and use a separate collapse set. Enter/Down selects the first visible match. Escape clears without invoking canvas shortcuts.

Browser QA on port 5181: get started returned Sample > card > actions > Get started; clearing kept card collapsed. .flex-qa returned only its frame and itself, and Enter focused/selected flex-qa. A missing query produced zero rows and No matching layers, Escape restored eleven original rows. button returned both button layers with their ancestors. Screenshot: /tmp/dom-canvas-layer-search.png. Build and diff check passed.

## Canvas project files

Added Save/Open controls above Layers. Versioned JSON includes artboards, applied live DOM, styles, font CSS and camera. Decoder validates required fields and finite dimensions/view before calling the import action. New frame IDs avoid stale host collisions; opening replaces document content through history and restores the file's camera. Import removes script/embedded document nodes, inline handlers and executable URL schemes. External assets remain referenced; drafts/history are not exported.

Three Node tests pass for full data round-trip, invalid format/dimensions/view rejection, empty documents and property whitelisting. Actual Save produced `/Users/home-daniel/Downloads/Untitled.domcanvas.json` (5677 bytes), verified as four frames plus camera. Download event observation timed out although the file was written. The browser file chooser rejected setFiles because the extension lacks file-URL access; native fallback did not expose a usable picker. Therefore opening through the UI, imported markup sanitization and open/Undo remain unverified integration checks. The test rename was undone. Screenshot: /tmp/dom-canvas-file-controls.png. Build passed.

### Project clipboard integration

Added project JSON clipboard recognition before ordinary HTML parsing. Malformed project text is routed to validation rather than imported as markup. File and clipboard routes share decode/open handling; file picker automation remains unverified.

Browser QA now verifies shared open integration through paste: the actual downloaded file restored all four frames and its saved camera. Undo restored a prior renamed document, Redo restored the loaded document. Malformed JSON showed an error and preserved four frames. A benign sanitizer fixture retained text and CSS while removing script/iframe nodes, onclick, a javascript URL and a script nested in a template. Undo restored the four-frame document. Four project-file Node tests and build passed. History traversal also clears stale import notices.

## Image fitting controls

HTML image selections expose object-fit modes, nine-point object-position, a free CSS position field, alt text and intrinsic dimensions. Load/error listeners refresh source status. Section reset only removes fit/position overrides, and the existing inspector transaction/history system covers edits.

Browser QA on port 5181: imported a 300x100 three-band SVG image in a 180x180 img box. Fill/right computed cover and 100% 50%, retained the 180x180 box and visibly cropped to the orange right band. Fit computed contain; alt editing updated the attribute. Two Undo operations restored cover and the original alt. Reset restored fill/50% 50%; Undo restored cover/right. Screenshot: /tmp/dom-canvas-image-controls.png. Build and diff check passed.

## Keyboard focus boundaries

Reproduced Space failing to activate inspector section buttons because the canvas pan listener prevented its default. Pan now ignores handled events and interactive controls. App shortcuts ignore handled events and menu/dialog focus, and unmodified canvas shortcuts ignore buttons, tabs, summaries and other interactive controls. Popup focus also excludes document paste.

Verified after a clean reload on port 5181: Space toggled Position open/closed. Delete on the section button preserved the image. Delete, Cmd+D and R on the color dialog's Cancel button left one image, the dialog open and Move selected. Space activated Cancel and closed it. Delete with canvas focus removed the image, and Undo restored it. Build and diff check passed.

## Contextual layout items

Added remembered Flex item/Grid item sections with CSS validation, per-field and section resets, and history support. Flex exposes grow/shrink/basis; Grid exposes column/row placement and justify-self; both offer align-self and order. Shared parent detection crosses the frame shadow boundary, skips display:contents wrappers and excludes absolute/fixed/non-box elements. Width/height sizing also uses this corrected parent detection.

Browser QA on port 5181: a direct child of a flex frame grew from 100px to 420px with grow1, align-self:center applied, negative grow was rejected and two Undo actions restored 100px/grow0/auto. A direct child of a three-column grid changed to span2, measured423.328px and moved the third sibling onto a second row. Reset restored auto/206.664px; Undo restored the span. Screenshot: /tmp/dom-canvas-layout-items.png. Build and diff check passed.

## Full-document body attributes

Full HTML paste preserves body style/class/id/dir/lang in a DOM-serialized wrapper. Direction and language fall back to html attributes when absent on body. Serialization escapes quotes and ampersands, fixing quoted font names breaking interpolated style attributes. Fragments without these attributes retain the existing unwrapped structure.

Browser QA on port 5181: a Hebrew document inherited rtl/he, retained its ID, class containing an ampersand, quoted Arial font, padding and blue background. A second document with html rtl/he and body ltr/en computed ltr and retained en and its quoted font. Undo removed the second frame and restored the prior document. Screenshot: /tmp/dom-canvas-rtl-paste.png. This does not address root-qualified selectors such as body.class or arbitrary html attributes.

## Text direction and long words

Type options now exposes direction for text outside Flex/Grid containers and overflow-wrap modes for long unbroken content. Default direction removes the inline override, allowing attributes, stylesheet rules and inheritance to apply. Typography reset includes both properties. Controls use the existing compact selects inside the remembered disclosure.

Browser QA on port 5181: mixed Hebrew/Latin text inherited RTL, switched to LTR, and anywhere wrapping kept scrollWidth equal to clientWidth (220px) while increasing height from45 to90px. Default restored inherited RTL and removed inline direction. Undo restored LTR. Typography reset restored RTL/normal wrapping; Undo restored LTR/anywhere. Text content remained unchanged. Screenshot: /tmp/dom-canvas-text-flow.png. Build and diff check passed.

## Nested HTML typography

Typography detection now walks descendant HTML text rather than requiring a direct text node. SVG and non-content subtrees are excluded. Parent controls edit parent CSS, preserving descendant overrides; the existing plain-text editor remains limited to elements without child elements so nested markup cannot be flattened by it.

Browser QA on port 5181: a heading containing span/strong/span exposed Typography and no Text content editor. Changing parent font size24 to32 produced child sizes32/32/16 with strong weight700, retaining identical innerHTML. Undo restored24 and the same markup. A container containing only SVG title/text exposed no HTML Typography section. Screenshot: /tmp/dom-canvas-nested-typography.png. Build and diff check passed.

## Inspector draft stability

Reproduced a field draft being erased by canvas wheel panning: an uncommitted frame width777 returned to640. Field synchronization depended on an inline callback whose identity changed on each parent render. Synchronization now depends on the property value only.

Browser QA after the fix: width777 survived wheel panning while the actual frame remained640; Escape restored640, Enter applied777, and Undo restored640. Invalid text and aria-invalid also survived panning until Escape. The final temporary draft was cancelled. Screenshot: /tmp/dom-canvas-field-draft.png. Build and diff check passed.

## Numeric field arithmetic

Numeric fields evaluate plain-number expressions on commit, with precedence, parentheses and unary signs. Existing field units are retained, property validation still applies, and invalid/non-finite arithmetic is rejected before calling property setters. The parser does not evaluate JavaScript or interpret CSS functions/units. Tooltips expose the supported operators. Three parser tests cover precedence, malformed expressions, division by zero and CSS passthrough.

Browser QA on port 5181: frame width `(640 + 80) / 2` became360; `1 / 0` was rejected, Escape restored360, and one Undo restored640. A10% corner radius changed to15% through `10 + 5`, then was undone. Font size `24 + 8 * 2` computed40px. Screenshot: /tmp/dom-canvas-arithmetic.png. Build and diff check passed.

## Position and opacity validation

Replaced parseFloat/fallback coercion in frame/element coordinates and HTML opacity with complete finite numeric validation. Pixel suffixes remain supported for coordinates; opacity accepts an optional percent suffix. Blank/partial/non-finite numbers now return validation errors without edits. HTML opacity display reads computed opacity, so imported `opacity:50%` displays50 rather than5000. Three numeric-input tests cover valid units, partial/invalid values and percentage parsing.

Browser QA on port 5181: imported50% opacity displayed50. `55oops` was rejected and computed opacity stayed0.5; invalid element/frame X remained errors without translation. `25%` applied0.25 and `80px` moved X to80; both were undone. Screenshot: /tmp/dom-canvas-numeric-validation.png. Build and diff check passed.

## CSS-wide keywords in visual controls

HTML and SVG property readers resolve initial/inherit/unset/revert/revert-layer to computed values for visual controls, without mutating authored declarations. This fixes solid background shorthand exposing an `initial` image layer and prevents Add gradient from composing an invalid gradient/initial layer list. Explicit units, CSS variables and other authored values retain their existing handling.

Browser QA on port 5181: the solid-color fixture had no image-sizing or remove-layer controls, while its original style attribute stayed byte-for-byte unchanged. Add gradient produced a valid computed gradient and kept its purple background color; Undo restored the original style and compact solid Fill. An SVG rect with fill-opacity:initial displayed100 and retained its authored keywords; the temporary fixture was undone. Screenshot: /tmp/dom-canvas-solid-fill.png. Build and diff check passed.

## Frame fill

Added a compact Fill section to frame selection using the shared color/alpha picker and transaction system. Optional backgroundColor is rendered on the frame host, persisted with history/local files, validated as a string by project decoding, and serialized as a browser-normalized :host color rule when copying code. Picker cancellation explicitly restores an absent override. Reset removes the override. The imported stylesheet still controls images and other properties; opaque child content may cover the frame background.

QA found the app's outer .artboard background:white rule overriding imported shadow :host backgrounds. Removed this redundant rule; the internal frame base stylesheet still supplies white by default. Browser QA on port5181: imported blue background appeared, yellow override applied, Reset restored blue, and picker Cancel restored both an existing yellow override and an absent override. Alpha50 computed0.5 and Undo restored opacity. Copied/pasted HTML reproduced yellow. Reload retained yellow. Project-file roundtrip/validation tests (four) and build passed. Screenshot: /tmp/dom-canvas-frame-fill.png.

## Element visibility

Added compact row eye buttons and Hide/Show layer menu actions. Hiding uses display:none!important and saves the previous inline display/priority in serialized metadata. Showing restores it; imported hidden CSS can be overridden with revert/block. Hidden rows stay accessible and dimmed, and their eye remains visible. Frames and locking are outside this change.

Canvas selection/hover measurement now suppresses outlines for elements with no layout boxes, including observer refreshes. Hidden HTML layers show CSS dimensions and a position explanation instead of misleading zero-size coordinates; ratio locking that needs measurement is disabled.

Browser QA on port5181: flex!important hid with no client rectangles and showed with the original priority. Undo restored hidden then visible states. An imported display:none paragraph showed through the selection menu and Undo restored it. After reload, the hidden flex layer still restored correctly. Final hidden selection had no outline or X field. Screenshot: /tmp/dom-canvas-layer-visibility.png. Build and diff check passed.

## Element canvas locks

Added row lock toggles and selection-menu actions, persisted through data-canvas-locked and document history. Locks include descendant elements. Canvas hit handling ignores locked branches, resize handles are absent, and nudge/delete/reorder actions are guarded. Layer-list selection and explicit inspector edits remain available; the inspector explains this boundary. Child unlock actions identify the parent lock. Frames are not independently lockable, and an unlocked ancestor can still move/remove its whole subtree.

Browser QA on port5181: locked heading ignored ArrowRight/Delete and had zero resize handles. Double-clicking its strong child kept the frame selected and did not enter editing. Delete menu action was disabled. Unlock enabled a1px nudge; two Undo actions restored the original locked/unmoved state. Child selection exposed Unlock parent layer and zero handles. Reload preserved the lock; a native drag left translate empty. Screenshot: /tmp/dom-canvas-layer-lock.png. Build and diff check passed.

## Imported activation and text editing

Shadow roots intercept native click/auxclick/submit/reset activation while editing, keeping links/forms/checkboxes from performing browser actions. This is an editing interaction boundary, not a general script sandbox. Double-click QA also exposed pointer capture retargeting the event to the canvas; editing now falls back to the recorded pointer hit, with connected-element, lock and bounds checks. Corrected the row-eye hover selector so inactive visible layers do not show every eye icon at rest.

Browser QA on port5181: mouse clicks on a hash link, submit button and checkbox left the URL unchanged and checkbox unchecked. Keyboard Enter on the link and a form input and Space on the checkbox also preserved the document URL/state. Double-click enabled plaintext editing, changed the heading, and Escape ended/committed the edit. Undo restored its original text. Screenshot: /tmp/dom-canvas-edit-activation.png. Build and diff check passed.

## Image source replacement

Added remembered Image source disclosure with URL validation and existing history integration. Explicit replacement clears img srcset/sizes and direct picture source srcset attributes, preserving other markup, styles and alt text. A contextual note explains the responsive-image change before editing. Loading status now takes precedence over stale natural dimensions while an image request is pending.

Browser QA on port5181: a responsive blue300x100 image was replaced with an orange120x240 image. The box stayed180x180 with cover,100%50% position and rounded corners; all responsive source candidates were cleared. One Undo restored the original natural size, img srcset/sizes and picture source. A non-image data URL was rejected. Screenshot: /tmp/dom-canvas-replace-image.png. Build and diff check passed. File upload is not part of this control.

## Frame clipping

Added frame Clip content with optional clipContent metadata, Reset, normal history and project validation/persistence. Frame hosts apply the explicit overflow setting; disabling clipping also removes paint containment. The base stylesheet uses layout/style containment and retains default overflow:hidden, allowing imported overflow rules to work. Copied code includes browser-normalized overflow/contain overrides alongside frame fill.

Browser QA on port5181: a120px child beginning100px down a160px frame became visible60px beyond its boundary when clipping was disabled, without changing frame height. Undo restored hidden overflow; Redo restored visible. Copied/pasted code retained visible overflow and layout/style containment. Reset restored hidden; Undo and reload retained visible. Four project-file tests and build passed. Screenshot: /tmp/dom-canvas-frame-clipping.png.


## Inspector guidance density and CSS keyboard editing

Kept Design panel at241px and property controls at24px. Position guidance now opens from an accessible info button instead of occupying permanent rows. CSS introductions and shortcut guidance share a native disclosure below the editor; padding/gap are12px/8px. Apply buttons expose the keyboard shortcut in their titles, and the textarea has an accessible keyboard-exit description.

Shared CodeInput adds two-space Tab/Shift+Tab indentation, Enter indentation, brace-pair newlines, and up to100 draft history states isolated from document Undo. Escape followed by Tab allows keyboard focus to exit. External value/selection-identity changes reset local draft history. History records input events rather than word-level groups; drafts/history remain session-only.

Browser QA on5181: measured panel241px, sizing row217x24, width/height fields91.5x24. Position help toggled without changing properties. Element CSS multiline Tab and draft Undo restored exact text; Escape/Tab focused Discard, and Discard restored the original styles. Frame CSS with live preview off preserved white text until Cmd+Enter applied an important yellow rule; document Undo restored white. CSS help expanded to show its instructions. Three code-editing tests cover selection boundaries, outdent and brace/newline behavior. Build and diff check passed. Screenshots: /tmp/dom-canvas-inspector-density.png and /tmp/dom-canvas-css-compact.png.


## Canonical opacity values

Fixed an observed boundary mismatch: ArrowUp at100% displayed101 while computed opacity remained1. Field setters can now return their accepted text; commit, suggestions, arrow steps and pointer scrubbing use it. HTML and SVG opacity setters return clamped0–100 values, including unchanged endpoints. SVG opacity fields now accept strict percentage input through the shared numeric parser. Hex color edits preserve an existing alpha of0 instead of treating it as absent.

Browser QA on5181: HTML ArrowUp at100 stayed100; typing-20 and ArrowDown stayed0;100+20 normalized to100. Scrubbing toward the upper limit kept100; reversing reduced the value and Undo restored100. Changing purple at0 alpha to orange retained rgba(255,102,0,0); successive Undo restored transparent purple then opaque purple. SVG fill paint opacity accepted50%, rejected wrong without changing0.5, and Undo restored1. Build and diff check passed. Screenshot: /tmp/dom-canvas-opacity-values.png.


## Position-first inspector hierarchy

Compared the local canvas reference NodeProperties: Position precedes Layout with coordinates and rotation first. Reordered HTML controls accordingly and moved frame X/Y ahead of frame sizing. HTML position is open by default while preserving any explicit saved collapse preference. Coordinates, rotation and stacking remain directly available; flow mode, insets and transform origin sit in remembered CSS positioning disclosure, with a compact current-mode summary. This changes presentation, not the existing DOM transform/flow semantics.

Browser QA on5181: X40->50 and Undo40; advanced left inset40->60 updated computed left60px, Undo restored40. Switching to the frame exposed section order Position, Frame, Fill. Returning to the element retained the open advanced disclosure; after closing it, Tab from Z index focused its summary. The final compact view shows Position, Layout, Appearance and Fill without scrolling. Build and diff check passed. Screenshot: /tmp/dom-canvas-position-first.png.


## Align HTML elements to their frame

Added six icon actions at the top of Position: physical left/center/right and top/middle/bottom relative to the containing canvas frame. Uses measured visual bounds and the existing transform-aware movement path, preserving authored flow/insets. Each action commits normally to history. Controls are disabled when the element has no layout box or frame. This is single-element frame alignment; it does not implement distribution, multi-selection or SVG alignment. Perspective/3D retains the existing movement limitations.

Browser QA on5181: a240x120 element in a640x160 frame aligned to X0/200/400 and Y0/20/40 within0.001px; Undo of bottom alignment restoredY20. A child with its own rotation/nonuniform scale under a rotated/scaled parent centered with errors0.0019px/0.0027px. All six actions disabled for a display:none layer. The row measures217x24 with no horizontal overflow. Build and diff check passed. Screenshot: /tmp/dom-canvas-frame-alignment.png.


## Compact flip actions and readable transformed labels

Added horizontal/vertical flips beside Rotation, moving Z index into CSS positioning alongside a Scale field. Flips negate the resolved individual CSS scale axis, preserving magnitudes, third-axis scale, rotate and transform. Position reset includes scale. Unknown/unresolved scale and zero axes disable the corresponding action. These are local scale-axis reflections around transform-origin, not world-axis matrix decomposition; SVG/frame transform controls are unchanged.

Visual QA found that selection captions and dimensions inherited the reflected outline transform. Moved those labels into a separate axis-aligned overlay using measured visual bounds. Resize handles retain the transformed outline and existing cursor/resize behavior.

Browser QA on5181:125%75%2 resolved to1.25 .75 2, both flips produced-1.25 -.75 2, and Undo restored each state through none. Scale0 2 disabled horizontal only. A child with imported matrix(0.952628,0.55,-0.4,0.69282,0,0) retained the exact matrix through two flips; its scale reset returned the stylesheet value1. Flip row217x24 had no overflow. The reflected card rendered mirrored text while the overlay remained readable, with computed label-container transform:none. Two parser tests cover preserved axes, involution, percentages, invalid expressions and zero axes. Build and diff check passed. Screenshot: /tmp/dom-canvas-flip-controls.png.


## Compact effect layers and paint ordering

Shadows now use single-open compact rows with color swatch, drop/inner/custom label, reorder arrows and remove icon. New shadows open for immediate editing. Moving/removing a layer updates the expanded index so it follows the same effect; endpoint arrows disable. Reordering preserves each authored shadow string, including effects that require the CSS fallback. Gradient removal now similarly shifts or clears its expanded index instead of opening a different layer.

Browser QA on5181: three distinct shadows rendered as31px rows at217px width with no overflow. Moving the blue inner shadow from second to first updated box-shadow order and kept its8px blur editor open; Undo restored original order. Removing a preceding red shadow retained the green shadow's open controls at its new index. Added shadows opened with16px blur. Top-up and bottom-down were disabled. Two gradients with angles135/90 retained the90-degree editor after removing the first layer. Build and diff check passed. Screenshot: /tmp/dom-canvas-compact-effects.png.


## Quoted CSS list boundaries

Extracted the shared CSS list splitter from ShadowEditor. It now tracks quoted strings, escaped characters and comments before interpreting parentheses or list delimiters. This preserves image URLs containing literal commas/parentheses instead of treating pieces of the URL as extra background layers. Source slices remain verbatim; the browser still validates CSS.

Three parser tests cover double/single-quoted data URLs, escaped quotes/delimiters, comments and nested color/variable functions. Browser QA on5181 used a rendered orange SVG URL whose text contains a),b(c. A transparent gradient plus that URL produced exactly two rows; removing the gradient produced one and preserved the image string. Undo restored two; adding/removing a gradient produced three/two without changing the URL. Build and diff check passed. Screenshot: /tmp/dom-canvas-css-layers.png.


## Background ordering with companion properties

Added compact background reorder controls and routed prepend/remove/reorder through one validated property batch. The image and seven companion lists move together: size, position, repeat, origin, clip, attachment and blend mode. Short lists repeat per CSS indexing. New layers receive default companion values; removing the last image keeps existing companion declarations. Existing inline priorities are retained. Fill reset covers all affected properties. Expanded gradient tracking follows moved indices.

Top-level image variables and companion values containing variables/cascade keywords are resolved before structural indexing. Such operations snapshot their current values rather than maintaining a dynamic variable binding; the custom property itself is not changed, and Undo restores the source declarations. Direct CSS value editing remains direct CSS semantics.

Browser QA on5181: blue/red swap also swapped80/40px size, right-bottom/left-top position, repeat-x/no-repeat, origin, clip, attachment and screen/multiply. Size!important survived. Removing blue retained red's40px/left-top/no-repeat; Undo restored both. Prepending a gradient added auto/0%0%/repeat/normal ahead of existing settings. Two variable-expanded images displayed two rows, reordered with60/30px sizes, and Undo restored var(--images)/var(--sizes). Four list tests, build and diff check passed. Screenshot: /tmp/dom-canvas-background-order.png.


## Per-layer background editing

Replaced the global background size/position list controls with Size & position inside each expanded layer. Size/repeat accept typed CSS and suggestions; position accepts CSS directly. Single-layer edits materialize the current repeated list, replace only the chosen index, retain inline priority, validate and commit once. Comma-separated multi-layer input is rejected in these controls. Custom images/nonlinear gradients now have a thumbnail disclosure and an individual CSS source field; whole-list CSS is explicitly expandable instead of forced open for every custom background.

Browser QA on5181: editing second-layer size40x40->55x65, left-top->center-top and no-repeat->space preserved the first layer's80x80/right-bottom/repeat-x and!important. Entering cover,contain was rejected without changing either layer. Three Undo steps restored original values. A custom SVG layer accepted cover/center while preserving the first layer; replacing only its CSS with radial-gradient(white,black) retained the first linear gradient, and Undo restored the SVG. The whole-list CSS field was absent while collapsed. Build and diff check passed. Screenshot: /tmp/dom-canvas-per-layer-fill.png.


## Copy and paste appearance

Added Copy appearance / Paste appearance to element selection menus, using a session-only in-app snapshot rather than the OS clipboard. Captures resolved typography, text decoration, color/opacity, backgrounds and companion lists, borders/radii, shadows and blend mode; SVG sources add vector paint fields only when applied to SVG targets. Paste validates supported declarations, retains existing inline priorities and commits once. Content, class/ID, dimensions, positioning, layout, transforms and vector geometry are not copied. Computed values are snapshots; nested overrides, stylesheet!important rules, and referenced SVG paint servers/assets can affect visual equivalence. Geometry may naturally reflow from typography/border changes. No frames, cross-tab transfer or filter copying is included.

Browser QA on5181: Paste disabled before copy. Transferring clip-frame appearance to item-alpha copied purple fill, white20px typography, multiple backgrounds and three shadows; textA and its width/height/position/translate declarations stayed unchanged. Computed target remained100x40. One Undo restored original null style and blue fill; Redo reapplied. SVG rect appearance transferred purple fill, brown6px stroke to the circle while retaining its coordinate/radius attributes; Undo restored the exact prior style string. Build and diff check passed. Screenshot: /tmp/dom-canvas-copy-appearance.png.


## RGB color entry and measured popover placement

Added Hex/RGB format selection in the existing color popover. RGB channels use editable drafts, clamp whole-number commits to0–255, and reject empty/non-finite values. Format selection does not emit a color change. Channels retain current alpha and share the existing preview/cancel/one-commit transaction. Invalid RGB channels disable Done. Focus containment includes the format selector. Popover positioning now measures its rendered width/height before paint and limits height to the viewport.

Browser QA on5181: a147/197/253 color at25% alpha was unchanged by switching toRGB; edits255/128/0 previewed rgba(255,128,0,.25), and Cancel restored the exact original. Red300 normalized255; an empty Green disabledDone. Correcting it and Done applied once; Undo restored originalblue/.25. Tab fromDone wrapped toClose color picker. RGB popover measured240x378 and remained within the viewport with8px bottom clearance. Build and diff check passed. Screenshot: /tmp/dom-canvas-rgb-picker.png.


## Recent approved colors

Color popovers show up to12 unique recent approved colors with alpha/checkerboard swatches. Confirmed changes through Done/outside close and the anchor close path are remembered; canceled/no-change popover sessions are excluded. Palette storage is separate from document history at dom-canvas:recent-colors:v1, validated as hex-only entries with a session fallback when storage is unavailable. Selecting a swatch remains a preview until confirmation. This records picker approvals, not every CSS/hex-field edit.

Browser QA on5181: approving#FF660080 added one entry; previewing#00FF0080 thenCancel left the palette unchanged. Reusing orange on another element produced rgba(255,102,0,.5), and Undo restored its original blue. Reload retained the orange swatch. Approving#2563EBFF via the anchor close path closed the picker and added normalized#2563EB ahead of orange. Two tests cover alpha, order, deduplication, invalid stored values and the12-entry bound. Build and diff check passed. Screenshot: /tmp/dom-canvas-recent-colors.png.

## Compact gradient stop selection

Expanded linear gradients now show numbered swatches in six columns and one active color/position editor. Buttons expose pressed state and position tooltips. Adding a stop selects the new stop; deleting selects a remaining neighbor. Opening another layer resets selection, and a shorter source clamps the active index. These are selection swatches, not spatially positioned or draggable gradient handles.

Browser QA on 5181: a six-stop gradient rendered six selectors and one editor. Stop 4 retained green at 65%. Adding a stop inserted white at 90%, selected stop 6 and produced seven selectors. Removing it restored the exact six-stop background string; Undo restored the seven-stop source (the disclosure resets on document restoration). Enter selected stop 4 with aria-pressed=true and one editor. Build and diff check passed. Screenshot: /tmp/dom-canvas-gradient-stops.png.

## Duplicate background layers and shadows

Compact duplicate buttons insert an exact source layer immediately below itself and open the copy. Background duplication uses the existing index remapping transaction for all seven companion properties, retaining layer-specific size, position, repeat, origin, clip, attachment and blend mode. Shadow duplication copies the layer string before any subsequent edit. Each duplication commits once; existing source-resolution limitations still apply to variable-backed lists.

Browser QA on 5181: duplicating a custom SVG image containing quoted commas preserved its source and copied cover/center/no-repeat/content-box/local/multiply settings while leaving the first gradient and its settings intact. One Undo restored the exact original style attribute. Duplicating the first inset shadow copied its blue 50% paint and 8px blur; changing only the copy to 12px retained the original 8px shadow. Two Undo operations restored the exact style before duplication and editing. All four shadow action rows measured 217px without horizontal overflow. Build and diff check passed. Screenshot: /tmp/dom-canvas-duplicate-effects.png.

## Gradient position track

Percentage stops now have a horizontal ramp with markers and one selected native range handle, within the existing 36px preview space. Swatches select the active stop. Drag/click and arrow keys adjust its position between neighboring stops; Shift steps 10%, Alt 0.1%, Home/End reach neighboring bounds. Inspector transactions group a pointer gesture or held key into one history entry, with Escape/pointer-cancel/unmount cancellation. Document Undo/Redo shortcuts now work from range inputs outside popovers without changing text-input shortcut behavior.

The track resolves omitted positions and CSS monotonic stop fixup, then materializes effective percentages when edited so the other stops do not drift. It does not reorder crossing stops. Lengths, double-position stops, expressions and out-of-range percentages retain the existing source/field editor. The horizontal ramp represents stop positions independently of the authored gradient angle; the collapsed summary and canvas retain the actual angle.

Browser QA on 5181: 65% -> 66% with Right, then 76% with Shift+Right and 75.9% with Alt+Left. End clamped to the next stop at 80%; Undo restored 75.9%. Focused-slider Cmd+Z restored its preceding source. A pointer click moved to 50%, and Undo restored 75.9%. A native continuous drag moved a middle stop from 60% to 40%; one Undo restored 60%. An implicit red/yellow/blue gradient resolved its middle to 50%; editing to 60% retained endpoints 0/100. A 0px/100px gradient showed no percentage slider and retained its exact source. Two helper tests cover omitted runs, fixup, coincident stops and unsupported positions. Escape during an active native drag and held-key repetition were code-reviewed, not separately exercised. Build and diff check passed. Screenshot: /tmp/dom-canvas-gradient-track.png.

## Action search

Added a toolbar search icon and Cmd/Ctrl+K action search. A native modal dialog contains a filterable combobox/listbox, shortcut labels, arrow navigation that skips disabled entries, Enter execution, empty results, Escape dismissal and focus restoration. It uses the same selection action objects as the context menu, including locks and sibling boundaries. Additional actions cover document history, CSS/Design panels, zoom, interface visibility and tools. It searches existing command labels by words; this is not a layer or inspector-property search. Native modal behavior isolates background UI, and the portal remains available when the interface is hidden.

Browser QA on 5181: searching zoom then Down/Enter ran Zoom to 100%. Paste appearance was disabled before copy and Enter did not execute or close it. An unmatched query showed No matching actions. Escape closed the dialog and restored the toolbar trigger. Edit CSS selected the CSS tab. Hide layer set display:none; finding Undo restored the exact original style attribute. Tab stayed inside the modal. Build and diff check passed. Screenshot: /tmp/dom-canvas-action-search.png.

## Document names and metadata history

The title is now a compact rename button/input with Enter/blur commit and Escape cancellation. Names are normalized to 120 characters, support Unicode, appear in the browser title, and produce filenames with path/reserved punctuation replaced. Document history stores name and artboards together while preserving the artboard-array references used by selection restoration. Local persistence writes the same atomic envelope and accepts the previous array-only format. Version 1 project files add an optional name; older files default to Untitled and invalid name types are rejected.

Browser QA on 5181: all 16 previous frames loaded. Renaming to קנבס / Landing v2 updated the header and tab title; Undo restored Untitled, Redo restored the new name, and Escape discarded a different draft. Reload retained the name and frames. Export created Downloads/קנבס - Landing v2.domcanvas.json; its JSON contained the unsanitized display name and all 16 frames. The download observation timed out, but the completed artifact was independently inspected. Opening an Imported QA single-frame project through the supported clipboard route changed name/content together; Undo restored the prior name and all 16 frames. Ten project-file/history tests and build passed. Native file-picker limitations remain as previously documented. Screenshot: /tmp/dom-canvas-document-name.png.

## Element CSS variables

Added a collapsed-by-default CSS variables section for HTML and SVG elements. It discovers declarations and references in accessible frame style rules plus inline ancestry, then displays variables resolved on the selection or defined locally. This avoids listing unrelated editor theme tokens. Rows show Local/CSS origin, raw local expressions or resolved values, a passive color preview, and a direct reset action for local definitions. Editing preserves existing inline priority, validates through CSS.supports and commits normally. Add validates names, rejects existing names and supports arbitrary CSS values; more than six variables exposes a filter. Help explains selected-element scope and inheritance.

This is a local override editor, not a stylesheet-origin or global token manager. Inaccessible external sheets, escaped/unusual names referenced only through var(), and unset variables with no local definition may not be discoverable. It does not infer types or guarantee that a valid custom-property token sequence is valid for every property consuming it.

Browser QA on 5181: a new fixture exposed exactly its four variables. Changing --brand from purple to green updated the heading and a child using --alias:var(--brand). --space:24px updated both gap and padding. Direct Reset returned the stylesheet purple; Undo restored green. An invalid new name was rejected. Adding --step:8px and assigning --space:var(--step) produced 8px spacing while retaining the raw reference. Overriding --alias on the child changed its fill to blue without changing the parent heading. Build and diff check passed. Screenshot: /tmp/dom-canvas-css-variables.png.

## Bulk inspector section disclosure

Collapse Design sections and Expand Design sections are available in the inspector actions menu and action search, disabled outside Design or without a selection. Mounted section disclosures register their scoped preference keys; bulk actions update only those sections in the current HTML/SVG/frame scope. Individual disclosures and preferences remain intact across other scopes. These actions do not alter document history, nested advanced options, or sections absent from the current selection.

Browser QA on 5181: all nine section headings for the flex fixture collapsed, with the exact inline source unchanged and Undo still disabled. Reload retained all nine closed states. Searching Expand Design opened all nine. Switching to frame 17 showed its three sections still open; collapsing the frame and returning to the element retained the element's expanded state. Build and diff check passed. Screenshot: /tmp/dom-canvas-collapsed-sections.png.

## Discoverable layer naming

Extended the existing tree rename operation to the selection menu, action search and global F2 outside text inputs/popovers. Requests reveal the selected row by clearing an active layer filter and showing the interface. Keyboard Enter/Escape return focus to the selected row, Enter respects IME composition, and new names are limited to 120 characters. The inspector breadcrumb uses custom data-name metadata while retaining tag/ID information in its tooltip. Frame names still use the existing frame metadata path; element names do not modify selectors or content.

Browser QA on 5181: renaming item-gamma to Hero swatch through the menu updated the tree, inspector heading and selection path; id/class/style/text were exactly unchanged. Undo restored item-gamma. With a variable-only layer filter hiding the selected element, action-search Rename cleared the filter and opened the correct row's editor. F2 from the inspector action button opened rename; Escape discarded a replacement and restored tree-row focus. Reload retained Hero swatch. Build and diff check passed. Screenshot: /tmp/dom-canvas-layer-rename.png.
