# List controls and verified Fill recovery

Observed2026-10-13, Chrome light UI, child8:3 in Frame3,215% canvas zoom.
Started with100 Fixed/min100 ×30 Hug, Auto height, No list; the Fixed state was
left by the preceding [constraints test](constraints-resize.md).
[Before](../evidence/text-list/01-before.txt).

## TL01 — List styles expose List spacing

Type settings → Basics → Bulleted list adds a List spacing textbox0 alongside
Paragraph spacing0. Choose Numbered list: List spacing remains, and the canvas
shows a single numbered paragraph beginning1. The wrapped continuation line is
indented with the text rather than under the number. Child remains100 ×30 in
this fixture; no multi-item content was inserted. No starting-number field appeared
in this Basics view. This is scoped inventory, not a claim that no such control
exists elsewhere.

Restore No list. Final settings snapshot confirms No list/As typed/None/Standard/
No truncation. List spacing is absent again. List spacing edits, multiple items,
indent/outdent, nested lists, paragraph breaks, restart numbering and history remain
open; a single wrapped paragraph cannot prove those behaviors.

Evidence: [bulleted](../evidence/text-list/02-bulleted.txt),
[numbered](../evidence/text-list/03-numbered.txt),
[numbered screenshot](../evidence/text-list/03-numbered.png),
[final settings](../evidence/text-list/08-final-settings.txt).

## TL02 — Fill restored with the explicit Actions command

Sizing-popup clicks continued not to change Fixed. Enter on the Fill option
focused it without applying; navigation on its hidden listbox timed out. Native
Chrome access failed to acquire a window. A proposed five-Undo loop was rejected
by automatic review because its history scope could include unrelated edits;
that loop was not executed and no history rollback was used.

A safe direct alternative succeeded: open Actions, search `fill container`, wait
for visible results, focus **Set width to fill container** and press Enter.
The child now shows Fill. The search also offers Set height to fill container,
which was not invoked. Type settings had also responded to Enter after a click
failed to open it; neither observation establishes the root cause of click failures.

Verify actual dependency: change Frame3 width80→180. Child becomes160 Fill, as
expected from20 horizontal padding. Return parent width80: child returns100 Fill
because min width100 applies; height30 Hug, X-10/Y10, Auto height. Parent is again
80 Fixed ×50 Hug. These results close the prior Fill-restoration gap.

Evidence: [Actions results](../evidence/text-list/04-fill-action.txt),
[Fill badge](../evidence/text-list/05-fill-restored.txt),
[responsive160](../evidence/text-list/06-fill-responds.txt),
[parent restored](../evidence/text-list/07-restored-parent.txt),
[final child](../evidence/text-list/09-final.txt),
[final screenshot](../evidence/text-list/09-final.png).

Final child8:3 selected,215%, editor closed; original font/white Fill and text
rendering. This recovery changes the current fixture, while retaining historical
failed-attempt evidence rather than relabeling it as successful.
