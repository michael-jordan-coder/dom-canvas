# Figma canvas research

מאגר מחקר התנהגות וממשק, המבוסס על ניסויים בפיגמה דרך Computer Use,
בדיקת DOM ומדידות DevTools. זהו חלק מפורש מהיעד המתמשך של הפרויקט,
לפי בקשת המשתמש ב־2026-10-13. המחקר אינו מוגבל לפיצ'רים שכבר קיימים במוצר שלנו.

## Start here

- **[Design panel goal and completion checklist](DESIGN_PANEL_GOAL.md)**: current
  user priority, including a complete UI-state and behavior research inventory.
- [Research plan and coverage](RESEARCH_PLAN.md): scope, open work, completion criteria.
- [Method](METHOD.md): how to reproduce and qualify each observation.
- [Environment and fixtures](ENVIRONMENT.md): approved test file, node IDs, access.
- **[Design panel state map](topics/design-panel.md)**: primary track; context,
  sizing dependencies, shared properties and Undo transitions.
- [Selection](topics/selection.md): marquee, multiple frames, Shift.
- [Parent-child layout](topics/parent-child-layout.md): positioning context,
  Constraints, Fill/text-mode coupling, Undo and Redo.
- [Text](topics/text.md): click creation, drawn boxes, sizing modes.
- [Input lifecycle](topics/input-lifecycle.md): expressions, invalid values, arrows,
  Tab/Escape and measured focus wrappers.
- [Fill and effect editors](topics/paint-effects.md): paint modes, gradient context,
  shadow editing and close/hide/remove behavior.
- [Stroke and corners](topics/stroke-corners.md): dashed dependencies, per-side
  editor and Mixed corner values within one object.
- [Typography](topics/typography.md): contextual Type settings and font/line-height
  propagation into child and parent geometry.
- [Components](topics/components.md): main-component context and property/configuration entry points.
- [Bindings](topics/bindings.md): local color style linking, removal and instance Fill reset.
- [Panel shell](topics/panel-shell.md): measured title rows, section dividers,
  action boxes, scroll containers and disabled semantics.
- [Guides and export](topics/guides-export.md): Grid/Columns context and Export-to-Fill dependency.
- [Transforms](topics/transforms.md): rotation coordinates and aspect-ratio coupling.
- [Grid and Wrap](topics/grid-wrap.md): flow transitions, track settings and sizing controls.
- [Multi-child Wrap](topics/wrap-multi.md): line-break thresholds, gap axes and direction history.
- [Multi-track Grid](topics/grid-multi.md): spans, fractional tracks, minimum widths and parent resizing.
- [Selection contexts](topics/selection-context.md): Page panel, hidden edits and locked-layer editing.
- [Groups and sections](topics/groups-sections.md): contextual controls, child edits, coordinates and Resize to fit.
- [Shapes and vector editing](topics/shapes-vector.md): contextual geometry fields, point selection and disabled corners.
- [Mixed types](topics/mixed-types.md): supported subsets, Mixed inputs and selection-aware Undo/Redo.
- [Mixed and multiple paints](topics/mixed-paint.md): Fill replacement/restoration, Escape and independent alpha/opacity.
- [Size limits](topics/size-limits.md): minimum removal/Undo and maximum-capped Fill reflow.
- [Font controls](topics/font-controls.md): family search, font-dependent styles, tracking units and reflow.
- [Lists and Fill recovery](topics/text-list.md): contextual list controls and verified restoration via Actions.
- [Constraint resizing](topics/constraints-resize.md): tested Left/Right/Center geometry and sizing transition.
- [Text truncation and trim](topics/text-trim.md): Max lines, trimmed text bounds and parent Hug reflow.
- [Text case and underline](topics/text-case.md): case rendering, nested decoration editor, center alignment and disabled states.
- [Alignment and spacing](topics/alignment.md): selection-edge alignment, distribution and contextual spacing fields.
- [Inner shadow](topics/inner-shadow.md): type-dependent Spread, blend persistence and independent effect rows.
- [Glass history](topics/glass-history.md): combined Fill/effect Undo, translucent Fill, slider keys and numeric bounds.
- [Material effects](topics/material-effects.md): Noise modes, Texture/Glass conversion, Fill dependency and slider metrics.
- [Blur effects](topics/blur-effects.md): Uniform/Progressive, type conversion, mode history and editor measurements.
- [Layout details](topics/layout-details.md): visual clipping, compound padding fields and stroke participation.
- [Inspector](topics/inspector.md): measured control density and panel structure.
- [DevTools](topics/devtools.md): precise measurements without guessing from screenshots.
- [Experiment template](templates/experiment.md): reusable record for future tests.

## Evidence vocabulary

| Status | Meaning |
| --- | --- |
| Measured | Direct DOM/Computed value for a named element and state |
| Observed | A performed interaction with a visible resulting state |
| Inconclusive | Attempt made; result does not justify the expected rule |
| Open | Not yet tested |

These labels are scoped to each scenario. They are not claims of full Figma parity.
Current evidence was gathered on 2026-10-13; UI variants and future versions may differ.

## Separation from implementation

This directory describes Figma, not the desired behavior of our existing code.
[INSPECTOR_PARITY.md](../INSPECTOR_PARITY.md) is the historical product work log;
its implementation claims do not count as Figma observations.
[Earlier comparison log](../figma-interaction-comparison.md) records the initial investigation.
Use the topic documents here as the index for new research.

Do not copy private content, account details, console/network logs or entire source
bundles into evidence. Keep only the UI measurements and disposable fixture results.
