# Design panel shell: measured light-theme structure

Measured 2026-10-13, Chrome, light UI, 125% canvas zoom, selected instance15:62,
individual corners expanded and a bound color variable. Values below are CSS px;
canvas zoom is not browser/UI zoom. Measurements apply to the captured state.

## Actual layout nodes versus semantic wrappers

Right sidebar's role=region element has a0 ×0 rect and transparent background.
It is not the drawn panel width. Traversing visible Position heading ancestors
finds240-wide content and a white properties-panel surface. A displayContents
ancestor also has0 dimensions. Never read these semantic wrappers as box sizes.

Position and Layout H2 text nodes: height16, font11, weight550, line-height16.
Their containing title rows: width240, height40, padding0 8 0 16, column-gap8.
Position section: height149 including1px bottom divider rgb(230,230,230), bottom
padding12. Layout section: height117 with same divider and bottom padding.
These section heights are context/content dependent, not reusable fixed heights.

The located scroll container has overflow-y:scroll, clientHeight812 and
scrollHeight823; its outer clipping container has overflow-y:hidden. The white
content surface is823 high. Scrolling behavior itself was not exercised here.

Evidence: [context](../evidence/panel-shell/01-instance-context.txt),
[semantic region](../evidence/panel-shell/02-sidebar.json),
[title/section ancestors](../evidence/panel-shell/03-heading-ancestors.json),
[panel ancestors](../evidence/panel-shell/05-panel-ancestors.json),
[screenshot](../evidence/panel-shell/06-panel.png).

## Actions and state

| Control | Box | Radius | Background in observed state |
| --- | --- | --- | --- |
| More actions | 24 ×24 | 5 | Transparent |
| Add fill | 24 ×24 | 5 | Transparent |
| Individual corners, expanded | 24 ×24 | 5 | rgb(229,244,255) |
| Align left, disabled | 28.664 ×24 | 5 0 0 5 | rgb(245,245,245) |

All sampled controls contain24 ×24 SVG view boxes and padding0. This measures
SVG boxes, not the painted path bounds. Align left uses aria-disabled=true while
having no HTML disabled attribute. Thus the false `disabled` field in the initial
metrics JSON only means hasAttribute('disabled') was false; it does not indicate
the button is enabled. Its computed opacity is1; a disabled color must be checked
on the relevant icon path/custom property rather than inferred from opacity.

Evidence: [action metrics](../evidence/panel-shell/04-action-metrics.json),
[disabled attributes](../evidence/panel-shell/07-disabled-semantics.json).

## Remaining visual matrix

Hover and pressed; icon path colors; collapsed sections; resizing panel width;
scroll retention and sticky regions; narrow/wide viewports; popup edges and layering;
keyboard focus order; theme comparison and animation timing remain open. These
measurements supplement the field/wrapper focus measurements in input-lifecycle.md.
