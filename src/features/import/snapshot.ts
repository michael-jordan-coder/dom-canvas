export type Snapshot = { html: string; css: string; fonts: string };

const INHERITED = new Set([
  "color", "font-family", "font-size", "font-weight", "font-style", "line-height",
  "letter-spacing", "text-align", "text-transform", "text-decoration-line", "white-space",
  "word-break", "overflow-wrap", "list-style-type", "visibility", "cursor", "fill", "stroke",
  "stroke-width", "text-shadow", "direction",
]);

const PROPS = [
  "display", "position", "top", "right", "bottom", "left", "z-index", "float", "clear",
  "box-sizing", "width", "height", "min-width", "min-height", "max-width", "max-height",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
  "background-color", "background-image", "background-size", "background-position", "background-repeat", "background-clip",
  "opacity", "overflow-x", "overflow-y", "vertical-align",
  "flex-direction", "flex-wrap", "justify-content", "align-items", "align-content", "align-self",
  "flex-grow", "flex-shrink", "flex-basis", "order", "row-gap", "column-gap",
  "grid-template-columns", "grid-template-rows", "grid-column-start", "grid-column-end",
  "grid-row-start", "grid-row-end", "grid-auto-flow",
  "transform", "transform-origin", "box-shadow", "object-fit", "aspect-ratio", "filter",
  "backdrop-filter", "text-decoration-color", "text-decoration-style", "text-overflow",
  "-webkit-line-clamp", "-webkit-box-orient", "columns",
  ...INHERITED,
];

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "NOSCRIPT", "TEMPLATE", "META", "TITLE", "HEAD", "BASE"]);
const PLACEHOLDER_TAGS = new Set(["IFRAME", "VIDEO", "CANVAS", "EMBED", "OBJECT", "AUDIO"]);
const VOID_TAGS = new Set(["img", "br", "hr", "input", "wbr", "source", "track"]);

let defaultsDoc: Document | null = null;
const defaultsCache = new Map<string, CSSStyleDeclaration>();

// UA defaults come from a blank same-origin frame so the imported page's own
// stylesheets cannot pollute the baseline we diff against.
function defaultStyle(tag: string): CSSStyleDeclaration {
  const cached = defaultsCache.get(tag);
  if (cached) return cached;
  if (!defaultsDoc) {
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none";
    document.body.append(frame);
    defaultsDoc = frame.contentDocument!;
  }
  const probe = defaultsDoc.createElement(tag);
  // Link defaults (color, cursor, underline) only apply to anchors with an href.
  if (tag === "a") probe.setAttribute("href", "#");
  defaultsDoc.body.append(probe);
  const style = defaultsDoc.defaultView!.getComputedStyle(probe);
  defaultsCache.set(tag, style);
  return style;
}

export function snapshot(root: HTMLElement): Snapshot {
  const view = root.ownerDocument.defaultView!;
  const rules: string[] = [];
  let counter = 0;

  const declarations = (
    computed: CSSStyleDeclaration,
    parent: CSSStyleDeclaration | null,
    baseline: CSSStyleDeclaration,
    tag: string,
  ) => {
    const out: string[] = [];
    const inlineLike = computed.display === "inline" && tag !== "img" && tag !== "svg";
    for (const prop of PROPS) {
      const value = computed.getPropertyValue(prop);
      if (!value) continue;
      if (inlineLike && (prop === "width" || prop === "height")) continue;
      // A border style without a width falls back to "medium" (3px), so the
      // width must travel with the style even when it equals the default 0.
      const borderSide = prop.match(/^border-(top|right|bottom|left)-width$/)?.[1];
      if (borderSide && computed.getPropertyValue(`border-${borderSide}-style`) !== "none") {
        out.push(`${prop}:${value}`);
        continue;
      }
      if (INHERITED.has(prop) && parent) {
        // Inheritance covers the value unless the UA stylesheet has a
        // tag-specific rule for it (a { color }, h1 { font-size }, b { font-weight }...).
        const uaOverrides = baseline.getPropertyValue(prop) !== defaultStyle("div").getPropertyValue(prop);
        if (value !== parent.getPropertyValue(prop) || uaOverrides) out.push(`${prop}:${value}`);
        continue;
      }
      if (value !== baseline.getPropertyValue(prop)) out.push(`${prop}:${value}`);
    }
    return out;
  };

  const pseudo = (el: Element, which: "::before" | "::after", className: string) => {
    const computed = view.getComputedStyle(el, which);
    if (computed.content === "none" || computed.content === "normal") return;
    const decls = declarations(computed, view.getComputedStyle(el), defaultStyle("span"), "span");
    rules.push(`.${className}${which}{content:${computed.content};${decls.join(";")}}`);
  };

  const visit = (node: Node, parent: CSSStyleDeclaration | null): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeText(node.nodeValue ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    if (SKIP_TAGS.has(el.tagName)) return "";

    const computed = view.getComputedStyle(el);
    if (computed.display === "none") return "";

    const tag = el.tagName.toLowerCase();
    const className = `i${counter++}`;
    const decls = declarations(computed, parent, defaultStyle(tag), tag);

    if (tag === "svg") {
      rules.push(`.${className}{${decls.join(";")}}`);
      return inlineSvg(el, className);
    }

    if (PLACEHOLDER_TAGS.has(el.tagName)) {
      rules.push(`.${className}{${decls.join(";")};background:#ddd}`);
      return `<div class="${className}" data-placeholder="${tag}"></div>`;
    }

    rules.push(`.${className}{${decls.join(";")}}`);
    pseudo(el, "::before", className);
    pseudo(el, "::after", className);

    const attrs = elementAttributes(el, className);
    if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`;
    const children = Array.from(el.childNodes).map((child) => visit(child, computed)).join("");
    // A <body> tag is dropped by fragment parsing inside the shadow root.
    const outTag = tag === "body" || tag === "html" ? "div" : tag;
    return `<${outTag}${attrs}>${children}</${outTag}>`;
  };

  const html = visit(root, null);
  return { html, css: rules.join("\n"), fonts: collectFontFaces(root.ownerDocument) };
}

// Attributes that change layout or meaning; everything else is either
// captured by the computed styles or dropped on purpose (scripts, handlers).
const KEPT_ATTRIBUTES = ["colspan", "rowspan", "dir", "lang", "title"];

// The page lives in another frame, so instanceof against this window's
// constructors never matches; identify elements by tag instead.
function elementAttributes(el: Element, className: string) {
  const classes = [className, ...Array.from(el.classList)].join(" ");
  const attrs = [`class="${escapeAttr(classes)}"`];
  if (el.id) attrs.push(`id="${escapeAttr(el.id)}"`);
  for (const name of KEPT_ATTRIBUTES) {
    const value = el.getAttribute(name);
    if (value !== null) attrs.push(`${name}="${escapeAttr(value)}"`);
  }
  const tag = el.tagName.toLowerCase();
  if (tag === "img") {
    const img = el as HTMLImageElement;
    attrs.push(`src="${escapeAttr(img.currentSrc || img.src)}"`, `alt="${escapeAttr(img.alt)}"`);
  }
  if (tag === "a") attrs.push(`href="${escapeAttr((el as HTMLAnchorElement).href)}"`);
  if (tag === "input") {
    const input = el as HTMLInputElement;
    attrs.push(`type="${escapeAttr(input.type)}"`, `value="${escapeAttr(input.value)}"`, `placeholder="${escapeAttr(input.placeholder)}"`);
  }
  return ` ${attrs.join(" ")}`;
}

function inlineSvg(svg: Element, className: string) {
  const clone = svg.cloneNode(true) as Element;
  clone.querySelectorAll("script").forEach((n) => n.remove());
  clone.setAttribute("class", [className, ...Array.from(svg.classList)].join(" "));
  clone.removeAttribute("style");
  return clone.outerHTML;
}

// @font-face is ignored inside shadow roots, so the caller injects these at
// document level. Cross-origin sheets throw on cssRules; the proxy makes the
// page's own sheets same-origin so most of them are readable.
function collectFontFaces(doc: Document) {
  const faces: string[] = [];
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (rule.type === CSSRule.FONT_FACE_RULE) faces.push(rule.cssText);
      if (rule.type === CSSRule.IMPORT_RULE) {
        try {
          for (const inner of Array.from((rule as CSSImportRule).styleSheet?.cssRules ?? [])) {
            if (inner.type === CSSRule.FONT_FACE_RULE) faces.push(inner.cssText);
          }
        } catch {
          continue;
        }
      }
    }
  }
  return faces.join("\n");
}

function escapeText(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(text: string) {
  return escapeText(text).replace(/"/g, "&quot;");
}
