import { useLayoutEffect, useState } from "react";
import type { Selection } from "@/features/canvas/types";
import { selectionItems } from "@/features/canvas/selection";

// Computed styles can change without a document edit (media queries, fonts,
// image loading or a scroll container). Refresh controls without creating history.
export function useSelectionRefresh(selection: Selection, hosts: Map<string, HTMLDivElement>) {
  const [, refresh] = useState(0);
  useLayoutEffect(() => {
    const elements = selectionItems(selection).flatMap(item => {
      const element = item.kind === "element" ? item.element : hosts.get(item.artboardId);
      return element ? [element] : [];
    });
    if (!elements.length) return;
    let scheduled = 0;
    const update = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(() => refresh(value => value + 1));
    };
    const roots = new Set(elements.map(element => element.shadowRoot ?? element.getRootNode()));
    const resize = new ResizeObserver(update);
    const observed = new Set<Element>(elements);
    const mutations = new MutationObserver(update);
    for (const root of roots) if (root instanceof ShadowRoot) {
      observed.add(root.host);
      mutations.observe(root, { attributes: true, childList: true, subtree: true, characterData: true });
    }
    for (const element of elements) for (let parent = element.parentElement; parent; parent = parent.parentElement) observed.add(parent);
    observed.forEach(element => resize.observe(element));
    roots.forEach(root => root.addEventListener("scroll", update, true));
    window.addEventListener("resize", update);
    document.fonts.addEventListener("loadingdone", update);
    return () => {
      cancelAnimationFrame(scheduled); resize.disconnect(); mutations.disconnect();
      roots.forEach(root => root.removeEventListener("scroll", update, true));
      window.removeEventListener("resize", update); document.fonts.removeEventListener("loadingdone", update);
    };
  }, [selection, hosts]);
}
