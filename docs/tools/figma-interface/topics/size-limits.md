# Min/Max width and Fill

Observed2026-10-13, Chrome light UI. Frame3 (`15:2`) baseline80 Fixed ×50 Hug,
centered horizontal, padding10. Child8:3 is100 Fill/min100 ×30 Hug, Auto height,
position-10/10, with no maximum. [Baseline](../evidence/size-limits/01-min-baseline.txt).

## SL01 — Remove min and Undo verified

Open horizontal sizing with Cmd+Down. Clicking Remove min closed the menu but
left100 ×30/min100. A following Undo returned to the previous Star selection;
this was not a proven property change. [Click attempt](../evidence/size-limits/02-click-remove-min-inconclusive.txt),
[Undo after it](../evidence/size-limits/03-undo-after-inconclusive-click.txt).

DOM inspection found a separate focused `role=listbox`, whose `aria-activedescendant`
points to the active option. The popup containing options is not the keyboard
focus target. Sending keys to that popup failed with element-not-focused.
Navigate the focused expanded listbox with Arrow keys; verify the referenced
option text is Remove min, then Enter. End did not move to the last option in
this attempt. Do not assume active option always resets to the current sizing mode.

Confirmed activation changes width100→60, height30→45, X-10→10, retaining Fill
and Auto height. An immediate accessible width-name suffix still says min width,
but menu content and geometry show removal. With selection unchanged, Main menu
→ Edit → Undo restores minimum100, width100, height30, X-10.

[Successful removal](../evidence/size-limits/04-keyboard-remove-min.txt),
[successful Undo](../evidence/size-limits/05-undo-min.txt).
This resolves removal/Undo for this fixture; pointer activation remains unreliable
in this automation attempt, not established as a Figma product defect.

## SL02 — Maximum caps a Fill child

Reopen the menu. Navigate to Add max width and verify the active option text before
Enter. Separate Min width100 and an empty Max width editor appear. Enter140 in
Max width, then Enter. Select Frame3 and set Width240; reselect child8:3.

| Property | Observed result |
| --- | --- |
| Parent | 240 Fixed ×35 Hug, padding10 |
| Child | 140 Fill, min100/max140 ×15 Hug, Auto height |
| Child position | 50/10, X/Y disabled |

The parent's220 inner width does not force the Fill child beyond its140 maximum.
The child is centered and text reflows to one line. Reselection closes separate
limit editor rows, while the main field/menu retain both bounds. The menu offers
Min width100, Max width140 and combined Remove min and max; that combined action
was inventoried, not activated.

Evidence: [new editor](../evidence/size-limits/06-add-max-editor.txt),
[max140](../evidence/size-limits/07-max140.txt),
[parent240](../evidence/size-limits/08-parent240.txt),
[capped child](../evidence/size-limits/09-capped-child.txt),
[screenshot](../evidence/size-limits/09-capped-child.png).

## SL03 — Restoration and conflict-test gap

Further keyboard navigation to reopen Max width timed out even while the focused
listbox appeared in DOM; reopening did not resolve it. No maximum smaller than
the minimum was entered. Conflict behavior remains open, not a validation result.

Close the menu; four explicit menu Undo actions restore:

1. Selection to Frame3,240 ×35.
2. Parent80 ×50.
3. Selection to child100 ×30.
4. No max, retaining min100. Menu now offers Add max width and Remove min.

Evidence: [Undo1](../evidence/size-limits/10-restore-undo-1.txt),
[2](../evidence/size-limits/10-restore-undo-2.txt),
[3](../evidence/size-limits/10-restore-undo-3.txt),
[4](../evidence/size-limits/10-restore-undo-4.txt),
[final parent](../evidence/size-limits/11-restored-parent.txt),
[final child](../evidence/size-limits/12-restored-child.txt),
[final screenshot](../evidence/size-limits/12-restored-child.png).

Open: min>max normalization, height bounds, bound variables, mixed limits,
simultaneous removal, fixed/hug interactions and menu keyboard focus reliability.
Child8:3 selected; original parent/child geometry and bounds restored.
