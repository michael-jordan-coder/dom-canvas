# Multi-track Grid, spans and minimum sizes

Observed 2026-10-13, Chrome light UI, canvas58%. Starting fixture is Frame4
`17:68`,240 Fixed ×100 Hug, Horizontal Wrap, centered, padding10, gaps10/20,
three100 Fixed ×30 Hug text children. See [Wrap setup](wrap-multi.md).

## GM01 — Conversion changes child sizing as well as parent controls

Select Frame4 and Grid. Parent remains240 ×100, with2 columns / Auto rows,
automatic positioning enabled, column gap10 and row gap20. Select child17:71
(third in the initial automatic layer order): X10/Y60 disabled, width105 Fill
(minimum100 retained), height30 Hug, Auto height. It was100 Fixed before conversion.

The child Position section exposes horizontal and vertical alignment **radio
groups**, rather than the disabled alignment buttons of a horizontal flow child.
Left/top are selected. Column span and Row span spinbuttons appear, both1.
Ignore auto layout remains available; X/Y remain disabled.

Evidence: [before](../evidence/grid-multi/01-before.txt),
[converted parent](../evidence/grid-multi/02-converted.txt),
[child](../evidence/grid-multi/03-child-grid.txt),
[child screenshot](../evidence/grid-multi/03-child-grid.png).

## GM02 — Column span propagates through text and Hug parent

With17:71 selected, enter2 in Column span and press Enter. Width105→220,
height30→15; position stays10/60. Parent height100→85. The text fits on one line
across the two columns. Grid settings show two Fill columns, each1fr, and two
Hug rows with heights30 and15.

Evidence: [spanning child](../evidence/grid-multi/04-span2-child.txt),
[parent](../evidence/grid-multi/05-span2-parent.txt),
[track settings](../evidence/grid-multi/06-track-settings.txt).

## GM03 — Fractional tracks and child minimum width are distinct

Open dimensions picker → Open grid settings. Set first Column width from1fr
to2fr, Enter, Close. Select first and second children:

| Child | Position | Displayed size | Modes |
| --- | --- | --- | --- |
| 17:69, first initial automatic row | 10/10 | 140 ×30 | Fill width/min100; Fill height, Fixed size text |
| 17:70, second | 160/10 | 100 ×30 | See captured child panel |

The220 inner width minus10 gap leaves210;2:1 gives140/70. The second child retains
its100 minimum atX160, extending beyond the parent's240 right edge. This is
consistent with a70-wide second track and100-wide child, rather than both tracks
being enlarged to satisfy that minimum. Track pixels were inferred from the
observed positions/widths and fr values, not read from a private layout engine.

The first child's Fill height / Fixed size state is observed here; its exact
transition time was not isolated. Do not attribute it specifically to changing fr
or to the later automatic-positioning toggle.

Evidence: [2fr edit](../evidence/grid-multi/07-first-2fr.txt),
[first child](../evidence/grid-multi/08-2fr-first.txt),
[second child](../evidence/grid-multi/08-2fr-second.txt),
[parent screenshot](../evidence/grid-multi/09-2fr-parent.png).

## GM04 — Automatic positioning changes layer ordering

Uncheck Toggle automatic positioning on the parent. The visible child layer order
becomes17:71,17:70,17:69. Selecting the third visible text row therefore now selects
17:69, **not**17:71. A DOM row-ID check resolves that ambiguity. Select17:71 by
its observed test ID: it retains span2, position10/60 and220 ×15 Auto height.

No new editable row/column start fields were observed in that child's panel;
X/Y remained disabled. This does not establish how to manually reposition it on
the canvas. That interaction remains open.

An attempted Cmd+Z after selecting the parent returned to a Text context, and
reselecting the parent still showed automatic positioning unchecked. Undo of this
toggle is **inconclusive**. Explicitly checking the checkbox restores automatic
positioning; do not treat that explicit restoration as successful Undo.

Evidence: [manual parent](../evidence/grid-multi/10-manual-parent.txt),
[third visible row =17:69](../evidence/grid-multi/11-manual-child.txt),
[DOM identities](../evidence/grid-multi/11-manual-layer-order.json),
[actual17:71](../evidence/grid-multi/12-manual-17-71.txt),
[Undo result](../evidence/grid-multi/13-undo-manual.txt),
[parent after Undo](../evidence/grid-multi/14-parent-after-undo.txt),
[explicit re-enable](../evidence/grid-multi/15-reenable-auto.txt).

## GM05 — Adding a column can resize a Fixed parent

With automatic positioning enabled,2fr/1fr columns and child17:71 span2,
open dimensions picker. Set Number of columns2→3 and Enter. Parent width240→320,
still Fixed; height85 remains Hug. The visible picker button text is3 ×Auto,
while its accessible name remains stale (`2 columns and Auto rows`). Reopen the
picker: Number of columns is3. Grid settings independently show three columns,
2fr/1fr/1fr, and the same two Hug rows30/15.

Remove column3 through its Remove button. Set first column back to1fr, Close:
parent returns240 ×85. Restore17:71 Column span1: parent height returns100.
The width sequence is consistent with adding/removing one70-wide track plus10
gap while preserving existing track pixel sizes. General column insertion rules
and which widths are preserved under other sizing modes are not established.

Evidence: [three columns](../evidence/grid-multi/16-three-columns.txt),
[three track settings](../evidence/grid-multi/17-three-track-settings.txt),
[remove third](../evidence/grid-multi/18-remove-third-track.txt),
[two equal tracks](../evidence/grid-multi/19-two-equal-tracks.txt),
[span1](../evidence/grid-multi/20-restored-child-span.txt).

## Retained fixture / open coverage

Frame4 is now Grid,2 columns / Auto rows, automatic positioning enabled,
240 Fixed ×100 Hug at500/-254, gaps10/20, padding10, clipping off. Columns are
1fr/1fr;17:71 span1 and width105 Fill/min100 ×30 Hug. The other children retain
their observed Grid sizing rather than being converted back to the Wrap fixture.
Frame3 is untouched.
[Final parent](../evidence/grid-multi/21-retained-grid.txt),
[screenshot](../evidence/grid-multi/21-retained-grid.png).

Open: row spans, child alignment actions, manual canvas placement, row insertion,
track Hug/Fixed/Fill combinations, overflow/clipping, track reorder, min/max track
availability, reliable Undo of positioning toggle, flexible unequal content,
precise visual state measurements and keyboard traversal of the track editor.
