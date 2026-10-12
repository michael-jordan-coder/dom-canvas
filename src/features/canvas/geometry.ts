import type { Camera } from "./types";

export type Rect = { left: number; top: number; width: number; height: number };
export type Point = { x: number; y: number };
export type Bounds = { x: number; y: number; width: number; height: number };

export function elementRectInCanvas(
  element: Element,
  canvas: HTMLElement,
): Rect {
  const r = element.getBoundingClientRect();
  const c = canvas.getBoundingClientRect();
  return { left: r.left - c.left, top: r.top - c.top, width: r.width, height: r.height };
}

export function parseTranslate(value: string): { x: number; y: number } {
  if (!value || value === "none") return { x: 0, y: 0 };
  const [x = "0", y = "0"] = value.split(/\s+/);
  return { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
}

export function zoomAround(
  camera: Camera,
  pointX: number,
  pointY: number,
  factor: number,
): Camera {
  const z = clampZoom(camera.z * factor);
  const scale = z / camera.z;
  return {
    z,
    x: pointX - (pointX - camera.x) * scale,
    y: pointY - (pointY - camera.y) * scale,
  };
}

export function clampZoom(z: number) {
  return Math.min(8, Math.max(0.02, z));
}

export function fitCamera(bounds: Bounds, viewport: Rect): Camera {
  const z = clampZoom(Math.min(viewport.width / bounds.width, viewport.height / bounds.height) * 0.9);
  return {
    z,
    x: viewport.left + (viewport.width - bounds.width * z) / 2 - bounds.x * z,
    y: viewport.top + (viewport.height - bounds.height * z) / 2 - bounds.y * z,
  };
}

export function unionBounds(list: Bounds[]): Bounds | null {
  if (list.length === 0) return null;
  const x = Math.min(...list.map((b) => b.x));
  const y = Math.min(...list.map((b) => b.y));
  const right = Math.max(...list.map((b) => b.x + b.width));
  const bottom = Math.max(...list.map((b) => b.y + b.height));
  return { x, y, width: right - x, height: bottom - y };
}

export function normalizeRect(a: Point, b: Point): Bounds {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) };
}
