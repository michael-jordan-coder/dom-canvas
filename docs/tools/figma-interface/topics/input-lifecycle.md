# Numeric input lifecycle and wrapper UI

Observed 2026-10-13, Chrome, light UI, canvas zoom 125%, Frame 1 (8:5),
freeform 150 × 125. Scope: Width textbox. Different control families and native
human typing need independent tests. Automation used locator.fill and press;
fill is not proof of per-keystroke preview behavior.

## Performed sequence

| Case | Action | Observed result | Evidence |
| --- | --- | --- | --- |
| IN01 | Fill width 210, Escape | 210 remains; input loses focus | [immediate](../evidence/input-lifecycle/04-escape.txt) |
| IN02 | Select Frame 2 then Frame 1 | Width still 210 | [reselected](../evidence/input-lifecycle/05-escape-reselection.txt) |
| IN03 | Fill `100+25`, Enter | Width evaluates to 125 | [expression](../evidence/input-lifecycle/06-expression-enter.txt) |
| IN04 | Fill `abc`, Enter | Returns to previous 125 | [invalid](../evidence/input-lifecycle/07-invalid-enter.txt) |
| IN05 | ArrowUp | 125 → 126; field focused | [arrow](../evidence/input-lifecycle/08-arrow-up.txt) |
| IN06 | Shift+ArrowUp | 126 → 136; field focused | [modified arrow](../evidence/input-lifecycle/09-shift-arrow-up.txt) |
| IN07 | Fill 150, Tab | Width 150; focus moves to Height 125 | [Tab](../evidence/input-lifecycle/11-tab-restore.txt) |

Baseline and draft: [baseline](../evidence/input-lifecycle/01-baseline.txt),
[draft 210](../evidence/input-lifecycle/03-width-draft.txt).

IN01–02 contradict an assumed universal Escape-cancels rule for this automation
path. Do not generalize to manually typing each character, all numeric controls,
or an open picker. IN04 had no visible error message in the resulting snapshot;
a read-only DOM check found no aria-invalid attribute. This does not prove that
there is no transient error animation.

## Measured field versus wrapper

All values CSS px. Width field measured at rest, then focused after IN06.

| Node/state | Size | Radius | Surface/border | Typography |
| --- | --- | --- | --- | --- |
| Rest input | 63 × 24 | 2 | Transparent background | Line height 16 |
| Rest label wrapper | 88 × 24 | 5 | Background and 1px border rgb(245,245,245) | Line height 16 |
| Focused input | 41 × 24 | 2 | Transparent background | 11px, weight 450, line height 16 |
| Focused label wrapper | 88 × 24 | 5 | Same surface, 1px rgb(13,153,255) border | 11px, weight 400, line height 16 |

The focused snapshot adds an Apply variable button alongside Width. The wrapper
retains 88px width while the input shrinks from 63 to 41. The border carrying
focus is on the wrapper. Both nodes have no box shadow; computed outline style
is none. Do not substitute the input's 2px radius for the visible 5px wrapper.

Evidence: [ancestor geometry](../evidence/input-lifecycle/02-width-ancestor-metrics.json),
[focused geometry](../evidence/input-lifecycle/10-focused-metrics.json),
[focused screenshot](../evidence/input-lifecycle/10-focused.png).

## Remaining work

Actual sequential typing, select-all and caret behavior; blur via click; empty,
negative, fractional and unit inputs; other expression operators; Alt/Cmd arrows;
scrubbing and precision modifiers; multi-selection; live canvas previews;
transaction grouping and Undo/Redo of each input path. Repeat across position,
opacity, color alpha, corner radius, gaps, text metrics and variable-bound fields.

Frame 1 ends at its baseline 150 × 125. Frame 3's min-width fixture remains.
