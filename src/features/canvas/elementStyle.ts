import { parseRotation } from "./rotation";
export type Styled = HTMLElement | SVGElement;

// Layout dimensions exclude visual transforms and retain fractional CSS pixels.
export function getLayoutSize(el: Element) {
  if (el instanceof SVGGraphicsElement && !(el instanceof SVGSVGElement)) {
    const bounds = el.getBBox();
    return { width: round(bounds.width), height: round(bounds.height) };
  }
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
  const value = getComputedStyle(el).translate;
  const parts = value.match(/calc\([^)]*\)|\S+/g) ?? [];
  let size = getLayoutSize(el);
  if (el instanceof SVGElement && getComputedStyle(el).transformBox === "view-box" && el.ownerSVGElement) {
    const viewBox = el.ownerSVGElement.viewBox.baseVal;
    size = viewBox.width > 0 && viewBox.height > 0 ? { width: viewBox.width, height: viewBox.height } : getLayoutSize(el.ownerSVGElement);
  }
  const length = (part: string | undefined, extent: number) => {
    if (!part || part === "none") return 0;
    const expression = part.replace(/^calc\((.*)\)$/, "$1").replace(/\s+/g, "");
    const terms = expression.match(/[+-]?(?:\d*\.)?\d+(?:px|%)?/g);
    if (!terms || terms.join("") !== expression) return 0;
    return terms.reduce((sum, term) => sum + parseFloat(term) * (term.endsWith("%") ? extent / 100 : 1), 0);
  };
  return { x: length(parts[0], size.width), y: length(parts[1], size.height) };
}

export function inverseLinearDelta(matrix: DOMMatrixReadOnly, dx: number, dy: number) {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  if (Math.abs(determinant) < 1e-8) return { x: 0, y: 0 };
  return { x: (matrix.d * dx - matrix.c * dy) / determinant, y: (matrix.a * dy - matrix.b * dx) / determinant };
}

/** Linear transform from local CSS pixels to screen pixels, crossing shadow hosts. */
export function screenLinearTransform(el: Element, includeSelf = false): DOMMatrix {
  if (!includeSelf && el.parentElement instanceof SVGGraphicsElement) {
    const matrix = el.parentElement.getScreenCTM();
    if (matrix) return matrix;
  }
  const parentOf = (node: Element): Element | null => node.parentElement ?? (node.getRootNode() instanceof ShadowRoot ? (node.getRootNode() as ShadowRoot).host : null);
  let matrix = new DOMMatrix();
  for (let parent = includeSelf ? el : parentOf(el); parent; parent = parentOf(parent)) {
    const style = getComputedStyle(parent);
    const transform = new DOMMatrix();
    const rotation = parseRotation(style.rotate);
    if (rotation) transform.rotateAxisAngleSelf(...rotation.axis, rotation.degrees);
    const scale = style.scale.split(/\s+/).map(Number);
    if (scale.every(Number.isFinite)) transform.scaleSelf(scale[0], scale[1] ?? scale[0]);
    if (style.transform !== "none") transform.multiplySelf(new DOMMatrix(style.transform));
    const zoom = Number(style.getPropertyValue("zoom"));
    if (Number.isFinite(zoom) && zoom > 0 && zoom !== 1) transform.scaleSelf(zoom);
    matrix = transform.multiply(matrix);
  }
  return matrix;
}

/** Convert a screen-space movement into the parent's coordinate system. */
export function screenDeltaToLocal(el: Element, dx: number, dy: number) {
  return inverseLinearDelta(screenLinearTransform(el), dx, dy);
}

/** Reconstruct an affine border box from its screen bounds and local basis. */
export function affineBorderBox(el: Element) {
  if (!isResizable(el) || getComputedStyle(el).display === "inline") return null;
  const matrix = screenLinearTransform(el, true);
  if (!matrix.is2D || Math.abs(matrix.a * matrix.d - matrix.b * matrix.c) < 1e-8) return null;
  const size = getLayoutSize(el);
  const rect = el.getBoundingClientRect();
  const x = { x: matrix.a * size.width, y: matrix.b * size.width };
  const y = { x: matrix.c * size.height, y: matrix.d * size.height };
  // Translation and transform-origin are already reflected in the browser's bounds.
  const origin = { x: rect.left - Math.min(0, x.x, y.x, x.x + y.x), y: rect.top - Math.min(0, x.y, y.y, x.y + y.y) };
  return { matrix, size, origin, x, y, point: (fx: number, fy: number) => ({ x: origin.x + x.x * fx + y.x * fy, y: origin.y + x.y * fx + y.y * fy }) };
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
