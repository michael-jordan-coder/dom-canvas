import { makeInert } from "../document/inert.ts";

export type PastedCode =
  | { kind: "document"; html: string; css: string; fonts: string }
  | { kind: "stylesheet"; css: string; fonts: string };

const TAG_PATTERN = /<([a-z][a-z0-9-]*)[\s>\/]/i;

export function parseClipboard(
  plain: string,
  richHtml: string,
): PastedCode | null {
  const source = pickSource(plain, richHtml);
  if (!source) return null;
  if (source.kind === "stylesheet") return { kind: "stylesheet", ...extractFonts(source.css) };
  return splitDocument(source.text);
}

function pickSource(
  plain: string,
  richHtml: string,
): { kind: "markup"; text: string } | { kind: "stylesheet"; css: string } | null {
  const trimmed = plain.trim();
  if (TAG_PATTERN.test(trimmed)) return { kind: "markup", text: trimmed };
  if (looksLikeCss(trimmed)) return { kind: "stylesheet", css: trimmed };
  if (richHtml.trim()) return { kind: "markup", text: richHtml };
  return null;
}

function looksLikeCss(text: string) {
  return /[^{}]+\{[^{}]*\}/.test(text) && !/<\w/.test(text);
}

function splitDocument(source: string): PastedCode {
  const doc = new DOMParser().parseFromString(source, "text/html");

  doc.querySelectorAll("noscript, meta, title, base").forEach((n) => n.remove());
  // Scripts are kept for Play. Head scripts would be dropped with the head,
  // so they move to the start of the body in their original order.
  doc.body.prepend(...Array.from(doc.querySelectorAll("head script")));
  makeInert(doc.body);

  const css = Array.from(doc.querySelectorAll("style"))
    .map((style) => {
      style.remove();
      return style.textContent ?? "";
    })
    .join("\n");

  // Stylesheet links in <head> would be dropped with the head; keep them
  // in the body so they still apply inside the shadow root. Font sheets
  // only declare @font-face, which a shadow root ignores, so they go to
  // the document instead.
  const fontLinks: string[] = [];
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (isFontStylesheet(href)) {
      fontLinks.push(href);
      link.remove();
    } else if (link.closest("head")) {
      doc.body.prepend(link);
    }
  });

  const bodyAttributes = new Map<string, string>();
  for (const name of ["style", "class", "id", "dir", "lang"]) {
    const inherited = name === "dir" || name === "lang"
      ? doc.documentElement.getAttribute(name)
      : null;
    const value = doc.body.getAttribute(name) ?? inherited;
    if (value !== null) bodyAttributes.set(name, value);
  }
  let html = doc.body.innerHTML;
  if (bodyAttributes.size) {
    // Let the DOM serializer escape quotes and ampersands in attributes.
    const wrapper = doc.createElement("div");
    bodyAttributes.forEach((value, name) => wrapper.setAttribute(name, value));
    wrapper.append(...Array.from(doc.body.childNodes));
    html = wrapper.outerHTML;
  }

  const extracted = extractFonts(css, fontLinks);
  return { kind: "document", html, css: scopeCss(extracted.css), fonts: extracted.fonts };
}

const FONT_FACE = /@font-face\s*\{[^}]*\}/g;
const IMPORT = /@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?[^;]*;/g;

// @font-face is ignored inside shadow roots, so font declarations move to
// the frame's fonts, which the app injects at document level.
export function extractFonts(css: string, links: string[] = []) {
  const imports = [...links];
  const faces: string[] = [];
  const rest = css
    .replace(IMPORT, (rule, href: string) => {
      if (!isFontStylesheet(href)) return rule;
      imports.push(href);
      return "";
    })
    .replace(FONT_FACE, (face) => {
      faces.push(face);
      return "";
    });
  const fonts = [...imports.map((href) => `@import url("${href}");`), ...faces].join("\n");
  return { css: rest, fonts };
}

// Decides whether an external stylesheet is moved out of the frame into the
// app document. Moved sheets apply to the whole app, so only sheets that
// carry nothing but @font-face are safe to move.
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.bunny.net", "use.typekit.net", "api.fontshare.com"];

export function isFontStylesheet(href: string): boolean {
  try {
    return FONT_HOSTS.includes(new URL(href).hostname);
  } catch {
    return false;
  }
}

// The artboard is the document: html/body/:root selectors become :host and
// viewport units become container units so the snippet lays out against
// the artboard instead of the app window. Width media queries become
// queries on the frame container for the same reason. rem resolves against
// the app's root font size, never the frame's, so it is fixed at the
// browser default of 16px.
export function scopeCss(css: string) {
  return css
    .replace(/@media([^{;]+)\{/g, (rule, prelude: string) => {
      const query = frameQuery(prelude);
      return query ? `@container frame ${query} {` : rule;
    })
    .replace(/(^|[\s,}])(?:html|body|:root)(?![\w-])/g, "$1:host")
    .replace(/:host\s+:host/g, ":host")
    .replace(/(\d)vw\b/g, "$1cqw")
    .replace(/(\d)vh\b/g, "$1cqh")
    .replace(/(^|[^\w.])(\d*\.?\d+)rem\b/g, (_match, before: string, value: string) => `${before}${parseFloat(value) * 16}px`);
}

// Returns the width condition of a media query that can run as a container
// query, or null when it depends on anything other than viewport width.
function frameQuery(prelude: string) {
  const query = prelude.trim().replace(/^(?:only\s+)?(?:screen|all)\s+and\s+/i, "");
  if (query.includes(",")) return null;
  const parts = query.split(/\s+and\s+/i);
  const widthOnly = parts.every((part) => /^\([^()]*\bwidth\b[^()]*\)$/i.test(part) && !/device-width/i.test(part));
  return widthOnly ? parts.join(" and ") : null;
}
