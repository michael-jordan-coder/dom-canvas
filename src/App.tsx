import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, isTyping } from "@/features/canvas/Canvas";
import { getTranslate, setTranslate } from "@/features/canvas/elementStyle";
import { fitCamera, unionBounds, zoomAround, type Bounds } from "@/features/canvas/geometry";
import { parseClipboard, scopeCss } from "@/features/canvas/paste";
import { SAMPLE_CSS, SAMPLE_HTML } from "@/features/canvas/sample";
import { Toolbar } from "@/features/canvas/Toolbar";
import type { Artboard, Camera, Selection, Tool } from "@/features/canvas/types";
import { pathOf, resolvePath, serializeRoot } from "@/features/document/serialize";
import { loadCamera, saveCamera, useDocument } from "@/features/document/useDocument";
import { ImportButton } from "@/features/import/ImportButton";
import { IMPORT_WIDTH, importUrl, isUrl } from "@/features/import/importUrl";
import { Inspector } from "@/features/inspector/Inspector";
import { CssEditor } from "@/features/inspector/CssEditor";
import { SelectionPath } from "@/features/inspector/SelectionPath";
import { Layers } from "@/features/layers/Layers";

const newId = () => `ab-${crypto.randomUUID().slice(0, 8)}`;

const PANEL_INSET = 257;
const TOOLBAR_INSET = 72;

const sampleDocument = (): Artboard[] => [
  { id: newId(), name: "Sample", x: 80, y: 80, width: 640, html: SAMPLE_HTML, css: scopeCss(SAMPLE_CSS) },
];

export function App() {
  const hostsRef = useRef(new Map<string, HTMLDivElement>());
  const doc = useDocument(hostsRef.current, sampleDocument);
  const { artboards } = doc;

  // Start offset so the first artboard clears the floating layers panel.
  const [camera, setCamera] = useState<Camera>(() => loadCamera() ?? { x: 200, y: 20, z: 1 });
  const [tool, setTool] = useState<Tool>("move");
  const [uiHidden, setUiHidden] = useState(false);
  const [selection, setSelection] = useState<Selection>({ kind: "none" });
  const [inspectorTab, setInspectorTab] = useState<"design" | "css">("design");
  const [cssDrafts, setCssDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [liveCssPreview, setLiveCssPreview] = useState(true);
  const [cssPreview, setCssPreview] = useState<{ id: string; css: string } | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const [layerHover, setLayerHover] = useState<Element | null>(null);
  const [version, setVersion] = useState(0);
  const pendingSelection = useRef<{ artboardId: string; path: number[] | null } | null>(null);
  const selectionAddress = useRef<{ element: Element; artboardId: string; path: number[] } | null>(null);

  const changeCssDraft = (id: string, value: string | null) => {
    setCssDrafts((current) => {
      const next = { ...current };
      if (value === null) delete next[id];
      else next[id] = value;
      return next;
    });
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const t = setTimeout(() => saveCamera(camera), 300);
    return () => clearTimeout(t);
  }, [camera]);

  const onHostMount = useCallback((id: string, host: HTMLDivElement | null) => {
    if (host) hostsRef.current.set(id, host);
    else hostsRef.current.delete(id);
    bump();
  }, [bump]);

  const commit = useCallback((fn?: (list: Artboard[]) => Artboard[]) => {
    doc.commit(fn);
    bump();
  }, [doc, bump]);

  const updateArtboard = useCallback((id: string, patch: Partial<Artboard>) => {
    doc.update((list) => list.map((ab) => (ab.id === id ? { ...ab, ...patch } : ab)));
  }, [doc]);

  const commitArtboard = useCallback((id: string, patch: Partial<Artboard>) => {
    commit((list) => list.map((ab) => (ab.id === id ? { ...ab, ...patch } : ab)));
  }, [commit]);

  const addArtboard = useCallback((content: Pick<Artboard, "html" | "css" | "fonts"> & Partial<Pick<Artboard, "name" | "width">>) => {
    const id = newId();
    commit((list) => {
      const last = list[list.length - 1];
      const x = last ? last.x + last.width + 80 : 80;
      return [...list, { id, name: `Artboard ${list.length + 1}`, x, y: 80, width: 640, ...content }];
    });
    pendingFocus.current = id;
    setSelection({ kind: "artboard", artboardId: id });
  }, [commit]);

  const createArtboard = useCallback((bounds: Bounds) => {
    const id = newId();
    commit((list) => [
      ...list,
      {
        id,
        name: `Frame ${list.length + 1}`,
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.max(1, Math.round(bounds.width)),
        height: Math.max(1, Math.round(bounds.height)),
        html: "",
        css: "",
      },
    ]);
    return id;
  }, [commit]);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importSite = useCallback(async (url: string) => {
    setImporting(true);
    setImportError(null);
    try {
      const { html, css, fonts, title } = await importUrl(url);
      addArtboard({ html, css, fonts, name: title, width: IMPORT_WIDTH });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : String(error));
    } finally {
      setImporting(false);
    }
  }, [addArtboard]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isTyping(e)) return;
      const plain = e.clipboardData?.getData("text/plain") ?? "";
      const rich = e.clipboardData?.getData("text/html") ?? "";
      if (isUrl(plain)) {
        e.preventDefault();
        void importSite(plain.trim());
        return;
      }
      const pasted = parseClipboard(plain, rich);
      if (!pasted) return;
      e.preventDefault();
      if (pasted.kind === "document") {
        addArtboard({ html: pasted.html, css: pasted.css });
      } else if (selection.kind !== "none") {
        const ab = artboards.find((a) => a.id === selection.artboardId);
        if (ab) commitArtboard(ab.id, { css: `${ab.css}\n${scopeCss(pasted.css)}` });
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addArtboard, artboards, commitArtboard, importSite, selection]);

  // Snapshot restores replace the DOM, so the selected element is re-found
  // by path once the artboards have re-rendered.
  useLayoutEffect(() => {
    const pending = pendingSelection.current;
    if (!pending) return;
    pendingSelection.current = null;
    const root = hostsRef.current.get(pending.artboardId)?.shadowRoot;
    if (!root) return setSelection({ kind: "none" });
    const element = pending.path ? resolvePath(root, pending.path) : null;
    setSelection(element ? { kind: "element", artboardId: pending.artboardId, element } : { kind: "artboard", artboardId: pending.artboardId });
  }, [artboards]);

  useLayoutEffect(() => {
    if (selection.kind !== "element") { selectionAddress.current = null; return; }
    if (selection.element.isConnected) {
      selectionAddress.current = { element: selection.element, artboardId: selection.artboardId, path: pathOf(selection.element) };
      return;
    }
    const address = selectionAddress.current;
    const root = hostsRef.current.get(selection.artboardId)?.shadowRoot;
    const replacement = root && address?.element === selection.element ? resolvePath(root, address.path) : null;
    setSelection(replacement ? { ...selection, element: replacement } : root ? { kind: "artboard", artboardId: selection.artboardId } : { kind: "none" });
  }, [selection, version, artboards]);

  const travel = useCallback((direction: "undo" | "redo") => {
    pendingSelection.current =
      selection.kind === "element"
        ? { artboardId: selection.artboardId, path: pathOf(selection.element) }
        : selection.kind === "artboard"
          ? { artboardId: selection.artboardId, path: null }
          : null;
    const moved = direction === "undo" ? doc.undo() : doc.redo();
    if (!moved) pendingSelection.current = null;
    bump();
  }, [doc, selection, bump]);

  const viewport = useCallback(() => {
    const inset = uiHidden ? 16 : PANEL_INSET;
    const rightInset = uiHidden ? 16 : inspectorTab === "css" ? 396 : 304;
    return { left: inset, top: uiHidden ? 16 : 60, width: Math.max(80, window.innerWidth - inset - rightInset), height: Math.max(80, window.innerHeight - (uiHidden ? 16 : 60) - (uiHidden ? 16 : TOOLBAR_INSET)) };
  }, [uiHidden, inspectorTab]);

  useLayoutEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    const ab = artboards.find((item) => item.id === id);
    const host = hostsRef.current.get(id);
    if (!ab || !host) return;
    pendingFocus.current = null;
    setCamera(fitCamera({ x: ab.x, y: ab.y, width: ab.width, height: host.offsetHeight || 300 }, viewport()));
  }, [artboards, version, viewport]);

  const artboardBounds = useCallback((ab: Artboard): Bounds => ({
    x: ab.x, y: ab.y, width: ab.width, height: hostsRef.current.get(ab.id)?.offsetHeight ?? ab.height ?? 0,
  }), []);

  const zoomToFit = useCallback(() => {
    const bounds = unionBounds(artboards.map(artboardBounds));
    if (bounds) setCamera(fitCamera(bounds, viewport()));
  }, [artboards, artboardBounds, viewport]);

  const zoomToSelection = useCallback(() => {
    if (selection.kind === "none") return zoomToFit();
    const target = selection.kind === "element" ? selection.element : hostsRef.current.get(selection.artboardId);
    if (!target) return;
    const r = target.getBoundingClientRect();
    const bounds = { x: (r.left - camera.x) / camera.z, y: (r.top - camera.y) / camera.z, width: r.width / camera.z, height: r.height / camera.z };
    setCamera(fitCamera(bounds, viewport()));
  }, [selection, camera, viewport, zoomToFit]);

  const setZoom = useCallback((zoom: number) => {
    const area = viewport();
    setCamera((current) => zoomAround(current, area.left + area.width / 2, area.top + area.height / 2, zoom / current.z));
  }, [viewport]);

  const revealSelection = useCallback((next: Selection) => {
    setSelection(next);
    const element = next.kind === "element" ? next.element : next.kind === "artboard" ? hostsRef.current.get(next.artboardId) : null;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const area = viewport();
    if (rect.right < area.left || rect.left > area.left + area.width || rect.bottom < area.top || rect.top > area.top + area.height) {
      pendingFocus.current = next.kind === "none" ? null : next.artboardId;
      bump();
    }
  }, [viewport, bump]);

  const deleteSelection = useCallback(() => {
    if (selection.kind === "artboard") {
      commit((list) => list.filter((ab) => ab.id !== selection.artboardId));
      setSelection({ kind: "none" });
    } else if (selection.kind === "element") {
      const parent = selection.element.parentElement;
      selection.element.remove();
      setSelection(parent ? { kind: "element", artboardId: selection.artboardId, element: parent } : { kind: "artboard", artboardId: selection.artboardId });
      commit();
    }
  }, [selection, commit]);

  const duplicateSelection = useCallback(() => {
    if (selection.kind === "artboard") {
      const ab = artboards.find((a) => a.id === selection.artboardId);
      const root = hostsRef.current.get(selection.artboardId)?.shadowRoot;
      if (!ab) return;
      const id = newId();
      commit((list) => [...list, { ...ab, id, name: `${ab.name} copy`, x: ab.x + ab.width + 80, html: root ? serializeRoot(root) : ab.html }]);
      setSelection({ kind: "artboard", artboardId: id });
    } else if (selection.kind === "element") {
      const clone = selection.element.cloneNode(true) as Element;
      selection.element.after(clone);
      setSelection({ kind: "element", artboardId: selection.artboardId, element: clone });
      commit();
    }
  }, [selection, artboards, commit]);

  const nudge = useCallback((dx: number, dy: number) => {
    if (selection.kind === "artboard") {
      const ab = artboards.find((a) => a.id === selection.artboardId);
      if (ab) commitArtboard(ab.id, { x: ab.x + dx, y: ab.y + dy });
    } else if (selection.kind === "element") {
      const el = selection.element as HTMLElement | SVGElement;
      const t = getTranslate(el);
      setTranslate(el, t.x + dx, t.y + dy);
      commit();
    }
  }, [selection, artboards, commit, commitArtboard]);

  const selectParent = useCallback(() => {
    if (selection.kind === "element") {
      const parent = selection.element.parentElement;
      setSelection(parent ? { kind: "element", artboardId: selection.artboardId, element: parent } : { kind: "artboard", artboardId: selection.artboardId });
    } else {
      setSelection({ kind: "none" });
    }
  }, [selection]);

  useEffect(() => {
    const TOOL_KEYS: Record<string, Tool> = { v: "move", f: "frame", a: "frame", r: "rect", t: "text", h: "hand" };
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "z") { e.preventDefault(); travel(e.shiftKey ? "redo" : "undo"); return; }
      if (mod && key === "y") { e.preventDefault(); travel("redo"); return; }
      if (mod && key === "d") { e.preventDefault(); duplicateSelection(); return; }
      if (mod && e.key === "\\") { e.preventDefault(); setUiHidden((v) => !v); return; }
      if (mod || e.altKey) return;

      if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); deleteSelection(); return; }
      if (e.key === "Escape") { selectParent(); setTool("move"); return; }
      if (e.key.startsWith("Arrow")) {
        if ((e.target as HTMLElement).closest("button, [role=tab]")) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const [dx, dy] = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key] ?? [0, 0];
        nudge(dx, dy);
        return;
      }
      if (e.shiftKey && e.code === "Digit0") { setZoom(1); return; }
      if (e.shiftKey && e.code === "Digit1") { zoomToFit(); return; }
      if (e.shiftKey && e.code === "Digit2") { zoomToSelection(); return; }
      if (!e.shiftKey && TOOL_KEYS[key]) setTool(TOOL_KEYS[key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [travel, duplicateSelection, deleteSelection, selectParent, nudge, zoomToFit, zoomToSelection, setZoom]);

  const [copied, setCopied] = useState(false);
  const copyCode = async () => {
    const id = selection.kind === "none" ? undefined : selection.artboardId;
    const ab = artboards.find((a) => a.id === id);
    const root = id ? hostsRef.current.get(id)?.shadowRoot : undefined;
    if (!ab || !root) return;
    try {
      await navigator.clipboard.writeText(`<style>\n${ab.css.trim()}\n</style>\n${serializeRoot(root)}`);
      setCopied(true);
      setNotice(`Copied ${ab.name}${cssDrafts[ab.id] !== undefined ? " — applied CSS only" : ""}`);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setNotice("Could not copy. Check browser clipboard permissions and try again.");
    }
  };

  const activeArtboard = selection.kind === "none" ? undefined : artboards.find((ab) => ab.id === selection.artboardId);
  const fonts = artboards.map((ab) => ab.fonts ?? "").filter(Boolean).join("\n");

  return (
    <div className={`app${uiHidden ? " ui-hidden" : ""}${inspectorTab === "css" ? " css-mode" : ""}`}>
      {fonts && <style>{fonts}</style>}
      <Canvas
        artboards={artboards}
        cssPreview={cssPreview}
        camera={camera}
        onCameraChange={setCamera}
        tool={tool}
        onToolChange={setTool}
        selection={selection}
        onSelect={setSelection}
        hosts={hostsRef.current}
        onHostMount={onHostMount}
        onUpdateArtboard={updateArtboard}
        onCreateArtboard={createArtboard}
        externalHover={layerHover}
        version={version}
        onChange={bump}
        onCommit={commit}
      />

      <aside className="panel left">
        <div className="panel-top">
          <div className="file-name">
            Untitled
            <small role="status" className={doc.saveStatus.startsWith("Not saved") ? "save-error" : ""}>{doc.saveStatus}</small>
          </div>
        </div>
        <div className="section-label">Layers<div className="history-controls"><button title="Undo (⌘/Ctrl+Z)" disabled={!doc.canUndo} onClick={() => travel("undo")}>Undo</button><button title="Redo (⌘/Ctrl+Shift+Z)" disabled={!doc.canRedo} onClick={() => travel("redo")}>Redo</button></div></div>
        <Layers
          artboards={artboards}
          hosts={hostsRef.current}
          selection={selection}
          onSelect={revealSelection}
          onHover={setLayerHover}
          onRenameArtboard={(id, name) => commitArtboard(id, { name })}
          onRenameElement={(el, name) => { el.setAttribute("data-name", name); commit(); }}
          version={version}
        />
      </aside>

      <aside className={`panel right${inspectorTab === "css" ? " code-panel" : ""}`}>
        <div className="inspector-header">
        <div className="inspector-tabs" role="tablist" aria-label="Inspector mode" onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
          e.preventDefault(); e.stopPropagation();
          const tab = e.key === "Home" ? "design" : e.key === "End" ? "css" : inspectorTab === "design" ? "css" : "design";
          if (tab === "css" && activeArtboard) pendingFocus.current = activeArtboard.id;
          setInspectorTab(tab);
          document.getElementById(`${tab}-tab`)?.focus();
        }}>
          <button id="design-tab" role="tab" tabIndex={inspectorTab === "design" ? 0 : -1} aria-selected={inspectorTab === "design"} aria-controls="inspector-content" onClick={() => setInspectorTab("design")}>Design</button>
          <button id="css-tab" role="tab" tabIndex={inspectorTab === "css" ? 0 : -1} aria-selected={inspectorTab === "css"} aria-controls="inspector-content" onClick={() => { if (activeArtboard) pendingFocus.current = activeArtboard.id; setInspectorTab("css"); }}>CSS{activeArtboard && cssDrafts[activeArtboard.id] !== undefined && <span className="draft-dot" aria-label="Draft pending" />}</button>
        </div>
          <button className="copy-control" onClick={copyCode} disabled={!activeArtboard} title="Copy frame HTML and CSS" aria-label={copied ? "Copied" : "Copy frame"}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><rect x="5.5" y="5.5" width="7" height="8" rx="1.5"/><path d="M9.5 3H4A1.5 1.5 0 0 0 2.5 4.5V10"/></svg></button>
        </div>
        {activeArtboard && <SelectionPath selection={selection} artboard={activeArtboard} onSelect={setSelection} />}
        {inspectorTab === "design" && activeArtboard && cssDrafts[activeArtboard.id] !== undefined && <div className="draft-notice">CSS draft kept. Open CSS to preview or apply it.</div>}
        <div className="panel-scroll" id="inspector-content" role="tabpanel" aria-labelledby={`${inspectorTab}-tab`}>
          {inspectorTab === "css" ? activeArtboard ? (
            <CssEditor key={activeArtboard.id} artboard={activeArtboard} draft={cssDrafts[activeArtboard.id] ?? activeArtboard.css} live={liveCssPreview} onLiveChange={setLiveCssPreview} onDraftChange={(value) => changeCssDraft(activeArtboard.id, value)} onPreview={setCssPreview} onApply={(css) => { commitArtboard(activeArtboard.id, { css }); setNotice(`CSS applied to ${activeArtboard.name}`); }} />
          ) : <div className="empty">Select a frame or layer to edit its frame stylesheet.</div> : (
            <Inspector selection={selection} artboards={artboards} onUpdateArtboard={commitArtboard} version={version} onChange={() => commit()} onPreview={bump} onPreviewArtboard={updateArtboard} />
          )}
        </div>
      </aside>

      <div className="canvas-navigation" aria-label="Canvas navigation">
        <button aria-label="Zoom out" onClick={() => setZoom(camera.z / 1.25)}>−</button>
        <button className="zoom-value" title="Actual size (Shift+0)" onClick={() => setZoom(1)}>{Math.round(camera.z * 100)}%</button>
        <button aria-label="Zoom in" onClick={() => setZoom(camera.z * 1.25)}>+</button>
        <span className="navigation-divider" />
        <button title="Fit all frames (Shift+1)" disabled={!artboards.length} onClick={zoomToFit}>Fit all</button>
        <button title="Fit selection (Shift+2)" disabled={selection.kind === "none"} onClick={zoomToSelection}>Fit selection</button>
      </div>
      {notice && <div className="toast" role="status">{notice}</div>}
      <Toolbar tool={tool} onToolChange={setTool}>
        <ImportButton busy={importing} error={importError} onImport={importSite} />
      </Toolbar>
    </div>
  );
}
