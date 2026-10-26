# Heterogeneous selection, supported subsets and selection history

Observed2026-10-13, Chrome light UI, canvas40%, Page2 Section1 shapes fixture.
Star1 Count7/Ratio50%, Polygon1 Count6, both100 ×100, sameD9D9D9 Fill.

## MX01 — Mixed values do not hide a partially supported field

Click Star1 in Layers, Shift-click adjacent Polygon1. Header becomes2 selected.
X is Mixed, Y200, Width/Height100, horizontal spacing130, rotation0. Count is
Mixed because the two supported values differ. Ratio50% remains available even
though only the Star supports it. Shared Fill is a normalD9D9D9 paint row.

Enter Count8, then Ratio60%, confirming each with Enter. Inspect each layer:
Star hasCount8/Ratio60%; Polygon hasCount8 and no Ratio control. Thus the shared
Count reaches both while Ratio can be edited through the heterogeneous selection
and reaches the supporting Star. This is a tested supported-subset case, not a
rule inferred solely from control visibility.

Evidence: [two selected](../evidence/mixed-types/01-star-polygon.txt),
[screenshot](../evidence/mixed-types/01-star-polygon.png),
[shared edits](../evidence/mixed-types/02-shared-edits.txt),
[Star](../evidence/mixed-types/03-star.txt),
[Polygon](../evidence/mixed-types/03-polygon.txt).

## MX02 — Undo includes the intervening selection changes

After editing both selected objects, click Star, then Polygon to inspect them.
Invoke **Main menu → Edit → Undo**, once per row below; avoid relying on an
unverified keyboard focus target.

| Action | Resulting selection | Count | Ratio |
| --- | --- | --- | --- |
| Initial after individual inspection | Polygon | 8 | unavailable |
| Undo1 | Star | 8 | 60% |
| Undo2 | Both | 8 | 60% |
| Undo3 | Both | 8 | 50% |
| Undo4 | Both | Mixed | 50% |
| Redo1 | Both | 8 | 50% |
| Redo2 | Both | 8 | 60% |
| Undo twice to restore | Both | Mixed | 50% |

Individual inspection after restoration proves Star7/50% and Polygon6. In this
sequence, two Undo actions first traverse selection changes; it takes further
Undo to restore edited values. An unchanged value after one Undo is therefore
insufficient to diagnose a failed transaction. This finding does not retroactively
prove the cause of every older inconclusive Undo attempt.

Evidence in order: [Undo1](../evidence/mixed-types/04-undo-ratio.txt),
[Undo2](../evidence/mixed-types/05-undo-selection.txt),
[Undo3](../evidence/mixed-types/06-undo-ratio-value.txt),
[Undo4](../evidence/mixed-types/07-undo-count.txt),
[Redo1](../evidence/mixed-types/08-redo-count.txt),
[Redo2](../evidence/mixed-types/09-redo-ratio.txt),
[restore Ratio](../evidence/mixed-types/10-restore-ratio.txt),
[restore Count](../evidence/mixed-types/11-restore-count.txt),
[restored Star](../evidence/mixed-types/12-restored-star.txt),
[restored Polygon](../evidence/mixed-types/12-restored-polygon.txt).
The filename04 reflects the attempted undo of Ratio; its actual result is the
selection change described here.

### Measured Mixed Count

`value="Mixed"`, no placeholder, disabled=false. Input63 ×24 CSS px,
font11px/16px weight450, radius2px, foreground rgba(0,0,0,.898).
Mixed is an actual displayed input value in this control, unlike the empty-value
placeholder used by the inherited Wrap row gap. Do not infer one mechanism from
the other. [Raw metrics](../evidence/mixed-types/11-mixed-count-metrics.json).

## MX03 — Five types expose a union of contextual controls

Click Star1 then Shift-click Frame5 in the same Section. The layer range includes
Star, Polygon, Ellipse, Vector path (named Rectangle1) and Frame5:5 selected.

- X/Y, Width/Height, horizontal/vertical spacing and corners are Mixed.
- Clip content is checked, representing the supporting frame's state.
- Count Mixed and Ratio50% remain available for the supporting shapes.
- Resize to fit and Toggle auto layout also appear; actions were not tested here.
- Fill has no normal paint row and says `Click + to replace mixed content`.
- Selection colors separately listsD9D9D9 andFFFFFF. No replacement was performed.

This inventory contradicts an implementation that only displays the intersection
of properties supported by every selected type. It does not specify the complete
applicability rule for all properties or arbitrary combinations.

Evidence: [five types](../evidence/mixed-types/14-five-types.txt),
[screenshot](../evidence/mixed-types/14-five-types.png).

## MX04 — Clip content applies to the frame within mixed selection

Uncheck shared Clip content, then select Frame5: its Clip content is unchecked.
Undo through the menu once restores the five-object selection, still unchecked;
Undo again restores Clip content checked. This independently repeats the selection
history behavior while proving an edit of a frame-only property from mixed types.

Evidence: [shared off](../evidence/mixed-types/15-shared-clip-off.txt),
[frame off](../evidence/mixed-types/16-frame-clip-off.txt),
[Undo selection](../evidence/mixed-types/17-undo-frame-selection.txt),
[Undo property](../evidence/mixed-types/18-undo-clip.txt),
[restored screenshot](../evidence/mixed-types/18-restored.png).

## Inconclusive / open

A separate attempt to add the top-level long text to Star using Meta-click on its
layer resulted in Page context (no selection). It did not establish an additive
selection shortcut or text+shape inspector behavior.
[Attempt](../evidence/mixed-types/13-star-text-attempt.txt).

Open: text+shape, cross-parent mixed selections, nested ancestor/descendant
selection, mixed sizing modes, multi-paint replacement/restoration, shared opacity,
disabled/locked targets, min/max conflicts, and heterogeneous component instances.
Final state: the five Section children selected; Star7/50%, Polygon6, Frame5 clip
checked, all fixture content otherwise restored.
