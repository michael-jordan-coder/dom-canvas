# Boolean property: created but unbound

Observed 2026-10-13, approved Untitled Page2, Chrome light interface,
750×893 viewport, canvas zoom69%. This case verifies the unbound state only.

## BP01 — Creation and source presentation

Select component set Frame2 (15:57) in Layers. Activate Create property with
Enter, choose Boolean. The dialog starts with Name Boolean and checked True.
Replace Name with Research visible and click the dialog Create property button.
The set now contains a row Research visible ・True and a Not used within component
warning button. Creation does not by itself establish a layer binding.

Evidence: [creation](../evidence/boolean-property/01-create.txt),
[created row](../evidence/boolean-property/02-unused.txt),
[source screenshot](../evidence/boolean-property/02-unused.png).

## BP02 — Existing instance

Select the first Frame2 Layers cell (instance15:62). The captured Design panel
contains Property1=Variant2, but no Research visible property control. Geometry
remains200×125 and direct Research/Panel color Fill remains present.
This verifies absence for this existing instance of Variant2 with an unused
Boolean definition. It does not prove behavior for every unused property type.

Evidence: [instance snapshot](../evidence/boolean-property/03-instance.txt).

## BP03 — Inline naming and UI measurement

Select Variant2, then Select component. Double-click Research visible ・True:
a nested textbox becomes active with Research visible. Escape exits with the
name unchanged. Text-content matching did not locate the INPUT because its value
was not textContent; DOM inspection resolved the correct input. This automation
failure is not a product behavior.

Immediately after Escape the property button measured128×24 CSSpx, font11px,
weight400, line-height16px, padding0, radius5px, foregroundblack and background
rgb(230,230,230). Screenshot shows the focused row and pointer over it; these are
**post-Escape focused/pointer-over values**, not an isolated rest-state token.
Inner icon/text metrics and separate hover/focus measurements remain open.

Evidence: [retained DOM](../evidence/boolean-property/04-retained.txt),
[computed values](../evidence/boolean-property/04-metrics.json),
[screenshot](../evidence/boolean-property/04-retained.png).

## Retained state and remaining work

The set retains one unused Boolean Research visible=True for the next binding
experiment. Set selected; no geometry, fill or instance overrides deliberately
changed. Page1 untouched. Binding to a child, instance toggle, default propagation,
overrides/reset, Undo/Redo, property configuration actions and Text/Instance swap/
Slot properties remain unverified. Enter on the warning produced no observed new
dialog; no conclusion about its click or hover behavior follows.


## BP04 — Visibility binding to a real child

Continuation: browser clipboard copy/paste attempts did not insert a layer. The
virtual clipboard reported no data; keyboard presses on non-focusable Layers
cells also timed out. This is a tooling limitation, not a Figma paste rule.

Alternative performed entirely through UI: select Variant2, focus Move and press
Shift+2, then Rectangle and click the visible canvas center. Layers verifies new
Rectangle2 nested at level2 under Variant2; its initial geometry is100×100 at51/57.
Set X20 and Y20, committing each with Enter. Fill isD9D9D9. Click Appearance's
Apply variable/property. (Enter focused it without opening; pointer click opened.)
The dialog offers Search, Variable set=All libraries, New variable/property and
Properties in Frame2 → Research visible=True. Select Research visible.

Select existing instance15:62. Research visible now appears as a **checked
checkbox**, between Property1 and Position. This closes BP02's unbound-only gap
for this Boolean/Variant2 fixture.

Evidence: [child baseline](../evidence/boolean-property/05-child.txt),
[binding picker](../evidence/boolean-property/06-picker.txt),
[bound child](../evidence/boolean-property/07-bound-child.txt),
[instance on](../evidence/boolean-property/08-instance-on.txt),
[visible child screenshot](../evidence/boolean-property/08-instance-on.png).

## BP05 — Toggle, history and variable picker

Uncheck Research visible. The gray child disappears from the blue instance;
instance dimensions200×125, position−163/−67 and direct Panel color binding remain.
Main menu → Edit → Undo returns the checkbox to checked. Redo returns unchecked.
These are single known visibility transactions; no selection changes intervene.
The screenshots prove the visible on/off difference; Undo/Redo have DOM evidence.

The adjacent Apply variable/property to Research visible button opens a variable
picker reporting No variables or properties available in this fixture. Close it.
No Boolean variable was created. Right-clicking the checkbox exposed no new menu
in the captured snapshot; this is not proof no reset mechanism exists elsewhere.

Check Research visible to restore True. This is a manual value restoration,
**not proof that an override was cleared**.

Evidence: [off](../evidence/boolean-property/09-instance-off.txt),
[off screenshot](../evidence/boolean-property/09-instance-off.png),
[Undo](../evidence/boolean-property/10-undo.txt),
[Redo](../evidence/boolean-property/11-redo.txt),
[variable picker](../evidence/boolean-property/12-instance-variable-picker.txt),
[on restored](../evidence/boolean-property/14-on-retained.txt).

## BP06 — Property visibility depends on the selected variant

With the Boolean=True, switch instance Property1 from Variant2 to Default.
Research visible disappears from the panel. Switch back to Variant2: the checked
control and rendered gray child return. Default has no bound child; both variants
belong to the same set. The field inventory must therefore depend on the selected
variant's usage, not just on the set's list of property definitions.

Evidence: [Default](../evidence/boolean-property/15-default-variant.txt),
[Variant2 restored](../evidence/boolean-property/16-variant-restored.txt),
[final screenshot](../evidence/boolean-property/16-variant-restored.png).

## BP07 — Control structure measurement

While the Boolean was off, DOM/computed inspection measured the checkbox INPUT
at32×16 with opacity0. Its SPAN parent is32×24; the next DIV is88×24. All three
report transparent backgrounds, zero padding and radius0. These are the hidden
input and structural wrappers, **not the painted switch track**. Screenshot
shows the visual pill; track/thumb CSS, hover and focus isolation remain open.

Evidence: [computed structure](../evidence/boolean-property/13-toggle-metrics.json).

## Latest retained fixture and gaps

Supersedes earlier unbound fixture: Rectangle2 remains inside Variant2 at20/20,
100×100, grayD9D9D9, visibility bound to Research visible (defaultTrue). Existing
instance15:62 selects Variant2 and Research visible=True, blue Panel color,
200×125,−163/−67, export1xPNG. Instance selected69%; Page1 untouched.

Remaining: source default changes and override inheritance, per-property reset,
Boolean variables, binding removal, multiple bound children, cross-variant value
retention when unequal, nested instances, Text/Instance swap/Slot, and the full
visual state matrix. No claim of component research completion.
