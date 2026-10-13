# Parent-child layout and Design panel dependencies

Observed 2026-10-13 in Untitled / Page 2, Chrome, light UI, canvas zoom 125%.
Scope: one text child inside one horizontal Auto layout frame. Other object types,
multiple children and vertical flow remain open.

## PC01 — Wrap a text layer

Select `Text tool comparison` (8:3), then Shift+A from the Move tool.
Figma creates `Frame 3` (15:2), wrapping the 119 × 15 text with padding 10 on
each side: 139 × 35, Hug on both axes, centered internal alignment, gap 10.
Parent position is -59, -254; child-relative position is 10, 10.
These are this fixture's resulting values, not universal defaults.

The parent has no Fill row; its Selection colors section exposes the child's
white fill. Selecting the child replaces the frame header with Text, adds
Typography, and shows its actual Fill row.

Evidence: [parent](../evidence/parent-child/01-parent-hug.txt),
[parent screenshot](../evidence/parent-child/01-parent-hug.png),
[child](../evidence/parent-child/02-child-hug.txt),
[child screenshot](../evidence/parent-child/02-child-hug.png).

## PC02 — Ignore auto layout changes several sections together

| Control | In flow | Ignore auto layout enabled |
| --- | --- | --- |
| X / Y | Disabled, 10 / 10 | Editable, 10 / 10 |
| Position alignment | Disabled | Enabled |
| Constraints button | Absent | Present |
| Dimension group | Resizing | Dimensions |
| Axis names | Horizontal/Vertical resizing | Width/Height |
| Fill container option | Present | Absent |
| Text resizing radio | Auto width | Auto width |

Enable Ignore auto layout. Open Constraints: horizontal Left, vertical Top.
Horizontal menu offers Left, Right, Left + Right, Center, Scale. Selecting the
already-current Left, closing Constraints and issuing one global Undo restores
the entire in-flow context: disabled positions, no Constraints, Hug labels and
Fill options. This experiment did not resize the parent under each constraint.

Evidence: [ignored child](../evidence/parent-child/04-child-ignore.txt),
[Constraints](../evidence/parent-child/05-constraints.txt),
[Constraints UI](../evidence/parent-child/05-constraints.png),
[horizontal options](../evidence/parent-child/06-horizontal-constraint-options.txt),
[Undo](../evidence/parent-child/07-undo-ignore.txt).

## PC03 — Fill width changes text sizing mode

1. Select Frame 3; enter width 240 and Enter. Height remains 35 Hug.
2. Select its text child. Width remains 119 Hug and text Auto width; centered
   placement produces X=60.5, Y=10.
3. Open Horizontal resizing with Cmd+Down (documented in the input's DOM
   `aria-description`). Activate the Fill container option with Enter.
4. Child becomes width 220 Fill, height 15 Hug, **text Auto height**.
5. Global Undo restores 119 Hug and Auto width; Redo restores 220 Fill and
   Auto height. The mode and geometry changes form one observed undoable action.

The 220 result equals parent 240 minus left/right padding 10 each. This supports
this single-child configuration, not a general allocation algorithm.

Evidence: [fixed parent](../evidence/parent-child/11-parent-fixed240.txt),
[Fill result](../evidence/parent-child/13-fill-keyboard.txt),
[Fill screenshot](../evidence/parent-child/13-child-fill.png),
[Undo](../evidence/parent-child/14-undo-fill.txt),
[Redo](../evidence/parent-child/15-redo-fill.txt).

## Automation and evidence limitations

- The Layers disclosure button is `aria-hidden=true`, despite appearing in the
  snapshot. Role-based lookup failed; inspected DOM exposed the test ID
  `layers-panel-expand-caret`, which successfully expanded the layer.
- Clicking the unnamed width listbox focused the input without opening its menu.
  Cmd+Down opened the actual menu and exposed a trustworthy Hug selected state.
- Clicking Fill container closed the menu but left Hug unchanged, under both
  Hug and Fixed parents. Enter on the visible Fill option succeeded. Treat the
  clicks as inconclusive automation outcomes, not a Figma rule rejecting Fill.
  [Hug-parent attempt](../evidence/parent-child/09-child-fill.txt),
  [parent after attempt](../evidence/parent-child/10-parent-after-child-fill.txt),
  [fixed-parent attempt](../evidence/parent-child/12-fill-fixed-parent-immediate.txt).
- Closed-menu snapshots contain multiple anonymous options marked selected;
  do not infer active sizing from these. Use the inline mode and opened menu.
- Earlier CSS measurements in dark UI are not light-theme color measurements.

## Follow-up experiments

- Repeat Fill under a Hug parent using the now-verified keyboard activation.
- Change parent width after Fill, including min/max clamping and text wrapping.
- Inspect each vertical constraint and resize the parent to verify geometry.
- Compare normal shapes, freeform children and multiple in-flow children.
- Measure wrapper/field/menu CSS and visual focus/hover/disabled states.

Retained research fixture: Frame 3 width 240 Fixed, height 35 Hug; text child
220 Fill × 15 Hug, Auto height. Ignore auto layout is off. No product code changed.
