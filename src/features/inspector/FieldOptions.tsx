import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function FieldOptions({ anchor, id, label, children }: { anchor: HTMLElement; id: string; label: string; children: ReactNode }) {
  const menu = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const place = () => {
      if (!menu.current) return;
      const rect = anchor.closest('.property-shell')?.getBoundingClientRect() ?? anchor.getBoundingClientRect();
      const width = Math.min(Math.max(180, rect.width), window.innerWidth - 16);
      menu.current.style.width = `${width}px`;
      const bounds = menu.current.getBoundingClientRect();
      menu.current.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
      const top = window.innerHeight - rect.bottom >= bounds.height + 12 ? rect.bottom + 4 : rect.top - bounds.height - 4;
      menu.current.style.top = `${Math.max(8, Math.min(top, window.innerHeight - bounds.height - 8))}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    if (menu.current) observer.observe(menu.current);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [anchor]);
  return createPortal(<div ref={menu} className="field-options field-options-portal" data-inspector-overlay role="listbox" id={id} aria-label={label}>{children}</div>, document.body);
}
