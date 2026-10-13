import type { Artboard, Camera } from "../canvas/types";

export type ProjectFile = { format: "dom-canvas"; version: 1; artboards: Artboard[]; camera: Camera };
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const positive = (v: unknown): v is number => finite(v) && v > 0;

export function encodeProject(artboards: Artboard[], camera: Camera) {
  return JSON.stringify({ format: "dom-canvas", version: 1, artboards, camera } satisfies ProjectFile, null, 2);
}

export function isProjectClipboard(source: string) {
  return source.trimStart().startsWith("{") && /"format"\s*:\s*"dom-canvas"/.test(source);
}

export function decodeProject(source: string): ProjectFile {
  let data;
  try { data = JSON.parse(source); } catch { throw new Error("This file is not valid JSON."); }
  if (!data || data.format !== "dom-canvas" || data.version !== 1 || !Array.isArray(data.artboards)) throw new Error("Choose a supported DOM Canvas file (version 1).");
  const artboards: Artboard[] = data.artboards.map((ab: Record<string, unknown>, index: number) => {
    if (!ab || typeof ab.id !== "string" || typeof ab.name !== "string" || typeof ab.html !== "string" || typeof ab.css !== "string" || !finite(ab.x) || !finite(ab.y) || !positive(ab.width) || (ab.height !== undefined && !positive(ab.height)) || (ab.aspectRatio !== undefined && !positive(ab.aspectRatio)) || (ab.fonts !== undefined && typeof ab.fonts !== "string")) throw new Error(`Frame ${index + 1} has invalid content or dimensions.`);
    return { id: ab.id, name: ab.name, html: ab.html, css: ab.css, x: ab.x, y: ab.y, width: ab.width, ...(ab.height === undefined ? {} : { height: ab.height as number }), ...(ab.aspectRatio === undefined ? {} : { aspectRatio: ab.aspectRatio as number }), ...(ab.fonts === undefined ? {} : { fonts: ab.fonts as string }) };
  });
  const camera = data.camera;
  if (!camera || !finite(camera.x) || !finite(camera.y) || !positive(camera.z) || camera.z < .02 || camera.z > 8) throw new Error("The file contains an invalid canvas view.");
  return { format: "dom-canvas", version: 1, artboards, camera: { x: camera.x, y: camera.y, z: camera.z } };
}

/** Imported project markup is editable content, not executable behavior. */
export function inertProjectHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const clean = (root: DocumentFragment) => {
    root.querySelectorAll("script, noscript, iframe, object, embed, base, meta").forEach(el => el.remove());
    for (const element of Array.from(root.querySelectorAll("*"))) {
      for (const attribute of Array.from(element.attributes)) {
        if (/^on/i.test(attribute.name) || attribute.name === "srcdoc" || (/^(?:href|src|action|formaction|xlink:href)$/i.test(attribute.name) && /^(?:javascript|vbscript):/i.test(attribute.value.replace(/[\u0000-\u0020]/g, "")))) element.removeAttributeNode(attribute);
      }
      if (element instanceof HTMLTemplateElement) clean(element.content);
    }
  };
  clean(template.content);
  return template.innerHTML;
}
