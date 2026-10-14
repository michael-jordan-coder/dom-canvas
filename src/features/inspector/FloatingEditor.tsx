import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function FloatingEditor({ title, anchor, onClose, children }: { title: string; anchor: HTMLElement; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDivElement>(null);
  const latestClose = useRef(onClose);
  latestClose.current = onClose;
  const place = () => {
    if (!dialog.current) return;
    const rect = anchor.getBoundingClientRect(), bounds = dialog.current.getBoundingClientRect();
    dialog.current.style.left = `${Math.max(8, Math.min(rect.left - bounds.width - 8, window.innerWidth - bounds.width - 8))}px`;
    dialog.current.style.top = `${Math.max(8, Math.min(rect.top, window.innerHeight - bounds.height - 8))}px`;
  };
  useLayoutEffect(place);
  useEffect(() => {
    const node = dialog.current;
    const focusTarget = node?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]:not(:disabled)') ?? node?.querySelector<HTMLElement>('[role="radio"]:not(:disabled)') ?? node;
    focusTarget?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || anchor.contains(target) || node?.contains(target) || target.closest("[data-inspector-overlay]")) return;
      latestClose.current();
    };
    const reposition = () => { if (!anchor.isConnected) latestClose.current(); else place(); };
    const observer = new ResizeObserver(place);
    if (node) observer.observe(node);
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      observer.disconnect(); document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("resize", reposition); window.removeEventListener("scroll", reposition, true);
      if (node?.contains(document.activeElement) && anchor.isConnected) anchor.focus({ preventScroll: true });
    };
  }, [anchor]);
  return createPortal(<div ref={dialog} className="inspector-popover" data-inspector-overlay role="dialog" aria-label={title} tabIndex={-1} onKeyDown={event => {
    event.stopPropagation();
    if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); onClose(); anchor.focus({ preventScroll: true }); }
  }}>
    <div className="inspector-popover-heading"><strong>{title}</strong><button className="inspector-icon" aria-label={`Close ${title}`} onClick={() => { onClose(); anchor.focus({ preventScroll: true }); }}>×</button></div>
    <div className="inspector-popover-body">{children}</div>
  </div>, document.body);
}

export function EditorTrigger({ title, children, icon = "⋯" }: { title: string; children: ReactNode; icon?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={anchor} className="inspector-icon" type="button" title={title} aria-label={title} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>{icon}</button>
    {open && anchor.current && <FloatingEditor title={title} anchor={anchor.current} onClose={() => setOpen(false)}>{children}</FloatingEditor>}
  </>;
}
