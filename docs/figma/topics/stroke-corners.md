# Stroke and corner context

Observed 2026-10-13, Chrome light UI, Frame 1, 150 × 125, Page 2.

## ST01 — Adding a stroke

Add stroke creates a black000000 alpha100 stroke, Inside alignment, weight1 in
this fixture, and opens the Color picker. The section's add action becomes
Add stroke fill. Closing the picker leaves the stroke row and geometry controls.
[Evidence](../evidence/stroke-corners/01-add-stroke.txt).

## ST02 — Advanced controls and dependent availability

Advanced stroke settings opens a dialog with Stroke Type Basic/Dynamic/Brush;
Style Solid; Width profile Uniform; disabled Flip width points; Join Miter/Bevel/
Round; Miter angle28.96°. This frame context exposes no endpoint cap controls in
Basic Solid; open vector paths need a separate experiment.

Style menu offers Solid, Dashed, Custom. Selecting Dashed exposes Dash2, Gap with
placeholder2, and No dash cap / square / round. Width profile becomes disabled.
Join and Miter angle remain available. No claim is made about Dynamic or Brush
behavior from their presence alone.

Evidence: [advanced](../evidence/stroke-corners/02-advanced.txt),
[styles](../evidence/stroke-corners/03-style-menu.txt),
[dashed state](../evidence/stroke-corners/04-dashed.txt),
[screenshot](../evidence/stroke-corners/04-dashed.png).

## ST03 — Per-side editor

Individual strokes opens a menu with All, Top, Bottom, Left, Right and Custom.
Select Custom: four additional Stroke width textboxes appear, initially1 each,
while the main Stroke weight field remains. Accessibility names do not identify
sides, so do not map the four controls by guessed DOM order; inspect icons/tooltips
and edit individual sides in a follow-up. The stroke was removed via its black
paint row's Remove; the white Fill remained.

Evidence: [menu](../evidence/stroke-corners/05-individual-menu.txt),
[custom fields](../evidence/stroke-corners/06-custom-sides.txt),
[screenshot](../evidence/stroke-corners/06-custom-sides.png).

## CR01 — Mixed within a single object

Individual corners expands four explicitly named corner inputs and exposes
Corner smoothing. Set Top left corner radius12, Enter: the main Corner radius
field reads Mixed, while the four values are12/0/0/0. Mixed therefore represents
subproperties of one selected object as well as multiple object selections.

Corner smoothing opens a dialog containing a slider, a 0% textbox, and an iOS
label. Its value was not changed. Close it, set the main Corner radius to0 and
Enter: all four corner fields become0, with the expanded editor still visible.

Evidence: [expanded](../evidence/stroke-corners/07-individual-corners.txt),
[mixed](../evidence/stroke-corners/08-mixed-corners.txt),
[smoothing](../evidence/stroke-corners/09-smoothing.txt),
[screenshot](../evidence/stroke-corners/09-smoothing.png),
[reset](../evidence/stroke-corners/10-radius-reset.txt).

## Remaining coverage

Stroke align changes/geometry; per-side value mapping; multiple stroke paints;
Custom dash arrays; Dynamic/Brush; joins/caps and profiles on open paths;
stroke scaling and transforms; history/cancellation; actual smoothing values
and path rendering; individual radius clamping; exact wrapper/icon/popup CSS,
hover/focus and multi-selection. Final Frame 1 has white Fill, no stroke/effects,
and all radii0. This is partial research, not implementation parity.
