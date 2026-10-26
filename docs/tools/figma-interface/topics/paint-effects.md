# Fill and effect editors

Observed 2026-10-13 in Chrome, light UI, 125% canvas zoom, Frame 1 on Page 2.
This is a first behavioral inventory, not complete paint/effect coverage.

## PA01 — Solid picker and committed close

Click the white Fill swatch. The Color picker dialog exposes Custom/Libraries,
New style or variable, and Solid/Gradient/Pattern/Image/Video/Shader paint modes.
Solid includes a reticle, hue and opacity sliders, Sample color, Color format
(current Hex), color value, alpha, page swatches, blend mode and contrast action.
Only Solid and Gradient were exercised; other modes are inventory observations.

Enter FF0000 into the dialog's Color spinbutton and press Enter. Both the dialog
and the panel show red. Close the dialog: the panel retains FF0000. Closing an
editor after a committed entry is not cancellation in this case.

Evidence: [initial UI](../evidence/paint-effects/01-solid-picker.txt),
[screenshot](../evidence/paint-effects/01-solid-picker.png),
[red entered](../evidence/paint-effects/03-red-enter.txt),
[closed](../evidence/paint-effects/04-close-persists-red.txt).

The measured role=dialog bounding box is 240 × 489 CSS px at x269/y388 in this
viewport. That node itself is transparent, padding 0, radius 0, shadow none.
This does **not** describe its nested visible surface or prove a universal popup
height/placement. [DOM metrics](../evidence/paint-effects/02-picker-metrics.json).

## PA02 — Gradient changes panel row and editing context

Reopen red Fill; choose Gradient. The panel's hex field becomes a Linear gradient
button with whole-paint opacity. The editor exposes Paint type, Flip gradient,
Rotate gradient, Add gradient stop, and individual stop position/color/opacity/
delete controls. The observed initial stops are red FF0000 at 0% and 990000 at
100%, both alpha100. These values belong to this conversion, not every gradient.

Paint type menu lists Linear, Radial, Angular, Diamond. In this gradient editing
state the snapshot also marks Rotate 90 right, Flip horizontal/vertical and Toggle
auto layout disabled. Thus an open editor can change capabilities elsewhere in
the panel, not only its own controls. Individual gradient types/handles were not
edited in this pass.

Evidence: [gradient context](../evidence/paint-effects/05-gradient.txt),
[type menu](../evidence/paint-effects/06-gradient-types.txt),
[screenshot](../evidence/paint-effects/07-gradient.png).

Switching back to Solid returned FF0000. Enter FFFFFF and close to restore the
fixture's white Fill. The subsequent effect snapshot confirms FFFFFF.

## EF01 — Add, edit, close, hide and remove a shadow

1. Click Add effect: a type menu appears before an effect row is created.
   Observed types: Inner shadow, Drop shadow, Layer blur, Background blur, Noise,
   Texture, Glass, Shader (Beta).
2. Choose Drop shadow: a row with an editor button, visibility checkbox and Remove
   appears. Its editor opens immediately.
3. Initial fixture values: X0, Y4, Blur4, Spread0, black000000 alpha25. The editor
   also exposes Effect settings (type), Blend mode and Close.
4. Set Blur12, Enter, Close, then reopen the Drop shadow row. Blur remains12.
5. Close and uncheck its visibility. The effect row remains, checkbox unchecked.
6. Remove from that effect's row. The row disappears; Effects returns to the empty
   section with Add effect. The white Fill is retained.

Evidence: [add menu](../evidence/paint-effects/08-add-effect.txt),
[created effect](../evidence/paint-effects/09-drop-shadow.txt),
[editor screenshot](../evidence/paint-effects/09-drop-shadow.png),
[reopened Blur12](../evidence/paint-effects/10-effect-reopened.txt),
[hidden](../evidence/paint-effects/11-effect-hidden.txt),
[removed](../evidence/paint-effects/12-effect-removed.txt).

## Open coverage

Paint alpha versus object opacity; multiple fill/effect ordering and selection;
picker Escape and Undo transaction boundaries; live preview timing; gradient stop
editing and canvas handles; other paint types; all other effect types/parameters;
blend modes; style/variable binding; floating editor nested surfaces, focus and
hover, repositioning/scroll and viewport edge behavior. Inventory is not verified
behavior for untested options. Final fixture: Frame 1 white Fill, no effects.
