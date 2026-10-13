# Noise, Texture and Glass effect contexts

Observed 2026-10-13, Chrome light UI, canvas101%, viewport750 ×893. Star18:79
on approved Page2 initially100 ×100, Count7/Ratio50%, D9D9D9 Fill100%, object
opacity100%, no effects. [Baseline](../evidence/material-effects/01-baseline.txt).
This pass exercises one effect row through type conversions. Values after a
conversion are not necessarily the defaults of a freshly added effect.

## ME01 — Noise modes and committed edits

Add effect → Noise. Initial Mono has Noise size X/Y0.5, Density100%, black Color
with alpha25. A Blend mode button is present (not exercised). Select Duo: two
color rows appear, black25% and white25%. Select Multi: color rows disappear;
a single Opacity25% field remains. Size and Density remain available in all three.

In Multi, enter X2 and Density60%, committing with Enter. Close and reopen:
X2, **Y2**, Density60%, Opacity25% persist. Only X was explicitly edited before
this reopening. Then enter Y3: X stays2 and Y becomes3. This is the observed
sequence; whether Y initially follows X only while equal, or another rule
applies, remains open. The screenshot shows fine colored noise inside the Star.

Evidence: [Mono](../evidence/material-effects/02-noise-default.txt),
[Duo](../evidence/material-effects/03-noise-duo.txt),
[Multi](../evidence/material-effects/04-noise-multi.txt),
[reopened edits](../evidence/material-effects/05-noise-edited.txt),
[Y3](../evidence/material-effects/06-noise-y3.txt),
[screenshot](../evidence/material-effects/06-noise.png).

## ME02 — Texture conversion

Effect settings → Texture. The mode, color and Density fields are replaced by
Size X2/Y3, Radius4 and unchecked Clip to shape. Set Radius10 and check Clip to
shape. Close and reopen: all values persist. The main object's Fill is still100%.
The screenshot has the compact X/Y/Radius editor and a separate lower checkbox
row. No claim is made that the screenshot resolves Texture's rendering algorithm.

Evidence: [converted](../evidence/material-effects/07-texture.txt),
[reopened](../evidence/material-effects/08-texture-reopen.txt),
[screenshot](../evidence/material-effects/08-texture.png).

## ME03 — Glass conversion changes Fill alpha too

Effect settings → Glass. The editor now has:

| Group/control | Value immediately after conversion |
| --- | --- |
| Light Angle | -45° |
| Light Intensity | 80% |
| Refraction | 80 |
| Depth | 20 |
| Dispersion | 50 |
| Frost | 10 |
| Splay | 0 |

Refraction/Depth/Dispersion/Frost/Splay each expose a textbox and slider. A visual
light-direction control is also visible. It was not manipulated in this pass.
**The main Fill alpha changes100→20 on this conversion**, with D9D9D9 unchanged;
object opacity stays100%. This is a change outside the floating editor. It is
confirmed by the full snapshots immediately before and after type conversion.

Set Angle30, Refraction40, Frost5 with Enter. Close and reopen:30°/40/5 persist;
Intensity80%, Depth20, Dispersion50, Splay0 remain. The opaque baseline Star now
renders dark/translucent with a fine highlighted edge, but there is no detailed
backdrop here to validate the optical behavior of individual Glass parameters.

Evidence: [first Glass state including Fill20](../evidence/material-effects/09-glass.txt),
[reopened edits](../evidence/material-effects/10-glass-reopen.txt),
[screenshot](../evidence/material-effects/10-glass.png).

## ME04 — Returning to previous types is not a full state rollback

Change Glass → Texture. Size X2/Y3 and checked Clip to shape return, but Radius
is now5, matching the edited Glass Frost5 rather than the earlier Texture Radius10.
Fill alpha stays20. Change Texture → Noise: Multi, X2/Y3, Density60%, Opacity25%
return. Thus some type-specific state survives, while other values transfer
between different labels. Do not infer an internal data model from this UI test.

Close and remove the effect row: Fill alpha still20. Restore it explicitly to100.
Final Star has no Effects, original100 ×100/X240/Y200/Count7/Ratio50%, one visible
D9D9D9 Fill100%, object opacity100%; remains selected, zoom101%.

Evidence: [back to Texture](../evidence/material-effects/12-back-texture.txt),
[back to Noise](../evidence/material-effects/13-back-noise.txt),
[removed, Fill still20](../evidence/material-effects/14-effect-removed.txt),
[fully restored](../evidence/material-effects/15-restored.txt),
[restored screenshot](../evidence/material-effects/15-restored.png).
The effect row's accessible name stays Noise through conversions while visible
text correctly changes. Use visible text and actual inputs for the current type.

## ME05 — Glass control measurements

[Raw read-only DOM measurements](../evidence/material-effects/11-glass-metrics.json)
were collected after reopening Glass with Angle30/Refraction40/Frost5.

- Dialog bounds240 ×313 at269/564; bottom877,16px above viewport bottom. The
  earlier Noise/Texture screenshot headers are lower, near647. This shows a
  placement change with editor height in this viewport, not a universal algorithm.
- Each semantic slider rectangle is96 ×44. Their y positions are698.5,730.5,
  762.5,794.5,826.5:32px vertical stride despite44px semantic rectangles. The
  screenshot tracks are smaller; these are not measurements of painted tracks.
- Slider ARIA range: Refraction/Dispersion/Frost/Splay0–100; Depth1–100. Current
  values match40/50/5/0 and20 respectively. These are advertised ranges, not
  validated numeric-entry clamping limits.
- Five associated numeric inputs are48 ×15, font11/450, line-height16, radius2,
  transparent background. Angle input64 ×15; Intensity input63 ×24. Do not
  assume every numeric input's inner box is24px tall from other panel examples.

## Remaining coverage

Fresh-add Texture/Glass defaults versus conversion inheritance; Glass alpha rules
with initially translucent/multiple/gradient fills; Undo/Redo of the combined
Glass/Fill change; effect blend mode; Noise colors; exact X/Y coupling; numeric
bounds and sliders via keyboard/drag; light-direction control; meaningful backdrop
and clipping rendering comparisons; multiple effects/order; Mixed selections;
preview cancellation; hover/focus/disabled states; Shader and Inner shadow.

Follow-up: [Glass history](glass-history.md) verifies fresh-add Frost4, combined
add/Fill Undo/Redo, preservation of Fill30%, two slider key steps and selected
numeric bounds. Conversion history and other alpha contexts remain open.
