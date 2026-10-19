import { serializeRoot } from "./serialize";
import { restoreScripts } from "./inert";
import type { Artboard } from "@/features/canvas/types";

// The selection as a standalone HTML file: an element brings its HTML and
// the rules that reach it, a frame its whole stylesheet. Kept scripts are
// restored, since the file is meant to run outside the canvas.
export function selectionDocument(artboard: Artboard, root: ShadowRoot | null | undefined, element?: Element, baseCss = "") {
  const nodes = element ? [restored(element)] : contentNodes(root ? serializeRoot(root) : artboard.html);
  const css = element ? matchingCss(artboard.css, element) : formatSheet(artboard.css);
  return documentFor(artboard.name, [artboard.fonts?.trim(), documentCss(css)].filter(Boolean).join("\n\n"), nodes, baseCss);
}

// Play runs the frame as the canvas shows it, so the frame's own defaults
// from the canvas stylesheet come first.
export function playDocument(artboard: Artboard, root: ShadowRoot | null | undefined) {
  const base = `body {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif;\n  color: #111;\n  background: ${artboard.backgroundColor ?? "#fff"};\n}`;
  return selectionDocument(artboard, root, undefined, base);
}

function restored(element: Element) {
  const clone = element.cloneNode(true) as Element;
  restoreScripts(clone);
  return clone;
}

// Pseudo-elements and interaction states never match a static element, so
// they are dropped before testing whether a selector reaches the subtree.
const UNMATCHABLE = /::?(?:before|after|marker|placeholder|selection|first-line|first-letter|backdrop|file-selector-button)\b|:(?:hover|focus|focus-visible|focus-within|active|visited|target)\b/g;

function matchingCss(css: string, element: Element) {
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(css);
  } catch {
    return "";
  }
  const kept = collect(Array.from(sheet.cssRules), element, "");
  // Animations stay readable when their keyframes come along.
  const keyframes = Array.from(sheet.cssRules).filter((rule): rule is CSSKeyframesRule => rule instanceof CSSKeyframesRule && kept.some(text => text.includes(rule.name)));
  return [...kept, ...keyframes.map(rule => rule.cssText)].join("\n\n");
}

function formatSheet(css: string) {
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(css);
  } catch {
    return css.trim();
  }
  return collect(Array.from(sheet.cssRules), null, "").join("\n\n");
}

function collect(rules: CSSRule[], element: Element | null, indent: string): string[] {
  const out: string[] = [];
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      if (!element || reaches(rule.selectorText, element)) out.push(formatRule(rule.cssText, indent));
    } else if (rule instanceof CSSGroupingRule && !(rule instanceof CSSStyleRule)) {
      const inner = collect(Array.from(rule.cssRules), element, `${indent}  `);
      if (inner.length) out.push(`${indent}${rule.cssText.slice(0, rule.cssText.indexOf("{")).trim()} {\n${inner.join("\n\n")}\n${indent}}`);
    } else if (!element) {
      out.push(`${indent}${rule.cssText}`);
    }
  }
  return out;
}

function reaches(selectorText: string, element: Element) {
  return splitSelectors(selectorText).some(selector => {
    // :host rules hold variables and defaults the element inherits.
    const test = selector.replace(/:host(?:\([^)]*\))?\s*>?\s*/g, "").replace(UNMATCHABLE, "").trim();
    if (!test) return true;
    try {
      return element.matches(test) || element.querySelector(test) !== null;
    } catch {
      return false;
    }
  });
}

function splitSelectors(text: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    else if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map(part => part.trim());
}

function formatRule(cssText: string, indent: string) {
  const open = cssText.indexOf("{");
  const selector = cssText.slice(0, open).trim();
  const body = cssText.slice(open + 1, cssText.lastIndexOf("}")).trim();
  if (body.includes("{")) return `${indent}${cssText}`;
  const declarations = body.split(/;\s*(?=(?:--)?[\w-]+\s*:)/).map(part => part.replace(/;\s*$/, "").trim()).filter(Boolean);
  return `${indent}${selector} {\n${declarations.map(line => `${indent}  ${line};`).join("\n")}\n${indent}}`;
}

// Frame CSS is written for a shadow root inside a container. A standalone
// file needs the document equivalents back: the body, media queries and
// viewport units.
function documentCss(css: string) {
  return css
    .replace(/:host\(([^)]*)\)/g, "body$1")
    .replace(/:host/g, "body")
    .replace(/@container frame\s+/g, "@media ")
    .replace(/(\d)cqw\b/g, "$1vw")
    .replace(/(\d)cqh\b/g, "$1vh");
}

// The code reads like a standalone file: a document whose head carries the
// CSS and whose body carries the HTML, indented one element per line.
function documentFor(title: string, css: string, nodes: Node[], baseCss = "") {
  const sheet = [baseCss, css].filter(Boolean).join("\n\n");
  const style = sheet ? `    <style>\n${indentLines(sheet, "      ")}\n    </style>\n` : "";
  const body = nodes.map(node => formatNode(node, "    ")).filter(Boolean).join("\n");
  return `<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <title>${escapeText(title)}</title>\n${style}  </head>\n  <body>\n${body}\n  </body>\n</html>`;
}

function contentNodes(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  restoreScripts(template.content);
  return Array.from(template.content.childNodes);
}

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["pre", "textarea", "script", "style"]);

function formatNode(node: Node, indent: string): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.replace(/\s+/g, " ").trim();
    return text ? `${indent}${escapeText(text)}` : "";
  }
  if (node.nodeType === Node.COMMENT_NODE) return `${indent}<!--${(node as Comment).data}-->`;
  if (!(node instanceof Element)) return "";
  const tag = node.localName;
  const shell = (node.cloneNode(false) as Element).outerHTML;
  const close = `</${tag}>`;
  const open = shell.endsWith(close) ? shell.slice(0, -close.length) : shell;
  if (VOID.has(tag)) return `${indent}${open}`;
  const children = Array.from(node.childNodes);
  // Text directly inside an element is whitespace-sensitive, so mixed content
  // stays on one line exactly as the browser renders it.
  const inline = RAW.has(tag) || children.some(child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim());
  if (RAW.has(tag)) return `${indent}${node.outerHTML}`;
  if (inline || !children.length) return `${indent}${node.outerHTML.replace(/\s*\n\s*/g, " ")}`;
  const inner = children.map(child => formatNode(child, `${indent}  `)).filter(Boolean).join("\n");
  return `${indent}${open}\n${inner}\n${indent}${close}`;
}

function indentLines(text: string, indent: string) {
  return text.split("\n").map(line => line ? indent + line : line).join("\n");
}

function escapeText(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
