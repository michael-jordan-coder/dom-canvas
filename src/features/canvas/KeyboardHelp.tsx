import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const groups = [
  { title: "Canvas", rows: [
    ["Move tool", "V"], ["Frame tool", "F / A"], ["Rectangle tool", "R"], ["Text tool", "T"], ["Hand tool", "H"],
    ["Pan temporarily", "Hold Space + drag"], ["Actual size", "Shift 0"], ["Fit all frames", "Shift 1"], ["Fit selection", "Shift 2"],
    ["Show / hide interface", "⌘/Ctrl \\"],
  ] },
  { title: "Selection", rows: [
    ["Select several layers or frames", "Drag empty canvas"], ["Add / remove selection", "Shift + click"], ["Pan canvas", "Space + drag / middle drag"], ["Select frame", "⌘/Ctrl + click"], ["Select parent", "Alt + click"], ["Select parent / clear selection", "Esc"],
    ["Rename", "F2"], ["Duplicate", "⌘/Ctrl D"], ["Delete", "Delete / Backspace"],
    ["Move by 1 px", "Arrow keys"], ["Move by 10 px", "Shift + arrows"],
  ] },
  { title: "Editing", rows: [
    ["Undo", "⌘/Ctrl Z"], ["Redo", "⌘/Ctrl Shift Z"], ["Find an action or Design section", "⌘/Ctrl K"],
    ["Adjust numeric value", "↑ / ↓"], ["Adjust by 10 / 0.1", "Shift / Alt + ↑ ↓"],
    ["Cancel field draft or active adjustment", "Esc"], ["Apply code / create HTML frame", "⌘/Ctrl Enter"],
    ["Indent / unindent code", "Tab / Shift Tab"], ["Leave code editor", "Esc, then Tab"], ["Keyboard shortcuts", "?"],
  ] },
];

export function KeyboardHelp({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [query, setQuery] = useState("");
  const tokens = query.trim().toLowerCase().split(/\s+/);
  const visible = groups.map(group => ({ ...group, rows: group.rows.filter(row => tokens.every(token => `${group.title} ${row.join(" ")}`.toLowerCase().includes(token))) })).filter(group => group.rows.length);
  useLayoutEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement;
    element.showModal(); input.current?.focus();
    return () => { element.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  return createPortal(<dialog ref={dialog} className="action-search keyboard-help" aria-modal="true" aria-labelledby={`${id}-title`} onCancel={e => { e.preventDefault(); onClose(); }} onKeyDown={e => e.stopPropagation()} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="action-search-content">
      <div className="action-search-heading"><strong id={`${id}-title`}>Keyboard shortcuts</strong><button aria-label="Close keyboard shortcuts" onClick={onClose}>Esc</button></div>
      <input ref={input} className="action-search-input" aria-label="Search keyboard shortcuts" placeholder="Search shortcuts…" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="keyboard-help-results">
        {visible.map(group => <section key={group.title} aria-label={group.title}><h3>{group.title}</h3><dl>{group.rows.map(([label, keys]) => <div key={label}><dt>{label}</dt><dd><kbd>{keys}</kbd></dd></div>)}</dl></section>)}
        {!visible.length && <p role="status" className="action-search-empty">No matching shortcuts</p>}
      </div>
      <p className="action-search-footer">Canvas shortcuts apply outside text fields. Arrow keys in a property field edit its value; arrows in suggestion menus select an option.</p>
    </div>
  </dialog>, document.body);
}
