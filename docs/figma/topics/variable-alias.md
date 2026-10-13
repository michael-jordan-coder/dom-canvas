# Color variable alias creation and source propagation

Observed2026-10-13, Chrome light UI. Local Variable collection contains
Research/Panel color with Mode1=3366FF, Mode2=22AA66; instance15:62 binds directly
to Panel color in Auto(Mode1). No alias was initially present.

## VA01 — Create a second color variable

Variables → Create variable offers Color, Number, String, Boolean, Timing and
Easing (inventory; only Color selected). Color adds a new row within Research,
whiteFFFFFF in both modes and an active name field. Rename to Panel alias.
The accessible row/rowheader name initially remains Color while visible text
correctly says Panel alias. [Created row](../evidence/variable-alias/01-created.txt).
A right-click attempt on its first value cell timed out; no context menu was
established. The supported picker route below succeeded.

## VA02 — Picker Libraries creates a reference, not a raw copied hex

Open the alias row's first-mode white swatch using Enter. Color picker starts
Custom; switch Libraries and search Panel color. Search results show Research /
Panel color. A previously available Show as list control is absent after this
search; do not target that stale control. Click the result within Color picker.

The picker closes. An immediate capture still showed raw white controls, but a
later settled snapshot replaces the first-mode controls with a named variable
pill: Research/Panel color, value#3366FF. Mode2 remains rawFFFFFF. This case creates
an alias in only Mode1; it does not automatically bind every mode.

Evidence: [search](../evidence/variable-alias/02-search.txt),
[settled alias](../evidence/variable-alias/03-alias-created.txt).

## VA03 — Source edits update the alias swatch

Edit Panel color Mode1 from3366FF toAA3355, Enter. The alias retains the source
name, while its swatch turns the same red as the source. Read-only computed CSS
on the alias swatch reports rgb(170,51,85),16 ×16. This resolves the stale pill
accessible name that can still say#3366FF after the source changes. The screenshot
shows both values; the exact color claim comes from the computed CSS measurement.

Evidence: [source edit](../evidence/variable-alias/04-source-change.txt),
[settled state](../evidence/variable-alias/05-source-settled.txt),
[screenshot](../evidence/variable-alias/05-source.png),
[computed alias paint](../evidence/variable-alias/06-alias-paint.json).

## Restoration and retained fixture

Restore source Mode1 to3366FF and Enter. Return via File. Existing instance still
uses its original direct Panel color binding; no object was rebound to the alias.
The new Research/Panel alias is retained: Mode1 references Research/Panel color;
Mode2 is rawFFFFFF. Source Mode2 remains22AA66. Manager closed, instance selected,
canvas69%, original geometry and export preset.

Evidence: [source restored](../evidence/variable-alias/07-source-restored.txt),
[instance](../evidence/variable-alias/08-instance-restored.txt),
[screenshot](../evidence/variable-alias/08-instance.png).

Open: bind an object to alias and switch modes; nested/cross-collection aliases,
cyclic-reference prevention, alias detach, source removal, type/scope filtering,
mode inheritance, history and complete editor UI measurements. Creating a named
reference and measuring one propagated color does not prove all those behaviors.
