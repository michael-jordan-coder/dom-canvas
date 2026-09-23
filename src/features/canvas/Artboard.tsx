import { useLayoutEffect, useRef } from "react";
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
  contain: layout paint style;
  overflow: hidden;
}
`;

type Props = {
  artboard: ArtboardData;
  onMount: (id: string, host: HTMLDivElement | null) => void;
};

export function ArtboardView({ artboard, onMount }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current!;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${BASE_CSS}${artboard.css}</style>${artboard.html}`;
    onMount(artboard.id, host);
    return () => onMount(artboard.id, null);
  }, [artboard.id, artboard.html, artboard.css, onMount]);

  return (
    <>
      <div
        className="artboard-label"
        data-artboard-label={artboard.id}
        style={{ left: artboard.x, top: artboard.y }}
      >
        {artboard.name}
      </div>
      <div
        ref={hostRef}
        className="artboard"
        data-artboard={artboard.id}
        style={{ left: artboard.x, top: artboard.y, width: artboard.width }}
      />
    </>
  );
}
