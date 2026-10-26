# Evidence method

## Confidence is per claim

A Computed property is exact for the selected DOM element at capture time. It does
not automatically describe its wrapper, other control types, hover/focus states,
light theme or a future Figma version. A successful interaction proves that case,
not an undocumented universal algorithm.

## Capture contract

- Date, surface (desktop/browser), file/page, selected nodes, tool, zoom, theme.
- Preconditions and named fixture geometry; distinguish document coordinates from
  screenshot pixels and CSS pixels.
- Exact action sequence including modifiers and where the gesture starts.
- Before/after selection, geometry, text and sizing values as relevant.
- Evidence links: screenshot plus focused accessibility/DOM/Computed excerpt.
- Status: Measured, Observed, Inconclusive, or Open.
- Alternative explanations, untested conditions, and product implications separately.

## Measurement layers

| Source | Good for | Does not prove |
| --- | --- | --- |
| Screenshot | visual composition, outlines, handles, cursors | exact CSS or hidden state |
| Accessibility/DOM snapshot | names, selected state, displayed values, disabled controls | internal canvas algorithms |
| Computed CSS + bounding box | exact rendered DOM size/style | geometry of arbitrary canvas objects |
| Inspector after a gesture | selected object's dimensions and mode | every input or nesting variant |

Native screenshots in the initial fixture used 2 image pixels per logical pixel.
Do not reuse this ratio blindly: verify current screenshot dimensions and scale.
DevTools docking changes the available canvas width. Reobserve coordinates after
opening/closing it. Canvas zoom and interface scale are different settings.

## Browser workflow

Prefer semantic DOM controls for panels and Layers. Read-only evaluation may inspect
visible DOM geometry/computed styles. Do not use private Figma application state as
a substitute for a user interaction. The current browser tool does not document a
DOM drag API; canvas drags use native input and may contend with the user's pointer.
Background operation during simultaneous user interaction remains unverified.

## Failure handling

After an action, inspect the result. A no-op or tool success is not a passed test.
Refresh stale accessibility indexes before reuse. Delayed UI responses and failed
typing are automation issues until a controlled test proves otherwise. Never infer
selection rules from a failed click alone. Keep approval/access failures separate
from product behavior.

## Repository hygiene

Store durable evidence under `evidence/`, not only `/tmp`. Raw accessibility index
numbers are ephemeral and useful only within their captured snapshot. Use labels
and geometry in reproduction steps. Keep each claim linked to a focused source.


## Overlay cross-surface discrepancy (observed 2026-10-13)

The native Chrome AX tree and screenshot showed the Assets Details overlay while
browser DOM snapshots omitted it. An absent overlay in that snapshot therefore
cannot establish that the preceding action had no effect. For ambiguous menu,
popup or asset actions, inspect an actual rendered screenshot or native AX before
retrying mutations. A successful tool return alone also does not prove an edit.
See components CO04–CO05. Do not retroactively infer the cause of unrelated earlier
inconclusive actions from this single discrepancy.

## Selection changes in history (observed 2026-10-13)

The mixed-types experiments verified that Undo can restore an intervening selection
before reverting property values. Record the selection and the property at every
Undo step. Prefer a controlled sequence that keeps selection constant, or account
explicitly for inspection selections. One Undo with unchanged values is not enough
to establish failure. See [MX02 and MX04](topics/mixed-types.md). Earlier uncertain
cases remain uncertain until reproduced; this evidence is a diagnostic lead.
