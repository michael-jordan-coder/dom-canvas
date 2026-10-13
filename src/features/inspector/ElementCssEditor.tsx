import { layerName } from "@/features/layers/Layers";
import type { Styled } from "@/features/canvas/elementStyle";

type Props = {
  element: Styled;
  draft?: string;
  onDraft: (value: string | null) => void;
  onApply: () => void;
};

export function ElementCssEditor({ element, draft, onDraft, onApply }: Props) {
  const source = element.getAttribute("style") ?? "";
  const value = draft ?? source;
  const dirty = value !== source;
  const apply = () => {
    if (!dirty || !element.isConnected) return;
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
    <p className="editor-help">Declarations for this element only. These override its stylesheet. Clear a declaration to return to the stylesheet value.</p>
    <textarea className="code-input" aria-label="Element CSS" value={value} placeholder={'color: #1e1e1e;\npadding: 16px;'} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" onChange={(event) => onDraft(event.target.value === source ? null : event.target.value)} onKeyDown={(event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); apply(); }
    }} />
    <div className="editor-actions"><button className="btn-ghost" disabled={!dirty} onClick={() => onDraft(null)}>Discard</button><button className="btn-primary" disabled={!dirty || !element.isConnected} onClick={apply}>Apply to element</button></div>
    <details className="css-parsed"><summary>Browser interpretation</summary><pre>{format() || "No supported declarations"}</pre></details>
    <p className="editor-help">⌘/Ctrl + Enter to apply as one undo step. Unsupported declarations are kept in the source but ignored by the browser.</p>
  </section>;
}
