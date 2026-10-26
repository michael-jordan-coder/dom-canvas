# Text truncation and vertical trim in a Hug parent

Observed2026-10-13, Chrome light UI, canvas215%. Child8:3 in Frame3:100 Fill/min100
×30 Hug/Auto height, Inter Regular12/Auto line height/0% tracking, original text
Text tool comparison, As typed/None, left/top. Frame3 is80 Fixed ×50 Hug with
padding10. [Baseline](../evidence/text-trim/01-baseline.txt).

## TT01 — Truncation exposes Max lines and changes Hug geometry

Type settings → Basics → Truncation enabled. A Max lines textbox appears with1.
Close editor: child becomes100 ×15 Hug, remains Auto height, X-10/Y10. Select
parent:80 ×35 Hug. This is consistent with15 content height plus20 padding.
The screenshot shows one line, but its right edge is behind the panel at this
zoom; it does not establish the precise ellipsis glyph or overflow endpoint.

Reselect child, reopen Type settings, enter Max lines2 and Enter. Child height
returns30. Disable truncation: Max lines disappears. Later re-enabling, after
a trim test, gives Max lines1 again, not the entered2. This observed sequence
shows a reset; an isolated off/on without other intervening controls remains open.

Evidence: [enabled](../evidence/text-trim/02-truncate.txt),
[one-line child](../evidence/text-trim/03-one-line.txt),
[screenshot](../evidence/text-trim/03-one-line.png),
[parent35](../evidence/text-trim/04-parent.txt),
[two lines](../evidence/text-trim/05-two-lines.txt),
[re-enabled1](../evidence/text-trim/09-reenable-max1.txt).

## TT02 — Vertical trim changes measured text height and parent Hug height

With No truncation, select Cap height to baseline. Child height becomes24
(from30); width100, Auto height and X-10/Y10 remain. Close and select Frame3:
parent height44 (from50), width80. Canvas remains two lines of original-case
text. This verifies this font/size/string only; exact ascent/descent calculations
and other fonts or explicit line-height behavior remain open.

Evidence: [trimmed child](../evidence/text-trim/06-trim.txt),
[screenshot](../evidence/text-trim/07-trim.png),
[parent44](../evidence/text-trim/08-trim-parent.txt).

## Restoration

Reselect child. Set Standard trim, briefly re-enable truncation for the Max lines
retention check above, then No truncation. Close. Child returns100 ×30 Hug/Auto
height. Select parent:80 ×50 Hug, original padding10/gap10/center/clip off, no
Fill or Stroke. Parent selected, canvas215%, editor closed.

Evidence: [restored settings](../evidence/text-trim/10-restored-settings.txt),
[child](../evidence/text-trim/11-restored-child.txt),
[parent](../evidence/text-trim/12-restored-parent.txt),
[screenshot](../evidence/text-trim/12-restored.png).

## Open coverage

Fixed-height truncation, exact ellipsis, Max lines validation/zero/negative values,
max-height interactions, font changes, explicit line height and trim, selected
ranges, history, long paragraphs, Wrap style, responsive changes, mixed selection,
UI metrics/focus/hover, isolated Max lines off/on retention. No underlying text
content edit was performed or inspected in this pass.
