const isStyle = (node: Node) => node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "STYLE";

export function serializeRoot(root: ShadowRoot) {
  let out = "";
  for (const node of Array.from(root.childNodes)) {
    if (isStyle(node)) continue;
    if (node.nodeType === Node.ELEMENT_NODE) out += (node as Element).outerHTML;
    else if (node.nodeType === Node.TEXT_NODE) out += escapeText(node.nodeValue ?? "");
  }
  return out;
}

export function contentElements(root: ShadowRoot) {
  return Array.from(root.children).filter((el) => el.tagName !== "STYLE");
}

// Element references die when a snapshot is restored, so selection survives
// undo as an index path from the shadow root.
export function pathOf(el: Element): number[] {
  const path: number[] = [];
  let node: Element | null = el;
  while (node) {
    const parent: Node | null = node.parentNode;
    if (!parent) break;
    const siblings = parent instanceof ShadowRoot ? Array.from(parent.children) : Array.from((parent as Element).children);
    path.unshift(siblings.indexOf(node));
    if (parent instanceof ShadowRoot) break;
    node = parent as Element;
  }
  return path;
}

export function resolvePath(root: ShadowRoot, path: number[]): Element | null {
  let node: Element | undefined = root.children[path[0]];
  for (const index of path.slice(1)) {
    node = node?.children[index];
  }
  return node ?? null;
}

function escapeText(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
