# Text property detach, history and rebind

Observed2026-10-13, light Chrome750×893,69% zoom, approved Untitled Page2.
Starts with source text24:128 bound to Research label=Panel label, instance15:62
following that default. See [reset](text-reset.md).

## TD01 — Detach is a binding change

Select source Layers gridcell Text (visible Panel label). Detach property replaces
Research label/Go to property/Detach property with an editable content textbox
Panel label and Apply variable/property. Text remains62×15 Auto width at20/30.
Immediate single Undo restores binding controls; Redo restores unbound textbox.
No selection changes intervene in those history transactions.

Evidence: [bound](../evidence/text-detach/01-bound.txt),
[detached](../evidence/text-detach/02-detached.txt),
[Undo](../evidence/text-detach/03-undo.txt),
[Redo](../evidence/text-detach/04-redo.txt).

## TD02 — Definition and instance context after detach

Select instance15:62: Research label field is absent, BooleanResearch visible=True
remains. Screenshot retains rendered Panel label. Select component set: Research
label ・Panel label definition still exists, now with Not used within component.
Therefore this action removed the layer binding without deleting its definition.
Only one layer used this property; multi-binding cases remain open.

Evidence: [instance](../evidence/text-detach/05-instance.txt),
[screenshot](../evidence/text-detach/05-instance.png),
[unused definition](../evidence/text-detach/06-unused-definition.txt).

## TD03 — Independence followed by rebind

Edit unused definition Value to Rebound label, close. Source text still shows
Panel label in its unbound content textbox. Open that textbox's binding picker:
Properties in Frame2 offers Research label with valueRebound label. Select it.
Source is bound again; instance field reappears with Rebound label and screenshot
renders that value. Binding adopted the property's current default in this case.

Evidence: [changed definition](../evidence/text-detach/07-new-default.txt),
[independent layer](../evidence/text-detach/08-independent-text.txt),
[picker](../evidence/text-detach/09-picker.txt),
[bound source](../evidence/text-detach/10-rebound-source.txt),
[instance](../evidence/text-detach/11-rebound-instance.txt),
[rendering](../evidence/text-detach/11-rebound-instance.png).

## Restoration and gaps

Source Go to property →ValuePanel label→Close, select instance. Both follow
Panel label again. Retain binding, BooleanTrue,bluePanel color,1xPNG,200×125 at
−163/−67. Instance selected69%, no dialog. Page1 untouched.

Evidence: [restored](../evidence/text-detach/12-restored.txt),
[screenshot](../evidence/text-detach/12-restored.png).

Open: detach with differing instance text overrides, multiple bound layers,
property deletion, rebind history, binding to String variables and mixed contexts.
Visual evidence here establishes control replacement and warning/field presence;
no new CSS state measurements were taken in this pass.
