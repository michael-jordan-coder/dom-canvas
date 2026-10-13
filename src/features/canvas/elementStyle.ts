import { parseTranslate } from "./geometry";

export type Styled = HTMLElement | SVGElement;

// Layout dimensions exclude visual transforms and retain fractional CSS pixels.
export function getLayoutSize(el: Element) {
  const style = getComputedStyle(el);
  const extra = (properties: string[]) => style.boxSizing === "border-box" ? 0 : properties.reduce((sum, property) => sum + (parseFloat(style.getPropertyValue(property)) || 0), 0);
  const width = parseFloat(style.width);
  const height = parseFloat(style.height);
  return {
    width: Number.isFinite(width) ? round(width + extra(["padding-left", "padding-right", "border-left-width", "border-right-width"])) : (el as HTMLElement).offsetWidth || el.getBoundingClientRect().width,
    height: Number.isFinite(height) ? round(height + extra(["padding-top", "padding-bottom", "border-top-width", "border-bottom-width"])) : (el as HTMLElement).offsetHeight || el.getBoundingClientRect().height,
  };
}

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
  const parent = el.parentElement ? getComputedStyle(el.parentElement) : null;
  if (parent?.display.includes("flex")) {
    const mainAxisChanged = parent.flexDirection.startsWith("column") ? size.height !== undefined : size.width !== undefined;
    if (mainAxisChanged) { el.style.flexGrow = "0"; el.style.flexShrink = "0"; el.style.flexBasis = "auto"; }
  }
  const extra = (properties: string[]) => computed.boxSizing === "border-box" ? 0 : properties.reduce((sum, property) => sum + (parseFloat(computed.getPropertyValue(property)) || 0), 0);
  // Keep the imported box model: changing box-sizing also changes the other axis.
  if (size.width !== undefined) el.style.width = `${round(Math.max(0, size.width - extra(["padding-left", "padding-right", "border-left-width", "border-right-width"])))}px`;
  if (size.height !== undefined) el.style.height = `${round(Math.max(0, size.height - extra(["padding-top", "padding-bottom", "border-top-width", "border-bottom-width"])))}px`;
}

export function isTextEditable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  return Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim());
}

export function round(n: number) {
  return Math.round(n * 100) / 100;
}
