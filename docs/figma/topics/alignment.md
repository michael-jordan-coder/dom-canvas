# Multi-selection alignment, distribution and spacing

Observed2026-10-13, Chrome light UI, approved Page2. Three equal100 ×100 shapes
inside Section1: Polygon18:78 at10/200, Ellipse18:77 at240/50, Star18:79 at240/200.
No effects, all D9D9D9 Fill100%. Coordinates below are relative to Section1.

## AL01 — Left alignment uses selection edge in this context

Select Ellipse1 in Layers, Shift-click Star1 to include the contiguous Polygon1
row. Header3 selected; X/Y eventually both Mixed; Width/Height100; horizontal
and vertical spacing both Mixed. The first immediate snapshot still contained
Ellipse X240/Y50 and disabled corners under the new3-selected header; a later
snapshot resolves to Mixed and the correct combined controls. Treat this as a
transient observation, not an atomic guarantee for the DOM snapshot API.

Click Align left: shared X10, Y Mixed, Width/Height100. This matches the selected
objects' minimum X, not Section's left boundary0. Main menu → Edit → Undo once,
without intervening layer selections, restores Mixed X. Subsequent distribution
retains endpoint X10/240, corroborating restoration. Unequal sizes, other parent
types and single-child alignment need separate cases.

Evidence: [immediate selection](../evidence/alignment/01-three-before.txt),
[settled selection](../evidence/alignment/02-three-settled.txt),
[aligned](../evidence/alignment/03-align-left.txt),
[Undo](../evidence/alignment/04-undo-left.txt).

## AL02 — Horizontal distribution and contextual spacing fields

Alignment → More actions offers Tidy up, Distribute vertical spacing and
Distribute horizontal spacing. Choose the latter, then Zoom to selection
(canvas43%). Inspect each layer individually:

| Shape | Before X/Y | After distribution X/Y |
| --- | --- | --- |
| Polygon | 10/200 | 10/200 |
| Ellipse | 240/50 | 125/50 |
| Star | 240/200 | 240/200 |

With100-wide shapes, the resulting horizontal edge gaps are15 and15. Y positions
remain unchanged. Despite equal horizontal edge gaps, the three-selection panel
still shows horizontal and vertical spacing Mixed in this non-row arrangement.
The coincident starting X240 shapes end with Star on the right; no general
ordering rule is inferred from this tie case.

Evidence: [menu](../evidence/alignment/05-distribution-menu.txt),
[distributed panel](../evidence/alignment/06-distributed.txt),
[screenshot](../evidence/alignment/06-distributed.png),
[individual Star](../evidence/alignment/07-Star-1.txt),
[Polygon](../evidence/alignment/07-Polygon-1.txt),
[Ellipse](../evidence/alignment/07-Ellipse-1.txt).

## AL03 — Same-row alignment exposes one spacing value

After individual inspection ends on Ellipse, Shift-click Star to reselect all3.
Click Align top: shared Y50, X Mixed. Horizontal spacing becomes15 and the
Vertical spacing field disappears. Enter20 in Horizontal spacing and Enter:
Polygon10/50, Ellipse130/50, Star250/50. Each remains100 ×100. This edit anchors
the leftmost object and increases the row extent by10 in this case; it does not
hold both outer edges fixed like the preceding distribution command.

Evidence: [top aligned](../evidence/alignment/08-align-top.txt),
[spacing20](../evidence/alignment/09-spacing20.txt),
[screenshot](../evidence/alignment/09-spacing20.png),
[individual Polygon](../evidence/alignment/10-Polygon-1.txt),
[Ellipse](../evidence/alignment/10-Ellipse-1.txt),
[Star](../evidence/alignment/10-Star-1.txt).

## Restoration and open coverage

Explicitly restore each original X/Y through its Position fields, then verify
individually. Star240/200, Polygon10/200, Ellipse240/50; all100 ×100, no effects.
Ellipse selected, canvas43%, no dialog. Restoration used explicit edits rather
than traversing selection history with Undo.

Evidence: [Star](../evidence/alignment/11-restored-Star-1.txt),
[Polygon](../evidence/alignment/11-restored-Polygon-1.txt),
[Ellipse](../evidence/alignment/11-restored-Ellipse-1.txt),
[screenshot](../evidence/alignment/11-restored.png).

Open: remaining alignment directions/centers, unequal bounds, locked/hidden or
nested selections, vertical distribution, Tidy up, negative spacing, row/column
reordering, rotated objects, key-object behavior if available, spacing transaction
Undo/Redo, UI hover/focus and disabled metrics. No broad parity claim follows
from these three equal-size shapes.
