import { useEffect } from "react";
import type { Artboard } from "@/features/canvas/types";
import { CodeInput } from "./CodeInput";

type Props = {
  artboard: Artboard;
  draft: string;
  live: boolean;
  onLiveChange: (live: boolean) => void;
  onDraftChange: (value: string | null) => void;
  onPreview: (preview: { id: string; css: string } | null) => void;
  onApply: (css: string) => void;
};

export function CssEditor({ artboard, draft, live, onLiveChange, onDraftChange, onPreview, onApply }: Props) {
  const dirty = draft !== artboard.css;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onPreview(live && dirty ? { id: artboard.id, css: draft } : null);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [draft, dirty, live, artboard.id, onPreview]);
  useEffect(() => () => onPreview(null), [onPreview]);

  const discard = () => { onDraftChange(null); onPreview(null); };
  const apply = () => { if (dirty) { onApply(draft); onDraftChange(null); onPreview(null); } };

  return (
    <section className="css-editor" aria-label="Frame CSS editor">
      <div className="css-editor-heading">
        <strong>{artboard.name}</strong>
        <span role="status">{dirty ? "Unapplied changes" : "Frame stylesheet"}</span>
      </div>

      <label className="preview-toggle"><input type="checkbox" checked={live} onChange={(e) => onLiveChange(e.target.checked)} />Live preview</label>
      <CodeInput label="Frame CSS" identity={artboard.id} value={draft} onChange={value => onDraftChange(value === artboard.css ? null : value)} onApply={apply} />
      <div className="editor-actions">
        <button className="btn-ghost" disabled={!dirty} onClick={discard}>Discard</button>
        <button className="btn-primary" title="Apply (⌘/Ctrl+Enter)" disabled={!dirty} onClick={apply}>Apply CSS</button>
      </div>

      <details className="editor-guidance"><summary>CSS help & keyboard shortcuts</summary><p className="editor-help">⌘/Ctrl + Enter to apply. Drafts stay here when you switch tabs or frames during this session. Invalid CSS is ignored by the browser.</p><p className="editor-help">Edit selectors, variables and CSS rules for this frame. Use :host for the frame itself. Inline styles from Design can override these rules.</p><p className="editor-help">Tab / Shift+Tab indent. Enter continues indentation. ⌘/Ctrl+Z undoes draft edits; Shift+⌘/Ctrl+Z redoes them. Escape then Tab moves focus out.</p></details>
    </section>
  );
}
