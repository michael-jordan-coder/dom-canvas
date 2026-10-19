import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CodeInput } from "../inspector/CodeInput";
import { parseClipboard } from "../canvas/paste";
import { inertProjectHtml } from "../document/projectFile";

export type HtmlDraft = { source: string; name: string; width: string };
export const emptyHtmlDraft: HtmlDraft = { source: "", name: "", width: "640" };

export function HtmlImportDialog({ draft, onDraft, onCreate, onClose }: {
  draft: HtmlDraft; onDraft: (draft: HtmlDraft) => void;
  onCreate: (content: { html: string; css: string; fonts?: string; width: number; name?: string }) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  useLayoutEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement;
    element.showModal();
    element.querySelector<HTMLTextAreaElement>("textarea")?.focus();
    return () => { element.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  const update = (patch: Partial<HtmlDraft>) => { setError(""); onDraft({ ...draft, ...patch }); };
  const create = () => {
    const width = Number(draft.width);
    if (!draft.width.trim() || !Number.isFinite(width) || width < 1 || width > 100000) { setError("Frame width must be between 1 and 100,000 pixels."); return; }
    const parsed = parseClipboard(draft.source, "");
    if (!parsed || parsed.kind !== "document") { setError("Paste HTML markup. Put CSS inside a <style> tag."); return; }
    const html = inertProjectHtml(parsed.html);
    if (!html.trim()) { setError("Include content inside the HTML body."); return; }
    const title = new DOMParser().parseFromString(draft.source, "text/html").title;
    const name = (draft.name.trim() || title.trim()).slice(0, 120);
    onCreate({ html, css: parsed.css, fonts: parsed.fonts, width, ...(name ? { name } : {}) });
  };
  return createPortal(<dialog ref={dialog} className="html-import-dialog" role="dialog" aria-modal="true" aria-labelledby="html-import-title" onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => event.stopPropagation()}>
    <div className="html-import-heading"><div><strong id="html-import-title">Paste HTML</strong><p>Turn a snippet or a full HTML document into an editable frame.</p></div><button className="inspector-icon" aria-label="Close HTML import" title="Close; keep draft" onClick={onClose}>×</button></div>
    <div className="html-import-settings"><label>Frame name<input aria-label="HTML frame name" placeholder="Use document title" maxLength={120} value={draft.name} onChange={event => update({ name: event.target.value })} /></label><label>Width<input aria-label="HTML frame width" type="number" min="1" max="100000" value={draft.width} onChange={event => update({ width: event.target.value })} /></label></div>
    <CodeInput label="HTML source" identity="html-import" value={draft.source} placeholder={'<!DOCTYPE html>\n<html>\n  <head><style>/* Your CSS */</style></head>\n  <body>…</body>\n</html>'} onChange={source => update({ source })} onApply={create} />
    {error && <p className="html-import-error" role="alert">{error}</p>}
    <div className="html-import-footer"><span>⌘/Ctrl+Enter to create · Escape, then Tab to leave the editor</span><button className="btn-primary" disabled={!draft.source.trim()} onClick={create}>Create frame</button></div>
  </dialog>, document.body);
}
