# Glass: add history, translucent Fill and numeric bounds

Observed2026-10-13, Chrome light UI, Star18:79 on Page2,100 ×100, D9D9D9 Fill100%,
object opacity100%, no effects, canvas101%. Continues [material effects](material-effects.md).
[Baseline](../evidence/glass-history/01-baseline.txt).

## GH01 — Fresh add and combined Undo/Redo

Add effect → Glass. Fresh values: Angle-45°, Intensity80%, Refraction80, Depth20,
Dispersion50, Frost4, Splay0. Fill alpha changes100→20 while object opacity stays100%.
Unlike conversion from Texture Radius10, a fresh Glass effect starts with Frost4
in this fixture. These are observed values, not an account-independent guarantee.

Close the editor. Main menu → Edit → Undo once removes Glass and restores Fill100.
Reopen Main menu → Edit → Redo once restores Glass and Fill20. No layer selections
or other document edits were interposed. This proves a combined history step for
**fresh addition**; conversion from another effect still needs a separate history test.
A first Redo attempt targeted the menu after it had closed and found no match;
opening the menu again and invoking Redo succeeded without an extra history edit.

Evidence: [fresh add](../evidence/glass-history/02-fresh-glass.txt),
[one Undo](../evidence/glass-history/03-undo-add.txt),
[one Redo](../evidence/glass-history/04-redo-add.txt).

## GH02 — Slider keyboard steps

Reopen Glass. Focus Refraction slider and press ArrowRight: textbox80→81.
Press Shift+ArrowRight:81→91. The slider is reported active after the first press;
the coupled textbox reflects the change. Other keys/slider families remain open.

Evidence: [ArrowRight](../evidence/glass-history/05-slider-right.txt),
[Shift+ArrowRight](../evidence/glass-history/06-slider-shift-right.txt).

## GH03 — Committed bounds and angle normalization

Enter each value into the named textbox and press Enter, keeping this order:

| Input | Displayed committed result | Evidence |
| --- | --- | --- |
| Refraction150 | 100 | [capture](../evidence/glass-history/07-refraction150.txt) |
| Depth0 | 1 | [capture](../evidence/glass-history/08-depth0.txt) |
| Frost150 | 100 | [capture](../evidence/glass-history/09-frost150.txt) |
| Angle450 | 90° | [capture](../evidence/glass-history/10-angle450.txt) |

These examples corroborate the advertised slider boundaries for the tested
ends only. Negative Refraction/Frost, upper Depth, other fields, fractional
precision and nonnumeric handling were not tested. Angle450→90 is one observed
normalization example, not proof of behavior across every positive/negative turn.

## GH04 — Already translucent Fill is preserved in this case

Close and remove Glass. Explicitly set the remaining Fill alpha30. Add a fresh
Glass effect: Fill remains30, object opacity100%; fresh effect values return to
-45/80/80/20/50/4/0. Thus the100→20 mutation is not applied to every starting alpha.
Close and Undo once: no effects, Fill still30. Explicitly restore Fill100.

Evidence: [before30](../evidence/glass-history/11-fill30-before.txt),
[Glass at30](../evidence/glass-history/12-fill30-glass.txt),
[screenshot](../evidence/glass-history/12-fill30-glass.png),
[Undo](../evidence/glass-history/13-undo-translucent.txt).

No threshold rule is inferred from testing only100 and30. Initial99%,0%, multiple
paints, gradients and object-opacity interactions still need cases.

## Final state and remaining gaps

Star restored: no effects, one visible D9D9D9 Fill100%, object opacity100%,100 ×100,
X240/Y200, Count7/Ratio50%. Selected, editor closed, zoom101%.
[State](../evidence/glass-history/14-restored.txt),
[screenshot](../evidence/glass-history/14-restored.png).

Fresh-add history and the listed numeric/keyboard cases are observed. Conversion
history, broader alpha predicate, numeric editing lifecycle, pointer slider/light
controls, visual focus/hover measurements and optical rendering remain open.
