# Main-component propagation, local override and partial reset

Observed2026-10-13, Chrome light UI. Source Variant2 (`15:58`) is200 ×125,
radius0, white Fill. Instance15:62 selects Variant2,200 ×125 at-163/-67,
radius0; Fill bound to Research/Panel color3366FF. Export1xPNG remains from an
earlier test. This case operates on the existing approved Page2 fixtures.

## CP01 — A source change reaches an unoverridden property

Select Variant2 in Layers, set Corner radius12 and Enter. Select the top-level
Frame2 instance (first of the two Frame2 rows). Its unified and all four individual
radius fields show12. Fill remains the named blue color-variable binding rather
than being replaced by the source's white Fill.

Evidence: [source baseline](../evidence/component-propagation/01-source.txt),
[instance baseline](../evidence/component-propagation/02-instance-before.txt),
[source12](../evidence/component-propagation/03-source12.txt),
[instance12 with binding](../evidence/component-propagation/04-instance12.txt).

## CP02 — Local radius override survives later source changes

Set instance radius24. Return to Variant2, set its radius6, then inspect instance:
its radius remains24. Geometry200 ×125 and blue Fill binding remain. This proves
isolation of this local override from a later change to the same source property;
it does not establish every property/descendant/variant-switch override rule.

Evidence: [local24](../evidence/component-propagation/05-instance-override24.txt),
[retained24 after source6](../evidence/component-propagation/06-instance-retains24.txt).

## CP03 — Reset others restores inheritance while preserving Fill

Instance More actions → Reset specific changes exposes Reset exports, Reset
others, Reset fill, Reset size. Choose Reset others: instance radius becomes6
and all individual corners6; blue color-variable Fill remains, as does the export
preset. No Push changes to main component action was used.

Return source radius0, then inspect instance: it follows back to0. This subsequent
propagation supports restoration of inheritance, not merely manually matching6.
Final instance remains200 ×125/-163/-67, Variant2, blue variable binding,1xPNG;
source white/radius0. Instance selected; zoom69%; no popup.

Evidence: [reset submenu](../evidence/component-propagation/07-reset-menu.txt),
[after Reset others](../evidence/component-propagation/08-reset-others.txt),
[source0](../evidence/component-propagation/09-source-restored.txt),
[instance0](../evidence/component-propagation/10-instance-restored.txt),
[screenshot](../evidence/component-propagation/10-instance-restored.png).

## Open

The complete membership of Reset others is unknown: only radius versus Fill and
export preservation were checked. Nested component properties, text/Boolean/
instance-swap/slot binding, per-corner overrides, partial selection, history,
source deletion and variant switching with overrides remain open. No exact
component-property UI measurements were added in this case.
