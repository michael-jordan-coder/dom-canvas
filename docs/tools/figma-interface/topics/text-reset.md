# Text property reset, history and multiline inheritance

Observed2026-10-13, Untitled Page2, light Chrome UI750×893,69% zoom.
Starts from [Text property](text-property.md): instance15:62 Research label
Updated label overrides sourcePanel label; Research visibleTrue, direct blue
Panel color Fill and1xPNG export.

## TR01 — Named reset and history

Instance More actions → Reset specific changes exposes Reset "Research label"
alongside Reset exports/fill/size. Select the named text reset: field returns
Panel label. Main menu → Edit → Undo restores Updated label; Redo restores
Panel label. No selection change intervenes in this history test. The instance
keeps BooleanTrue, blue variable Fill,200×125 geometry and1xPNG export.

Evidence: [reset menu](../evidence/text-reset/01-menu.txt),
[reset](../evidence/text-reset/02-reset.txt),
[Undo](../evidence/text-reset/03-undo.txt),
[Redo](../evidence/text-reset/04-redo.txt).

## TR02 — Source update after reset

Select component set, click Research label ・Panel label, Escape unchanged inline
name editor, then Edit property. Dialog Edit text property has Name and an
unlabelled Value textbox plus Close. Set Value to First line\nSecond line
(actual newline), close and select instance. Instance field inherits both lines;
screenshot confirms both lines rendered. Source Layers text also changes.

Select source text via its current accessible name Text (visible text differs).
Panel reports Auto width and67×30, position20/30. Earlier Panel label baseline
was62×15. Frame itself stays200×125. This verifies source text reflow and rendered
instance inheritance; instance child dimensions were not separately measured.

Evidence: [editor](../evidence/text-reset/05-editor.txt),
[inherited value](../evidence/text-reset/06-inherited-multiline.txt),
[rendering](../evidence/text-reset/06-inherited-multiline.png),
[source geometry](../evidence/text-reset/07-source-geometry.txt).

## TR03 — Go to property and editor UI

From the bound source text, Go to property opens Edit text property directly.
The Value textarea measures136×40 CSSpx, font11px/450, line-height16px,
padding3px7px, radius5px, background245/245/245, border1px solid245/245/245.
This is the captured two-line value state. Compare instance textarea88×40 in
[text-property](text-property.md); both measurements depend on captured context.

Evidence: [Go to property](../evidence/text-reset/08-go-to-property.txt),
[computed CSS](../evidence/text-reset/08-editor-css.json).

## Restoration and limits

Set source Value back to Panel label, close and select instance. It follows
Panel label, confirming continued default following after reset and the temporary
multiline update. Screenshot saved. Text overrideUpdated label is intentionally
cleared by the tested reset. BooleanTrue, blue binding,1xPNG and frame geometry
retained; instance selected69%. No Page1 change.

Evidence: [restored instance](../evidence/text-reset/09-restored.txt),
[screenshot](../evidence/text-reset/09-restored.png).

Two early clicks using source name Panel label timed out; later DOM explicitly
showed row/gridcell Text with visible First line Second line. Do not infer that
visible layer text always equals its accessible name, or a failed click means the
layer is not selectable. The set route continued the experiment successfully.

Remaining: source edits while an unequal override remains, empty string,
Enter/Escape/default editor cancellation, detach, multiple bound text layers,
mixed instances, String variables and full control state matrix.
