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
