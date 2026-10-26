# No selection, hidden and locked context

Observed2026-10-13, Chrome light UI. Page2. Frame1 (`8:5`) baseline150 ×125,
X-99/Y-19, freeform, white Fill, clip enabled, visible and unlocked. Canvas zoom
58% for no-selection capture and93% after zooming to Frame1.

## SC01 — No selection shows Page settings

Main menu → Edit → Select none clears the selected frame. Right panel retains
Share, Design/Prototype and zoom, then shows Page background color1E1E1E,
opacity100 and visibility; Styles, Color styles, Research folder and creation
buttons; Export; and an MCP setup/status area. No object Position/Layout/Appearance
sections are shown. Local style content and connection count are fixture-specific,
not universal empty-panel defaults. The page background was not changed.

An initial Escape sent while targeting the Move toolbar button did **not** clear
the selection. That attempt is retained separately and is not evidence that Escape
fails when canvas focus is active.

Evidence: [initial Escape attempt](../evidence/selection-context/01-no-selection.txt),
[Select none result](../evidence/selection-context/02-select-none.txt),
[screenshot](../evidence/selection-context/02-select-none.png).

## SC02 — Hidden selected frame remains editable

Select Frame1 in Layers; zoom to selection. Check Appearance → Hide. The frame
remains selected and its inspector retains Position, Layout, Appearance and paint
controls. The checkbox accessible name remains Hide but its adjacent generic label
becomes Show. Width150 and other numeric fields are not disabled.

Enter Width160 while hidden. Uncheck Hide: the visible frame retains width160.
Restore width150 explicitly. This verifies a committed size edit while hidden,
not just enabled-looking fields. Hidden ancestor behavior and selecting hidden
objects directly on the canvas were not tested.

Evidence: [visible baseline](../evidence/selection-context/03-frame-visible.txt),
[before screenshot](../evidence/selection-context/03-frame-visible.png),
[hidden](../evidence/selection-context/04-frame-hidden.txt),
[hidden screenshot](../evidence/selection-context/04-frame-hidden.png),
[hidden width edit](../evidence/selection-context/05-hidden-width160.txt),
[shown with edit](../evidence/selection-context/06-shown-width160.txt).

## SC03 — Locked selection is not a read-only inspector

Right-click Frame1's layer → Lock/Unlock. The row's Toggle layer locking checkbox
becomes checked. The selected frame still exposes editable Width, Height, X/Y and
the rest of its inspector. Enter Width160; it commits. Use Main menu → Edit →
Select none, then click Frame1 in Layers. It is selected again while still locked,
and Width160 remains. Thus locked layers can be selected through Layers and edited
through this panel in the observed context. Canvas hit-testing, dragging and
marquee behavior require separate evidence.

Restore Width150 and uncheck the layer's Toggle layer locking checkbox.

Evidence: [locked panel](../evidence/selection-context/07-frame-locked.txt),
[locked screenshot](../evidence/selection-context/07-frame-locked.png),
[width160](../evidence/selection-context/08-locked-width160.txt),
[deselected](../evidence/selection-context/09-locked-deselected.txt),
[reselected while locked](../evidence/selection-context/10-locked-reselected.txt),
[restored](../evidence/selection-context/11-restored.txt),
[restored screenshot](../evidence/selection-context/11-restored.png).

### Measured locked input

The Width input's DOM `disabled` is false and `aria-disabled` absent. Computed
styles and dimensions are recorded in the [raw measurement](../evidence/selection-context/07-locked-width-metrics.json).
Locking therefore did not merely leave an inert control visually unchanged in
this case; the performed edit above confirms it works.

## Open

Hidden/locked multi-selection, ancestor inheritance, visibility Undo/Redo, canvas
selection and drag restrictions, layer row/icon hover styling, no-selection export,
page-background editing, unsupported properties and heterogeneous selection.
Frame1 ends at its baseline, selected, visible and unlocked.
