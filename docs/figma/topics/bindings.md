# Styles and variables — binding entry points

Observed 2026-10-13, Chrome light UI, instance15:62 of Frame2, Variant2.

## BI01 — Shared color picker, different initial tab

Fill, Apply styles and variables opens Color picker on Libraries. This differs
from clicking a raw swatch, which opened Custom in the earlier paint experiment.
Libraries exposes Search, Variable set (All libraries), Show as list, and grouped
library entries. This does not prove search/filter behavior beyond availability.
[Evidence](../evidence/bindings/01-fill-binding.txt).

New style or variable opens a second dialog, Variable and style creation, with
Style and Variable tabs. Style contains Name, Description, Properties paint rows
and Create style. [Creation dialog](../evidence/bindings/02-new-menu.txt).

## BI02 — Create and apply a local style

Create `Research / Panel white` from the current white Fill. The resulting name
is displayed as Research/Panel white. The instance's Fill section replaces its
editable paint rows with a named style button and Remove. The Libraries tab also
shows the new local style grouped under Research. Close retains the binding.
This local test style was not published to any library.

Evidence: [created](../evidence/bindings/03-created-style.txt),
[linked panel](../evidence/bindings/04-linked-panel.txt),
[screenshot](../evidence/bindings/04-linked-panel.png).

## BI03 — Remove is not detach-and-preserve

Click Remove beside the linked style. The Fill section becomes empty, exposing
Add fill; it does not retain an editable white paint row. In this instance's More
actions menu, Reset fill and Push changes to main component become available.
Choose Reset fill: the raw FFFFFF alpha100 row returns. No push was performed.

Evidence: [removed](../evidence/bindings/05-remove-style.txt),
[context reset menu](../evidence/bindings/06-reset-fill-menu.txt),
[restored](../evidence/bindings/07-reset-fill.txt).

## Remaining coverage and state

Variable creation/binding, modes, aliases, scoped availability, actual search,
style editing/propagation, detach preserving values, mixed bindings, text/effect
styles and exact UI measurements remain open. The instance ends with its original
white raw Fill; the reusable local style Research/Panel white remains in the file.
A browser connection changed during the experiment; it was reconnected to the
same existing tab without reloading. This is not a Figma behavior observation.


## BI04 — Color variable differs from style binding

Open the creation dialog and select Variable: Name defaults to Color; Value is
white with alpha100; Create variable is available. Create Research/Panel color.
The selected instance's Fill retains a paint row with visibility and Remove, but
the color fields become a named Color Variable button. In contrast, BI02's style
binding replaced the section's paint rows with one style reference.

Variables opens a full manager view with Variable collection, Research group,
Name/Value table, New variable mode, Edit variable and Create variable. Modes were
not created. Enter3366FF into Panel color's value, commit with Enter, and return
via File: the bound panel now reports #36F ·100%. This verifies source-value
propagation to the instance's binding display. The screenshot captures the result.

A connection interruption left3366FF in the input while its swatch still reported
FFFFFF. After reconnecting, Enter committed it before returning to the panel.
The pre-interruption draft is not proof of a committed source value.

Evidence: [create dialog](../evidence/bindings/08-variable-create-dialog.txt),
[created](../evidence/bindings/09-variable-created.txt),
[bound panel](../evidence/bindings/10-variable-panel.txt),
[bound UI](../evidence/bindings/10-variable-panel.png),
[manager](../evidence/bindings/11-variable-manager.txt),
[updated panel](../evidence/bindings/13-variable-blue-panel.txt),
[screenshot](../evidence/bindings/13-variable-blue.png).

Retained local variable Research/Panel color=3366FF is bound to instance15:62.
The previous raw-white fixture state is superseded. No library publication.
Alias/mode switching, scope filtering, detach and Undo remain open.
