import type { Artboard, Selection } from "@/features/canvas/types";
import { layerName } from "@/features/layers/Layers";

export function SelectionPath({ selection, artboard, onSelect }: {
  selection: Selection;
  artboard: Artboard;
  onSelect: (selection: Selection) => void;
}) {
  const ancestors: Element[] = [];
  if (selection.kind === "element" && selection.element.isConnected) {
    for (let el: Element | null = selection.element; el; el = el.parentElement) ancestors.unshift(el);
  }
  return (
    <nav className="selection-path" aria-label="Selection hierarchy">
      <button title={`Select frame: ${artboard.name}`} aria-current={selection.kind === "artboard" ? "true" : undefined} onClick={() => onSelect({ kind: "artboard", artboardId: artboard.id })}>{artboard.name}</button>
      {ancestors.map((el, i) => (
        <span className="path-item" key={i}>
          <span aria-hidden="true">›</span>
          <button title={`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}: ${layerName(el)}`} aria-current={i === ancestors.length - 1 ? "true" : undefined} onClick={() => onSelect({ kind: "element", artboardId: artboard.id, element: el })}>{el.getAttribute("data-name") || `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}`}</button>
        </span>
      ))}
    </nav>
  );
}
