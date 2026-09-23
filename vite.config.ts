import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

const FONT_URL = /\.(woff2?|ttf|otf|eot)(\?|#|$)/i;

// Rewritten links must be absolute: the injected <base> would otherwise
// resolve a relative /__proxy path against the original site.
const proxied = (url: string, origin: string) => `${origin}/__proxy?url=${encodeURIComponent(url)}`;

function absolute(ref: string, base: string) {
  try {
    return new URL(ref.trim(), base).href;
  } catch {
    return ref;
  }
}

// Fonts must be same-origin to load without CORS, and imported sheets must be
// readable so the client can lift their @font-face rules. Everything else can
// keep pointing at the original host.
function rewriteCss(css: string, base: string, origin: string) {
  return css
    .replace(/@import\s+(?:url\()?\s*(['"]?)([^'")\s;]+)\1\s*\)?/g, (_m, _q, ref) => `@import url("${proxied(absolute(ref, base), origin)}")`)
    .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, _q, ref: string) => {
      if (/^(data:|#|blob:)/.test(ref)) return m;
      const abs = absolute(ref, base);
      return `url("${FONT_URL.test(abs) ? proxied(abs, origin) : abs}")`;
    });
}

function rewriteHtml(html: string, base: string, origin: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/?>/gi, "")
    .replace(/<meta\b[^>]*http-equiv=["']?content-security-policy["']?[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, (tag) => {
      if (!/rel=["']?[^"'>]*stylesheet/i.test(tag)) return tag;
      return tag.replace(/href=(["']?)([^"'\s>]+)\1/i, (_m, _q, href) => `href="${proxied(absolute(href, base), origin)}"`);
    })
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (tag, css) => tag.replace(css, rewriteCss(css, base, origin)))
    .replace(/<head\b[^>]*>/i, (tag) => `${tag}<base href="${base}">`);
}

async function handleProxy(req: IncomingMessage, res: ServerResponse) {
  const target = new URL(req.url ?? "", "http://localhost").searchParams.get("url");
  if (!target || !/^https?:\/\//.test(target)) {
    res.statusCode = 400;
    res.end("Missing or invalid url");
    return;
  }

  try {
    const upstream = await fetch(target, {
      headers: { "user-agent": BROWSER_UA, accept: req.headers.accept ?? "*/*", "accept-language": "en-US,en;q=0.9" },
      redirect: "follow",
    });
    const type = upstream.headers.get("content-type") ?? "application/octet-stream";
    const base = upstream.url || target;
    const origin = `http://${req.headers.host ?? "localhost:5180"}`;

    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-type", type);
    res.statusCode = upstream.status;

    if (type.includes("text/html")) {
      res.end(rewriteHtml(await upstream.text(), base, origin));
    } else if (type.includes("text/css")) {
      res.end(rewriteCss(await upstream.text(), base, origin));
    } else {
      res.end(Buffer.from(await upstream.arrayBuffer()));
    }
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "text/html");
    res.end(`<html data-proxy-error="${String(error).replace(/"/g, "'")}"></html>`);
  }
}

function siteProxy(): Plugin {
  return {
    name: "site-proxy",
    configureServer(server) {
      server.middlewares.use("/__proxy", (req, res) => void handleProxy(req, res));
    },
  };
}

export default defineConfig({
  plugins: [react(), siteProxy()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5180 },
});
