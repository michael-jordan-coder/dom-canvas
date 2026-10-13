# Environment and test fixture

- Date: 2026-10-13.
- File: [Untitled](https://www.figma.com/design/4OajwOr5ltNCZ5z0cPwrlO/Untitled?node-id=8-2).
- Approved disposable research surface: Page 2, node `8:2`.
- User explicitly authorized the separate test page; do not ask again for that scope.
- Native tests: Figma desktop, macOS, Design mode, dark theme, 100% canvas zoom.
- Browser access was initially denied for a different signed-in account. After the
  user changed account and opened the file, editor access was verified. This was a
  file-access issue; no Pro-plan restriction was established.
- Browser showed 156% canvas zoom on first successful inspection. Do not reuse the
  desktop gesture coordinates in that browser viewport.
- Native app displayed an offline/sync notice during early tests. Observed local
  editing is not proof of cloud synchronization. The four test objects were later
  present in the browser, but this does not prove every future edit is synced.

## Fixture registry

| Node | Name | Geometry / mode from native inspector |
| --- | --- | --- |
| `8:3` | Text tool comparison | X -49, Y -244; 119 x 15; Auto width |
| `8:4` | A drawn text box keeps… | X -74, Y -169; 170 x 45; Fixed size |
| `8:5` | Frame 1 | X -99, Y -19; 150 x 125 |
| `8:6` | Frame 2 | X 126, Y -19; 150 x 125 |

These are reusable fixtures, not immutable values. Verify current state before a
new experiment and record any changes. Preserve Page 1 and unrelated user designs.

Latest retained research state (2026-10-13, parent-child pass): `15:2` Frame 3
wraps `8:3`, at -59/-254, width 240 Fixed, height 35 Hug, horizontal flow,
padding 10, center alignment. Child `8:3` is now 220 Fill × 15 Hug with text
Auto height and relative position 10/10. Ignore auto layout is off. Other
fixtures were not changed during this pass. See `topics/parent-child-layout.md`.

## Access and input notes

Native UI calls previously failed intermittently with capture/missing-window errors.
Keeping Figma foreground coincided with a successful retry; causation was not proven.
Native `typeText` initially produced an empty text layer; double-click plus paste
inserted the intended string. Browser label selection and DOM measurements now work.
Selecting the enclosing Layers `row` produced no change; clicking its named
`gridcell` selected Frame 1 and exposed X -99, Y -19, W 150, H 125.

Latest continuation: Frame 3 is now 80 Fixed × 50 Hug. Child 8:3 is
100 Fill (min width 100) × 30 Hug, Auto height, relative -10/10. This supersedes
the 240-wide state above; see PC04–PC05 in the parent-child topic.

Component research update: live Frame2 baseline was200 ×125 (not the older150
width). It was converted to a main component without a width edit and retained
for instance research. Its configuration dialog is open. See topics/components.md.

Variant continuation: Frame2 is now component set15:57 with Default and Variant2,
set240 ×310; each variant200 ×125. The unchanged Property1 inline name editor
is active. See CO03 in topics/components.md.

Instance continuation: node15:62 is now verified, selected Variant2 of Frame2,
200 ×125 at -163/-67. Width override260 was reset to200 via Reset instance.

Binding research: local color style Research/Panel white was created and retained.
Instance15:62 was linked, its Fill removed, then Reset fill restored raw white.
No library publication or push to main component was performed.

Variable research: Research/Panel color in Variable collection is3366FF and
bound to the Fill of instance15:62. Previous raw-white state is superseded.

Guide/export pass: instance15:62 has no guide after test removal, and now has one
PNG1x export preset. Advanced Export dialog is open. No file was exported.

Transform pass: Export dialog closed; instance15:62 restored to200 ×125,
X-163/Y-67, rotation0, aspect ratio unlocked. See topics/transforms.md.

Grid/Wrap pass: Frame3 returned to Horizontal, Wrap off, centered,80 Fixed ×50
Hug, padding/gap10, clip off. Child8:3 selected,100 Fill/min100 ×30 Hug,
Auto height, X-10/Y10 in flow. Grid's persisted inactive track settings were not
audited. See topics/grid-wrap.md.

Multi-child Wrap pass: new retained Frame4 (`17:68`) at500/-254,240 Fixed ×100
Hug, Horizontal/Wrap on, centered, gap10/row gap20, padding10, clip off. Three
text children17:69/17:70/17:71 each100 Fixed (min100) ×30 Hug, Auto height,
Inter Regular12, fill3366FF. Frame4 selected; zoom-to-selection58%. Existing
Frame3 unchanged. See topics/wrap-multi.md.

Multi-track Grid pass supersedes Frame4's Wrap state: Grid2 columns / Auto rows,
automatic positioning on,240 Fixed ×100 Hug, X500/Y-254, gaps10/20, padding10,
clip off, columns1fr/1fr.17:71 restored span1,105 Fill/min100 ×30 Hug. Grid
conversion also changed other child sizing (17:69 observed Fill height/Fixed size).
Frame4 remains selected. See topics/grid-multi.md for positioning toggle and
inconclusive Undo; previous Wrap child modes are no longer the current fixture.

Selection context pass: Frame1 hidden/edit/show and lock/edit/reselect experiments
completed, then restored to150 ×125 at-99/-19, visible/unlocked, white Fill,
clip enabled. Frame1 selected, canvas zoom93%. Frame4 retained in Grid state above.

Group/Section pass: duplicated Frame1 as Frame5 (`18:72`), grouped into18:73,
then converted group to Section1 (`18:74`). Group no longer exists. Section1 is
350 ×325 at400/0 after Resize to fit; Frame5 is150 ×125 at100/100 relative,
white Fill, clip enabled. Section1 selected, menu closed, canvas zoom40%.
Other fixtures unchanged. See topics/groups-sections.md.

Shapes pass: Section1 now also contains18:75 Rectangle1 (converted Vector path,
100 ×100 at127/189,radius10),18:77 Ellipse1 (100 ×100 at240/50),18:78 Polygon1
(100 ×100 at10/200,Count6),18:79 Star1 (100 ×100 at240/200,Count7,Ratio50%).
All haveD9D9D9 Fill; positions are section-relative. Section bounds unchanged.
Star1 selected, Move active, vector editor closed, zoom40%. Line attempt created
no layer. See topics/shapes-vector.md.

Mixed-types pass: five Section1 children (Star, Polygon, Ellipse, Vector path,
Frame5) selected. Count/Ratio and Clip tests undone with per-target restoration:
Star7/50%, Polygon6, Frame5 clip checked. Other fixture geometry and paints unchanged.
See topics/mixed-types.md for verified selection changes within Undo history.

Mixed-paint pass: five-object Fill replacement and color edits fully undone;
Frame5 white and four shapesD9D9D9 individually verified. Star second-fill test
removed; Star has one visibleD9D9D9 Fill100%, object opacity100%, Count7/Ratio50%.
Star selected. See topics/mixed-paint.md.
