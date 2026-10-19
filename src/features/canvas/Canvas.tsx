import { makeSelection, selectionItems, sameItem, toggleSelection } from "./selection";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from "react";
import { ArtboardView } from "./Artboard";
import { lockedAncestor } from "@/features/layers/locking";
import { affineBorderBox, inverseLinearDelta, getTranslate, screenDeltaToLocal, isResizable, isTextEditable, setSize, setTranslate, type Styled } from "./elementStyle";
import { elementRectInCanvas, normalizeRect, zoomAround, type Bounds, type Point, type Rect } from "./geometry";
import type { Artboard, Camera, Selection, SelectionItem, Tool } from "./types";

type Props = {
  surfaceRef: RefObject<HTMLDivElement | null>;
  artboards: Artboard[];
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  hosts: Map<string, HTMLDivElement>;
  onHostMount: (id: string, host: HTMLDivElement | null) => void;
  onUpdateArtboard: (id: string, patch: Partial<Artboard>) => void;
  onCreateArtboard: (bounds: Bounds) => string;
  externalHover: Element | null;
  version: number;
  onChange: () => void;
  onCommit: () => void;
};

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

type ResizeTarget =
  | { kind: "artboard"; id: string; x: number; y: number; w: number; h: number }
  | { kind: "element"; element: Styled; w: number; h: number; tx: number; ty: number; matrix?: DOMMatrix; anchor?: Point; anchorX: number; anchorY: number };

type GroupOrigin = { item: SelectionItem; x: number; y: number; style?: string | null };
type Drag =
  | { kind: "text"; artboardId: string; start: Point; target: HTMLElement | null }
  | { kind: "marquee"; start: Point; initial: Selection; additive: boolean; scope?: string; click?: SelectionItem; moved?: boolean }
  | { kind: "group"; startX: number; startY: number; origins: GroupOrigin[]; moved: boolean }
  | { kind: "pan"; startX: number; startY: number; camera: Camera }
  | { kind: "artboard"; id: string; startX: number; startY: number; originX: number; originY: number; moved: boolean }
  | { kind: "element"; element: Styled; startX: number; startY: number; originX: number; originY: number; moved: boolean }
  | { kind: "resize"; handle: Handle; startX: number; startY: number; target: ResizeTarget; moved: boolean }
  | { kind: "draw"; tool: "frame" | "rect"; artboardId: string | null; start: Point };

type Hit =
  | { kind: "empty" }
  | { kind: "locked"; id: string }
  | { kind: "label"; id: string }
  | { kind: "artboard"; id: string }
  | { kind: "element"; id: string; element: Element };

const DEFAULT_SHAPE = 100;
const DRAG_THRESHOLD = 2;

export function Canvas(props: Props) {
  const {
    artboards, camera, onCameraChange, tool, onToolChange, selection, onSelect,
    hosts, onHostMount, onUpdateArtboard, onCreateArtboard, externalHover, version, onChange, onCommit,
  } = props;

  const canvasRef = props.surfaceRef;
  const dragRef = useRef<Drag | null>(null);
  const restoreDrag = useRef<(() => void) | null>(null);
  const pointerId = useRef<number | null>(null);
  const pointerHit = useRef<Hit>({ kind: "empty" });
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panning, setPanning] = useState(false);
  const [hovered, setHovered] = useState<Element | null>(null);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [multipleRects, setMultipleRects] = useState<OutlineRect[]>([]);
  const [drawPreview, setDrawPreview] = useState<Rect | null>(null);
  const [editing, setEditing] = useState<HTMLElement | null>(null);
  const handMode = tool === "hand" || spaceHeld;

  const cancelDrag = () => {
    if (!dragRef.current) return false;
    const drag = dragRef.current;
    dragRef.current = null;
    const restore = restoreDrag.current;
    restoreDrag.current = null;
    restore?.();
    if (drag.kind === "pan") onCameraChange(drag.camera);
    if (drag.kind === "marquee") onSelect(drag.initial);
    setMarquee(null);
    const id = pointerId.current;
    pointerId.current = null;
    if (id !== null && canvasRef.current?.hasPointerCapture(id)) canvasRef.current.releasePointerCapture(id);
    setPanning(false);
    setDrawPreview(null);
    return true;
  };
  const cancelDragRef = useRef(cancelDrag);
  cancelDragRef.current = cancelDrag;
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && cancelDragRef.current()) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    const blur = () => { cancelDragRef.current(); setSpaceHeld(false); };
    window.addEventListener("keydown", escape, true);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", escape, true); window.removeEventListener("blur", blur); };
  }, []);
  const captureElement = (element: Styled) => {
    const style = element.getAttribute("style");
    restoreDrag.current = () => {
      if (style === null) element.removeAttribute("style"); else element.setAttribute("style", style);
      onChange();
    };
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space" && !e.defaultPrevented && !isTyping(e) && !isInteractiveControl(e)) { setSpaceHeld(true); e.preventDefault(); } };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") setSpaceHeld(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.01);
        onCameraChange(zoomAround(camera, e.clientX - rect.left, e.clientY - rect.top, factor));
      } else {
        onCameraChange({ ...camera, x: camera.x - e.deltaX, y: camera.y - e.deltaY });
      }
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [camera, onCameraChange]);

  const toWorld = useCallback((clientX: number, clientY: number): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (clientX - rect.left - camera.x) / camera.z, y: (clientY - rect.top - camera.y) / camera.z };
  }, [camera]);

  const hitTest = useCallback((e: { nativeEvent: Event }): Hit => {
    const path = e.nativeEvent.composedPath();
    for (const node of path) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.dataset.artboardLabel) return { kind: "label", id: node.dataset.artboardLabel };
      if (node.dataset.artboard) {
        const target = path[0];
        if (target === node || !(target instanceof Element)) return { kind: "artboard", id: node.dataset.artboard };
        if (lockedAncestor(target)) return { kind: "locked", id: node.dataset.artboard };
        return { kind: "element", id: node.dataset.artboard, element: target };
      }
    }
    return { kind: "empty" };
  }, []);

  const startEditing = useCallback((el: HTMLElement, isNew: boolean) => {
    el.contentEditable = "plaintext-only";
    if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
    el.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    setEditing(el);

    let done = false;
    const onKey = (e: KeyboardEvent) => {
      // Keep Escape from reaching the global handler, which would also
      // select the parent once editing has ended.
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(); el.blur(); }
    };
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("blur", finish);
      el.removeAttribute("contenteditable");
      window.getSelection()?.removeAllRanges();
      setEditing(null);
      const artboardId = (el.getRootNode() as ShadowRoot).host?.getAttribute("data-artboard");
      if (isNew && !(el.textContent ?? "").trim()) {
        el.remove();
        onSelect(artboardId ? { kind: "artboard", artboardId } : { kind: "none" });
      } else if (artboardId) {
        onSelect({ kind: "element", artboardId, element: el });
      }
      onCommit();
    };
    el.addEventListener("keydown", onKey);
    el.addEventListener("blur", finish);
  }, [onCommit, onSelect]);

  const artboardAt = (hit: Hit) => (hit.kind === "artboard" || hit.kind === "element" ? hit.id : null);

  const createText = (artboardId: string, world: Point, width?: number) => {
    const ab = artboards.find((a) => a.id === artboardId);
    const root = hosts.get(artboardId)?.shadowRoot;
    if (!ab || !root) return;
    const el = document.createElement("p");
    el.textContent = "Text";
    el.setAttribute(
      "style",
      `position:absolute;left:${Math.round(world.x - ab.x)}px;top:${Math.round(world.y - ab.y)}px;margin:0;` +
        `font:400 16px/1.4 Inter, system-ui, sans-serif;color:#000000;${width === undefined ? "white-space:pre" : `width:${Math.max(1, Math.round(width))}px;white-space:pre-wrap;overflow-wrap:break-word`}`,
    );
    root.append(el);
    onSelect({ kind: "element", artboardId, element: el });
    startEditing(el, true);
  };

  const createRect = (artboardId: string, bounds: Bounds) => {
    const ab = artboards.find((a) => a.id === artboardId);
    const root = hosts.get(artboardId)?.shadowRoot;
    if (!ab || !root) return;
    const el = document.createElement("div");
    el.dataset.name = "Rectangle";
    el.setAttribute(
      "style",
      `position:absolute;left:${Math.round(bounds.x - ab.x)}px;top:${Math.round(bounds.y - ab.y)}px;` +
        `width:${Math.round(bounds.width)}px;height:${Math.round(bounds.height)}px;background:#D9D9D9`,
    );
    root.append(el);
    onSelect({ kind: "element", artboardId, element: el });
    onCommit();
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.button !== 0 && e.button !== 1) || dragRef.current) return;
    const hit = hitTest(e);
    pointerHit.current = hit;
    if (editing && hit.kind === "element" && editing.contains(hit.element)) return;
    const canvas = canvasRef.current!;
    canvas.focus();
    canvas.setPointerCapture(e.pointerId);
    pointerId.current = e.pointerId;
    restoreDrag.current = null;

    if (e.button === 1 || handMode) {
      dragRef.current = { kind: "pan", startX: e.clientX, startY: e.clientY, camera };
      setPanning(true);
      return;
    }

    if (tool === "text") {
      const id = artboardAt(hit);
      if (id) {
        const target = hit.kind === "element" && hit.element instanceof HTMLElement && isTextEditable(hit.element) && !lockedAncestor(hit.element) ? hit.element : null;
        dragRef.current = { kind: "text", artboardId: id, start: toWorld(e.clientX, e.clientY), target };
      }
      return;
    }

    if (tool === "frame" || tool === "rect") {
      const artboardId = tool === "rect" ? artboardAt(hit) : null;
      dragRef.current = { kind: "draw", tool: artboardId ? "rect" : "frame", artboardId, start: toWorld(e.clientX, e.clientY) };
      return;
    }

    if (hit.kind === "locked") { e.preventDefault(); return; }
    if (hit.kind === "empty") {
      dragRef.current = { kind: "marquee", start: { x: e.clientX, y: e.clientY }, initial: selection, additive: e.shiftKey };
      if (!e.shiftKey) onSelect({ kind: "none" });
      return;
    }
    const clicked: SelectionItem = hit.kind === "element" && !e.metaKey && !e.ctrlKey
      ? { kind: "element", artboardId: hit.id, element: hit.element }
      : { kind: "artboard", artboardId: hit.id };
    if (e.shiftKey) { onSelect(toggleSelection(selection, clicked)); return; }
    if (selection.kind === "multiple" && selection.items.some(item => sameItem(item, clicked) || (item.kind === "element" && clicked.kind === "element" && item.element.contains(clicked.element)))) {
      const origins: GroupOrigin[] = selection.items.flatMap<GroupOrigin>(item => {
        if (item.kind === "element") {
          if (lockedAncestor(item.element)) return [];
          const origin = getTranslate(item.element as Styled);
          return [{ item, x: origin.x, y: origin.y, style: item.element.getAttribute("style") }];
        }
        const ab = artboards.find(ab => ab.id === item.artboardId);
        return ab ? [{ item, x: ab.x, y: ab.y }] : [];
      });
      restoreDrag.current = () => {
        for (const origin of origins) {
          if (origin.item.kind === "artboard") onUpdateArtboard(origin.item.artboardId, { x: origin.x, y: origin.y });
          else if (origin.style == null) origin.item.element.removeAttribute("style"); else origin.item.element.setAttribute("style", origin.style);
        }
        onChange();
      };
      dragRef.current = { kind: "group", startX: e.clientX, startY: e.clientY, origins, moved: false }; return;
    }

    if (hit.kind === "artboard" && !e.metaKey && !e.ctrlKey) {
      dragRef.current = { kind: "marquee", start: { x: e.clientX, y: e.clientY }, initial: selection, additive: false, scope: hit.id, click: clicked };
      return;
    }
    if (hit.kind === "artboard" || hit.kind === "label") {
      const ab = artboards.find((a) => a.id === hit.id)!;
      onSelect({ kind: "artboard", artboardId: hit.id });
      restoreDrag.current = () => onUpdateArtboard(ab.id, { x: ab.x, y: ab.y });
      dragRef.current = { kind: "artboard", id: hit.id, startX: e.clientX, startY: e.clientY, originX: ab.x, originY: ab.y, moved: false };
      return;
    }

    if (e.metaKey || e.ctrlKey) {
      onSelect({ kind: "artboard", artboardId: hit.id });
      return;
    }
    if (e.altKey) {
      const current = selection.kind === "element" && selection.element.contains(hit.element) ? selection.element : hit.element;
      onSelect(current.parentElement ? { kind: "element", artboardId: hit.id, element: current.parentElement } : { kind: "artboard", artboardId: hit.id });
      return;
    }
    onSelect({ kind: "element", artboardId: hit.id, element: hit.element });
    const el = hit.element;
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      const origin = getTranslate(el);
      captureElement(el);
      dragRef.current = { kind: "element", element: el, startX: e.clientX, startY: e.clientY, originX: origin.x, originY: origin.y, moved: false };
    }
  };

  const startResize = (handle: Handle) => (e: ReactPointerEvent) => {
    e.stopPropagation();
    if (selection.kind === "element" && lockedAncestor(selection.element)) return;
    if (e.button !== 0 || dragRef.current) return;
    canvasRef.current!.focus();
    canvasRef.current!.setPointerCapture(e.pointerId);
    pointerId.current = e.pointerId;
    restoreDrag.current = null;
    let target: ResizeTarget | null = null;
    if (selection.kind === "artboard") {
      const ab = artboards.find((a) => a.id === selection.artboardId);
      const host = hosts.get(selection.artboardId);
      if (ab && host) {
        target = { kind: "artboard", id: ab.id, x: ab.x, y: ab.y, w: ab.width, h: host.offsetHeight };
        restoreDrag.current = () => onUpdateArtboard(ab.id, { x: ab.x, y: ab.y, width: ab.width, height: ab.height, aspectRatio: ab.aspectRatio });
      }
    } else if (selection.kind === "element" && isResizable(selection.element)) {
      const el = selection.element;
      const r = el.getBoundingClientRect();
      const t = getTranslate(el);
      captureElement(el);
      const box = affineBorderBox(el);
      const anchorX = handle.includes("w") ? 1 : handle.includes("e") ? 0 : 0.5;
      const anchorY = handle.includes("n") ? 1 : handle.includes("s") ? 0 : 0.5;
      target = { kind: "element", element: el, w: box?.size.width ?? r.width / camera.z, h: box?.size.height ?? r.height / camera.z, tx: t.x, ty: t.y, matrix: box?.matrix, anchor: box?.point(anchorX, anchorY), anchorX, anchorY };
    }
    if (target) dragRef.current = { kind: "resize", handle, startX: e.clientX, startY: e.clientY, target, moved: false };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (drag && pointerId.current !== e.pointerId) return;
    if (!drag) {
      if (handMode || tool !== "move") return setHovered(null);
      const hit = hitTest(e);
      setHovered(hit.kind === "element" ? hit.element : hit.kind === "artboard" || hit.kind === "label" ? hosts.get(hit.id) ?? null : null);
      return;
    }

    if (drag.kind === "marquee") {
      const bounds = normalizeRect(drag.start, { x: e.clientX, y: e.clientY });
      const canvas = canvasRef.current!.getBoundingClientRect();
      setMarquee({ left: bounds.x - canvas.left, top: bounds.y - canvas.top, width: bounds.width, height: bounds.height });
      if (bounds.width < DRAG_THRESHOLD && bounds.height < DRAG_THRESHOLD) return;
      drag.moved = true;
      const contained = (element: Element) => {
        const r = element.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left >= bounds.x && r.top >= bounds.y && r.right <= bounds.x + bounds.width && r.bottom <= bounds.y + bounds.height;
      };
      const found: SelectionItem[] = [];
      for (const ab of artboards) {
        if (drag.scope && ab.id !== drag.scope) continue;
        const host = hosts.get(ab.id);
        if (!host) continue;
        if (!drag.scope && contained(host)) { found.push({ kind: "artboard", artboardId: ab.id }); continue; }
        for (const element of Array.from(host.shadowRoot?.querySelectorAll("*") ?? [])) {
          if (element.matches("style,script,link,meta,title,defs,clipPath,mask") || lockedAncestor(element) || getComputedStyle(element).visibility === "hidden") continue;
          if (contained(element)) found.push({ kind: "element", artboardId: ab.id, element });
        }
      }
      onSelect(makeSelection([...(drag.additive ? selectionItems(drag.initial) : []), ...found])); return;
    }
    if (drag.kind === "draw" || drag.kind === "text") {
      const bounds = normalizeRect(drag.start, toWorld(e.clientX, e.clientY));
      setDrawPreview({ left: bounds.x * camera.z + camera.x, top: bounds.y * camera.z + camera.y, width: bounds.width * camera.z, height: bounds.height * camera.z });
      return;
    }

    if (drag.kind === "pan") {
      onCameraChange({ ...drag.camera, x: drag.camera.x + e.clientX - drag.startX, y: drag.camera.y + e.clientY - drag.startY });
      return;
    }

    const screenDx = e.clientX - drag.startX;
    const screenDy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(screenDx, screenDy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    const dx = screenDx / camera.z;
    const dy = screenDy / camera.z;

    if (drag.kind === "group") {
      for (const origin of drag.origins) {
        if (origin.item.kind === "artboard") onUpdateArtboard(origin.item.artboardId, { x: origin.x + dx, y: origin.y + dy });
        else {
          const delta = screenDeltaToLocal(origin.item.element, screenDx, screenDy);
          setTranslate(origin.item.element as Styled, origin.x + delta.x, origin.y + delta.y);
        }
      }
      onChange();
    } else if (drag.kind === "artboard") {
      onUpdateArtboard(drag.id, { x: Math.round(drag.originX + dx), y: Math.round(drag.originY + dy) });
    } else if (drag.kind === "element") {
      const delta = screenDeltaToLocal(drag.element, screenDx, screenDy);
      setTranslate(drag.element, drag.originX + delta.x, drag.originY + delta.y);
      onChange();
    } else {
      const { handle, target } = drag;
      const delta = target.kind === "element" && target.matrix ? inverseLinearDelta(target.matrix, screenDx, screenDy) : { x: dx, y: dy };
      const grow = (start: number, delta: number, fromStart: boolean) => Math.max(1, fromStart ? start - delta : start + delta);
      let w = handle.includes("e") ? grow(target.w, delta.x, false) : handle.includes("w") ? grow(target.w, delta.x, true) : target.w;
      let h = handle.includes("s") ? grow(target.h, delta.y, false) : handle.includes("n") ? grow(target.h, delta.y, true) : target.h;
      const locked = e.shiftKey || (target.kind === "element" ? getComputedStyle(target.element).aspectRatio !== "auto" : !!artboards.find((ab) => ab.id === target.id)?.aspectRatio);
      if (locked && target.h > 0) {
        const ratio = target.w / target.h;
        const horizontal = handle.includes("e") || handle.includes("w");
        const vertical = handle.includes("n") || handle.includes("s");
        if (horizontal && (!vertical || Math.abs(w / target.w - 1) >= Math.abs(h / target.h - 1))) h = w / ratio;
        else w = h * ratio;
      }
      const shiftX = handle.includes("w") ? target.w - w : 0;
      const shiftY = handle.includes("n") ? target.h - h : 0;
      if (target.kind === "artboard") {
        const sizesHeight = locked || handle.includes("n") || handle.includes("s");
        onUpdateArtboard(target.id, {
          x: Math.round(target.x + shiftX),
          y: Math.round(target.y + shiftY),
          width: Math.round(w),
          ...(sizesHeight ? { height: Math.round(h) } : {}),
        });
      } else {
        setSize(target.element, {
          width: locked || handle.includes("e") || handle.includes("w") ? w : undefined,
          height: locked || handle.includes("n") || handle.includes("s") ? h : undefined,
        });
        const resized = target.anchor ? affineBorderBox(target.element) : null;
        if (resized && target.anchor) {
          const currentAnchor = resized.point(target.anchorX, target.anchorY);
          const correction = screenDeltaToLocal(target.element, target.anchor.x - currentAnchor.x, target.anchor.y - currentAnchor.y);
          const current = getTranslate(target.element);
          setTranslate(target.element, current.x + correction.x, current.y + correction.y);
        } else setTranslate(target.element, target.tx + shiftX, target.ty + shiftY);
        onChange();
      }
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    const canvas = canvasRef.current!;
    const drag = dragRef.current;
    dragRef.current = null;
    restoreDrag.current = null;
    pointerId.current = null;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    setPanning(false);
    setDrawPreview(null);
    setMarquee(null);
    if (!drag) return;
    if (drag.kind === "marquee") { if (!drag.moved && drag.click) onSelect(drag.click); return; }
    if (drag.kind === "text") {
      const bounds = normalizeRect(drag.start, toWorld(e.clientX, e.clientY));
      const drawn = bounds.width * camera.z >= DRAG_THRESHOLD || bounds.height * camera.z >= DRAG_THRESHOLD;
      if (!drawn && drag.target) {
        onSelect({ kind: "element", artboardId: drag.artboardId, element: drag.target });
        startEditing(drag.target, false);
      } else createText(drag.artboardId, drawn ? { x: bounds.x, y: bounds.y } : drag.start, drawn ? bounds.width : undefined);
      onToolChange("move"); return;
    }

    if (drag.kind === "draw") {
      const end = toWorld(e.clientX, e.clientY);
      let bounds = normalizeRect(drag.start, end);
      if (bounds.width < DRAG_THRESHOLD && bounds.height < DRAG_THRESHOLD) {
        bounds = { x: drag.start.x, y: drag.start.y, width: DEFAULT_SHAPE, height: DEFAULT_SHAPE };
      }
      if (drag.tool === "rect" && drag.artboardId) {
        createRect(drag.artboardId, bounds);
      } else {
        const id = onCreateArtboard(bounds);
        onSelect({ kind: "artboard", artboardId: id });
      }
      onToolChange("move");
      return;
    }

    if ((drag.kind === "artboard" || drag.kind === "element" || drag.kind === "resize" || drag.kind === "group") && drag.moved) onCommit();
  };

  const onDoubleClick = (e: ReactMouseEvent) => {
    if (tool !== "move" || handMode) return;
    // Pointer capture can retarget the resulting double-click to the canvas.
    const direct = hitTest(e);
    const hit = direct.kind === "empty" ? pointerHit.current : direct;
    if (hit.kind === "element" && isTextEditable(hit.element)) {
      const rect = hit.element.getBoundingClientRect();
      if (!hit.element.isConnected || lockedAncestor(hit.element) || e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      onSelect({ kind: "element", artboardId: hit.id, element: hit.element });
      startEditing(hit.element, false);
    }
  };

  // Rects are measured after commit so the overlay tracks the world transform
  // that is actually on screen, not the one from the previous render.
  const hoverTarget = externalHover ?? hovered;
  const [rects, setRects] = useState<{ selected: OutlineRect | null; hover: Rect | null }>({ selected: null, hover: null });
  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const selectedEl = selectedElement(selection, hosts);
    setMultipleRects(selection.kind === "multiple" ? selection.items.flatMap(item => {
      const element = selectedElement(item, hosts);
      return element?.isConnected && element.getClientRects().length ? [selectionOutline(element, canvas)] : [];
    }) : []);
    setRects({
      selected: selectedEl?.getClientRects().length ? selectionOutline(selectedEl, canvas) : null,
      hover: hoverTarget && hoverTarget.isConnected && hoverTarget.getClientRects().length && hoverTarget !== selectedEl ? elementRectInCanvas(hoverTarget, canvas) : null,
    });
  }, [camera, version, selection, hoverTarget, hosts, artboards]);
  useLayoutEffect(() => {
    const elements = selectionItems(selection).flatMap(item => {
      const element = selectedElement(item, hosts); return element ? [element] : [];
    });
    const canvas = canvasRef.current;
    if (!elements.length || !canvas) return;
    let scheduled = 0;
    const refresh = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(() => {
        const next = elements.flatMap(element => element.isConnected && element.getClientRects().length ? [selectionOutline(element, canvas)] : []);
        if (selection.kind === "multiple") setMultipleRects(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
        else setRects(current => JSON.stringify(current.selected) === JSON.stringify(next[0] ?? null) ? current : { ...current, selected: next[0] ?? null });
      });
    };
    const resize = new ResizeObserver(refresh);
    const roots = new Set(elements.map(element => element.shadowRoot ?? element.getRootNode()));
    const observed = new Set<Element>();
    for (const element of elements) {
      observed.add(element);
      for (let parent = element.parentElement; parent && parent !== canvas; parent = parent.parentElement) observed.add(parent);
    }
    const mutations = new MutationObserver(refresh);
    for (const root of roots) {
      if (root instanceof ShadowRoot) {
        observed.add(root.host);
        mutations.observe(root, { attributes: true, childList: true, subtree: true, characterData: true });
      }
      root.addEventListener("scroll", refresh, true);
    }
    observed.forEach(element => resize.observe(element));
    window.addEventListener("resize", refresh);
    document.fonts.addEventListener("loadingdone", refresh);
    return () => {
      cancelAnimationFrame(scheduled); resize.disconnect(); mutations.disconnect();
      roots.forEach(root => root.removeEventListener("scroll", refresh, true));
      window.removeEventListener("resize", refresh); document.fonts.removeEventListener("loadingdone", refresh);
    };
  }, [selection, hosts]);
  const { selected: selectedRect, hover: hoverRect } = rects;

  const selectedArtboardId = selection.kind === "artboard" ? selection.artboardId : null;
  const canResize = !editing && (selection.kind === "artboard" || (selection.kind === "element" && !lockedAncestor(selection.element) && isResizable(selection.element)));
  const toolCursor = handMode ? " hand" : tool === "text" ? " text-tool" : tool === "frame" || tool === "rect" ? " draw-tool" : "";

  return (
    <div
      ref={canvasRef}
      className={`canvas${panning ? " panning" : toolCursor}`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={(event) => { if (pointerId.current === event.pointerId) cancelDrag(); }}
      onLostPointerCapture={(event) => { if (pointerId.current === event.pointerId) cancelDrag(); }}
      onDoubleClick={onDoubleClick}
      onPointerLeave={() => setHovered(null)}
    >
      {marquee && <div className="selection-marquee" style={rectStyle(marquee)} />}
      {multipleRects.map((rect, index) => <div key={index} className="outline selected multiple-outline" style={{ ...rectStyle(rect), transform: rect.transform, transformOrigin: "0 0" }} />)}
      <div className="world" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})` }}>
        {artboards.map((ab) => (
          <ArtboardView key={ab.id} artboard={ab} selected={ab.id === selectedArtboardId || (selection.kind === "multiple" && selection.items.some(item => item.kind === "artboard" && item.artboardId === ab.id))} zoom={camera.z} onMount={onHostMount} onSelect={(additive) => { const item = { kind: "artboard" as const, artboardId: ab.id }; onSelect(additive ? toggleSelection(selection, item) : item); }} />
        ))}
      </div>

      <div className="overlay" data-version={version}>
        {hoverRect && <div className="outline hover" style={rectStyle(hoverRect)} />}
        {selectedRect && <>
          <div className={`outline selected ${selection.kind === "artboard" ? "frame-selection" : "element-selection"}`} style={{ ...rectStyle(selectedRect), transform: selectedRect.transform, transformOrigin: "0 0" }}>
            {canResize && HANDLES.map((h) => (
              <span key={h} className={`handle ${h}`} style={{ cursor: resizeCursor(h, selectedRect.transform) }} onPointerDown={startResize(h)} />
            ))}
          </div>
          <div className={`selection-labels ${selection.kind === "artboard" ? "frame-selection" : "element-selection"}`} style={rectStyle(selectedRect.visualBounds ?? selectedRect)}>
            <div className="selection-caption">{selection.kind === "artboard" ? "Frame" : selection.kind === "element" ? selection.element.tagName.toLowerCase() : ""}</div>
            <div className="size-pill">
              {Math.round(selectedRect.layoutWidth ?? selectedRect.width / camera.z)} × {Math.round(selectedRect.layoutHeight ?? selectedRect.height / camera.z)}
            </div>
          </div>
        </>}
        {drawPreview && <div className="outline draw" style={rectStyle(drawPreview)} />}
      </div>

      {artboards.length === 0 && (
        <div className="hint">
          Press <kbd>F</kbd> to draw a frame, or paste HTML with <kbd>⌘V</kbd>
        </div>
      )}
    </div>
  );
}

type OutlineRect = Rect & { visualBounds?: Rect; transform?: string; layoutWidth?: number; layoutHeight?: number };
function selectionOutline(element: Element, canvas: HTMLElement): OutlineRect {
  const box = affineBorderBox(element);
  if (!box) return elementRectInCanvas(element, canvas);
  const bounds = canvas.getBoundingClientRect();
  const sx = Math.hypot(box.matrix.a, box.matrix.b);
  const sy = Math.hypot(box.matrix.c, box.matrix.d);
  return { visualBounds: elementRectInCanvas(element, canvas), left: box.origin.x - bounds.left, top: box.origin.y - bounds.top, width: box.size.width * sx, height: box.size.height * sy,
    transform: `matrix(${box.matrix.a / sx},${box.matrix.b / sx},${box.matrix.c / sy},${box.matrix.d / sy},0,0)`, layoutWidth: box.size.width, layoutHeight: box.size.height };
}

function resizeCursor(handle: Handle, transform?: string) {
  const matrix = transform ? new DOMMatrix(transform) : new DOMMatrix();
  const x = handle.includes("e") ? 1 : handle.includes("w") ? -1 : 0;
  const y = handle.includes("s") ? 1 : handle.includes("n") ? -1 : 0;
  const angle = Math.atan2(matrix.b * x + matrix.d * y, matrix.a * x + matrix.c * y) * 180 / Math.PI;
  return ["ew-resize", "nwse-resize", "ns-resize", "nesw-resize"][((Math.round(angle / 45) % 4) + 4) % 4];
}

function rectStyle(r: Rect) {
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function selectedElement(selection: Selection, hosts: Map<string, HTMLDivElement>): Element | null {
  if (selection.kind === "artboard") return hosts.get(selection.artboardId) ?? null;
  if (selection.kind === "element") return selection.element.isConnected ? selection.element : null;
  return null;
}

export function isTyping(e: Event) {
  const t = e.composedPath()[0];
  return t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement || (t instanceof HTMLElement && t.isContentEditable);
}

export function isInteractiveControl(e: Event) {
  const target = e.composedPath()[0];
  return target instanceof Element && !!target.closest('button, a[href], summary, [role="button"], [role="tab"], [role="slider"], [role="spinbutton"], [role="menu"], [role="dialog"]');
}

export function isPopupControl(e: Event) {
  const target = e.composedPath()[0];
  return target instanceof Element && !!target.closest('[role="dialog"], [role="menu"]');
}
