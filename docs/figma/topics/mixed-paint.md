# Mixed Fill replacement, history and multiple paints

Observed2026-10-13, Chrome light UI, canvas40%. Start with five Section1 children
selected: Star/Polygon/Ellipse/Vector path eachD9D9D9 Fill, Frame5 whiteFFFFFF.
All paints fully opaque and visible; object opacity100%.

## MP01 — Add fill replaces the mixed content

The mixed Fill section says `Click + to replace mixed content`, while Selection
colors listsD9D9D9 andFFFFFF. Click Add fill. A sharedD9D9D9,100% paint row replaces
the mixed presentation and Color picker opens. The selected replacement color
matches the four gray shapes in this fixture; the algorithm for choosing it from
arbitrary selections is not established.

In the picker, enter3366FF and Enter. Press Escape from its Color field: picker
closes, shared3366FF remains. Selecting each of the five layers independently
confirms a single3366FF Fill on each. Escape after this committed Enter edit
closes the picker rather than restoring pre-edit paints. This does not establish
cancellation behavior for an uncommitted draft, pointer preview or eyedropper.

Evidence: [before](../evidence/mixed-paint/01-before.txt),
[Add fill](../evidence/mixed-paint/02-add-fill.txt),
[blue](../evidence/mixed-paint/03-common-blue.txt),
[Escape](../evidence/mixed-paint/04-escape.txt),
[Star](../evidence/mixed-paint/05-blue-Star-1.txt),
[Polygon](../evidence/mixed-paint/05-blue-Polygon-1.txt),
[Ellipse](../evidence/mixed-paint/05-blue-Ellipse-1.txt),
[Vector path](../evidence/mixed-paint/05-blue-Rectangle-1.txt),
[Frame](../evidence/mixed-paint/05-blue-Frame-5.txt).

## MP02 — Replacement and recoloring are separate history steps

After individual inspection in Star→Polygon→Ellipse→Vector→Frame order, invoke
Main menu → Edit → Undo repeatedly, recording each result:

| Undo number | Result |
| --- | --- |
| 1–4 | Previous individual selection restored; its Fill stays3366FF |
| 5 | Five-object selection restored, still shared3366FF |
| 6 | Shared color returnsD9D9D9; replacement still applied |
| 7 | Mixed Fill UI returns withD9D9D9 andFFFFFF selection colors |

Inspect all targets again: Frame5 isFFFFFF; all four shapesD9D9D9. This proves
per-target restoration rather than only a Mixed label or an apparently unchanged
canvas. Selection transitions are distinct from paint transactions, consistent
with [mixed-types history](mixed-types.md).

Evidence: [Undo1](../evidence/mixed-paint/06-undo-1.txt),
[2](../evidence/mixed-paint/06-undo-2.txt),
[3](../evidence/mixed-paint/06-undo-3.txt),
[4](../evidence/mixed-paint/06-undo-4.txt),
[5](../evidence/mixed-paint/06-undo-5.txt),
[6](../evidence/mixed-paint/06-undo-6.txt),
[7](../evidence/mixed-paint/06-undo-7.txt).
Individual results: [Frame](../evidence/mixed-paint/07-restored-Frame-5.txt),
[Vector](../evidence/mixed-paint/07-restored-Rectangle-1.txt),
[Ellipse](../evidence/mixed-paint/07-restored-Ellipse-1.txt),
[Polygon](../evidence/mixed-paint/07-restored-Polygon-1.txt),
[Star](../evidence/mixed-paint/07-restored-Star-1.txt).

## MP03 — Multiple Fill rows and independent opacity controls

With Star alone selected, Add fill inserts a new row **above** its existing gray
paint. New row is000000 at20%; old row remainsD9D9D9 at100%. Each has its own
visibility checkbox and Remove button. These are observed session defaults; they
do not prove an invariant new-fill color or opacity in every context.

Set the new row's ColorFF0000 and its Opacity50. Set Appearance Opacity25%:

- Object opacity is25%.
- Top red paint opacity is50%.
- Lower gray paint opacity remains100%.

Restore Appearance Opacity100%, then uncheck top-row Toggle visibility. The red
paint row stays present, retains50%, and only its visibility becomes unchecked;
the lower gray paint remains visible. Click the top-row Remove button: only that
paint disappears. Final Star has one visibleD9D9D9 paint at100%, object opacity100%.

Do not identify opacity inputs only by their repeated accessible name. Scope to
the paint row or Appearance context. The screenshot shows the resulting render,
but no pixel compositing equation was measured in this experiment.

Evidence: [second fill](../evidence/mixed-paint/08-second-fill.txt),
[separate opacities](../evidence/mixed-paint/09-alpha-vs-opacity.txt),
[rendered state](../evidence/mixed-paint/09-alpha-vs-opacity.png),
[hidden top paint](../evidence/mixed-paint/10-hidden-top-fill.txt),
[final single paint](../evidence/mixed-paint/11-restored-star.txt),
[final screenshot](../evidence/mixed-paint/11-restored-star.png).

## Accuracy limits / open

Swatch button and row accessible names sometimes retained previous hex strings
while the actual Color field changed. Use the current field plus rendered state;
do not infer current paint from a stale row name. A right-click on the fill row
focused its opacity input and exposed no reorder menu; it does not establish that
paint reordering is unavailable.

Open: paint reorder, mixed multi-paint arrays, styles/variables during replacement,
gradient/image alpha and cancellation, blend mode compositing, picker live pointer
preview, keyboard navigation across paint rows and detailed row visual states.
All original colors restored; Star selected. No new paints retained.
