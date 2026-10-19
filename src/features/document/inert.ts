// Pasted JavaScript stays with the design but never runs on the canvas:
// scripts get a type the browser ignores and handler attributes a prefix.
// Play restores both inside a sandboxed iframe, where they can run.
const INERT_TYPE = "text/x-dom-canvas-script";
const PREFIX = "data-dc-";

const isScriptAttribute = (attribute: Attr) =>
  /^on/i.test(attribute.name) ||
  (/^(?:href|src|action|formaction|xlink:href)$/i.test(attribute.name) && /^(?:javascript|vbscript):/i.test(attribute.value.replace(/[\u0000- ]/g, "")));

export function makeInert(root: ParentNode) {
  for (const element of elementsOf(root)) {
    if (element instanceof HTMLScriptElement && element.type !== INERT_TYPE) {
      const original = element.getAttribute("type");
      if (original !== null) element.setAttribute(`${PREFIX}type`, original);
      element.setAttribute("type", INERT_TYPE);
    }
    for (const attribute of Array.from(element.attributes)) {
      if (!isScriptAttribute(attribute)) continue;
      element.setAttribute(PREFIX + attribute.name, attribute.value);
      element.removeAttributeNode(attribute);
    }
    if (element instanceof HTMLTemplateElement) makeInert(element.content);
  }
}

export function restoreScripts(root: ParentNode) {
  for (const element of elementsOf(root)) {
    if (element instanceof HTMLScriptElement && element.type === INERT_TYPE) {
      const original = element.getAttribute(`${PREFIX}type`);
      element.removeAttribute(`${PREFIX}type`);
      if (original === null) element.removeAttribute("type");
      else element.setAttribute("type", original);
    }
    for (const attribute of Array.from(element.attributes)) {
      if (!attribute.name.startsWith(PREFIX)) continue;
      element.setAttribute(attribute.name.slice(PREFIX.length), attribute.value);
      element.removeAttributeNode(attribute);
    }
    if (element instanceof HTMLTemplateElement) restoreScripts(element.content);
  }
}

function elementsOf(root: ParentNode) {
  const all = Array.from(root.querySelectorAll("*"));
  return root instanceof Element ? [root, ...all] : all;
}
