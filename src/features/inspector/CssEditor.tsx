import { useEffect, useState } from "react";
import type { Artboard } from "@/features/canvas/types";

type Props = {
  artboard: Artboard;
  onPreview: (preview: { id: string; css: string } | null) => void;
  onApply: (css: string) => void;
};

export function CssEditor({ artboard, onPreview, onApply }: Props) {
  const [draft, setDraft] = useState(artboard.css);
  const [live, setLive] = useState(true);
  const dirty = draft !== artboard.css;

  useEffect(() => setDraft(artboard.css), [artboard.css]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onPreview(live && dirty ? { id: artboard.id, css: draft } : null);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [draft, dirty, live, artboard.id, onPreview]);
  useEffect(() => () => onPreview(null), [onPreview]);

  const discard = () => { setDraft(artboard.css); onPreview(null); };
  const apply = () => { if (dirty) { onApply(draft); onPreview(null); } };

  return (
    <section className="css-editor" aria-label="Frame CSS editor">
      <div className="css-editor-heading">
        <strong>{artboard.name}</strong>
        <span role="status">{dirty ? "Unapplied changes" : "Frame stylesheet"}</span>
      </div>
      <p className="editor-help">Edit selectors, variables and CSS rules for this frame. Use :host for the frame itself. Inline styles from Design can override these rules.</p>
      <label className="preview-toggle"><input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />Live preview</label>
      <textarea
        className="code-input"
        aria-label="Frame CSS"
        value={draft}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); apply(); }
          if (e.key === "Escape") { e.preventDefault(); discard(); }
        }}
      />
      <div className="editor-actions">
        <button className="btn-ghost" disabled={!dirty} onClick={discard}>Discard</button>
        <button className="btn-primary" disabled={!dirty} onClick={apply}>Apply CSS</button>
      </div>
      <p className="editor-help">⌘/Ctrl + Enter to apply · Esc to discard. Unapplied changes are discarded when you leave this editor. Invalid CSS is ignored by the browser.</p>
    </section>
  );
}
