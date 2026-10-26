# Layer and Background blur editors

Observed 2026-10-13 in Chrome, light UI, viewport screenshot 750 × 893 CSS pixels,
canvas zoom 101% after Zoom to selection. Disposable Page 2 Star 1 (`18:79`):
100 × 100 at X240/Y200 within Section 1, Count7, Ratio50%, D9D9D9 Fill100%,
object opacity100%, no initial effects. [Baseline](../evidence/blur-effects/01-before.txt).

## BL01 — Add Layer blur and switch modes

1. Add effect → Layer blur. A visible effect row and floating unnamed dialog appear.
2. Uniform is initially selected; Blur radius is4. Set12 and Enter.
3. Select Progressive. Start appears with0 and End retains12.
4. Set Start2 and End20, committing each. Close, Zoom to selection, reopen the row.
5. Progressive and2/20 persist. The canvas shows the blurred Star and a vertical
   line with endpoint handles. Width/Height remain100; blur does not change these
   panel geometry values in this case.
6. Select Uniform: Start disappears; the remaining visible Blur field is20.
   Its immediate accessible name still says End. Select Progressive again.

Evidence: [added](../evidence/blur-effects/02-layer-blur.txt),
[Uniform12](../evidence/blur-effects/03-uniform12.txt),
[Progressive initially](../evidence/blur-effects/04-progressive.txt),
[reopened2/20](../evidence/blur-effects/05-progressive-reopen.txt),
[canvas and editor](../evidence/blur-effects/05-progressive-reopen.png),
[Uniform again](../evidence/blur-effects/06-uniform-again.txt),
[Progressive again](../evidence/blur-effects/07-progressive-again.txt).
The Layer blur screenshot has a transient Zoom to selection toast over part of
its lower editor; use the text capture for the End value.

## BL02 — Changing effect type preserves these parameters

Open Effect settings in the editor header. The visible type menu offers Inner
shadow, Drop shadow, Layer blur, Background blur, Noise, Texture, Glass and Shader
(the Add effect inventory labels Shader Beta). Choose Background blur.

The visible row/header change to Background blur while Progressive and2/20 remain.
Close and reopen: these values persist. Both modes remain available. Selecting
Uniform again leaves20 as the single Blur value. No extra background-specific
control appears in this tested editor state.

The row accessible name remains Layer blur even though its rendered text says
Background blur. Likewise the immediate single Blur input can retain End as its
accessible name; after the later Redo/reopen it correctly says Blur radius.
Do not use stale accessibility names as evidence that type changes failed.

Evidence: [type changed](../evidence/blur-effects/08-background.txt),
[reopened](../evidence/blur-effects/09-background-reopen.txt),
[screenshot](../evidence/blur-effects/09-background-reopen.png),
[Uniform](../evidence/blur-effects/11-background-uniform.txt).
The opaque gray Star has no useful detailed backdrop: this case proves editor
state and parameter retention, not the rendered background-blur sampling rule.

## BL03 — Mode Undo/Redo

After BL02's switch to Uniform, close the editor. Main menu → Edit → Undo;
reopen the effect row. Progressive is selected with Start2/End20. Close; Main
menu → Edit → Redo; reopen. Uniform is selected with Blur radius20. No layer
selection changes were inserted between these edits/history commands.

Evidence: [Undo](../evidence/blur-effects/12-undo-mode.txt),
[Redo](../evidence/blur-effects/14-redo-mode.txt).
This verifies mode history, not effect-type-switch history or cancellation.

## BL04 — Measured UI, Progressive Background blur at rest

Read-only DOM computed styles and rectangles, after reopening the editor:
[control measurements](../evidence/blur-effects/10-metrics.json),
[styled surfaces](../evidence/blur-effects/13-surface-metrics.json).

| Element | Measured CSS values |
| --- | --- |
| Dialog bounds | x269/y647, 240 × 156; semantic dialog transparent, radius0 |
| Visible inner surface | Same bounds; white, radius13; three shadows listed below |
| Header | 240 × 40; padding0 32px 0 8px; inset bottom divider rgb230 |
| Mode track | 208 × 24 at285/699; rgb245 background; radius5 |
| Each radio hit area | 104 × 24 |
| Selected Progressive label | white; radius5; inset1px rgb230; horizontal padding8 |
| Start/End field visible wrappers | 136 × 24 at357/731 and357/763; rgb245, border1px rgb245, radius5 |
| Start input | 110 × 24 at382/731; font11/450, line-height16; transparent, radius2, transparent1px border, padding0 |
| Close button | 24 × 24 at477/655; radius5; transparent |

Surface shadows: black alpha .15 at0/2px/5px; alpha .12 at0/10px/16px;
alpha .12 at0/0/.5px, all spread0. Input text is black alpha .898.
The gray field labels overlap underlying white wrappers with rgb230 borders;
measurements distinguish these DOM layers. The semantic dialog itself does not
own the visible white background, radius or shadow. These are rest-state values,
not hover/focus/disabled or other viewport measurements.

## Final state and open coverage

Close the editor and Remove the effect row. The Effects section has no rows;
Star remains100 × 100, X240/Y200, Count7/Ratio50%, one visible D9D9D9 Fill100%,
object opacity100%. Star selected, canvas101%.
[Restored state](../evidence/blur-effects/15-restored.txt),
[restored screenshot](../evidence/blur-effects/15-restored.png).

Open: drag/reverse Progressive handles; numeric limits/negative/invalid values;
background sampling on transparent objects over detailed content; cancellation;
multiple effects/order and Mixed effect values; effect-type Undo/Redo; variable
binding; editor hover/focus/edge placement; the other effect types.
