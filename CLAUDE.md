# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

DOM Canvas is a Figma-like infinite canvas whose design language is real HTML/CSS: pasted code, URLs and pasted React components become live, selectable DOM layers. React 19 + Vite + TypeScript, no backend; documents live in `localStorage`.

## Commands

```bash
pnpm install
pnpm dev                                  # http://localhost:5180 (also "dom-canvas" in .claude/launch.json)
pnpm build                                # tsc -b && vite build
npx tsc -b                                # typecheck only
node --test tests/*.test.mjs              # all tests
node --test tests/paste.test.mjs          # one file
node --test --test-name-pattern="rem" tests/paste.test.mjs   # one test
```

There is no linter. Tests use `node:test` and import `src/**/*.ts` directly via Node's type stripping, which has two consequences for any module a test imports (directly or transitively):
- runtime imports must be relative and end in `.ts` (`import { x } from "./inert.ts"`); the `@/` alias and extensionless paths only resolve in Vite/tsc (type-only imports are erased and are fine);
- there is no DOM in Node, so logic that needs `DOMParser`, `CSSStyleSheet` or elements can't be unit-tested there; verify it in the browser instead.

## Architecture

**Frames are shadow roots.** Each frame (`Artboard` in `src/features/canvas/types.ts`) renders as a host `<div>` with an open shadow root containing one `<style>` (`BASE_CSS` + the frame's `css`) followed by its `html` (`canvas/Artboard.tsx`). `:host` is `all: initial`, a named inline-size container (`container-name: frame`) and the frame's "document".

**The live DOM is the source of truth while editing.** Interactions (drag, resize, Design panel edits) mutate DOM inside the shadow roots directly, without React state. `commit()` in `document/useDocument.ts` serializes every shadow root back into `artboard.html`; that string is what undo/redo (`document/history.ts`, full-document snapshots), `localStorage` persistence (`dom-canvas:doc:v1`, `dom-canvas:camera:v1`) and project files read. Any mutation that isn't followed by a commit is lost and isn't undoable. `Artboard.tsx` only replaces shadow content when the serialized DOM differs from `html` (undo/redo/new content), so element references held by selection survive ordinary commits; across snapshots selection is restored by index path (`serialize.ts` `pathOf`/`resolvePath`).

**Canvas.** All frames sit in `.world`, transformed by the camera (`translate(x,y) scale(z)`). Hit-testing uses `composedPath()` to reach elements inside shadow roots. Selection outlines/handles are drawn in a separate overlay from `getBoundingClientRect`; transformed elements use accumulated matrices across shadow hosts (`canvas/elementStyle.ts`). The canvas is `user-select: none`; `[contenteditable]` text opts back in.

**Import pipeline** (`canvas/paste.ts`, entry in `App.tsx`'s paste handler):
- HTML documents are split with `DOMParser`: `<style>` contents become `css`, body attributes move to a wrapper `<div>`, head stylesheets/scripts move into the body.
- `scopeCss()` rewrites document CSS for a shadow root: `html`/`body`/`:root` → `:host`, width-only `@media` → `@container frame`, `vw`/`vh` → `cqw`/`cqh`, `rem` → px at 16px (`rem` would otherwise resolve against the app's 11px root). Compound selectors such as `body.dark` are known to break.
- `@font-face` and font-service stylesheets (allowlist in `isFontStylesheet`) are ignored inside shadow roots, so they go to `artboard.fonts`, which `App` injects at document level as one `<style>` per frame (keeps `@import` valid). Tailwind `@property` rules from React imports go there too.
- React code (`import/reactDetect.ts` → lazy `import/react.ts`) is compiled with Sucrase, rendered once with `renderToStaticMarkup` (non-React imports are stubbed, missing props retried as empty lists), and only the Tailwind classes it uses are compiled with the Tailwind v4 `compile()` API.
- URL import (`import/importUrl.ts` + `snapshot.ts`) loads the page through the `/__proxy` middleware in `vite.config.ts` (dev server only) and snapshots computed styles at 1280px.

**Scripts are kept inert, run only in Play.** `document/inert.ts` makes `<script>` a non-executable type and prefixes `on*` handlers and `javascript:` URLs with `data-dc-`; this runs on paste, the Paste HTML dialog and project open (`inertProjectHtml`). Play (frame badge chip, action search, Escape to stop) restores them into a `srcdoc` iframe over the frame with `sandbox="allow-scripts"` and no same-origin, so it can't reach the app or its storage. Never let pasted markup reach the canvas without going through `makeInert`.

**Export.** `document/exportHtml.ts` builds a standalone HTML file from a frame or element (only rules reaching the element's subtree; `:host`/`@container`/`cq*` translated back to `body`/`@media`/`v*`; inert scripts restored). It powers both the read-only CSS tab (`inspector/ElementCode.tsx` + `highlight.ts`) and Play.

**Inspector (Design panel).** Edits are written as inline styles on the selected element, not to stylesheet rules. `inspector/propertyState.ts` separates authored, computed, Mixed, variable-bound and resettable values across multi-selection. Frame appearance/border/effects are stored in an owned `:host` rule inside `artboard.css`, between `dom-canvas:frame-style` comments.

## Docs

- `README.md` is the user-facing behavior spec, kept in sync with every behavior change.
- `docs/tools/figma-interface/` is the Figma behavior research (mostly Hebrew) that the Design panel is modeled on; `docs/design-panel-implementation/README.md` maps that research to the implementation and lists deliberate Figma/CSS differences.
