import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@/features/canvas/Canvas";
import { parseClipboard, scopeCss } from "@/features/canvas/paste";
import { SAMPLE_CSS, SAMPLE_HTML } from "@/features/canvas/sample";
import type { Artboard, Camera, Selection } from "@/features/canvas/types";
import { ImportBar } from "@/features/import/ImportBar";
import { IMPORT_WIDTH, importUrl, isUrl } from "@/features/import/importUrl";
import { Inspector } from "@/features/inspector/Inspector";
import { Layers } from "@/features/layers/Layers";

let nextId = 1;
const newId = () => `ab${nextId++}`;

export function App() {
  const [artboards, setArtboards] = useState<Artboard[]>(() => [
    { id: newId(), name: "Sample", x: 80, y: 80, width: 640, html: SAMPLE_HTML, css: scopeCss(SAMPLE_CSS) },
  ]);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, z: 1 });
  const [selection, setSelection] = useState<Selection>({ kind: "none" });
  const [version, setVersion] = useState(0);
  const hostsRef = useRef(new Map<string, HTMLDivElement>());

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const onHostMount = useCallback((id: string, host: HTMLDivElement | null) => {
    if (host) hostsRef.current.set(id, host);
    else hostsRef.current.delete(id);
    bump();
  }, [bump]);

  const updateArtboard = useCallback((id: string, patch: Partial<Artboard>) => {
    setArtboards((list) => list.map((ab) => (ab.id === id ? { ...ab, ...patch } : ab)));
  }, []);

  const addArtboard = useCallback((content: Pick<Artboard, "html" | "css" | "fonts"> & Partial<Pick<Artboard, "name" | "width">>) => {
    setArtboards((list) => {
      const last = list[list.length - 1];
      const x = last ? last.x + last.width + 80 : 80;
      const id = newId();
      setSelection({ kind: "artboard", artboardId: id });
      return [...list, { id, name: `Artboard ${list.length + 1}`, x, y: 80, width: 640, ...content }];
    });
  }, []);

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
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
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
        if (ab) updateArtboard(ab.id, { css: `${ab.css}\n${scopeCss(pasted.css)}` });
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addArtboard, artboards, importSite, selection, updateArtboard]);

  const fonts = artboards.map((ab) => ab.fonts ?? "").filter(Boolean).join("\n");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      if (selection.kind === "artboard") {
        setArtboards((list) => list.filter((ab) => ab.id !== selection.artboardId));
        setSelection({ kind: "none" });
      } else if (selection.kind === "element") {
        selection.element.remove();
        setSelection({ kind: "none" });
        bump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selection, bump]);

  const copyCode = async () => {
    const id = selection.kind === "none" ? artboards[0]?.id : selection.artboardId;
    const ab = artboards.find((a) => a.id === id);
    const host = id ? hostsRef.current.get(id) : undefined;
    if (!ab || !host?.shadowRoot) return;
    const markup = Array.from(host.shadowRoot.children)
      .filter((el) => el.tagName !== "STYLE")
      .map((el) => el.outerHTML)
      .join("\n");
    await navigator.clipboard.writeText(`<style>\n${ab.css.trim()}\n</style>\n${markup}`);
  };

  return (
    <div className="app">
      <aside className="panel left">
        <div className="panel-header">Layers</div>
        <Layers artboards={artboards} hosts={hostsRef.current} selection={selection} onSelect={setSelection} version={version} />
      </aside>

      <main className="canvas-area">
        {fonts && <style>{fonts}</style>}
        <Canvas
          artboards={artboards}
          camera={camera}
          onCameraChange={setCamera}
          selection={selection}
          onSelect={setSelection}
          hosts={hostsRef.current}
          onHostMount={onHostMount}
          onMoveArtboard={(id, x, y) => updateArtboard(id, { x, y })}
          version={version}
          onChange={bump}
        />
        <ImportBar busy={importing} error={importError} onImport={importSite} />
      </main>

      <aside className="panel right">
        <div className="panel-header">
          Inspector
          <button onClick={copyCode}>Copy code</button>
        </div>
        <Inspector selection={selection} artboards={artboards} onUpdateArtboard={updateArtboard} version={version} onChange={bump} />
      </aside>
    </div>
  );
}
