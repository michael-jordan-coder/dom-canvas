import { setSize, type Styled } from "@/features/canvas/elementStyle";

export type SizeAxis = "width" | "height";
export type SizeMode = "css" | "fixed" | "hug" | "fill" | "custom";

export function layoutParent(element: Element): Element | null {
  const parentOf = (node: Element) => node.parentElement ?? (node.getRootNode() instanceof ShadowRoot ? (node.getRootNode() as ShadowRoot).host : null);
  let parent = parentOf(element);
  while (parent && getComputedStyle(parent).display === "contents") parent = parentOf(parent);
  return parent;
}

export function layoutItemKind(element: Element): "flex" | "grid" | null {
  const own = getComputedStyle(element);
  if (["absolute", "fixed"].includes(own.position) || ["none", "contents"].includes(own.display)) return null;
  const parent = layoutParent(element);
  if (!parent) return null;
  const display = getComputedStyle(parent).display;
  return display.includes("flex") ? "flex" : display.includes("grid") ? "grid" : null;
}

export function isFlexMainAxis(element: Element, axis: SizeAxis) {
  const parent = layoutParent(element);
  if (!parent || layoutItemKind(element) !== "flex") return false;
  const style = getComputedStyle(parent);
  return style.display.includes("flex") && style.flexDirection.startsWith("column") === (axis === "height");
}

export function sizingProperties(element: Element, axis: SizeAxis) {
  return [axis, `min-${axis}`, ...(isFlexMainAxis(element, axis) ? ["flex-grow", "flex-shrink", "flex-basis"] : [])];
}

export function sizeMode(element: Styled, axis: SizeAxis): SizeMode {
  const value = element.style.getPropertyValue(axis);
  if (isFlexMainAxis(element, axis) && element.style.flexGrow === "1" && value === "0px") return "fill";
  if (!value) return "css";
  if (value === "max-content" || value === "fit-content") return "hug";
  if (value === "100%" || value === "stretch") return "fill";
  if (/^[\d.]+px$/.test(value)) return "fixed";
  return "custom";
}

export function setSizeMode(element: Styled, axis: SizeAxis, mode: SizeMode, measured: number) {
  if (mode === "css") {
    sizingProperties(element, axis).forEach((property) => element.style.removeProperty(property));
    return;
  }
  if (mode === "custom") return;
  const main = isFlexMainAxis(element, axis);
  if (getComputedStyle(element).display === "inline") element.style.display = "inline-block";
  if (main) {
    element.style.flexGrow = mode === "fill" ? "1" : "0";
    element.style.flexShrink = mode === "fill" ? "1" : "0";
    element.style.flexBasis = "auto";
  }
  if (mode === "fixed") setSize(element, { [axis]: measured });
  else if (mode === "hug") element.style.setProperty(axis, "max-content");
  else {
    element.style.setProperty(axis, main ? "0px" : CSS.supports(axis, "stretch") ? "stretch" : "100%");
    element.style.setProperty(`min-${axis}`, "0px");
  }
}
