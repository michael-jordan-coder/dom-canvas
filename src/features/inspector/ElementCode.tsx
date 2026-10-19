import { useMemo, useState } from "react";
import { selectionDocument } from "@/features/document/exportHtml";
import type { Artboard } from "@/features/canvas/types";
import { highlight } from "./highlight";

type Props = { artboard: Artboard; root: ShadowRoot | null | undefined; element?: Element; version: number };

// Read-only code for the selection: its HTML and the stylesheet rules that
// reach it or its descendants. A frame shows its whole stylesheet.
export function ElementCode({ artboard, root, element }: Props) {
  const [copied, setCopied] = useState(false);
  const code = selectionDocument(artboard, root, element);
  const tokens = useMemo(() => highlight(code), [code]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };
  return <section className="element-code" aria-label="Selection code">
    <button className="btn-ghost element-code-copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    <pre tabIndex={0}>{tokens.map((token, index) => token.kind ? <span key={index} className={`tok-${token.kind}`}>{token.text}</span> : token.text)}</pre>
  </section>;
}
