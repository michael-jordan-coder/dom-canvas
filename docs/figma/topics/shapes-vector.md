# Primitive shapes and vector editing context

Observed2026-10-13, Chrome light UI, canvas40%. Shapes are created in the approved
Page2 Section1 fixture. Shape tools → choose shape → single-click canvas center
created100 ×100 Rectangle/Ellipse/Polygon/Star in this session. The observed
D9D9D9 Fill and sizes are session results, not guaranteed reset defaults.

## SV01 — Rectangle has a shape-specific header

Rectangle1 (`18:75`) at127/189 relative to Section1 has a Rectangle heading,
Create component, Use as mask, Boolean operations and Edit object. Position
includes alignment, X/Y, rotation/flip. Layout only has dimensions and aspect lock;
there is no Flow, Auto layout or Clip content. Appearance has opacity/blend,
corner radius, individual corners and smoothing; Fill/Stroke/Effects/Export follow.

[Rectangle panel](../evidence/shapes-vector/01-rectangle.txt).

## SV02 — Edit object is a different inspector mode

Click Edit object. Visible heading becomes Vector, while its accessible name
temporarily remains Rectangle. Object dimensions, rotation and the Appearance
section disappear; alignment, X/Y, Mirroring and Corner radius precede Fill/Stroke.
No Effects/Export are shown in this edit-mode snapshot. With no point selection,
X/Y are blank and disabled. Mirroring has No mirroring (selected), Mirror angle,
Mirror angle and length. A separate Vector editing toolbar exposes Move, Lasso,
Paint, Bend, Cut, Erase, More and Close.

Main menu → Edit → Select all selects the points: X/Y become enabled and Mixed.
Set Corner radius10 and Enter. Close through the Vector editing toolbar. Visible
object heading now says Vector path; bounds remain100 ×100 at127/189. Corner
radius10 persists, and the individual-corners toggle/fields are no longer present.
The layer retains the name Rectangle1; layer name and actual visible type differ.

This experiment changes radius on all selected points. Single-point coordinates,
handles and topology editing were not tested. Do not infer those interactions from
the toolbar inventory or Mixed fields.

Evidence: [edit mode](../evidence/shapes-vector/02-edit-object.txt),
[edit screenshot](../evidence/shapes-vector/02-edit-object.png),
[all points](../evidence/shapes-vector/03-vector-select-all.txt),
[radius10](../evidence/shapes-vector/04-vector-radius10.txt),
[after Close](../evidence/shapes-vector/05-after-edit.txt),
[after screenshot](../evidence/shapes-vector/05-after-edit.png).

## SV03 — Ellipse disables corners

Create Ellipse through Shape tools. Its visible type is Ellipse; standard shape
Position/Layout/paint sections remain, but Corner radius0 is disabled and there
are no individual corners or smoothing controls in this captured state. No Arc
controls appeared in this ordinary selection panel; that does not prove Arc is
unsupported. Canvas arc handles and any contextual arc panel remain open.
Move Ellipse1 to240/50 relative to Section1, retaining100 ×100.

Evidence: [Ellipse](../evidence/shapes-vector/06-ellipse.txt),
[positioned](../evidence/shapes-vector/07-ellipse-positioned.txt).

### Measured disabled radius input

DOM disabled=true, aria-disabled absent,63 ×24 CSS px, font11px/16px weight450,
foreground rgba(0,0,0,.3), opacity1, cursor default, radius2px. Its immediate parent
is63 ×24, transparent, radius0. This distinguishes reduced text color from lowering
the entire input's opacity. The immediate parent is not necessarily the visual
field wrapper; do not apply these parent values to the entire control.
[Raw metrics](../evidence/shapes-vector/13-ellipse-disabled-metrics.json).

## SV04 — Polygon and Star add geometric parameters

Polygon1 initially exposes Count3 below radius/smoothing. Set Count6 and Enter;
the rendered shape becomes a hexagon and bounds remain100 ×100. Move it to10/200.
Star1 initially exposes Count5 and Ratio38.2%. Set Count7, Ratio50%, Enter for
each. Both values persist with100 ×100 bounds; move it to240/200.

These parameters belong to the selected shape type, not a shared frame layout
section. Both retain editable corner radius/smoothing; individual rectangle corner
controls are absent. Parameter limits and invalid values were not tested.

Evidence: [Polygon initial](../evidence/shapes-vector/08-polygon.txt),
[Count6](../evidence/shapes-vector/09-polygon-six.txt),
[hexagon screenshot](../evidence/shapes-vector/09-polygon-six.png),
[Star initial](../evidence/shapes-vector/10-star.txt),
[Star edit](../evidence/shapes-vector/11-star-edited.txt),
[Star screenshot](../evidence/shapes-vector/11-star-edited.png).

## SV05 — Line attempt is not completed coverage

Choose Line and single-click canvas. No Line layer is created; selected Star
inspector remains. The shape-tool icon visually becomes Line, despite the toolbar's
stale Rectangle accessible name. The action did not provide a Line inspector.
Return to Move. Line/Arrow creation and endpoint/cap controls remain open.
[Attempt snapshot](../evidence/shapes-vector/12-line.txt).

## Retained fixture

All four shape layers are inside Section1 (`18:74`), alongside Frame5:

| ID / layer name | Current visible type | X/Y relative | Size / parameters |
| --- | --- | --- | --- |
| 18:75 Rectangle1 | Vector path | 127/189 | 100 ×100, radius10 |
| 18:77 Ellipse1 | Ellipse | 240/50 | 100 ×100 |
| 18:78 Polygon1 | Polygon | 10/200 | 100 ×100, Count6 |
| 18:79 Star1 | Star | 240/200 | 100 ×100, Count7, Ratio50% |

FillD9D9D9; Star selected, Move active, vector editor closed. Section remains
350 ×325 at400/0; no additional Resize to fit was performed after adding shapes.
Evidence: [final state](../evidence/shapes-vector/14-final-star.txt),
[final screenshot](../evidence/shapes-vector/14-final-star.png),
[DOM layer IDs](../evidence/shapes-vector/14-layer-ids.json).

Open: Line/Arrow, Ellipse Arc, individual vector points and handles, boolean
operations, parameter boundaries, shape-specific Stroke behavior, Undo/Redo,
multi-shape Mixed parameters, and focus/hover UI measurements beyond the disabled field.
