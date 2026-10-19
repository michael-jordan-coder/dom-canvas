import { useLayoutEffect, useRef } from "react";
import { serializeRoot } from "@/features/document/serialize";
import type { Artboard as ArtboardData } from "./types";

const BASE_CSS = `
:host {
  all: initial;
  display: block;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif;
  color: #111;
  background: #fff;
  container-type: inline-size;
  container-name: frame;
  contain: layout style;
  overflow: hidden;
}
[contenteditable] { outline: none; cursor: text; }
`;

type Props = {
  artboard: ArtboardData;
  selected: boolean;
  onSelect: (additive: boolean) => void;
  zoom: number;
  onMount: (id: string, host: HTMLDivElement | null) => void;
};

export function ArtboardView({ artboard, selected, zoom, onMount, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current!;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      root.prepend(styleRef.current);
    }
    // Imported controls are design elements while on the editing canvas.
    // Form events do not cross the shadow boundary, so intercept them here.
    const preventActivation = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const activationEvents = ["click", "auxclick", "submit", "reset"];
    activationEvents.forEach(type => root.addEventListener(type, preventActivation, true));
    onMount(artboard.id, host);
    return () => {
      activationEvents.forEach(type => root.removeEventListener(type, preventActivation, true));
      onMount(artboard.id, null);
    };
  }, [artboard.id, onMount]);

  useLayoutEffect(() => {
    styleRef.current!.textContent = BASE_CSS + artboard.css;
  }, [artboard.css]);

  // After a commit the DOM already matches html, and replacing it would
  // destroy the element references that selection holds. Only undo, redo
  // and new content actually differ.
  useLayoutEffect(() => {
    const host = hostRef.current!;
    const root = host.shadowRoot!;
    if (serializeRoot(root) === artboard.html) return;
    for (const node of Array.from(root.childNodes)) {
      if (node !== styleRef.current) node.remove();
    }
    styleRef.current!.insertAdjacentHTML("afterend", artboard.html);
    onMount(artboard.id, host);
  }, [artboard.id, artboard.html, onMount]);

  return (
    <>
      <button
        type="button"
        aria-label={`Select frame ${artboard.name}`}
        aria-pressed={selected}
        onClick={event => { if (event.detail === 0) onSelect(event.shiftKey); }}
        className={`artboard-label${selected ? " selected" : ""}`}
        data-artboard-label={artboard.id}
        style={{
          left: artboard.x,
          top: artboard.y,
          maxWidth: artboard.width * zoom,
          // Counter-scale so the label stays screen-sized at every zoom level.
          transform: `translateY(-100%) scale(${1 / zoom})`,
        }}
      >
        {artboard.name}
      </button>
      <div
        ref={hostRef}
        className="artboard"
        data-artboard={artboard.id}
        style={{ left: artboard.x, top: artboard.y, width: artboard.width, height: artboard.height, backgroundColor: artboard.backgroundColor, overflow: artboard.clipContent === undefined ? undefined : artboard.clipContent ? "hidden" : "visible", contain: artboard.clipContent === false ? "layout style" : undefined }}
      />
    </>
  );
}
