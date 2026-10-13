# Grid and Wrap — contextual panel transitions

Observed 2026-10-13, Chrome light UI, canvas zoom 125%. Fixture: Page 2,
Frame 3 (`15:2`), one text child with Fill width and minimum 100. Parent baseline:
80 Fixed × 50 Hug, horizontal, centered, padding 10, gap 10, clipping off.

## GW01 — Wrap adds a second gap control

Select Frame 3 in Layers; enable Wrap. Horizontal remains selected and the
nine-point alignment control remains. A `Vertical gap between rows` combobox
appears alongside horizontal gap 10. Its snapshot value is blank; this does not
establish a numeric default. Parent dimensions remain 80 × 50.

Evidence: [before](../evidence/grid-wrap/01-horizontal.txt),
[Wrap enabled](../evidence/grid-wrap/02-wrap.txt).

## GW02 — Grid changes the control model

Select Grid in Flow. Wrap is replaced by checked `Toggle automatic positioning`.
The nine-point alignment control disappears. A dimensions picker reads
`1 columns and Auto rows`. Column and row gaps are separate textboxes, both 10;
padding remains 10 and dimensions 80 × 50.

Open the dimensions picker: Number of columns is a spinbutton (1), Number of
rows a combobox (Auto), and a matrix offers dimensions through 12 × 8 in this
observed viewport. That matrix is not evidence of a maximum supported grid size.
An `Open grid settings` action leads to a dedicated right-panel view headed Grid;
Position, Layout and Appearance are replaced by Columns and Rows. Design/Prototype,
Share and zoom remain above it. Close returns to the regular inspector.

Evidence: [Grid](../evidence/grid-wrap/03-grid.txt),
[Grid screenshot](../evidence/grid-wrap/03-grid.png),
[picker](../evidence/grid-wrap/04-dimensions-picker.txt),
[settings](../evidence/grid-wrap/05-grid-settings.txt),
[settings screenshot](../evidence/grid-wrap/05-grid-settings.png).

## GW03 — Track sizing has its own mode and value

The single column starts Fill, width `1fr`; the single row starts Hug, height 30.
Each track has a numbered selection button, Track sizing control, dimension value
and Remove action. Columns/Rows each have an Add action.

Open the column Track sizing combobox. Options: Fixed width (60), Hug contents,
Fill container (1fr), with Fill selected. Choose Fixed width (60): mode becomes
Fixed and the Column width changes from combobox `1fr` to spinbutton `60`.
The enclosing gridcell name still says `1fr` in the immediate snapshot, so use the
actual input and mode as evidence, not that stale parent accessible name.

Evidence: [modes](../evidence/grid-wrap/06-track-modes.txt),
[Fixed result](../evidence/grid-wrap/07-fixed-track.txt).

### Measured — Fixed column input

Direct computed-style/DOM measurement after choosing Fixed, before closing:

| Element | CSS dimensions | Typography | Radius / surface |
| --- | --- | --- | --- |
| Column width input | 68 × 24 | 11px / 16px, weight 450 | 5px |
| Immediate DIV parent | 76 × 24, padding 0 | not measured | 5px, rgb(245,245,245) |

[Raw measurement](../evidence/grid-wrap/07-fixed-track-metrics.json).
These values are scoped to this control and state, not a universal input token.

## GW04 — Mode round trip changes alignment

Close Grid settings and select Horizontal. Wrap is unchecked; parent stays
80 × 50, padding/gap 10, but alignment is now top-left rather than baseline center.
This establishes the outcome of this particular Wrap → Grid → Fixed track →
Horizontal sequence, not which individual transition caused the alignment reset.

Select Align center to restore the fixture. Then select the text child: it is
100 Fill with min width 100, height 30 Hug, Auto height, in-flow, X -10/Y 10 disabled.

Evidence: [return](../evidence/grid-wrap/08-return-horizontal.txt),
[restored parent](../evidence/grid-wrap/09-restored-parent.txt),
[restored child](../evidence/grid-wrap/10-restored-child.txt).

## Open

- [Multi-child wrapping](wrap-multi.md) now covers fixed equal children, numeric
  row gap and a width threshold; automatic gaps and flexible children remain open.
- Multiple tracks, fr weighting, track Hug/Fixed resizing, adding/removing tracks.
- Grid child placement, spans, automatic positioning toggle and overflow.
- Undo/Redo, retained grid configuration after changing modes, keyboard navigation.
- Hover, focus, disabled, mixed and narrow-viewport track settings.
- Exact canvas track geometry: this single-child fixture does not prove a layout algorithm.
