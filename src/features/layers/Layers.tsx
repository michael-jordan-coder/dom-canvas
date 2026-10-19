import { selectionItems, toggleSelection } from "@/features/canvas/selection";
import { useEffect, useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import type { Artboard, Selection } from "@/features/canvas/types";
import { isLayerHidden } from "./visibility";
import { lockedAncestor } from "./locking";
import { ChevronIcon, FrameIcon, ImageIcon, RectIcon, TextIcon, VectorIcon } from "@/design-system/icons";

type Props = {
  renameRequest: { target: Element | string } | null;
  artboards: Artboard[];
  hosts: Map<string, HTMLDivElement>;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onContextMenu: (selection: Selection, event: MouseEvent<HTMLElement>) => void;
  onHover: (element: Element | null) => void;
  onRenameArtboard: (id: string, name: string) => void;
  onRenameElement: (element: Element, name: string) => void;
  onToggleVisibility: (element: Element) => void;
  onToggleLock: (element: Element) => void;
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
  const treeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searchCollapsed, setSearchCollapsed] = useState(() => new Set<Element | string>());
  useEffect(() => {
    if (!props.renameRequest) return;
    setQuery("");
    setSearchCollapsed(new Set());
    setRenaming(props.renameRequest.target);
  }, [props.renameRequest]);
  const needle = query.trim().toLocaleLowerCase();
  const matches = new Set<Element>();
  const visible = new Set<Element>();
  const matchingFrames = new Set<string>();
  if (needle) for (const ab of artboards) {
    if (ab.name.toLocaleLowerCase().includes(needle)) matchingFrames.add(ab.id);
    const root = hosts.get(ab.id)?.shadowRoot;
    for (const el of Array.from(root?.querySelectorAll("*") ?? [])) {
      if (!isLayer(el)) continue;
      const directText = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join(" ");
      const searchable = [layerName(el), el.tagName, el.id, el.id ? `#${el.id}` : "", ...Array.from(el.classList).flatMap(name => [name, `.${name}`]), directText].join(" ");
      if (!searchable.toLocaleLowerCase().includes(needle)) continue;
      matches.add(el);
      for (let current: Element | null = el; current && !visible.has(current); current = current.parentElement) visible.add(current);
    }
  }
  const updateQuery = (value: string) => { setQuery(value); setSearchCollapsed(new Set()); onHover(null); };
  const toggleSearch = (key: Element | string) => setSearchCollapsed(previous => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next; });

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
    if (needle) { toggleSearch(el); return; }
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(el)) next.delete(el);
      else next.add(el);
      return next;
    });
  };

  const toggleArtboard = (id: string) => (e: MouseEvent) => {
    e.stopPropagation();
    if (needle) { toggleSearch(id); return; }
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
    const isSelected = selectionItems(selection).some(item => item.kind === "element" && item.element === el);
    const hidden = isLayerHidden(el);
    const lockOwner = lockedAncestor(el);
    const children = Array.from(el.children).filter(child => isLayer(child) && (!needle || visible.has(child)));
    const open = needle ? !searchCollapsed.has(el) : expanded.has(el);
    const Icon = layerIcon(el);
    return (
      <div key={keyFor(el)}>
        <div
          ref={isSelected ? selectedRowRef : undefined}
          role="treeitem"
          tabIndex={-1}
          aria-label={layerName(el)}
          data-search-match={needle && matches.has(el) ? "true" : undefined}
          aria-selected={isSelected}
          aria-expanded={children.length ? open : undefined}
          aria-level={depth + 1}
          onKeyDown={(e) => { if (e.key === "F2") { e.preventDefault(); e.stopPropagation(); setRenaming(el); } }}
          className={`layer${isSelected ? " selected" : within ? " within" : ""}${hidden ? " layer-hidden" : ""}`}
          style={{ paddingLeft: 8 + depth * INDENT }}
          onClick={(e) => { const item = { kind: "element" as const, artboardId, element: el }; onSelect(e.shiftKey ? toggleSelection(selection, item) : item); }}
          onContextMenu={(e) => props.onContextMenu({ kind: "element", artboardId, element: el }, e)}
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
              onDone={(name, restoreFocus) => { setRenaming(null); if (name && name !== layerName(el)) onRenameElement(el, name); if (restoreFocus) requestAnimationFrame(() => selectedRowRef.current?.focus()); }}
            />
          ) : (
            <span className="name">{layerName(el)}</span>
          )}
          <button className={`layer-lock${lockOwner ? " active" : ""}`} aria-label={lockOwner ? `Unlock ${layerName(lockOwner)}` : `Lock ${layerName(el)}`} title={lockOwner && lockOwner !== el ? "Unlock parent layer" : lockOwner ? "Unlock layer" : "Lock layer on canvas"} onClick={(e) => { e.stopPropagation(); props.onToggleLock(el); }} onDoubleClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><rect x="3.5" y="7" width="9" height="7" rx="1.5"/><path d={lockOwner ? "M5 7V5a3 3 0 0 1 6 0v2" : "M5 7V5a3 3 0 0 1 6 0"}/><path d="M8 10v2"/></svg>
          </button>
          <button className="layer-visibility" aria-label={`${hidden ? "Show" : "Hide"} ${layerName(el)}`} title={hidden ? "Show layer" : "Hide layer"} onClick={(e) => { e.stopPropagation(); props.onToggleVisibility(el); }} onDoubleClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M1.5 8s2-4 6.5-4 6.5 4 6.5 4-2 4-6.5 4-6.5-4-6.5-4Z"/><circle cx="8" cy="8" r="2"/>{hidden && <path d="m2 2 12 12"/>}</svg>
          </button>
        </div>
        {open && children.map((child) => renderNode(child, depth + 1, artboardId, within || isSelected))}
      </div>
    );
  };

  return (
    <>
    <div className="layer-search">
      <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4"/><path d="m10 10 3 3"/></svg>
      <input ref={searchRef} aria-label="Search layers" placeholder="Search layers" value={query} onChange={(e) => updateQuery(e.target.value)} onKeyDown={(e) => {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (query) updateQuery(""); else e.currentTarget.blur(); }
        if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); const row = treeRef.current?.querySelector<HTMLElement>('[data-search-match="true"]') ?? treeRef.current?.querySelector<HTMLElement>('[role="treeitem"]'); row?.focus(); row?.click(); }
      }} />
      {query && <button aria-label="Clear layer search" onClick={() => { updateQuery(""); searchRef.current?.focus(); }}>×</button>}
    </div>
    {needle && <div className="layer-search-status" role="status">{matches.size + matchingFrames.size ? `${matches.size + matchingFrames.size} ${matches.size + matchingFrames.size === 1 ? "match" : "matches"}` : "No matching layers"}</div>}
    <div ref={treeRef} className="panel-scroll layer-tree" role="tree" aria-label="Layers" aria-multiselectable="true" tabIndex={0} data-version={version} onKeyDown={navigateTree} onMouseLeave={() => onHover(null)}>
      {artboards.length === 0 && <div className="empty">Draw a frame, paste HTML or import a site to add layers.</div>}
      {artboards.map((ab) => {
        const root = hosts.get(ab.id)?.shadowRoot;
        const isSelected = selectionItems(selection).some(item => item.kind === "artboard" && item.artboardId === ab.id);
        const open = needle ? !searchCollapsed.has(ab.id) : !collapsedArtboards.has(ab.id);
        const children = root ? Array.from(root.children).filter((el) => isLayer(el) && (!needle || visible.has(el))) : [];
        if (needle && !matchingFrames.has(ab.id) && !children.length) return null;
        return (
          <div key={ab.id}>
            <div
              ref={isSelected ? selectedRowRef : undefined}
              role="treeitem"
              tabIndex={-1}
              aria-label={ab.name}
              data-search-match={needle && matchingFrames.has(ab.id) ? "true" : undefined}
              aria-selected={isSelected}
              aria-expanded={children.length ? open : undefined}
              aria-level={1}
              onKeyDown={(e) => { if (e.key === "F2") { e.preventDefault(); e.stopPropagation(); setRenaming(ab.id); } }}
              className={`layer artboard-row${isSelected ? " selected" : ""}`}
              style={{ paddingLeft: 8 }}
              onClick={(e) => { const item = { kind: "artboard" as const, artboardId: ab.id }; onSelect(e.shiftKey ? toggleSelection(selection, item) : item); }}
              onContextMenu={(e) => props.onContextMenu({ kind: "artboard", artboardId: ab.id }, e)}
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
                  onDone={(name, restoreFocus) => { setRenaming(null); if (name && name !== ab.name) onRenameArtboard(ab.id, name); if (restoreFocus) requestAnimationFrame(() => selectedRowRef.current?.focus()); }}
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
    </>
  );
}

function RenameInput({ value, onDone }: { value: string; onDone: (name: string, restoreFocus?: boolean) => void }) {
  const [draft, setDraft] = useState(value);
  const restoreFocus = useRef(false);
  return (
    <input
      className="rename"
      aria-label="Layer name"
      autoFocus
      value={draft}
      maxLength={120}
      onFocus={(e) => e.target.select()}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onDone(draft.trim(), restoreFocus.current)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); restoreFocus.current = true; e.currentTarget.blur(); }
        if (e.key === "Escape") { e.preventDefault(); setDraft(value); onDone(value, true); }
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

// Stylesheets and kept scripts are part of the frame but not of its design.
function isLayer(el: Element) {
  return el.tagName !== "STYLE" && el.tagName !== "SCRIPT";
}
