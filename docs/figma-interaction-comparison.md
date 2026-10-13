# Figma interaction comparison

## Working rule

Before changing a product interaction, inspect the corresponding interaction in
Figma, record the observed result, implement it, and verify the local behavior.
An existing implementation or remembered Figma behavior is not evidence of parity.

## Reference inspected — 2026-10-13

- Native Figma, `Untitled`, file `4OajwOr5ltNCZ5z0cPwrlO`, Page 1.
- Selected nested auto-layout frame `1:221`, then top-level frame `1:364`.
- Right sidebar width: **241 logical pixels**, reported by accessibility.
- Field height: approximately **24 logical pixels**, measured from a 2x screenshot.
- Observed section order: Position, Auto layout, Appearance, Fill, Stroke,
  Effects, Selection colors, Layout guide, Export.
- Dimensions combine the axis label, numeric value, and sizing mode in one
  compact control. Aspect lock is an adjacent icon control.
- A selected frame displays four corner handles and a dimension badge below it;
  the badge includes the Hug sizing mode when applicable.

## Interaction evidence still required

| Scenario | Figma observation | Local status |
| --- | --- | --- |
| Marquee fully encloses multiple frames | Not yet verified | Implemented; parity unproven |
| Marquee only intersects a frame | Not yet verified | Full containment currently required |
| Marquee starts inside a frame/container | Not yet verified | Bare frame background only |
| Shift adds/removes selection | Not yet verified in this comparison | Implemented; parity unproven |
| Text click versus drawn box | Click: Auto width; drag: Fixed size, both dimensions retained | Drawn box currently auto height; mismatch |
| Text created outside a frame | Verified on Page 2 | Missing |
| Resize multiple selected objects | Not yet verified | Missing |

## Access status

The user explicitly approved a separate test page in this Untitled file after
automatic approval review rejected the initial Add new page action. Do not ask
again for that same test page. On retry, Page 2 (`8:2`) was present and empty.

Native accessibility and screenshots were readable, but subsequent input/capture
calls intermittently failed with missing-window or screen-capture errors. The
browser account does not have access to this file; its account picker exposes
only that account. No access request was submitted and no sharing was changed.

## Successful foreground-window retry

Native input worked with Figma in front. This does not prove window switching was
the sole cause of the previous failures. Tests on approved Page 2:

- Click-created text `8:3`: Auto width, 119 x 15 after pasting
  `Text tool comparison`. Initial typeText did not insert content; double-click
  plus paste did. Do not interpret that automation issue as Figma behavior.
- Drag-created text `8:4`: 170 x 45 logical pixels, Fixed size selected.
  Pasting a wrapping sentence retained both dimensions.
- Marquee from screenshot (810,460) to (1240,810) enclosed both text layers:
  accessibility reported **2 items selected**.
- Marquee from (810,600) to (950,690) partially intersected the second text box
  (850,650 to 1190,740) and selected it. Its position and dimensions were unchanged.
  Therefore text selection does not require full containment. Frame/container
  rules remain unverified and must not be inferred from this text-only test.
- Screenshot: `/tmp/figma-text-selection-reference.png` (2x pixels).

Next: compare frame/container selection separately; correct drawn text sizing
and verify the local result against this fixed-width, fixed-height reference.
