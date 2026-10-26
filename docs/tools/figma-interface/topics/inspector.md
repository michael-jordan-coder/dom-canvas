# Inspector structure and measurements

## INS-01 — Panel geometry

Measured native accessibility: right panel 241 logical pixels, left panel 280.
DevTools Elements showed root custom properties `--right-panel-width: 241px`,
`--left-panel-width: 280px`, `--left-rail-width: 57px` and a properties-panel element
with inline width 241px. These are current sizes, not claims that resizing is disallowed.

## INS-02 — Page color input, dark theme

Source: native DevTools Elements > Computed, selected `input[aria-label="Color"]`.
Later independently matched by read-only browser DOM measurement.

| Property | Measured value |
| --- | --- |
| Height | 24px |
| Width in captured layout | 105px |
| Font size / line height | 11px / 16px |
| Font weight | 450 |
| Font family | Inter with system fallbacks |
| Border radius | 5px |
| Box sizing | border-box |
| Background on input itself | transparent |
| Text color in native dark theme | rgb(255, 255, 255) |
| Padding on input itself | 0 on all sides |
| Overflow | clip |

The gray surrounding field background belongs to another element; transparent input
does not mean a transparent whole control. Likewise zero input padding does not mean
zero wrapper spacing. Measure wrappers separately before implementing those values.

Evidence: [computed values](../evidence/2026-10-13-color-input-computed.txt),
[DevTools screenshot](../evidence/2026-10-13-devtools-color-input.png).

## INS-03 — Context changes

- No selection: Page color/opacity, Styles and Export.
- Text selected: Position, Layout/Resizing, Appearance, Typography, Fill, Stroke,
  Effects, Export in the observed state.
- Auto-layout frame selected in Page 1: Position, Auto layout, Appearance, Fill,
  Stroke, Effects, Selection colors, Layout guide, Export.
- Two frames selected: common W/H shown; differing X shown as Mixed.

## Open measurements

Section header height and padding; control gaps; focus and hover treatment; disabled
colors; icon sizes; wrapper backgrounds; menu geometry; every theme/scale variant.
Never extrapolate the one measured input to all controls without sampling them.
