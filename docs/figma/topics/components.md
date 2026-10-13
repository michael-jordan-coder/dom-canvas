# Main component context — initial investigation

Observed 2026-10-13, Chrome light UI, approved Page2. Selected Frame2 was
**200 ×125** in the live baseline, contrary to the older fixture registry's150
width. No width edit was made in this pass. The origin of that drift is unknown;
use the captured live baseline for this experiment.

## CO01 — Convert frame to main component

Click Create component. The frame preset header changes to the component's name
Frame2, with Add variant, Component configuration and More actions. A Properties
area with Create property appears before Position. Geometry remains200 ×125.
Normal Position, Layout, Appearance, Fill, Stroke, Effects, Layout guide and Export
sections remain in the captured panel. Individual corners remained expanded from
the previous object, an observed cross-selection UI state in this session.

Evidence: [baseline](../evidence/components/01-frame-baseline.txt),
[main component](../evidence/components/02-main-component.txt).

## CO02 — Property and configuration entry points

Create property activated with Enter opens Variant, Text, Boolean, Instance swap
and Slot options. An earlier click did not open it; this is an automation caveat.
Choose Boolean: Create property dialog contains Name=Boolean and Value=True
(checked), Create property and Close. Close was used; no property was created.

Component configuration opens a rich Description editor with formatting actions
(bold, italic, strike, header, lists, link, code and code block) and a separate Link
to documentation field. No description or link was edited.

Evidence: [property menu](../evidence/components/04-property-menu-keyboard.txt),
[Boolean dialog](../evidence/components/05-boolean-dialog.txt),
[configuration](../evidence/components/06-configuration.txt),
[screenshot](../evidence/components/06-configuration.png).

## Remaining work and fixture

Retained Frame2 is now a main component,200 ×125, for subsequent instance and
variant experiments. Configuration dialog remains open. Page1 is untouched.
Instance creation, instance panel, overrides/reset/detach, property binding,
variants, slots, nested components, variable integration and all exact component
UI measurements remain open. Menu availability is not verified feature behavior.


## CO03 — Variant versus component-set context

Close configuration and click Add variant. The selected new variant retains
200 ×125 geometry, at relative20/165. Header now includes Multi-edit variants,
Current variant and Select component. A Property1 row shows value Variant2;
the value control's inventory includes Default, Variant2 and Rename.

Select component selects the containing set (URL node15:57). The panel now
shows Properties with Property1 ・Default, Variant2, Add variant, configuration
and More actions. The set is240 ×310 at106/-39, with vertical spacing20,
radius5 and purple9747FF stroke in this generated fixture. These are observed
creation results, not universal component-set defaults.

Click the Property1 row: it becomes an inline textbox containing Property1.
The immediate snapshot still showed the button; a later snapshot showed the
textbox. An attempted keyboard action targeting the old button therefore failed.
This resolves that locator failure as an observed inline-edit transition; it is
not evidence that property editing is unavailable. No rename was committed.

Evidence: [new variant](../evidence/components/07-add-variant.txt),
[set selected](../evidence/components/08-component-set.txt),
[immediate click](../evidence/components/09-variant-property-editor.txt),
[inline editor](../evidence/components/10-property-current.txt),
[screenshot](../evidence/components/10-component-set.png).

Latest retained state: Frame2 is a component set15:57 containing Default and
Variant2. Property-name inline editor is active, unchanged. Instances, swapping,
renaming, override propagation, multi-edit variants and history remain untested.
