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


## CO04 — Instance insertion route, still unverified

Right-click Default in Layers: captured context menu includes Copy but no direct
Create instance entry. Copy followed by paste from the Move button did not produce
an instance panel in the observed result; creation is not established.

Assets → Created in this file exposes one local component card, Frame2, explicitly
marked Includes2 variants. Its UI instructs Enter/Space to insert and Cmd+Enter to
view details. Role-based press and double-click on the card timed out; clicking
its text did not reveal instance controls. The live tab remained present and DOM
snapshots remained readable. This is a control-path limitation, not a Figma product
rule or a missing-account entitlement. Do not retry blind pastes or count an
instance as created. Next attempt should inspect the rendered card with native
Computer Use and verify insertion through the instance header/node.

Evidence: [context menu](../evidence/components/11-main-context-menu.txt),
[paste result](../evidence/components/12-copy-paste-result.txt),
[Assets](../evidence/components/13-assets.txt),
[current card state](../evidence/components/14-instance-attempt-current.txt),
[text-click result](../evidence/components/15-asset-details.txt).


## CO05 — Native inspection reveals the Details overlay

Native Chrome initially targeted a different user window. Window → Untitled –
Figma selected the research window. Its native accessibility tree and screenshot
showed a Details overlay for Frame2, Includes2 variants, Insert instance, Property1
Default and disabled Reset properties. This overlay was absent from the preceding
browser DOM snapshots. Consequently CO04's no-visible-result must not be read as
proof the asset Details overlay never opened.

Native AX click on Insert instance produced no verified instance header. A fresh
screenshot still showed the overlay. Coordinate activation of its visible button
then failed with noWindowsAvailable. Browser snapshots remained readable but still
did not represent the native Details overlay. Insertion remains unverified.

Evidence: [native post-click diff](../evidence/components/16-native-insert.txt),
[browser after attempt](../evidence/components/17-after-native-attempt.txt).
The native screenshot was viewed during the experiment but not saved as a durable
file; do not treat this paragraph as a pixel-measurement record. Next insertion
attempt requires a fresh rendered/native state before any mutation. Native/DOM
agreement is now an explicit verification requirement for this overlay.


## CO06 — Instance verified, width reset and variant switch

On the next fresh native AX observation the selected node was15:62 with an
instance header. Browser DOM independently agreed. Thus insertion ultimately
succeeded after CO05; exact timing and which pending action completed it are not
established. Do not repeat insertion. The instance starts at -163/-67,200 ×125.

Instance header exposes Frame2, More actions, From this file, Property1=Default
and Apply variable. Compared with the main variant, Layout lacks the Flow
selector and Toggle auto layout in this fixture. Width/height and Clip content
remain. More actions exposes Create component, Detach instance, Reset instance,
Reset specific changes, dev status and Use as mask.

Set Width260, Enter, then More actions → Reset instance. Width returns200 while
height stays125. This verifies the width override/reset path only, not reset
semantics for every property or nested layer. Open Property1 and select Variant2:
the instance property updates to Variant2. The two fixtures look identical, so
this proves property switching, not a visible style difference between variants.

Evidence: [verified instance](../evidence/components/18-instance-verified.txt),
[width override/menu](../evidence/components/19-instance-override-menu.txt),
[reset](../evidence/components/20-reset-instance.txt),
[variant switch](../evidence/components/22-instance-switched.txt),
[screenshot](../evidence/components/22-instance.png).

Retained instance15:62 selects Variant2 at200 ×125. Remaining: source-to-instance
propagation, nested/partial overrides, Reset specific changes, detach, component
properties beyond variants, style/variable interactions and detailed UI metrics.
