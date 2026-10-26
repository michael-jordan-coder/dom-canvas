# Boolean default propagation and targeted reset

Observed 2026-10-13, Chrome light UI750×893,69% canvas zoom, Untitled Page2.
Continues [Boolean binding](boolean-property.md). Instance15:62 selects Variant2,
Research visible=True; child Rectangle2 is bound to that property. Instance retains
blue Research/Panel color Fill and1xPNG export. No Page1 edits.

## BD01 — Default change follows prior manual restoration

Select component set Frame2. Click Research visible ・True to enter inline naming,
Escape to leave the name unchanged and expose Edit property. Click Edit property:
Edit boolean property dialog contains Name, Value=True checkbox, and Close.
There is no Save/Apply button in the captured dialog.

Uncheck True, close and select the instance. Research visible is now unchecked.
Thus the manually restored True from the previous experiment did **not prevent**
this source change from propagating. This behavioral result resolves the earlier
uncertainty for this fixture; it does not reveal internal override bookkeeping or
prove that setting any property equal to default always clears an override.

Evidence: [editor](../evidence/boolean-default/01-editor.txt),
[defaultFalse](../evidence/boolean-default/02-false-default.txt),
[instance followsFalse](../evidence/boolean-default/03-instance.txt).

## BD02 — A named reset preserves unrelated overrides

While source defaultFalse, check Research visible on the instance to True.
More actions → Reset specific changes contains Reset exports, Reset fill,
Reset size, and **Reset "Research visible"**. Select that named reset.
The Boolean returnsFalse; Fill remains Research/Panel color, export remains1xPNG,
geometry200×125 at−163/−67. This verifies reset isolation for these other values.
It does not establish all properties covered by other reset categories.

Evidence: [True override](../evidence/boolean-default/04-override-true.txt),
[reset menu](../evidence/boolean-default/05-reset-menu.txt),
[reset result](../evidence/boolean-default/06-reset-false.txt),
[screenshot](../evidence/boolean-default/06-reset-false.png).

## BD03 — Inheritance after reset

Return to source Edit boolean property, check False to setTrue, close and select
instance. Checkbox followsTrue and gray child renders again. Combined with BD02,
this proves the named reset restores subsequent default-following behavior in
this fixture, rather than merely setting a local False once.

Evidence: [sourceTrue](../evidence/boolean-default/07-source-true.txt),
[instanceTrue](../evidence/boolean-default/08-inherited-true.txt),
[rendered child](../evidence/boolean-default/08-inherited-true.png).

## BD04 — Checked switch painted parts

Inspect the checked checkbox's sibling span, not the invisible input. Span bounds
32×16, radius9999px, transparent background. Its ::before paints the track:
computed width30px,height14px,border1px solid rgba(0,0,0,.2), background
rgb(13,153,255), radius9999px. Its ::after paints the white thumb:12×8px,
radius9999px, transform matrix(1,0,0,1,16,0), no shadow. The32×16 rect recorded
for pseudo entries is the originating span rect, **not a pseudo-element rect**.

Declared transitions: track background0.1s cubic-bezier(.645,.045,.355,1),
thumb0.1s ease-out. These are computed CSS declarations, not measured runtime
animation timing or frame evidence. Other switch states remain to be measured.

Evidence: [track/thumb computed CSS](../evidence/boolean-default/09-checked-track.json).

## Retained state and gaps

DefaultTrue, instanceVariant2/True following reset, bound child visible, same
blue binding/export/geometry. Instance selected69%, no dialog open.
Open: reset Undo/Redo, source changes while a differing override remains, binding
removal, mixed Boolean instances, Boolean variables, default editor name changes
and cancellation semantics, and unchecked/hover/focus/disabled switch paint.
