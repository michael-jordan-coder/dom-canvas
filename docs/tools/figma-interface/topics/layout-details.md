# Clipping, padding and stroke participation in Auto layout

Observed2026-10-13, Chrome light UI, canvas155%. Frame3 baseline80 Fixed ×50 Hug,
horizontal/center, gap10, padding10, clip off, no Stroke. Child8:3 is100 Fill/min100
×30 Hug at-10/10. [Baseline](../evidence/layout-details/01-baseline.txt).

## LD01 — Clip content changes rendering without resizing the child

Check Clip content. Text extending left of the frame boundary is visibly clipped;
the child's width100, height30 and position-10/10 remain unchanged. Frame stays
80 ×50. Uncheck afterward. This verifies visual clipping versus geometric resizing
for a single overflowing text child, not selection/hit-testing or export clipping.

Evidence: [off screenshot](../evidence/layout-details/01-clip-off.png),
[on state](../evidence/layout-details/02-clip-on.txt),
[on screenshot](../evidence/layout-details/02-clip-on.png),
[child geometry](../evidence/layout-details/03-clipped-child.txt).

## LD02 — Individual padding and compound field values

Click Individual padding. Four fields appear in order Left, Right, Top, Bottom,
each10; Left receives focus. Set Left30 and Top20, keeping Right/Bottom10.
Parent height becomes60, child stays100 ×30 but moves to0/20. Collapse Individual
padding: Horizontal padding displays `30, 10`; Vertical padding displays `20, 10`.
The single-object asymmetry is represented as ordered values rather than Mixed.

Enter `12, 24` in the collapsed Horizontal padding field and Enter, then expand.
The four values shown are12,24,20,10. The first two accessible labels still say
Horizontal/Vertical padding in this immediate capture, rather than Left/Right.
This proves pair input acceptance and retention of the other pair, but the
freshly named left/right mapping was not independently revalidated. A later
attempt to repeat that check timed out before any confirmed value change.

Collapse again, enter10 in each composite padding field. Final expanded inspection
shows Left/Right/Top/Bottom all10; scalar entry restores symmetry.

Evidence: [expanded](../evidence/layout-details/04-individual-padding.txt),
[asymmetric parent](../evidence/layout-details/05-asymmetric-parent.txt),
[child](../evidence/layout-details/06-asymmetric-child.txt),
[collapsed pairs](../evidence/layout-details/07-collapsed-asymmetric.txt),
[pair input](../evidence/layout-details/08-pair-input.txt),
[restored four sides](../evidence/layout-details/15-restored-sides.txt).

## LD03 — Advanced settings inventory

Auto layout settings opens a floating dialog containing:

- Inside stroke: Included in this fixture; menu offers Included/Excluded.
- Canvas stacking: Last on top.
- Align text baseline: Disabled/Enabled radios, Disabled selected.
- Auto spacing: Between, disabled in this single-child context.
- Layout: Updated, plus More info.
- Preview and Close.

Only Inside stroke was exercised below. Other controls are inventory, not proven
behavior. [Dialog](../evidence/layout-details/09-advanced-settings.txt),
[screenshot](../evidence/layout-details/09-advanced-settings.png).

## LD04 — Inside stroke participates in layout when Included

Close settings; Add stroke creates a black100% Inside stroke, weight1. Close its
color picker. Parent Hug height increases50→52. Set Stroke weight10: height70.
Open Auto layout settings and change Inside stroke to Excluded: height50 while
the10-wide stroke remains present. Child remains100 ×30 at-10/10.

Change back to Included and inspect the child: it remains100 ×30 but Y becomes20
(X remains-10). With vertical padding10 and child height30, the70 parent height
is consistent with adding two10-wide inside-stroke contributions. Do not generalize
this exact geometry to Center/Outside/unequal strokes without testing them.

Evidence: [stroke1](../evidence/layout-details/10-stroke1.txt),
[stroke10 Included](../evidence/layout-details/11-stroke10-included.txt),
[Excluded](../evidence/layout-details/12-stroke10-excluded.txt),
[Excluded child](../evidence/layout-details/13-excluded-child.txt),
[Included child](../evidence/layout-details/14-included-child.txt).

## Final state / open

Remove the stroke row after restoring Included. Parent returns80 ×50; all four
padding values10, Clip off, center alignment, gap10. Padding collapsed, parent
selected. The final repeat attempt for pair labels caused no confirmed edit;
last state still shows the two collapsed values10 and height50.
[Restored](../evidence/layout-details/16-restored.txt),
[screenshot](../evidence/layout-details/16-restored.png),
[last verification](../evidence/layout-details/18-final.txt).

Open: pair-field label mapping after remount, negative padding/gaps, linked
padding controls, stacking overlaps, baseline alignment, automatic spacing,
legacy/updated layout differences, stroke alignment variants and layout Undo.
