const common = [
  "color", "opacity", "font-family", "font-size", "font-weight", "font-style", "font-stretch",
  "line-height", "letter-spacing", "word-spacing", "text-align", "text-transform",
  "text-decoration-line", "text-decoration-color", "text-decoration-style", "text-decoration-thickness",
  "text-shadow", "box-shadow", "mix-blend-mode",
  "background-color", "background-image", "background-size", "background-position", "background-repeat",
  "background-origin", "background-clip", "background-attachment", "background-blend-mode",
  ...["top", "right", "bottom", "left"].flatMap(side => ["width", "style", "color"].map(part => `border-${side}-${part}`)),
  ...["top-left", "top-right", "bottom-right", "bottom-left"].map(corner => `border-${corner}-radius`),
];
const vector = ["fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-opacity", "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "stroke-dashoffset", "vector-effect"];

export type Appearance = { common: Record<string, string>; vector: Record<string, string> | null };

export function captureAppearance(element: Element): Appearance {
  const style = getComputedStyle(element);
  const read = (properties: string[]) => Object.fromEntries(properties.map(property => [property, style.getPropertyValue(property)]).filter(([, value]) => value !== ""));
  return { common: read(common), vector: element instanceof SVGElement ? read(vector) : null };
}

export function applyAppearance(element: HTMLElement | SVGElement, appearance: Appearance) {
  const properties = { ...appearance.common, ...(element instanceof SVGElement ? appearance.vector : null) };
  for (const [property, value] of Object.entries(properties)) {
    if (CSS.supports(property, value)) element.style.setProperty(property, value, element.style.getPropertyPriority(property));
  }
}
