# Layout guides and export settings

Observed2026-10-13, light UI, instance15:62 with bound blue Fill.

## GE01 — Guides

Add layout guide creates a row with settings, type, visibility and removal and
opens settings. Initial Grid10px has Size10, redFF0000 and opacity10 in this
fixture. Type menu offers Grid, Columns, Rows. Choosing Columns exposes Count5,
Type Stretch, disabled Width with Auto placeholder, Margin (accessible name
Offset)0 and Gutter20. Thus labels and accessibility names can differ. Other
column alignment types/Rows and geometry edits remain open. Close and Remove
layout guide removes the test row.

Evidence: [created](../evidence/guides-export/01-add-guide.txt),
[types](../evidence/guides-export/02-guide-types.txt),
[Columns](../evidence/guides-export/03-columns.txt),
[screenshot](../evidence/guides-export/03-columns.png).

## GE02 — Export affects more than its own section

Add export settings expands Export with a row: scale1x, formatPNG, Advanced
export settings and Remove; Export Frame2 and Preview appear below. The Fill
section simultaneously exposes Show in exports, checked. This dependency must
be represented in a holistic panel model.

Advanced export settings opens an Export dialog: Suffix (None placeholder),
Color profile sRGB (same as file), Image resampling Detailed, Ignore overlapping
layers checked, Close. No export file was generated in this pass.

Evidence: [export row and Fill change](../evidence/guides-export/04-export-settings.txt),
[advanced](../evidence/guides-export/05-advanced-export.txt),
[screenshot](../evidence/guides-export/05-advanced-export.png).

Retained state: no layout guide; instance15:62 has one PNG1x export setting and
its advanced Export dialog open. Scale/format choices, multiple presets, preview,
export output, Show in exports effect, guide styles, history and precise UI metrics
remain untested. Initial values above are scoped to this fixture.
