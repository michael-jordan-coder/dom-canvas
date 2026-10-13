import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type MenuAnchor = { x: number; y: number; returnFocus: HTMLElement };
export type SelectionAction = { label: string; shortcut?: string; run: () => void; danger?: boolean; disabled?: boolean; separator?: boolean };

export function SelectionMenu({ anchor, actions, onClose }: { anchor: MenuAnchor; actions: SelectionAction[]; onClose: () => void }) {
  const menu = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = menu.current!;
    const rect = el.getBoundingClientRect();
    el.style.left = `${Math.max(8, Math.min(anchor.x, window.innerWidth - rect.width - 8))}px`;
    el.style.top = `${Math.max(8, Math.min(anchor.y, window.innerHeight - rect.height - 8))}px`;
    el.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus();
    const outside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchor.returnFocus.getAttribute("aria-haspopup") === "menu" && anchor.returnFocus.contains(target)) return;
      if (!el.contains(target)) onClose();
    };
    const close = () => onClose();
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("resize", close);
    window.addEventListener("blur", close);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", close);
    };
  }, [anchor, onClose]);
  const dismiss = () => { onClose(); if (anchor.returnFocus.isConnected) anchor.returnFocus.focus(); };
  return createPortal(<div ref={menu} className="selection-menu" role="menu" aria-label="Selection actions" style={{ left: anchor.x, top: anchor.y }} onKeyDown={(e) => {
    e.stopPropagation();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); dismiss(); }
    else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
  }}>
    {actions.map(action => <div key={action.label}>{action.separator && <div role="separator" className="menu-separator" />}<button role="menuitem" disabled={action.disabled} className={action.danger ? "danger" : ""} onClick={() => { dismiss(); action.run(); }}><span>{action.label}</span>{action.shortcut && <kbd>{action.shortcut}</kbd>}</button></div>)}
  </div>, document.body);
}
