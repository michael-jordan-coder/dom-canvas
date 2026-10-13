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
