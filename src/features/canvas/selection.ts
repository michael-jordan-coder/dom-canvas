import type { Selection, SelectionItem } from "./types";

export function selectionItems(selection: Selection): SelectionItem[] {
  return selection.kind === "none" ? [] : selection.kind === "multiple" ? selection.items : [selection];
}
export function sameItem(a: SelectionItem, b: SelectionItem) {
  return a.kind === b.kind && a.artboardId === b.artboardId && (a.kind !== "element" || (b.kind === "element" && a.element === b.element));
}
export function makeSelection(items: SelectionItem[]): Selection {
  const unique = items.filter((item, index) => !items.slice(0, index).some(other => sameItem(item, other)));
  const roots = unique.filter(item => !unique.some(other => other !== item && other.artboardId === item.artboardId && (other.kind === "artboard" || (other.kind === "element" && item.kind === "element" && other.element.contains(item.element)))));
  return roots.length === 0 ? { kind: "none" } : roots.length === 1 ? roots[0] : { kind: "multiple", items: roots };
}
export function toggleSelection(selection: Selection, item: SelectionItem): Selection {
  const items = selectionItems(selection);
  return makeSelection(items.some(other => sameItem(item, other)) ? items.filter(other => !sameItem(item, other)) : [...items, item]);
}
