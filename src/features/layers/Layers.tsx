import { useEffect, useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import type { Artboard, Selection } from "@/features/canvas/types";
import { ChevronIcon, FrameIcon, ImageIcon, RectIcon, TextIcon, VectorIcon } from "@/design-system/icons";

type Props = {
  artboards: Artboard[];
  hosts: Map<string, HTMLDivElement>;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onHover: (element: Element | null) => void;
  onRenameArtboard: (id: string, name: string) => void;
  onRenameElement: (element: Element, name: string) => void;
  version: number;
};

const TEXT_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "label", "li", "strong", "em", "b", "i", "small", "button"]);
const GENERATED_CLASS = /^i\d+$/;
const INDENT = 16;

export function Layers(props: Props) {
  const { artboards, hosts, selection, onSelect, onHover, onRenameArtboard, onRenameElement, version } = props;
  const [renaming, setRenaming] = useState<Element | string | null>(null);
  const [expanded, setExpanded] = useState(() => new Set<Element>());
  const [collapsedArtboards, setCollapsedArtboards] = useState(() => new Set<string>());
  const selectedRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selection.kind !== "element") return;
    const ancestors: Element[] = [];
    for (let el = selection.element.parentElement; el; el = el.parentElement) ancestors.push(el);
    setExpanded((prev) => (ancestors.every((a) => prev.has(a)) ? prev : new Set([...prev, ...ancestors])));
    setCollapsedArtboards((prev) => {
      if (!prev.has(selection.artboardId)) return prev;
      const next = new Set(prev);
      next.delete(selection.artboardId);
      return next;
    });
  }, [selection]);

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [selection]);

  const toggle = (el: Element) => (e: MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(el)) next.delete(el);
      else next.add(el);
      return next;
    });
  };

  const toggleArtboard = (id: string) => (e: MouseEvent) => {
    e.stopPropagation();
    setCollapsedArtboards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const navigateTree = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement) return;
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    const rows = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="treeitem"]'));
    if (!rows.length) return;
    const target = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    const current = target ?? selectedRowRef.current ?? rows[0];
    const index = rows.indexOf(current);
    let next = current;
    const level = Number(current.getAttribute("aria-level"));
    if (e.key === "Home") next = rows[0];
    else if (e.key === "End") next = rows[rows.length - 1];
    else if (e.key === "ArrowDown") next = target ? rows[Math.min(index + 1, rows.length - 1)] : current;
    else if (e.key === "ArrowUp") next = rows[Math.max(0, index - 1)];
    else if (e.key === "ArrowRight") {
      if (current.getAttribute("aria-expanded") === "false") current.querySelector<HTMLElement>(".chevron")?.click();
      else if (rows[index + 1] && Number(rows[index + 1].getAttribute("aria-level")) > level) next = rows[index + 1];
    } else if (e.key === "ArrowLeft") {
      if (current.getAttribute("aria-expanded") === "true") current.querySelector<HTMLElement>(".chevron")?.click();
      else next = rows.slice(0, index).reverse().find((row) => Number(row.getAttribute("aria-level")) < level) ?? current;
    }
    next.focus();
    next.click();
  };

  const selectedEl = selection.kind === "element" ? selection.element : null;

  const renderNode = (el: Element, depth: number, artboardId: string, within: boolean) => {
    const isSelected = el === selectedEl;
    const children = Array.from(el.children);
    const open = expanded.has(el);
    const Icon = layerIcon(el);
    return (
      <div key={keyFor(el)}>
        <div
          ref={isSelected ? selectedRowRef : undefined}
          role="treeitem"
          tabIndex={-1}
          aria-label={layerName(el)}
          aria-selected={isSelected}
          aria-expanded={children.length ? open : undefined}
          aria-level={depth + 1}
          onKeyDown={(e) => { if (e.key === "F2") { e.preventDefault(); e.stopPropagation(); setRenaming(el); } }}
          className={`layer${isSelected ? " selected" : within ? " within" : ""}`}
          style={{ paddingLeft: 8 + depth * INDENT }}
          onClick={() => onSelect({ kind: "element", artboardId, element: el })}
          onDoubleClick={() => setRenaming(el)}
          onMouseEnter={() => onHover(el)}
        >
          <span className={`chevron${open ? " open" : ""}${children.length ? "" : " none"}`} onClick={toggle(el)}>
            <ChevronIcon />
          </span>
          <Icon className="icon" />
          {renaming === el ? (
            <RenameInput
              value={layerName(el)}
              onDone={(name) => { setRenaming(null); if (name && name !== layerName(el)) onRenameElement(el, name); }}
            />
          ) : (
            <span className="name">{layerName(el)}</span>
          )}
        </div>
        {open && children.map((child) => renderNode(child, depth + 1, artboardId, within || isSelected))}
      </div>
    );
  };

  return (
    <div className="panel-scroll layer-tree" role="tree" aria-label="Layers" tabIndex={0} data-version={version} onKeyDown={navigateTree} onMouseLeave={() => onHover(null)}>
      {artboards.length === 0 && <div className="empty">Draw a frame, paste HTML or import a site to add layers.</div>}
      {artboards.map((ab) => {
        const root = hosts.get(ab.id)?.shadowRoot;
        const isSelected = selection.kind === "artboard" && selection.artboardId === ab.id;
        const open = !collapsedArtboards.has(ab.id);
        const children = root ? Array.from(root.children).filter((el) => el.tagName !== "STYLE") : [];
        return (
          <div key={ab.id}>
            <div
              ref={isSelected ? selectedRowRef : undefined}
              role="treeitem"
              tabIndex={-1}
              aria-label={ab.name}
              aria-selected={isSelected}
              aria-expanded={children.length ? open : undefined}
              aria-level={1}
              onKeyDown={(e) => { if (e.key === "F2") { e.preventDefault(); e.stopPropagation(); setRenaming(ab.id); } }}
              className={`layer artboard-row${isSelected ? " selected" : ""}`}
              style={{ paddingLeft: 8 }}
              onClick={() => onSelect({ kind: "artboard", artboardId: ab.id })}
              onDoubleClick={() => setRenaming(ab.id)}
              onMouseEnter={() => onHover(hosts.get(ab.id) ?? null)}
            >
              <span className={`chevron${open ? " open" : ""}${children.length ? "" : " none"}`} onClick={toggleArtboard(ab.id)}>
                <ChevronIcon />
              </span>
              <FrameIcon className="icon" />
              {renaming === ab.id ? (
                <RenameInput
                  value={ab.name}
                  onDone={(name) => { setRenaming(null); if (name && name !== ab.name) onRenameArtboard(ab.id, name); }}
                />
              ) : (
                <span className="name">{ab.name}</span>
              )}
            </div>
            {open && children.map((el) => renderNode(el, 1, ab.id, isSelected))}
          </div>
        );
      })}
    </div>
  );
}

function RenameInput({ value, onDone }: { value: string; onDone: (name: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <input
      className="rename"
      aria-label="Layer name"
      autoFocus
      value={draft}
      onFocus={(e) => e.target.select()}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onDone(draft.trim())}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") { setDraft(value); onDone(value); }
      }}
    />
  );
}

const keys = new WeakMap<Element, number>();
let nextKey = 0;
function keyFor(el: Element) {
  let key = keys.get(el);
  if (key === undefined) keys.set(el, (key = nextKey++));
  return key;
}

function isTextLayer(el: Element) {
  return el.children.length === 0 && (el.textContent ?? "").trim() !== "" && TEXT_TAGS.has(el.tagName.toLowerCase());
}

function layerIcon(el: Element) {
  const tag = el.tagName.toLowerCase();
  if (tag === "img" || tag === "picture") return ImageIcon;
  if (el.namespaceURI === "http://www.w3.org/2000/svg") return VectorIcon;
  if (isTextLayer(el)) return TextIcon;
  if (el.children.length > 0) return FrameIcon;
  return RectIcon;
}

export function layerName(el: Element) {
  const named = el.getAttribute("data-name");
  if (named) return named;
  if (isTextLayer(el)) return (el.textContent ?? "").trim().slice(0, 40);
  if (el.id) return el.id;
  const cls = Array.from(el.classList).find((c) => !GENERATED_CLASS.test(c));
  if (cls) return cls;
  return el.tagName.toLowerCase();
}
