# Typography: contextual settings and layout propagation

Observed 2026-10-13, Chrome light UI, Page 2 text8:3 in Frame3. Baseline Inter
Regular12, Auto line height, tracking0%, 100 Fill/min100 ×30 Hug, Auto height.
Parent80 Fixed ×50 Hug with padding10. This constrained fixture is intentional.

## TY01 — Type settings inventory

Type settings opens Basics, Details and Variable tabs with a preview area.
Basics exposes alignment including justified, decoration (None/Underline/
Strikethrough) and Underline details; case transforms; vertical trim; list style;
paragraph spacing; truncation; wrap style. Small caps explicitly reports that
this font does not support it and is disabled. This is font-specific evidence.

Details exposes OpenType feature groups and font-specific character variants,
including alternate numerals/letters and kerning. The raw snapshot is the exact
inventory for this Inter fixture; availability in other fonts remains untested.
Variable exposes Slant0 and Weight400, each with a textbox and slider. Merely
seeing these controls does not verify the result of changing their values.

Evidence: [baseline](../evidence/typography/01-baseline.txt),
[Basics](../evidence/typography/02-type-settings.txt),
[UI](../evidence/typography/02-type-settings.png),
[Details](../evidence/typography/03-details.txt),
[Variable](../evidence/typography/04-variable.txt).

## TY02 — Font size and line height propagate into layout

| Action | Child width/height | Line height field | Parent width/height |
| --- | --- | --- | --- |
| Baseline font12 | 100 /30 | Auto, placeholder15 | 80 /50 |
| Font24, Enter | 100 /87 | Auto, placeholder29 | 80 /107 |
| Line height40, Enter | 100 /120 | 40 | Not separately measured |
| Line height Auto, then font12, Enter | Restored baseline text configuration | Auto, placeholder15 | Not separately reselected |

The font size input's accessible name changes from Font size: 12 px to Font
size: 24 px. Width stays constrained by Fill/min100 while text height changes;
parent Hug height follows the child's measured height plus vertical padding20.
Do not assume Auto line height is a universal fixed ratio: this experiment only
establishes the observed Inter12 and Inter24 values.

Evidence: [font24 child](../evidence/typography/05-font24-child.txt),
[parent](../evidence/typography/06-font24-parent.txt),
[line height40](../evidence/typography/07-lineheight40.txt),
[restored](../evidence/typography/08-restored.txt).

## Remaining coverage

Font family/style menus and missing fonts; variable axes edits; partial text
selection and mixed runs; tracking units; paragraphs, lists, decoration details,
case, trimming, truncation/wrap, RTL/direction; OpenType toggles; baseline alignment;
transactions and Undo; detailed popup/control CSS and focus states. Inventoried
controls above remain behavioral gaps until exercised with before/after evidence.
