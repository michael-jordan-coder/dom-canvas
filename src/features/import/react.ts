import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "sucrase";
import { compile } from "tailwindcss";
import tailwindIndex from "tailwindcss/index.css?raw";
import tailwindPreflight from "tailwindcss/preflight.css?raw";
import tailwindTheme from "tailwindcss/theme.css?raw";
import tailwindUtilities from "tailwindcss/utilities.css?raw";
import { scopeCss } from "@/features/canvas/paste";

const TAILWIND_SHEETS: Record<string, string> = {
  tailwindcss: tailwindIndex,
  "./preflight.css": tailwindPreflight,
  "./theme.css": tailwindTheme,
  "./utilities.css": tailwindUtilities,
};

// Renders pasted React code once, to static HTML, with stubs for anything
// it imports besides React. Tailwind classes in the output get their CSS.
export async function renderReact(code: string) {
  const Component = evaluate(code);
  const html = renderOnce(Component);
  const { css, documentCss } = await tailwindFor(html);
  return { html, css: scopeCss(css), fonts: documentCss };
}

function evaluate(source: string): React.ComponentType<Record<string, unknown>> {
  // A bare JSX snippet has no component around it.
  const code = /^\s*</.test(source) ? `export default function Snippet() { return (<>${source}</>); }` : source;
  const { code: compiled } = transform(code, { transforms: ["jsx", "typescript", "imports"], jsxRuntime: "automatic", production: true });
  const module = { exports: {} as Record<string, unknown> };
  new Function("require", "module", "exports", compiled)(requireStub, module, module.exports);
  const exported = module.exports.default ?? Object.values(module.exports).find(value => typeof value === "function");
  if (typeof exported !== "function") throw new Error("No React component was exported from the pasted code.");
  return exported as React.ComponentType<Record<string, unknown>>;
}

// Components usually need props the paste does not include. Try the real
// defaults first; if that throws, every missing prop becomes an empty list,
// which maps, measures and renders as nothing.
function renderOnce(Component: React.ComponentType<Record<string, unknown>>) {
  try {
    return renderToStaticMarkup(React.createElement(Component));
  } catch {
    // createElement copies only own keys, so call the component directly.
    const props = new Proxy({}, { get: (_target, key) => key === "children" ? undefined : [] });
    const WithProps = () => (Component as (props: object) => React.ReactNode)(props);
    return renderToStaticMarkup(React.createElement(WithProps));
  }
}

function requireStub(path: string) {
  if (path === "react") return React;
  if (path === "react/jsx-runtime") return jsxRuntime;
  const icons = /icon|lucide|heroicons/i.test(path);
  return new Proxy({}, {
    get: (_target, name) => name === "__esModule" ? true : stubComponent(String(name), icons),
  });
}

// Imported components cannot be resolved from a paste, so they render as the
// closest plain element and keep their className and children.
function stubComponent(name: string, icon: boolean) {
  return function Stub({ children, className }: { children?: React.ReactNode; className?: string }) {
    if (icon) return React.createElement("span", { className, "data-stub": name, style: { display: "inline-block", width: "1em", height: "1em", borderRadius: 4, background: "currentColor", opacity: 0.4 } });
    const tag = /button/i.test(name) ? "button" : /input/i.test(name) ? "input" : "div";
    return React.createElement(tag, { className, "data-stub": name }, tag === "input" ? undefined : children ?? name);
  };
}

async function tailwindFor(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const candidates = new Set<string>();
  doc.querySelectorAll("[class]").forEach(element => element.classList.forEach(name => candidates.add(name)));
  const compiler = await compile('@import "tailwindcss";', {
    loadStylesheet: async (id: string) => ({ path: id, base: "/", content: TAILWIND_SHEETS[id] ?? "" }),
  });
  const css = compiler.build([...candidates]);
  // @property is ignored inside a shadow root; registrations are document-wide
  // anyway, so they go to the document with the frame's fonts.
  const properties: string[] = [];
  const rest = css.replace(/@property\s+--[\w-]+\s*\{[^}]*\}/g, rule => { properties.push(rule); return ""; });
  return { css: rest, documentCss: properties.join("\n") };
}
