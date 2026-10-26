# DevTools measurement workflow

Status: **Performed successfully** on native Figma, 2026-10-13.

## Native path

Help → Troubleshooting → Toggle Web App Developer Tools.
The nearby Tab Bar Developer Tools entry targets the shell, not the editor UI.

1. Open Elements.
2. Focus the DOM tree and use Cmd+F.
3. Search a selector grounded in the observed control, e.g. `input[aria-label="Color"]`.
4. Select the matching element and open Computed.
5. Record dimensions, font, line height, borders, padding and background, identifying
   whether the selected node is the input or its wrapper.
6. Save a focused excerpt and screenshot. Close DevTools before coordinate gestures
   because docking changes the canvas viewport.

Console paste was guarded by a DevTools warning in this environment. No override
was enabled; Elements/Computed provided the required measurements without console
execution. Do not make console access a prerequisite for research.

## Browser alternative

Once the user opened the same file in an authorized browser account, semantic DOM
selection and read-only computed-style inspection worked directly. The color input
measurement matched native DevTools: 105 x 24, 11px font, 16px line-height, 450 weight,
5px radius. Use the documented browser API to read visible UI DOM; do not inspect
private application stores, cookies or account/network data.

## Limits

DevTools gives precise evidence for DOM-based panels. It is not a complete API for
objects painted on the design canvas. Test their behavior through actual actions
and read the resulting selection and property values. Exact CSS is not evidence
for the canvas engine's hit-testing, undo model or layout algorithm.

Working on a DOM-backed browser tab and sharing native pointer input are distinct.
Concurrent background operation has not been tested; do not promise interference-free
canvas dragging based solely on successful DOM inspection.
