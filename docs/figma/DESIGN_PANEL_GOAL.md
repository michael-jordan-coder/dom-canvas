# Goal: complete Design panel research

User requested this explicit continuing goal on 2026-10-13:

> תהפוך את זה ל /goal , ותעשה חקירה שלמה על ה design panel, כולל הui

## Objective

Build an evidence-backed, holistic reference for Figma's Design panel, including
its behavior and visual interface, sufficient to guide the corresponding panel in
our HTML editor. Use actual Computer Use experiments, visible DOM, and DevTools
measurements. Store durable Markdown and focused evidence in this directory.

## Platform registration

The previous broad product goal was cleared by the user. The dedicated Design
panel research goal was successfully created and returned status **active** on
2026-10-13. This file defines its coverage and evidence requirements. Research is
in progress; registration is not a claim of research completion.

## Required coverage

Each row needs a topic/specification, reproducible experiments, actual results,
evidence, measured UI states and an explicit list of remaining uncertainties.

| Area | Behavioral coverage | UI coverage | Current status |
| --- | --- | --- | --- |
| Selection context | None, single/multiple, homogeneous/mixed types, locked/hidden, editable/unsupported properties | Headers, icons, section order, visibility, disabled and Mixed states | Partial: frames/text, Page context, editable hidden/locked frame; heterogeneous/ancestor contexts open |
| Object types | Frame, text, primitive shape, vector, group, section, component, instance and variants where available | Contextual controls and actions per type | Partial: frame/text, group/section, components, Rectangle/Ellipse/Polygon/Star and vector edit mode; Line/Arrow and individual vector points open |
| Position | X/Y, rotation, flip, alignment/distribution, constraints, absolute positioning | Fields, icons, alignment groups, menus, axis labels | Partial: rotation/position coupling; alignment/flip/constraints actions open |
| Layout | Freeform, auto-layout directions, wrap, grid, padding, gap, container alignment, clipping | Section transitions, selectors, sizing controls, expandable options | Partial: directions/Wrap/Grid, clipping, asymmetric padding, inside-stroke participation; flexible content, stacking/baseline/auto spacing and manual placement open |
| Parent-child dependencies | Hug/Fill/Fixed availability, parent effects, child position, min/max, constraints | Enabled/disabled controls, mode badges, contextual menus | Partial: Fill reflow, min removal/Undo, max cap, Ignore layout; bound conflicts and height limits open |
| Text | Resize modes, content editing, font family/style/weight/size, line height, spacing, paragraphs, decoration, case, alignment, direction | Font menus, mixed typography, type settings, resizing states | Partial: resizing/Undo, family/style menus, size/line-height/tracking reflow, type-settings inventory; paragraph/range/mixed behaviors open |
| Appearance | Visibility, opacity, blend modes, radii and individual corners | Shared row geometry, toggles, expanded corner controls | Partial: input metrics, individual corners and Mixed/reset |
| Fills | Solid, gradient/image options exposed by UI, alpha, multiple fills, order, visibility, remove | Swatches, fields, picker layouts, handles, menus, previews | Partial: Solid/Gradient, mixed replacement/Undo, stacked Fill alpha/visibility/remove, committed Escape; reorder/image/preview cancellation open |
| Strokes | Width, alignment, sides, joins/caps/dashes where available, multiple strokes | Rows, menus, advanced settings, unavailable states | Partial: frame stroke, dashed dependencies, custom-side editor |
| Effects | Types exposed by UI, parameters, order, visibility, add/remove, preview/cancel | Effect rows, floating editors, icons, overflow behavior | Partial: Drop shadow lifecycle; Layer/Background blur modes, retained parameters, mode Undo/Redo and editor metrics; Noise/Texture/Glass controls, conversion dependencies, fresh Glass/Fill history and selected bounds; Inner shadow Spread context/blend and independent rows; Shader/order/cancellation open |
| Styles/variables | Binding, modes, source indicators, overrides, reset/detach where available | Menus, search, badges, linked/mixed states | Partial: color style create/link/remove, variable binding/source propagation; modes/aliases open |
| Components/instances | Properties, variants, overrides, reset, instance-specific actions | Context header, property editors, unavailable actions | Partial: main/variant/set/instance context, width reset, variant switch; nested overrides open |
| Other Design sections | Selection colors, layout guides, export, contextual sections discovered during research | Collapsed/expanded/empty/populated states | Partial: Grid/Columns, export preset/settings and Show in exports dependency |
| Numeric/text input lifecycle | Focus, select-all, typing, expressions, units, arrows/modifiers, scrub, Enter/blur/Escape, invalid input | Caret/selection, focus rings, hover cursors, errors, disabled presentation | Partial: Width expressions, invalid input, arrows, Tab/Escape; other controls open |
| Multi-edit transactions | Common/mixed, supported subsets, per-target restoration, undo/redo, picker preview/cancel | Mixed placeholders, shared fields, aggregate controls | Partial: frame width, heterogeneous Count/Ratio/Clip, per-target restoration and selection history; text+shape and picker cancellation open |
| Canvas synchronization | Move/resize/text/layout changes reflected in panel, panel edits reflected on canvas | Live values, selection changes, feedback and retained focus | Reflow observed; broad matrix open |
| Panel shell | Scroll, collapse, navigation, floating editors, keyboard traversal, narrow window | Width, spacing, dividers, typography, surfaces, border/radius, icon/hit areas, z-order | Partial: control/wrapper focus, title rows, sections/actions and scroll container metrics |

Newly discovered contextual controls extend the inventory. A row is not complete
merely because a Markdown file exists or one example succeeds.

## Visual state matrix

For each reusable control family, inspect applicable states:

- Rest, hover, focused, typing, active/pressed, disabled, mixed, invalid.
- Empty/populated, collapsed/expanded, menu closed/open, selected/unselected option.
- Bound/unbound style or variable; supported/unsupported selection contexts.
- Viewport/scroll boundaries and editor placement near edges.

Measure the control wrapper and inner content separately: rendered dimensions,
padding/gap, font/weight/line height, foreground/background/border, radius, icon
size, focus outline and hit target. Record theme and interface scale. Dark-theme
values cannot prove light-theme values; enumerate and test available variants.
Animations require timing evidence rather than a single screenshot.

## Evidence and completion criteria

1. Inspect actual Figma UI before describing or implementing a rule.
2. Link each claim to a performed case, measured DOM/Computed value, or screenshot.
3. Record preconditions and postconditions, not merely the attempted action.
4. Test important dependencies through an entire workflow, including cancellation
   and history where applicable.
5. Keep Figma observations separate from HTML/CSS adaptations and implementation status.
6. Resolve contradictory results or explicitly retain them as open gaps.
7. Complete the coverage ledger for every discovered requirement; unavailable
   features remain recorded as limitations, not fabricated behavior.
8. Audit links, evidence, current fixture state, and remaining gaps before claiming
   completion. No unsupported claim of full parity.

## Immediate next batch

Create a populated auto-layout parent and compare its panel with a selected child:
Fill/Hug/Fixed, editable position, absolute positioning, min/max and their UI.
Then cover the input lifecycle and paint/effect editor transactions.

Starting evidence: [Design panel map](topics/design-panel.md).
Process: [Method](METHOD.md). Shared fixture: [Environment](ENVIRONMENT.md).
