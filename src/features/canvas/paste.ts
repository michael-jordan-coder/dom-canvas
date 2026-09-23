export type PastedCode =
  | { kind: "document"; html: string; css: string }
  | { kind: "stylesheet"; css: string };

const TAG_PATTERN = /<([a-z][a-z0-9-]*)[\s>\/]/i;

export function parseClipboard(
  plain: string,
  richHtml: string,
): PastedCode | null {
  const source = pickSource(plain, richHtml);
  if (!source) return null;
  if (source.kind === "stylesheet") return source;
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

  doc.querySelectorAll("script, noscript, meta, title, base").forEach((n) => n.remove());

  const css = Array.from(doc.querySelectorAll("style"))
    .map((style) => {
      style.remove();
      return style.textContent ?? "";
    })
    .join("\n");

  // Stylesheet links in <head> would be dropped with the head; keep them
  // in the body so they still apply inside the shadow root.
  doc.querySelectorAll('head link[rel="stylesheet"]').forEach((link) => {
    doc.body.prepend(link);
  });

  const bodyStyle = doc.body.getAttribute("style");
  const bodyClass = doc.body.getAttribute("class");
  let html = doc.body.innerHTML;
  if (bodyStyle || bodyClass) {
    const attrs = [
      bodyClass ? `class="${bodyClass}"` : "",
      bodyStyle ? `style="${bodyStyle}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    html = `<div ${attrs}>${html}</div>`;
  }

  return { kind: "document", html, css: scopeCss(css) };
}

// The artboard is the document: html/body/:root selectors become :host and
// viewport units become container units so the snippet lays out against
// the artboard instead of the app window.
export function scopeCss(css: string) {
  return css
    .replace(/(^|[\s,}])(?:html|body|:root)(?![\w-])/g, "$1:host")
    .replace(/:host\s+:host/g, ":host")
    .replace(/(\d)vw\b/g, "$1cqw")
    .replace(/(\d)vh\b/g, "$1cqh");
}
