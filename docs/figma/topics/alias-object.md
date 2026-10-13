# Object binding to a per-mode alias

Observed2026-10-13, Chrome light UI, instance15:62 Variant2,200 ×125 at-163/-67,
69% zoom. Variable collection: Panel color Mode1=3366FF/Mode2=22AA66;
Panel alias Mode1 references Panel color, Mode2 rawFFFFFF. Initial instance
binds directly to Panel color, Auto(Mode1). See [alias creation](variable-alias.md).

## AO01 — Rebind the existing Fill to the alias

Fill, Apply styles and variables → Libraries → search Panel alias → select its
result. The picker closes and the named Fill reference displays Research/Panel
alias, preserving one visible paint row and Show in exports. In Auto(Mode1), the
reference resolves blue. The immediate accessible button/row names still mention
Panel color; the visible generic text changes to Panel alias. Do not use those
stale role names to deny the rebind.

Evidence: [search](../evidence/alias-object/01-search.txt),
[alias Mode1](../evidence/alias-object/02-alias-mode1.txt).

## AO02 — Explicit Mode2 resolves the alias's own per-mode value

Appearance → Apply variable mode → Variable collection → Mode2. The panel gains
the explicit mode row and Layers badge, while Fill still says Research/Panel alias.
Canvas and swatch become white, matching alias Mode2 rawFFFFFF. They do not become
green from Panel color Mode2. This confirms the tested alias is stored per mode;
Mode1's reference is not applied automatically to Mode2's independent raw value.

Evidence: [Mode2 state](../evidence/alias-object/03-alias-mode2.txt),
[screenshot](../evidence/alias-object/03-alias-mode2.png).

## AO03 — Rebinding preserves the object's explicit mode

While still in Mode2, use the Fill library picker to select Panel color again.
The mode row remains Mode2 and the object turns green (source Mode2=22AA66).
Thus choosing another variable did not clear the object's explicit collection
mode in this case. Set Auto(Mode1) through Apply variable mode: row/badge disappear
and the object returns blue with its direct Panel color binding.

Evidence: [direct Mode2](../evidence/alias-object/04-direct-mode2.txt),
[green screenshot](../evidence/alias-object/04-direct-mode2.png),
[restored Auto](../evidence/alias-object/05-restored.txt),
[restored screenshot](../evidence/alias-object/05-restored.png).

## Final state and open

Instance original direct binding/AutoMode1, geometry, radius0 and1xPNG retained;
selected69%, editor closed. Neither source variable nor alias values were edited
in this pass. Remaining: cross-collection mode resolution, inherited parent mode,
nested alias chains, circular reference guards, detach and override history,
mixed binding edits and exact picker/binding UI states. Screenshots establish
rendered color differences; exact values come from the earlier manager evidence.
