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
