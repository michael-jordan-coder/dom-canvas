import type { Artboard, Camera } from "../canvas/types";

export type ProjectFile = { format: "dom-canvas"; version: 1; name?: string; artboards: Artboard[]; camera: Camera };
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const positive = (v: unknown): v is number => finite(v) && v > 0;

export function encodeProject(artboards: Artboard[], camera: Camera, name = "Untitled") {
  return JSON.stringify({ format: "dom-canvas", version: 1, name: documentName(name), artboards, camera } satisfies ProjectFile, null, 2);
}

export function isProjectClipboard(source: string) {
  return source.trimStart().startsWith("{") && /"format"\s*:\s*"dom-canvas"/.test(source);
}

export function decodeProject(source: string): ProjectFile {
  let data;
  try { data = JSON.parse(source); } catch { throw new Error("This file is not valid JSON."); }
  if (!data || data.format !== "dom-canvas" || data.version !== 1 || !Array.isArray(data.artboards)) throw new Error("Choose a supported DOM Canvas file (version 1).");
  if (data.name !== undefined && typeof data.name !== "string") throw new Error("The file contains an invalid document name.");
  const artboards: Artboard[] = data.artboards.map((ab: Record<string, unknown>, index: number) => {
    if (!ab || typeof ab.id !== "string" || typeof ab.name !== "string" || typeof ab.html !== "string" || typeof ab.css !== "string" || !finite(ab.x) || !finite(ab.y) || !positive(ab.width) || (ab.height !== undefined && !positive(ab.height)) || (ab.aspectRatio !== undefined && !positive(ab.aspectRatio)) || (ab.fonts !== undefined && typeof ab.fonts !== "string") || (ab.backgroundColor !== undefined && typeof ab.backgroundColor !== "string") || (ab.clipContent !== undefined && typeof ab.clipContent !== "boolean")) throw new Error(`Frame ${index + 1} has invalid content or dimensions.`);
    return { id: ab.id, name: ab.name, html: ab.html, css: ab.css, x: ab.x, y: ab.y, width: ab.width, ...(ab.height === undefined ? {} : { height: ab.height as number }), ...(ab.aspectRatio === undefined ? {} : { aspectRatio: ab.aspectRatio as number }), ...(ab.fonts === undefined ? {} : { fonts: ab.fonts as string }), ...(ab.backgroundColor === undefined ? {} : { backgroundColor: ab.backgroundColor as string }), ...(ab.clipContent === undefined ? {} : { clipContent: ab.clipContent as boolean }) };
  });
  const camera = data.camera;
  if (!camera || !finite(camera.x) || !finite(camera.y) || !positive(camera.z) || camera.z < .02 || camera.z > 8) throw new Error("The file contains an invalid canvas view.");
  return { format: "dom-canvas", version: 1, name: documentName(data.name ?? "Untitled"), artboards, camera: { x: camera.x, y: camera.y, z: camera.z } };
}

/** Imported project markup is editable content, not executable behavior. */
import { makeInert } from "./inert.ts";

export function inertProjectHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const clean = (root: DocumentFragment) => {
    root.querySelectorAll("noscript, iframe, object, embed, base, meta").forEach(el => el.remove());
    for (const element of Array.from(root.querySelectorAll("*"))) {
      element.removeAttribute("srcdoc");
      if (element instanceof HTMLTemplateElement) clean(element.content);
    }
    // Scripts and handlers stay for Play, but cannot run on the canvas.
    makeInert(root);
  };
  clean(template.content);
  return template.innerHTML;
}

export function documentName(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 120).trim() || "Untitled";
}

export function projectFilename(name: string) {
  const safe = documentName(name).replace(/[<>:"/\\|?*]/g, "-").replace(/[. ]+$/g, "").replace(/^\.+/, "") || "Untitled";
  return `${safe}.domcanvas.json`;
}
