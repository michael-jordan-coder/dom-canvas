# Variable editor and explicit color mode selection

Observed2026-10-13, Chrome light UI, approved local research variable
Research/Panel color in Variable collection, bound to instance15:62. Initial
single mode value3366FF; instanceVariant2,200 ×125 at-163/-67, radius0.

## VM01 — Variable manager and editor inventory

Variables in the navigation rail replaces the design canvas with the manager:
Collections/Groups on the left, searchable/filterable Name/Value table, New
variable mode and Create variable. Edit variable opens Details/Scope tabs.
Details includes Name, Description, per-mode Value and alpha, Code syntax with
Add code syntax, and Hide from publishing. None of those metadata controls was
edited. Scope exposes Show in all supported properties, Fill with Frame/Shape/Text
suboptions, Stroke and Effects, all checked initially. This is inventory only;
no scope filtering behavior is established.

Evidence: [manager](../evidence/variable-editor/01-manager.txt),
[Details](../evidence/variable-editor/02-details.txt),
[Scope](../evidence/variable-editor/03-scope.txt).

## VM02 — Add mode copies the existing value

Close editor. Activate New variable mode: existing Value header now displays
Mode1 and a second column appears with active name textbox Mode2. Its color
initially also3366FF. Commit the name unchanged; edit only second-column value
to22AA66 and Enter. Return via File. Instance still uses the original blue.
The Appearance section now exposes Apply variable mode.

Evidence: [mode creation](../evidence/variable-editor/04-new-mode.txt),
[Mode2 value](../evidence/variable-editor/05-mode2-green.txt).
The second mode is retained locally for subsequent tests; no library publication.

## VM03 — Explicit mode is visible in both panel and Layers

Apply variable mode → Variable collection opens Auto (Mode1), Mode1, Mode2.
Auto is initially checked. Choose Mode2. Appearance gains a Variable collection
row with Mode2 combobox and Remove; Layers gains a Mode2 badge beside the instance.
The Fill retains its named variable binding, and the canvas/swatch becomes green.
Dimensions and radius are unchanged.

The immediate accessible swatch name still reports #36F despite green rendering.
This is stale accessible text, not reliable evidence that mode selection failed.
The screenshot plus selected mode and manager value support the observed result.
Do not infer a pixel-exact color from the screenshot alone.

Evidence: [mode menu](../evidence/variable-editor/06-mode-menu.txt),
[applied mode](../evidence/variable-editor/07-mode2-instance.txt),
[screenshot](../evidence/variable-editor/07-mode2.png).

## VM04 — Auto removes the explicit mode row

Reopen Apply variable mode → Variable collection → Auto (Mode1). Canvas/swatch
return blue, explicit Appearance mode row and Layers badge disappear. The variable
binding remains. This shows return to default resolution for this top-level
instance; nested parent-mode inheritance is not tested.

Evidence: [Auto restored](../evidence/variable-editor/08-auto-restored.txt),
[screenshot](../evidence/variable-editor/08-auto.png).

## Retained fixture and open coverage

Variable collection now has Mode1=3366FF and Mode2=22AA66 for Research/Panel color.
Instance15:62 is Auto (Mode1), original geometry, radius0, blue binding,1xPNG export;
selected at69%, manager closed. Mode2 remains as an explicit disposable research
fixture, not an assertion that all file state is unchanged.

Open: aliases, parent/child mode inheritance and overrides, scope changes/search
filtering, other variable types, publishing metadata, detach, mode removal/rename,
mode history, mixed selection, exact UI metrics and unavailable plans/limits.
