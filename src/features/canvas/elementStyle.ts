import { parseTranslate } from "./geometry";

export type Styled = HTMLElement | SVGElement;

export function getTranslate(el: Styled) {
  return parseTranslate(el.style.translate);
}

export function setTranslate(el: Styled, x: number, y: number) {
  el.style.translate = `${round(x)}px ${round(y)}px`;
}

export function isResizable(el: Element): el is Styled {
  return el instanceof HTMLElement || el.tagName.toLowerCase() === "svg";
}

// Sizes are visual (border-box) like Figma's W/H, and inline boxes ignore
// width/height, so they are promoted to inline-block on first resize.
export function setSize(el: Styled, size: { width?: number; height?: number }) {
  const computed = getComputedStyle(el);
  if (computed.display === "inline") el.style.display = "inline-block";
  el.style.boxSizing = "border-box";
  if (size.width !== undefined) el.style.width = `${round(Math.max(1, size.width))}px`;
  if (size.height !== undefined) el.style.height = `${round(Math.max(1, size.height))}px`;
}

export function isTextEditable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  return Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim());
}

export function round(n: number) {
  return Math.round(n * 100) / 100;
}
