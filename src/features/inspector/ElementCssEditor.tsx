import { layerName } from "@/features/layers/Layers";
import type { Styled } from "@/features/canvas/elementStyle";
import { CodeInput } from "./CodeInput";

export type ElementCssDraft = { value: string; base: string };

type Props = {
  element: Styled;
  draft?: ElementCssDraft;
  onDraft: (value: string | null) => void;
  onApply: () => void;
};

export function ElementCssEditor({ element, draft, onDraft, onApply }: Props) {
  const source = element.getAttribute("style") ?? "";
  const value = draft?.value ?? source;
  const dirty = value !== source;
  const conflict = dirty && draft !== undefined && draft.base !== source;
  const apply = (replace = false) => {
    if (!dirty || !element.isConnected || (conflict && !replace)) return;
    if (value.trim()) element.setAttribute("style", value);
    else element.removeAttribute("style");
    onDraft(null);
    onApply();
  };
  const format = () => {
    // The interpretation is read-only; the source keeps unsupported declarations.
    const probe = document.createElement("div");
    probe.setAttribute("style", value);
    const formatted = Array.from(probe.style).map((property) => `${property}: ${probe.style.getPropertyValue(property)}${probe.style.getPropertyPriority(property) ? " !important" : ""};`).join("\n");
    return formatted;
  };
  return <section className="css-editor" aria-label="Selected element CSS editor">
    <div className="css-editor-heading"><strong>{layerName(element)}</strong><span role="status">{dirty ? "Unapplied changes" : "Inline styles"}</span></div>

    {conflict && <div className="css-conflict" role="alert">
      <strong>Styles changed in Design</strong>
      <p>The element changed after this draft started. Compare the current styles before replacing them.</p>
      <details><summary>Current inline styles</summary><pre>{source || "No inline styles"}</pre></details>
      <div className="editor-actions"><button className="btn-ghost" onClick={() => onDraft(null)}>Use current styles</button><button className="btn-ghost" onClick={() => apply(true)}>Replace with draft</button></div>
    </div>}
    <CodeInput label="Element CSS" identity={element} value={value} placeholder={'color: #1e1e1e;\npadding: 16px;'} onChange={next => onDraft(next === source ? null : next)} onApply={() => apply()} />
    <div className="editor-actions"><button className="btn-ghost" disabled={!dirty} onClick={() => onDraft(null)}>Discard</button><button className="btn-primary" title="Apply (⌘/Ctrl+Enter)" disabled={!dirty || !element.isConnected || conflict} onClick={() => apply()}>Apply to element</button></div>
    <details className="css-parsed"><summary>Browser interpretation</summary><pre>{format() || "No supported declarations"}</pre></details>

    <details className="editor-guidance"><summary>CSS help & keyboard shortcuts</summary><p className="editor-help">⌘/Ctrl + Enter to apply as one undo step. Unsupported declarations are kept in the source but ignored by the browser.</p><p className="editor-help">Declarations for this element only. These override its stylesheet. Clear a declaration to return to the stylesheet value.</p><p className="editor-help">Tab / Shift+Tab indent. Enter continues indentation. ⌘/Ctrl+Z undoes draft edits; Shift+⌘/Ctrl+Z redoes them. Escape then Tab moves focus out.</p></details>
  </section>;
}
