# Group and Section context

Observed2026-10-13, Chrome light UI. Disposable Page2 fixture. Duplicate Frame1
to Frame5 (`18:72`),150 ×125, white Fill, clipping enabled, and place it at500/100.
Group selection creates Group1 (`18:73`) containing Frame5. Later Convert to
section replaces that group with Section1 (`18:74`), preserving Frame5.

## GS01 — Group panel and its child

The header visibly says Group, although its accessible button name remains
`Frame, Frame Dimension Presets`. Group has Position, rotation/flip, alignment
buttons and their More actions; Layout with Flow and Auto layout toggle; Width/
Height; Appearance; Fill/Stroke/Effects; Selection colors; Export. Unlike the
baseline frame, the group lacks Clip content, Resize to fit and Layout guide in
this snapshot. Alignment controls are enabled despite a single selected group.
That inventory does not prove what each alignment action would do.

Fill contains white, matching the only child, and Selection colors also contains
white. Do not infer from a displayed Fill row that the group has an independent
paint surface: the edit experiment below establishes a child effect.

Evidence: [Frame baseline](../evidence/object-context/01-frame-baseline.txt),
[Group](../evidence/object-context/02-group.txt),
[Group screenshot](../evidence/object-context/02-group.png).

## GS02 — Width and Fill edits propagate to the child

1. Enter Group Width300, Enter. Select Frame5: its width is300, height remains125.
   X/Y display500/100, the same page coordinates as the group rather than0/0.
2. Select Group1 and restore Width150.
3. Set the **Fill-row** Color toFF0000 (not the second Color control under
   Selection colors). Select Frame5: its Fill isFF0000 and width150.
4. Restore the child's Fill toFFFFFF.

This proves resizing and aggregate paint editing for a group containing one frame.
It does not establish multi-child scaling, constraint behavior or text scaling.

Evidence: [group width300](../evidence/object-context/03-group-width300.txt),
[child width300](../evidence/object-context/04-child-after-group-width.txt),
[group red](../evidence/object-context/05-group-red.txt),
[child red](../evidence/object-context/06-child-red.txt).

## GS03 — Section suppresses different control families

Right-click Group1 → Convert to section. Section1 is150 ×125 at500/100 and
contains Frame5. Its panel retains Position X/Y and alignment, Layout dimensions/
aspect lock plus Resize to fit, Appearance, Fill/Stroke, Selection colors, Export.
It does **not** show Rotation/flip, Flow, Auto layout toggle, Clip content,
Create component, Use as mask, Effects or Layout guide in this captured context.
Appearance still shows opacity, blend mode, radii and Hide; those actions were
not tested here. Section Fill is empty while Selection colors reports the white
child, distinguishing this state from the group's white Fill row.

Evidence: [Section panel](../evidence/object-context/07-section.txt),
[screenshot](../evidence/object-context/07-section.png).

## GS04 — Section resizing and Resize to fit

Enter Section Width300. Frame5 stays150 ×125, unlike the group resize case, and
its X/Y are0/0 relative to the section. Select Section1 and click Resize to fit:

| State | Section X/Y | Section W/H | Child relative X/Y | Child W/H |
| --- | --- | --- | --- | --- |
| Before fit | 500/100 | 300/125 | 0/0 | 150/125 |
| After fit | 400/0 | 350/325 | 100/100 | 150/125 |

The result supplies100 space on each side while preserving the child's page
position500/100. This is an observed single-child section result; it is not proof
that every Resize to fit control or object type uses100 padding.

Evidence: [Section width300](../evidence/object-context/08-section-width300.txt),
[child unchanged](../evidence/object-context/09-child-after-section-width.txt),
[fit](../evidence/object-context/10-section-resize-fit.txt),
[child relative position](../evidence/object-context/11-child-after-fit.txt),
[rendered fit](../evidence/object-context/12-retained-section.png).

## GS05 — Type menu and measured disabled options

Click the header's visible Section button. Menu group `Frame Layout Options`
contains Section (checked, disabled), Frame (enabled), Group (disabled). No
conversion through this menu was performed. The stale Frame accessible button
name must not be used to infer the current object type.

Direct DOM/computed metrics for these three option elements:

| Property | All options | Enabled Frame | Disabled Section/Group |
| --- | --- | --- | --- |
| Box | 222 ×24 CSS px | same | same |
| Font | 11px /16px, weight450 | same | same |
| Padding / radius | 0 8px /0 | same | same |
| Foreground | varies | rgb(255,255,255) | rgba(255,255,255,.4) |
| Element background | transparent | same | same |

These are option-element measurements, not the menu surface or total menu size.
Light editor chrome does not imply a light popup background.

Evidence: [menu](../evidence/object-context/13-section-type-menu.txt),
[computed metrics](../evidence/object-context/13-type-menu-metrics.json).

## Retained fixture / open

Section1 is retained350 ×325 at400/0, containing Frame5 white150 ×125 at100/100
relative; menu closed, Section selected, canvas zoom40% after Zoom to selection.
[Final state](../evidence/object-context/14-final-section.txt).

Group1 no longer exists after conversion. Frame1 and other prior fixtures were
not modified. Open: multi-child group transforms, group paint with mixed children,
section Fill/Stroke/Appearance actions, section-to-frame conversion, nesting,
ready-for-dev interactions, alignment/distribution, Undo/Redo and drag resizing.
