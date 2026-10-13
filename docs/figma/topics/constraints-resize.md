# Horizontal constraints during parent resizing

Observed2026-10-13, Chrome light UI, canvas215%. Child8:3 originally100 Fill/min100
×30 Hug at-10/10, Auto height, in Frame3 horizontal80 Fixed ×50 Hug. Prior baseline:
[text-trim restored child](../evidence/text-trim/11-restored-child.txt).

## CR01 — Ignore auto layout exposes active position and constraints

Check Ignore auto layout. Child stays100 ×30 at-10/10; X/Y become editable;
Constraints button appears, dimension labels become Width + min width and Height.
Opening Constraints exposes Horizontal Left and Vertical Top. The expanded state
survives selecting the parent and returning to the child: blindly clicking the
button again can collapse it. One subsequent selector failure came from that
collapse, not evidence that constraints were absent.

Evidence: [absolute child](../evidence/constraints-resize/01-absolute.txt),
[Left/Top](../evidence/constraints-resize/02-left-top.txt),
[parent after ignore](../evidence/constraints-resize/03-parent-absolute.txt).

## CR02 — Left, Right and Center respond differently

The child remains outside layout flow for these steps. Change only parent width
through its Horizontal resizing field; inspect child after each change.

| Constraint set before resize | Parent width change | Child X afterward | Child width |
| --- | --- | --- | --- |
| Left | 80→180 | -10 | 100 |
| Right | 180→280 | 90 | 100 |
| Center | 280→380 | 140 | 100 |

Y remains10 and height30. Left preserves X; Right adds the full100 width delta;
Center adds half50. These are direct tests of this child/parent context, not an
inference from option names. The initial overflowing child has negative left
inset, so these tests also preserve an offset rather than repositioning inside.

The Horizontal menu shows Left, Right, Center enabled, **Left + Right and Scale
disabled**. The cause (sizing/minimum/auto-layout context) is not isolated, so the
requested stretch case remains open. No disabled option was forced.

Evidence: [Left at180](../evidence/constraints-resize/04-left-child180.txt),
[menu disabled options](../evidence/constraints-resize/05-options.txt),
[parent280](../evidence/constraints-resize/06-parent280.txt),
[Right at280](../evidence/constraints-resize/07-right-child280.txt),
[Center at380](../evidence/constraints-resize/08-center-child380.txt).

## CR03 — Returning to flow restores placement but not Fill

Set Horizontal constraint back to Left, return parent width80, select child and
uncheck Ignore auto layout. Child returns to-10/10,100 ×30, with X/Y disabled,
Auto height/Hug height and min width100. **Horizontal sizing is Fixed**, not its
original Fill mode. The geometry happens to match because of min width100.
Parent80 ×50 Hug verified separately.

Attempts to restore Fill through the sizing popup did not produce a Fill badge.
Clicking the Fill container option closed the popup without changing Fixed;
keyboard navigation on the focused hidden listbox timed out; clicking the visible
label scoped to the active menu also left Fixed. The popup screenshot/active
option inspection showed Fixed width (100) selected. This is an automation result,
not proof the Figma command is broken for normal input. Final screenshot and DOM
confirm no Fill badge. Do not count matching100px as sizing-mode restoration.

Evidence: [back in flow](../evidence/constraints-resize/09-inflow.txt),
[first restore attempt](../evidence/constraints-resize/10-restored-child.txt),
[parent50](../evidence/constraints-resize/11-restored-parent.txt),
[actual final Fixed](../evidence/constraints-resize/12-final-fixed.txt),
[final screenshot](../evidence/constraints-resize/12-final-fixed.png).

## Current fixture / outstanding work

Child8:3 selected at215%, Ignore off,100 **Fixed**/min100 ×30 Hug, Auto height,
-10/10, original font/white Fill; Frame3 width80/height50. Restore Fill before any
later experiment that assumes the original sizing mode. Constraint source is
Left/Top as last explicitly set; constraints hidden in normal flow.

Open: Fill restoration, Left+Right/Scale enabled contexts, vertical constraints,
unequal/rotated children, direct parent canvas resize, Undo/Redo, constraint widget
hit targets and focus/disabled UI measurements.

## Follow-up: restoration gap closed

[Lists and Fill recovery](text-list.md#tl02--fill-restored-with-the-explicit-actions-command)
restored Fill through Actions → Set width to fill container, then verified child
width160 under parent180 and restored100/min100 under parent80. The Current
fixture paragraph above describes the historical end of this pass, now superseded.
