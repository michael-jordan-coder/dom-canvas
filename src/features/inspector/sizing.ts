import { setSize, type Styled } from "@/features/canvas/elementStyle";
import { availableSizeModes, type SizeMode } from "./sizingPolicy";
export type { SizeMode } from "./sizingPolicy";

export type SizeAxis = "width" | "height";

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
  if (!parent || ["absolute", "fixed"].includes(getComputedStyle(element).position) || getComputedStyle(element).display === "contents") return false;
  const style = getComputedStyle(parent);
  return style.display.includes("flex") && style.flexDirection.startsWith("column") === (axis === "height");
}

export function sizingProperties(element: Element, axis: SizeAxis) {
  return [axis, ...(isFlexMainAxis(element, axis) ? ["flex-grow", "flex-shrink", "flex-basis"] : [])];
}

export function sizeModes(element: Styled, axis: SizeAxis) {
  const parent = layoutParent(element);
  const style = getComputedStyle(element);
  // Typed OM retains "auto" where getComputedStyle reports a used pixel height.
  const typedParent = parent as (HTMLElement & { computedStyleMap?: () => Map<string, { toString(): string }> }) | null;
  let parentSize = parent ? getComputedStyle(parent).getPropertyValue(axis) : "auto";
  try { parentSize = typedParent?.computedStyleMap?.().get(axis)?.toString() ?? parentSize; } catch { /* CSSOM fallback */ }
  return availableSizeModes({ box: style.display !== "contents" && (element instanceof HTMLElement || element.tagName.toLowerCase() === "svg"), inline: style.display === "inline", parentLayout: layoutItemKind(element), parentDefinite: parentSize !== "auto" && parentSize !== "max-content" && parentSize !== "fit-content" });
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
  if (mode !== "custom" && !sizeModes(element, axis).includes(mode)) return false;
  if (mode === "css") {
    sizingProperties(element, axis).forEach((property) => element.style.removeProperty(property));
    return true;
  }
  if (mode === "custom") return false;
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
    // Existing min/max bounds (including stylesheet bounds) remain authoritative.
    if (main && getComputedStyle(element).getPropertyValue(`min-${axis}`) === "auto" && !element.style.getPropertyValue(`min-${axis}`)) element.style.setProperty(`min-${axis}`, "0px");
  }
  return true;
}
