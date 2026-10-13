# Multi-child Wrap and direction changes

Observed 2026-10-13 in Chrome, light UI. Uses a separate Page 2 fixture, Frame 4
(`17:68`), preserving the earlier Frame 3. Initial canvas zoom125%; Zoom to
selection changes the rendered zoom to58%. A stale accessible zoom button name
may still say125%; screenshot and visible button text show58%.

## WM01 — Reproducible fixture

1. Select Frame 3 in Layers; use Cmd+D to create Frame 4.
2. Set X500, retain Y-254; set width240, height remains Hug.
3. Expand Frame 4. Select its child, enter width100 to change Fill to Fixed;
   inherited minimum100 remains. Set text fill3366FF for visibility.
4. Duplicate that child twice with Cmd+D. Child nodes in layer order are
   `17:69`, `17:70`, `17:71`. All contain “Text tool comparison”, Inter Regular12,
   width100, Auto height, resulting height30.

Parent has center alignment, padding10, horizontal gap10, Wrap off, clipping off.
Three children in one horizontal row exceed its width240; parent stays height50.
[Initial parent](../evidence/wrap-multi/01-three-horizontal.txt).

## WM02 — Wrap and its inherited row gap

Enable Wrap. Parent becomes240 ×90 Hug. The screenshot shows two children on the
first row and one centered on the second. First child relative position is15/10,
width100, height30. With 20 total horizontal padding, the available width is220;
two100-wide children with gap10 occupy210, centered with5 additional pixels each side.
That arithmetic is an interpretation consistent with the observed positions.

The row-gap input has empty DOM value, placeholder10, disabled=false. It visibly
shows10, and the parent height is consistent with a10-pixel row gap. Blank input
value therefore must not be interpreted as zero or missing layout information.

Evidence: [Wrap state](../evidence/wrap-multi/02-wrap240.txt),
[rendered result](../evidence/wrap-multi/02-wrap240.png),
[input attributes](../evidence/wrap-multi/02-rowgap-dom.json),
[first child](../evidence/wrap-multi/03-wrap240-child-17-69.txt).

## WM03 — Row gap and width threshold

Enter20 in Vertical gap between rows, then Enter. Parent height becomes100;
third child is at70/60. Subsequent parent width edits produce:

| Parent width | Hug height | Arrangement consistent with dimensions |
| --- | --- | --- |
| 240 | 100 | Two children then one |
| 230 | 100 | Two children then one, exactly210 inner width |
| 229 | 150 | Three rows |
| 340 | 50 | One row, exactly320 inner width |

The threshold follows the widths, padding and gap of this fixture; this does not
prove every wrap algorithm, especially with flexible or unequal children.

Evidence: [gap20](../evidence/wrap-multi/04-rowgap20.txt),
[third child](../evidence/wrap-multi/05-third-gap20.txt),
[width230](../evidence/wrap-multi/06-width230.txt),
[width229](../evidence/wrap-multi/06-width229.txt),
[width340](../evidence/wrap-multi/06-width340.txt).

## WM04 — Direction change preserves Wrap and changes gap roles

At340 ×50 horizontal, switch to Vertical. Wrap stays enabled, width stays340
Fixed and height becomes150 Hug. Children form a vertical column; the third
child is at120/110. Main-axis gap is20, cross-axis gap10.

The immediate DOM snapshot names the first gap `Horizontal gap between objects`
(20), and the second `Vertical gap between rows` (10). After Undo/Redo, the second
name is `Horizontal gap between columns`, but the first misleading horizontal
name remains. Rendered icons show vertical spacing20 and horizontal spacing10.
Do not infer physical axes solely from the initial accessibility labels.

Disable Wrap: the secondary gap disappears, height stays150 and primary gap20.
No wrap-to-column threshold was tested because parent height remained Hug.

Evidence: [Vertical](../evidence/wrap-multi/07-vertical.txt),
[rendered icons and column](../evidence/wrap-multi/07-vertical.png),
[Wrap off](../evidence/wrap-multi/08-vertical-nowrap.txt),
[third child](../evidence/wrap-multi/12-vertical-third.txt).

## WM05 — History restores distinct actions

With Wrap just disabled:

1. Cmd+Z restores Wrap checked; Vertical, H150, main gap20 remain.
2. Cmd+Z restores Horizontal, H50, main gap10, secondary gap20, Wrap checked.
3. Cmd+Shift+Z restores Vertical, H150, main gap20, secondary gap10, Wrap checked.

Evidence: [Undo Wrap](../evidence/wrap-multi/09-undo-wrap.txt),
[Undo direction](../evidence/wrap-multi/10-undo-direction.txt),
[Redo direction](../evidence/wrap-multi/11-redo-direction.txt).

## Retained fixture and limitations

Return to Horizontal and width240. Frame 4 remains at500/-254,240 Fixed ×100 Hug,
Wrap enabled, gaps10/20, padding10, centered, clipping off. All three blue text
children are retained for subsequent multi-child/grid testing. Frame 3 and its
original child were not edited in this experiment.
[Final state](../evidence/wrap-multi/13-retained-fixture.txt),
[screenshot](../evidence/wrap-multi/13-retained-fixture.png).

Two test-ID-scoped clicks on the second child timed out despite visible matching
DOM. No second-child position is claimed. Direct role-based selection subsequently
worked. This is an automation observation, not a Figma interaction specification.

Open: unequal/flexible children, vertical wrap with fixed height, automatic gaps,
individual padding, clipping, nested frames, reorder, baseline alignment, input
hover/focus metrics, canvas drag-resize, and more than three children.
