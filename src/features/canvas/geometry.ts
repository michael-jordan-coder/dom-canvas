import type { Camera } from "./types";

export type Rect = { left: number; top: number; width: number; height: number };

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
  const z = Math.min(8, Math.max(0.1, camera.z * factor));
  const scale = z / camera.z;
  return {
    z,
    x: pointX - (pointX - camera.x) * scale,
    y: pointY - (pointY - camera.y) * scale,
  };
}
