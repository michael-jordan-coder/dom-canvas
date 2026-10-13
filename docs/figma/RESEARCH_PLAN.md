# Research goal and coverage

Current explicit goal: [complete Design panel research, including UI](DESIGN_PANEL_GOAL.md).
The broader canvas inventory below remains the long-term research backlog.

## User mandate

Document everything that can be done on the Figma canvas through direct Computer Use
experiments and DevTools measurements, building a durable Markdown reference for the
product. This extends the existing product goal; it does not replace implementation.
Before each product behavior change, inspect the corresponding Figma behavior first.

## Scope inventory

The list below is a research backlog, not an assertion that every named feature is
available in the current file/account. Discover availability through actual menus.
Add newly discovered tools, settings and contextual states instead of treating this
initial list as a closed definition of “everything.”

| Area | Cases to cover | Current coverage |
| --- | --- | --- |
| Navigation | pan, zoom, fit, rulers, guides, UI visibility | Open |
| Selection | click, marquee, crossing, direction, Shift, deep selection, nested/locked/hidden targets | Basic top-level text and frames observed |
| Geometry | move, nudge, resize, scale, rotate, flip, snapping, aspect lock | Open |
| Frames/sections/groups | creation, nesting, clipping, grouping, reparenting, presets | Two freeform frames created; other cases open |
| Text | click/drag creation, sizing, editing, multiline, selection, typography, RTL, overflow | Click/drag sizing observed |
| Shapes/vectors | primitive shapes, pen, paths, points, boolean operations, masks | Open |
| Layout | auto layout, axes, grid, wrap, padding, gap, alignment, Hug/Fill/Fixed, constraints | Panel structure observed; behavioral matrix open |
| Appearance | fills, gradients, images, strokes, radii, effects, opacity, blends | One color input measured |
| Layers | hierarchy, visibility, locking, rename, ordering, search | Basic label selection observed |
| Shared editing | mixed values, alignment, distribution, multi-edit, collective transforms | Multi-frame dimensions and mixed X observed |
| Components | create, instance, overrides, variants, properties, detach | Open |
| Reusable data | styles, variables, modes, bindings | Open |
| Clipboard/history | copy/paste, duplicate, cut, undo/redo, transactions | Open |
| Prototype | connections, interactions, overlays, scroll behavior | Open |
| Output | export, asset settings, presentation | Open |
| Additional canvas modes | inventory Draw/Motion and contextual tools; document separately from Design | Toolbar entries observed; behavior open |
| Interaction details | focus, keyboard, validation, menus, tooltips, cursor, cancellation | Open |

## Research cycle

1. Inspect actual UI and identify one behavior or control family.
2. Read the existing topic to avoid retesting established cases without a reason.
3. Set up an isolated fixture in the approved test page.
4. Record initial values, action, resulting values, and evidence.
5. Vary meaningful conditions: hierarchy, selection size, lock/visibility, modifiers,
   zoom, sizing mode, overflow and transformed objects, where relevant.
6. Record limitations and contradictory results. Do not discard them to simplify a rule.
7. Update the topic and coverage ledger; commit the evidence locally.
8. Use the verified rule when implementing the corresponding product behavior.

## Completion gate

Research is not complete merely because every topic has a file. Each discovered
capability needs reproducible cases covering its relevant states, visible evidence,
precise measurements where DOM permits, and explicit limitations. Unavailable or
untested features remain recorded as gaps. The product itself still needs separate
implementation and local verification against these observations.

## Next experiments

User reprioritized the **holistic Design panel** above canvas selection research.
The first [state/dependency map](topics/design-panel.md) now records freeform versus
auto-layout frames, text resizing modes, shared widths and transactional Undo.

1. Design panel in parent/child contexts: Fill, Hug, Fixed, absolute position, min/max.
2. Numeric field lifecycle: focus, blur, Enter/Escape, arrows, scrub, expressions, errors.
3. Appearance editors and dependent state: fill/stroke/effects, preview/cancel, opacity.
4. Mixed-type selections and per-field support; panel-to-canvas synchronization.
5. Resume nested selection and group resize research after panel foundations.
