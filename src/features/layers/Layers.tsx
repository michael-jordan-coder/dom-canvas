import type { Artboard, Selection } from "@/features/canvas/types";

type Props = {
  artboards: Artboard[];
  hosts: Map<string, HTMLDivElement>;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  version: number;
};

export function Layers({ artboards, hosts, selection, onSelect, version }: Props) {
  return (
    <div className="panel-body" data-version={version}>
      {artboards.length === 0 && <div className="empty">No artboards yet.</div>}
      {artboards.map((ab) => {
        const host = hosts.get(ab.id);
        const isSelected = selection.kind === "artboard" && selection.artboardId === ab.id;
        return (
          <div key={ab.id}>
            <div
              className={`layer${isSelected ? " selected" : ""}`}
              onClick={() => onSelect({ kind: "artboard", artboardId: ab.id })}
            >
              <span className="tag">▣ {ab.name}</span>
            </div>
            {host?.shadowRoot &&
              Array.from(host.shadowRoot.children)
                .filter((el) => el.tagName !== "STYLE")
                .map((el, i) => (
                  <LayerNode key={i} element={el} depth={1} artboardId={ab.id} selection={selection} onSelect={onSelect} />
                ))}
          </div>
        );
      })}
    </div>
  );
}

type NodeProps = {
  element: Element;
  depth: number;
  artboardId: string;
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

function LayerNode({ element, depth, artboardId, selection, onSelect }: NodeProps) {
  const isSelected = selection.kind === "element" && selection.element === element;
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes = element.classList.length ? `.${Array.from(element.classList).join(".")}` : "";
  const text = element.children.length === 0 ? (element.textContent ?? "").trim().slice(0, 30) : "";

  return (
    <>
      <div
        className={`layer${isSelected ? " selected" : ""}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onSelect({ kind: "element", artboardId, element })}
      >
        <span className="tag">{tag}</span>
        {(id || classes) && <span className="meta">{id}{classes}</span>}
        {text && <span className="text">{text}</span>}
      </div>
      {Array.from(element.children).map((child, i) => (
        <LayerNode key={i} element={child} depth={depth + 1} artboardId={artboardId} selection={selection} onSelect={onSelect} />
      ))}
    </>
  );
}
