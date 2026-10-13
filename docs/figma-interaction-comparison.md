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
| Text click versus drawn box | Not yet verified in this comparison | Implemented inside frames |
| Text created outside a frame | Not yet verified in this comparison | Missing |
| Resize multiple selected objects | Not yet verified | Missing |

## Access status

The user explicitly approved a separate test page in this Untitled file after
automatic approval review rejected the initial Add new page action. Do not ask
again for that same test page. No test page has been successfully created yet.

Native accessibility and screenshots were readable, but subsequent input/capture
calls intermittently failed with missing-window or screen-capture errors. The
browser account does not have access to this file; its account picker exposes
only that account. No access request was submitted and no sharing was changed.

Resume with an operable native Figma window, create the approved test page, and
record the actual gesture results before changing selection/text behavior.
