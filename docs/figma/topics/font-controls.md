# Font family, style and letter-spacing controls

Observed2026-10-13, Chrome light UI. Child8:3 in Frame3,100 Fill/min100 ×30 Hug,
Auto height, Inter Regular12, line height Auto (placeholder15), tracking0%.
Parent80 ×50, padding10. [Baseline](../evidence/font-controls/01-baseline.txt).

## FC01 — Font family is a searchable floating dialog

Click Font family. A Fonts dialog opens with heading, Apply variable, Search
fonts, Clear search, Font set (All fonts), result count, font list and Close.
On opening, search input displays Inter and the broad list contains1818 results
scrolled near Inter, which is selected. This initial current-family presentation
is not equivalent to an applied search query.

Fill Search fonts with Roboto. List filters to six observed options: Roboto,
Roboto Condensed, Roboto Flex, Roboto Mono, Roboto Serif, Roboto Slab. Font set is
absent in this filtered snapshot. Click Roboto: dialog closes; panel family
changes toRoboto and style staysRegular. At unchanged12px and100 width, Auto
line-height placeholder15→14 and child height30→28.

Counts and available families are session-dependent inventories, not exhaustive
guarantees about Figma's font catalog.

Evidence: [initial dialog](../evidence/font-controls/02-family-menu.txt),
[screenshot](../evidence/font-controls/02-family-menu.png),
[Roboto query](../evidence/font-controls/03-search-roboto.txt),
[Roboto selected](../evidence/font-controls/04-roboto.txt).

## FC02 — Style inventory depends on the selected family

Open Font style forRoboto. Its menu contains condensed and normal weights,
upright/italic forms, separators, Variable font axes and Apply variable. Choose
Bold. Later switching family back toInter preservesBold in this case, because
the resulting Inter style is visiblyBold. Missing-style mapping was not tested.

Inter's menu has its own names (e.g. Extra Light, Semi Bold, Extra Bold), whereas
Roboto's corresponding names use ExtraLight, SemiBold, ExtraBold and also offer
Condensed forms. Do not hard-code one universal style list or normalize away the
font's displayed names. Variable axes entry was inventoried, not edited here.

Evidence: [Roboto styles](../evidence/font-controls/05-roboto-styles.txt),
[Bold](../evidence/font-controls/06-bold.txt),
[Inter retainsBold](../evidence/font-controls/12-inter-style-retained.txt),
[Inter styles](../evidence/font-controls/13-inter-styles.txt).

## FC03 — Letter spacing accepts percent and explicit pixels

WithRoboto Bold12 selected:

| Input +Enter | Displayed spacing | Child height | Parent height |
| --- | --- | --- | --- |
| 20% | 20% | 28 | 48 (inspected) |
| 100% | 100% | 56 | not inspected |
| 2px | 2px | 28 | not inspected |

Child width remains100, with Auto height/Hug. The100% case reflows to a taller
text box;2px restores the smaller height and keeps the px suffix. Numeric unitless
input conversion, negative values and mixed units were not tested here.

Evidence: [20%](../evidence/font-controls/07-letter20.txt),
[parent48](../evidence/font-controls/08-parent-after-tracking.txt),
[100%](../evidence/font-controls/09-letter100.txt),
[2px](../evidence/font-controls/10-letter2px.txt).

## FC04 — Measured dialog and focused search field

Set spacing0%, reopen Fonts and search Inter: one result appears. Before selecting
it, the document still usesRoboto Bold. Measure the Fonts semantic dialog node
and focused Search fonts input in this filtered state:

| Node | Measured CSS values |
| --- | --- |
| Dialog | x270/y408,240 ×469, padding0, transparent background, radius0 |
| Search input | 176 ×24, font11px/16px weight450, padding0, radius5 |
| Search input color | rgba(0,0,0,.898); background transparent |
| Search input outline | style none (computed shorthand includes3px; no drawn outline implied) |

These describe the named nodes. Transparent semantic dialog/input backgrounds do
not establish the popup's visual surface color; nested wrappers may draw it.
No viewport was changed. Do not universalize these dimensions to every result count.

Evidence: [filtered Inter](../evidence/font-controls/11-search-inter.txt),
[screenshot](../evidence/font-controls/11-search-inter.png),
[raw metrics](../evidence/font-controls/11-font-dialog-metrics.json).

## Restoration / open

Choose Inter, then Regular. Child returns100 ×30, Auto height/Hug, font12,
line heightAuto, spacing0%, Fill/min100. Parent returns80 ×50. Parent selected
and Zoom to selection used for final evidence; no font edits retained.
[Child](../evidence/font-controls/14-restored-child.txt),
[parent](../evidence/font-controls/15-restored-parent.txt),
[screenshot](../evidence/font-controls/15-restored-parent.png).

Open: font set filtering, font preview/cancellation, unavailable local fonts,
style fallback, mixed typography, variable axes, negative tracking, paragraph
spacing/direction/actions, selected text ranges and keyboard traversal.
