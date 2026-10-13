export function lockedAncestor(element: Element) {
  return element.closest('[data-canvas-locked="true"]');
}

export function toggleLayerLock(element: Element) {
  const owner = lockedAncestor(element);
  if (owner) owner.removeAttribute("data-canvas-locked");
  else element.setAttribute("data-canvas-locked", "true");
}
