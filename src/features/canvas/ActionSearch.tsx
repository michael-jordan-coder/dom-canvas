import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SelectionAction } from "../layers/SelectionMenu";

export function ActionSearch({ actions, onClose }: { actions: SelectionAction[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const tokens = query.toLowerCase().trim().split(/\s+/);
  const matches = actions.filter(action => tokens.every(token => action.label.toLowerCase().includes(token)));
  const enabled = matches.map((action, index) => action.disabled ? -1 : index).filter(index => index >= 0);
  const selected = enabled.includes(active) ? active : enabled[0];
  useLayoutEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement;
    element.showModal();
    input.current?.focus();
    return () => { element.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  useEffect(() => { if (selected !== undefined) document.getElementById(`${id}-${selected}`)?.scrollIntoView({ block: "nearest" }); }, [selected, query, id]);
  const run = (index: number | undefined) => {
    if (index === undefined || matches[index]?.disabled) return;
    const action = matches[index];
    if (!action) return;
    onClose(); action.run();
  };
  return createPortal(<dialog ref={dialog} className="action-search" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => {
    event.stopPropagation();
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); onClose(); }
  }}>
    <div className="action-search-content">
      <div className="action-search-heading"><strong id={`${id}-title`}>Find an action</strong><button aria-label="Close action search" onClick={onClose}>Esc</button></div>
      <input ref={input} className="action-search-input" role="combobox" aria-label="Search actions" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-results`} aria-activedescendant={selected === undefined ? undefined : `${id}-${selected}`} placeholder="Search actions…" value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={event => {
        if (event.key === "Enter") { event.preventDefault(); run(selected); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const current = enabled.indexOf(selected);
          if (enabled.length) setActive(enabled[(current + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length]);
        }
      }} />
      <div id={`${id}-results`} className="action-search-results" role="listbox" aria-label="Actions">
        {matches.map((action, index) => <button key={action.label} id={`${id}-${index}`} role="option" aria-selected={index === selected} aria-disabled={action.disabled || undefined} disabled={action.disabled} tabIndex={-1} className={action.danger ? "danger" : undefined} onMouseMove={() => { if (!action.disabled) setActive(index); }} onClick={() => run(index)}><span>{action.label}</span>{action.shortcut && <kbd>{action.shortcut}</kbd>}</button>)}
      </div>
      {!matches.length && <p className="action-search-empty" role="status">No matching actions</p>}
      <div className="action-search-footer">↑ ↓ to navigate · Enter to run · Esc to close</div>
    </div>
  </dialog>, document.body);
}
