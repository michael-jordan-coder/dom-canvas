# Text component property: creation, binding and instance override

Observed2026-10-13, approved Untitled Page2, light UI750×893,69% zoom.

## TP01 — Child and direct binding creation

Select Variant2, Zoom to selection, Text tool, click canvas center. A text layer
is created inside Variant2. Type Panel label into the active div[role=document],
Escape, set X20/Y30 with Enter. Auto width,62×15,InterRegular12,Auto line height,
black000000 Fill. Layer node24:128 was observed in the live URL after reconnect.

The text panel has a content textbox above Position and two identically named
Apply variable/property controls: one beside content, another beside visibility.
Use the first, content control. Its picker exposes New variable/property. Click:
Create property or variable dialog defaults Create=Property,Name=Text,
Value=Panel label. Set Name=Research label and Create property.
The source panel replaces the content textbox with Research label, Go to property,
and Detach property. This path creates **and binds** in one workflow.

Evidence: [text baseline](../evidence/text-property/01-text.txt),
[creation](../evidence/text-property/02-create.txt),
[bound source](../evidence/text-property/03-bound.txt).

## TP02 — Instance edit and rendered override

Select instance15:62. Below Research visible, a Research label textbox appears
with Panel label and its own Apply variable/property to Research label action.
Fill Updated label, then Tab. The instance field contains the new value.
The source visible in the initial screenshot still reads Panel label.
Actions → search zoom to selection → Zoom to selection centers the instance;
its rendered text reads Updated label. Instance frame remains200×125 and blue
Research/Panel color binding persists. This demonstrates source/instance content
separation for this edit, not all text override or source-update semantics.

Evidence: [instance baseline](../evidence/text-property/04-instance.txt),
[override](../evidence/text-property/05-override.txt),
[source retains baseline screenshot](../evidence/text-property/05-override.png),
[rendered instance](../evidence/text-property/06-rendered.png),
[final panel](../evidence/text-property/07-final.txt),
[final screenshot](../evidence/text-property/07-final.png).

## TP03 — Field measurement

Research label is a TEXTAREA,88×40 CSSpx,font11px/450,line-height16px,padding3px7px,
radius5px,backgroundrgb(245,245,245). Value Updated label wraps visually onto two
lines in the narrow inspector field; the canvas auto-width text remains one line.
This is the captured populated state, not a universal field height.

Evidence: [computed values](../evidence/text-property/07-field.json).

## Tooling observations and retained state

Browser3 became unavailable while opening creation. Inventory exposed Chrome4;
reconnected to the same tab858575047, inspected picker state, then continued.
No page reload or duplicate fixture creation was needed. A generic role=document
matched both HTML and the canvas DIV; scoped DIV fixed text entry. The Move
shortcut for zoom timed out in the later state; action search successfully
centered the selection. Zoom menu remained open after Escape/action search and
was closed with its own button. These are recorded automation observations,
not universal Figma interaction rules.

Retained: Variant2 now contains Panel label text24:128 at20/30,62×15 Auto width,
black InterRegular12, content bound Research label defaultPanel label. Existing
instance15:62 has text overrideUpdated label and Research visible=True, same
blueFill and1xPNG. Instance selected69%, menus closed. Page1 untouched.

Open: text reset/history, source default propagation, multiline/empty values,
variant switches with text overrides, property detach, mixed instances, String
variables, and field hover/focus/typing/invalid/cancellation states.
