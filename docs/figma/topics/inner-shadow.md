# Inner shadow, supported Spread and multiple effect rows

Observed2026-10-13 in Chrome light UI, canvas101%. Page2 Star18:79 begins with
no effects,100 ×100 at240/200, D9D9D9 Fill100%, object opacity100%, Count7/Ratio50%.
The immediately preceding restored baseline is recorded in
[Glass history](../evidence/glass-history/14-restored.txt).

## IS01 — Star context and disabled Spread

Add effect → Inner shadow. Default X0/Y4, Blur4, black25% color. Spread is0 and
**disabled**, with accessible explanation: “Spread is only supported for rectangles,
ellipses, frames, and components”. This is the UI's stated support list; the Star
and Ellipse cases were actually tested here. Other types require separate tests.

Set Position X8 and Blur12 with Enter. Open Blend mode: Normal is checked.
Options are Normal, Darken, Multiply, Plus darker, Color burn, Lighten, Screen,
Plus lighter, Color dodge, Overlay, Soft light, Hard light, Difference, Exclusion,
Hue, Saturation, Color and Luminosity. Choose Multiply, close/reopen the editor,
then reopen Blend mode: Multiply remains checked; X8/Y4/Blur12 persist.

Evidence: [initial](../evidence/inner-shadow/01-star-default.txt),
[blend inventory](../evidence/inner-shadow/02-blend-menu.txt),
[reopened](../evidence/inner-shadow/03-reopen-multiply.txt),
[screenshot](../evidence/inner-shadow/03-star.png).
This verifies mode selection/persistence, not each blend algorithm's rendering.

Disabled Spread inner input measured110 ×24, font11/450, line-height16, radius2,
transparent background, text black alpha.3, opacity1. Native `disabled=true`,
`aria-disabled` absent. [Raw CSS/DOM](../evidence/inner-shadow/04-disabled-spread.json).
The disabled appearance is text color rather than reduced whole-element opacity.

## IS02 — Two effect rows retain independent values and visibility

Close Inner shadow. Add effect → Drop shadow. A new **top** row is inserted above
Inner shadow and its editor opens. The new effect has X0/Y4/Blur4/black25%, with
Spread also disabled on Star. Click the existing Inner shadow row while Drop
shadow's editor is open: the single visible editor switches to Inner shadow and
shows the retained X8/Y4/Blur12. No global parameter overwrite is observed.

Close; uncheck visibility only on Inner shadow. Drop shadow remains checked.
Remove Drop shadow: only the unchecked Inner shadow row remains. Remove that
row too: Star has no Effects, original Fill and geometry.

Evidence: [two rows and new defaults](../evidence/inner-shadow/05-two-effects.txt),
[switch editor](../evidence/inner-shadow/06-switch-inner.txt),
[hide one](../evidence/inner-shadow/07-hide-inner.txt),
[remove top](../evidence/inner-shadow/08-remove-top.txt),
[Star restored](../evidence/inner-shadow/09-star-restored.txt).
Insertion order is proven; drag reorder, compositing order and per-row Undo are not.

## IS03 — Ellipse enables Spread

Select Ellipse1 (`18:77`),100 ×100 at240/50 inside Section1, D9D9D9 Fill100%,
object opacity100%, no effects. Add Inner shadow: X0/Y4/Blur4/black25%, Spread0
**enabled** with ordinary label Spread. Set Spread10 and Enter. Close/reopen:
Spread10 persists. Screenshot shows the inward dark ring while width/height
remain100 ×100. Close and remove the effect to restore the Ellipse.

Evidence: [Ellipse baseline](../evidence/inner-shadow/10-ellipse-before.txt),
[enabled Spread](../evidence/inner-shadow/11-ellipse-default.txt),
[Spread10 reopened](../evidence/inner-shadow/12-ellipse-spread10.txt),
[screenshot](../evidence/inner-shadow/12-ellipse.png),
[restored](../evidence/inner-shadow/13-ellipse-restored.txt),
[restored screenshot](../evidence/inner-shadow/13-ellipse-restored.png).

## Final state and open

Star and Ellipse have no Effects, original gray Fill100% and geometry. Ellipse
selected, editor closed, zoom101%. Other Page2 objects unchanged by these actions.

Open: negative Spread and bounds; text/vector/group/section/component support
verification; mixed supported/unsupported selections; shadow color editing and
nested picker cancellation; blend previews; effect reorder; transactions/history;
multiple same-type rows; enabled/disabled hover and focus; Shader editor.
