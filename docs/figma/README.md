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
