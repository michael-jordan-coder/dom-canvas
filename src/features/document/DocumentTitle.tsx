import { useEffect, useRef, useState } from "react";
import { documentName } from "./projectFile";

export function DocumentName({ value, onRename }: { value: string; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const cancelled = useRef(false);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing) { input.current?.focus(); input.current?.select(); }
    else if (restoreFocus.current) { restoreFocus.current = false; button.current?.focus(); }
  }, [editing]);
  const finish = () => {
    setEditing(false);
    if (cancelled.current) { cancelled.current = false; setDraft(value); return; }
    const next = documentName(draft);
    setDraft(next);
    if (next !== value) onRename(next);
  };
  return editing ? <input ref={input} className="document-name-input" aria-label="Document name" value={draft} maxLength={120} onChange={event => setDraft(event.target.value)} onBlur={finish} onKeyDown={event => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); restoreFocus.current = true; event.currentTarget.blur(); }
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); restoreFocus.current = true; cancelled.current = true; event.currentTarget.blur(); }
  }} /> : <button ref={button} className="document-name-button" aria-label="Rename document" title={value} onClick={() => { cancelled.current = false; setDraft(value); setEditing(true); }}>{value}</button>;
}
