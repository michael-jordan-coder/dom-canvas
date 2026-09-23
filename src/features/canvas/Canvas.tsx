import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArtboardView } from "./Artboard";
import { elementRectInCanvas, parseTranslate, zoomAround, type Rect } from "./geometry";
import type { Artboard, Camera, Selection } from "./types";

type Props = {
  artboards: Artboard[];
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  hosts: Map<string, HTMLDivElement>;
  onHostMount: (id: string, host: HTMLDivElement | null) => void;
  onMoveArtboard: (id: string, x: number, y: number) => void;
  version: number;
  onChange: () => void;
};

type Drag =
  | { kind: "pan"; startX: number; startY: number; camera: Camera }
  | { kind: "artboard"; id: string; startX: number; startY: number; originX: number; originY: number }
  | { kind: "element"; element: HTMLElement | SVGElement; startX: number; startY: number; originX: number; originY: number };

type Hit =
  | { kind: "empty" }
  | { kind: "artboard"; id: string }
  | { kind: "element"; id: string; element: Element };

export function Canvas(props: Props) {
  const {
    artboards, camera, onCameraChange, selection, onSelect,
    hosts, onHostMount, onMoveArtboard, version, onChange,
  } = props;

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const spaceRef = useRef(false);
  const [panning, setPanning] = useState(false);
  const [hovered, setHovered] = useState<Element | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space" && !isTyping(e)) { spaceRef.current = true; e.preventDefault(); } };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") spaceRef.current = false; };
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

  const hitTest = useCallback((e: ReactPointerEvent): Hit => {
    const path = e.nativeEvent.composedPath();
    for (const node of path) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.dataset.artboardLabel) return { kind: "artboard", id: node.dataset.artboardLabel };
      if (node.dataset.artboard) {
        const target = path[0];
        if (target === node || !(target instanceof Element)) return { kind: "artboard", id: node.dataset.artboard };
        return { kind: "element", id: node.dataset.artboard, element: target };
      }
    }
    return { kind: "empty" };
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    const canvas = canvasRef.current!;
    canvas.focus();
    canvas.setPointerCapture(e.pointerId);
    const hit = e.button === 1 || spaceRef.current ? { kind: "empty" as const } : hitTest(e);

    if (hit.kind === "empty") {
      dragRef.current = { kind: "pan", startX: e.clientX, startY: e.clientY, camera };
      setPanning(true);
      if (!spaceRef.current && e.button === 0) onSelect({ kind: "none" });
      return;
    }

    if (hit.kind === "artboard") {
      const ab = artboards.find((a) => a.id === hit.id)!;
      onSelect({ kind: "artboard", artboardId: hit.id });
      dragRef.current = { kind: "artboard", id: hit.id, startX: e.clientX, startY: e.clientY, originX: ab.x, originY: ab.y };
      return;
    }

    onSelect({ kind: "element", artboardId: hit.id, element: hit.element });
    const el = hit.element;
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      const origin = parseTranslate(el.style.translate);
      dragRef.current = { kind: "element", element: el, startX: e.clientX, startY: e.clientY, originX: origin.x, originY: origin.y };
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) {
      const hit = hitTest(e);
      setHovered(hit.kind === "element" ? hit.element : hit.kind === "artboard" ? hosts.get(hit.id) ?? null : null);
      return;
    }
    const dx = (e.clientX - drag.startX) / camera.z;
    const dy = (e.clientY - drag.startY) / camera.z;
    if (drag.kind === "pan") {
      onCameraChange({ ...drag.camera, x: drag.camera.x + e.clientX - drag.startX, y: drag.camera.y + e.clientY - drag.startY });
    } else if (drag.kind === "artboard") {
      onMoveArtboard(drag.id, Math.round(drag.originX + dx), Math.round(drag.originY + dy));
    } else {
      drag.element.style.translate = `${Math.round(drag.originX + dx)}px ${Math.round(drag.originY + dy)}px`;
      onChange();
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    canvasRef.current!.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setPanning(false);
  };

  // Rects are measured after commit so the overlay tracks the world transform
  // that is actually on screen, not the one from the previous render.
  const [rects, setRects] = useState<{ selected: Rect | null; hover: Rect | null }>({ selected: null, hover: null });
  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const selectedEl = selectedElement(selection, hosts);
    setRects({
      selected: selectedEl ? elementRectInCanvas(selectedEl, canvas) : null,
      hover: hovered && hovered !== selectedEl ? elementRectInCanvas(hovered, canvas) : null,
    });
  }, [camera, version, selection, hovered, hosts, artboards]);
  const { selected: selectedRect, hover: hoverRect } = rects;

  return (
    <div
      ref={canvasRef}
      className={`canvas${panning ? " panning" : ""}`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => setHovered(null)}
    >
      <div className="world" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})` }}>
        {artboards.map((ab) => (
          <ArtboardView key={ab.id} artboard={ab} onMount={onHostMount} />
        ))}
      </div>

      <div className="overlay" data-version={version}>
        {hoverRect && <Outline rect={hoverRect} className="hover" />}
        {selectedRect && <Outline rect={selectedRect} className="selected" zoom={camera.z} />}
      </div>

      {artboards.length === 0 && (
        <div className="hint">
          Copy some HTML and press <kbd>⌘V</kbd>
        </div>
      )}

      <div className="zoom-readout">{Math.round(camera.z * 100)}%</div>
    </div>
  );
}

function Outline({ rect, className, zoom }: { rect: Rect; className: string; zoom?: number }) {
  return (
    <div className={`outline ${className}`} style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
      {zoom && (
        <div className="size">
          {Math.round(rect.width / zoom)} × {Math.round(rect.height / zoom)}
        </div>
      )}
    </div>
  );
}

function selectedElement(selection: Selection, hosts: Map<string, HTMLDivElement>): Element | null {
  if (selection.kind === "artboard") return hosts.get(selection.artboardId) ?? null;
  if (selection.kind === "element") return selection.element.isConnected ? selection.element : null;
  return null;
}

function isTyping(e: KeyboardEvent) {
  const t = e.target;
  return t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
}
