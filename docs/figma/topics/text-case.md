# Text case, decoration and underline detail states

Observed2026-10-13, Chrome light UI. Page2 child8:3 Text tool comparison in Frame3,
Inter Regular12, Auto line height, spacing0%,100 Fill/min100 ×30 Hug/Auto height,
white Fill, X-10/Y10. Initial alignment left/top, As typed, Decoration None.
[Baseline](../evidence/text-case/01-baseline.txt). Zoom to selection gives215%.

## TC01 — Case and underline affect rendering without resizing this fixture

Type settings → Basics: choose Uppercase, then Underline. Open Underline details.
It exposes a nested Basics/Underline dialog with Back; Decoration radios; Style
Solid/Dotted/Wavy; Thickness Auto (placeholder6.82%); Offset Auto (19.89%);
Skip ink off/on (on initially); Color Auto. Thickness and Offset each have a slider.

Choose Wavy, Thickness12%, Skip ink off. Close the entire editor: canvas shows
TEXT TOOL / COMPARISON with wavy underlines. Width100/height30 and X-10/Y10 remain;
font12/Auto line height/0% tracking remain. Reopen Basics then Underline details:
Uppercase/Underline and Wavy/12%/Skip ink off persist. Layer name still reads
Text tool comparison; this alone does not prove the underlying editable string.

Evidence: [Uppercase/Underline](../evidence/text-case/02-uppercase-underline.txt),
[details initially](../evidence/text-case/03-underline-details.txt),
[closed panel](../evidence/text-case/04-uppercase-canvas.txt),
[screenshot](../evidence/text-case/04-uppercase-canvas.png),
[reopened settings](../evidence/text-case/05-details-reopen.txt).

## TC02 — Center alignment without changing text dimensions

Restore Solid, enter Auto in Thickness, select Skip ink on. Back to Basics,
choose As typed and Decoration None, then Text align center. Close. The main
panel's Align center is selected and the canvas displays original casing centered
in the100-wide text box. Height remains30, two lines; placement of glyphs changes
without changing the object's X-10/Y10. Restore main-panel Align left afterward.

Evidence: [centered state](../evidence/text-case/06-centered.txt),
[screenshot](../evidence/text-case/06-centered.png),
[restored Basics](../evidence/text-case/07-restored-basics.txt).

## TC03 — Underline subeditor remains reachable when disabled

With Decoration None, opening Underline details is still possible. Decoration
None is selected; Style/Thickness/Offset/Skip ink and sliders are disabled; both
numeric inputs display0% despite their6.82%/19.89% placeholders. Color has no
editable control in this snapshot. Re-enable Underline: Solid, Thickness Auto,
Offset Auto and Color Auto return. Therefore disabled0% is not enough evidence
that the latent Auto settings were overwritten.

However Skip ink off is selected on this re-enable, despite the earlier attempt
to restore on before switching to None. The exact transition causing this is not
isolated. Set on again (snapshot verifies it), then return to Basics → None and
close. Final no-decoration rendering is restored; latent Skip ink retention across
None remains inconclusive and must not be claimed fully restored.

Evidence: [disabled details](../evidence/text-case/08-restored-details.txt),
[reenabled latent values](../evidence/text-case/10-latent-settings.txt),
[on verified](../evidence/text-case/11-skip-on.txt),
[final state](../evidence/text-case/12-final.txt),
[final screenshot](../evidence/text-case/12-final.png).

## Automation observation / scope

The first intended target was the long named top-level text. Its visible DOM
name cell measured x49–591.75,width542.75 while the left sidebar ends near289.
A semantic click on the cell and later its row left Page context/no selection.
This suggests the click center falls beyond the clipped sidebar; exact hit testing
was not traced. No text edit occurred. The short child fixture was selected
successfully instead. Do not generalize the inability to select to native UI use.

## Final state and remaining work

Child8:3 selected,215% zoom, main right panel slightly scrolled; As typed, None,
left/top alignment; original geometry and font preserved. Solid/Auto thickness
and offset were verified on re-enable; Skip ink state after final None is open.
Frame3 geometry was not separately reselected in this pass.

Open: lowercase/title case/strikethrough, selected ranges, underlying text content,
case-induced reflow on other strings, fixed-height vertical alignment, paragraph
formatting, decoration colors and offset edits, list/trim/truncation/wrap, history,
Skip ink transition, UI metrics and hover/focus states. Existing type-settings
inventory is not evidence that all those controls work as inferred.
