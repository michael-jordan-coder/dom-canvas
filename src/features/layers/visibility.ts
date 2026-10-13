const PREVIOUS_DISPLAY = "data-canvas-previous-display";

export function isLayerHidden(element: Element) {
  return getComputedStyle(element).display === "none";
}

export function toggleLayerVisibility(element: Element) {
  const style = (element as HTMLElement | SVGElement).style;
  if (!isLayerHidden(element)) {
    element.setAttribute(PREVIOUS_DISPLAY, JSON.stringify({ value: style.getPropertyValue("display"), priority: style.getPropertyPriority("display") }));
    style.setProperty("display", "none", "important");
    return;
  }
  let previous: { value?: string; priority?: string } = {};
  try { previous = JSON.parse(element.getAttribute(PREVIOUS_DISPLAY) ?? "{}") ?? {}; } catch { /* Imported metadata can be malformed. */ }
  element.removeAttribute(PREVIOUS_DISPLAY);
  style.removeProperty("display");
  if (typeof previous.value === "string" && CSS.supports("display", previous.value)) {
    style.setProperty("display", previous.value, previous.priority === "important" ? "important" : "");
  }
  // Also allow layers hidden by imported CSS or the hidden attribute to be shown.
  if (isLayerHidden(element)) style.setProperty("display", "revert", "important");
  if (isLayerHidden(element)) style.setProperty("display", "block", "important");
}
