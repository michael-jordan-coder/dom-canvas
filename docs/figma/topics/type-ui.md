# Type settings: shell, radio states and keyboard focus

Measured2026-10-13, Chrome light UI,750 ×893 viewport, canvas215%. Selected child8:3
Inter Regular12,100 Fill/min100 ×30 Hug. All actions in this pass are UI navigation
or focus; no document property value was intentionally changed.

Evidence: [Basics state](../evidence/type-ui/01-basics.txt),
[full computed measurements](../evidence/type-ui/02-metrics.json),
[screenshot](../evidence/type-ui/02-basics.png).

## TU01 — Dialog and tab geometry

| Element | CSS measurement |
| --- | --- |
| Semantic Type settings dialog | x270/y371,240 ×506; transparent, radius0 |
| Visible inner surface | Same bounds; white, radius13 |
| Header | 240 ×40; padding0 32px 0 8px; bottom1px inset rgb230 divider |
| Tab list | 171.242 ×24, gap4 |
| Basics selected | 50.875 ×24, horizontal padding8, radius5, rgb245 background; font11/550, LH16, text black alpha.898 |
| Details unselected | 52.828 ×24, padding8, radius5, white background; font11/450, LH16, text black alpha.5 |
| Variable unselected | 59.539 ×24; other rest values match Details |
| Preview wrapper | 240 ×144; padding16px 16px 8px; white |

The visible surface shadow matches three components: black alpha.15 at0/2/5px,
alpha.12 at0/10/16px, alpha.12 at0/0/.5px, each spread0. The semantic dialog owns
none of that styling. Screenshot shows no separate visible title above the tabs,
although a Type settings heading is present in the accessibility tree. The large
preview region displays Preview in this capture; it is not a typography rendering
sample from which font metrics should be inferred.

## TU02 — Small caps unavailable: semantics and actual icon paint

With this Inter Regular selection, the final Case radio is named Font doesn't
support small caps and marked disabled in the snapshot. Its input is24 ×24,
`aria-disabled=true`, but native `disabled=false`, opacity0. Its immediate wrapper
is24 ×24 and the Case track is120 ×24 with rgb245 background/radius5. The painted
SVG is24 ×24; its path fill is black alpha.3 with opacity1. Thus the invisible
input's opacity0 is an implementation layer, not the visual disabled opacity.
Do not force activation merely because HTML disabled is false.

Evidence: [disabled layers](../evidence/type-ui/03-disabled-caps.json),
[resolved icon fill](../evidence/type-ui/04-caps-icon.json).

## TU03 — Keyboard focus uses a painted sibling

Focus Paragraph spacing with the locator and press Tab. Active element becomes
the selected No truncation radio; property state stays unchanged. The24 ×24 input
and parent have no visible outline. The painted24 ×24 sibling span has white
background, radius5, rgb2301px inset shadow, and **1px solid rgb13,153,255 outline**.
This measurement distinguishes the keyboard focus layer from the input layer.

Evidence: [focused control measurements](../evidence/type-ui/05-keyboard-focus.json).
This proves one local tab transition, not complete keyboard traversal or a focus trap.

## TU04 — Variable tab retains shell size and survives reopening

Activate Variable using Enter. It exposes Slant0 and Weight400 with sliders.
The dialog still measures240 ×506 at270/371 despite fewer controls. Slider
semantic rectangles224 ×24; first (Slant) ARIA range-10–0, current0; second
(Weight)100–900, current400. These are advertised ranges, not validated clamping.
Close the editor and reopen: Variable remains selected. Restore Basics and close.
No variable-font numeric property was edited in this pass.

Evidence: [Variable](../evidence/type-ui/06-variable.txt),
[geometry/ranges](../evidence/type-ui/07-variable-metrics.json),
[reopened Variable](../evidence/type-ui/08-reopen.txt),
[final closed state](../evidence/type-ui/09-final.txt).

## Scope and remaining UI coverage

Child and parent geometry unchanged; child selected,215%, Basics last selected,
editor closed. These measurements apply to this light theme/viewport/context.
Hover, dark theme, alternate viewport/scale, Details controls, scroll boundaries,
full keyboard order, animation timings and all supported font families remain open.
