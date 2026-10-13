const numberPattern = "[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?";
const numeric = new RegExp(`^${numberPattern}$`, "i");
const angle = new RegExp(`^(${numberPattern})(deg|grad|rad|turn)$`, "i");

/** Parses resolved individual CSS rotate values; expressions remain browser-owned. */
export function parseRotation(value: string): { axis: [number, number, number]; degrees: number } | null {
  const parts = value.trim().toLowerCase().split(/\s+/);
  if (parts[0] === "none" && parts.length === 1) return { axis: [0, 0, 1], degrees: 0 };
  const match = angle.exec(parts.at(-1) ?? "");
  if (!match) return null;
  const degrees = Number(match[1]) * ({ deg: 1, grad: .9, rad: 180 / Math.PI, turn: 360 }[match[2]] ?? 1);
  if (!Number.isFinite(degrees)) return null;
  if (parts.length === 1) return { axis: [0, 0, 1], degrees };
  if (parts.length === 2 && ["x", "y", "z"].includes(parts[0])) return { axis: parts[0] === "x" ? [1, 0, 0] : parts[0] === "y" ? [0, 1, 0] : [0, 0, 1], degrees };
  if (parts.length === 4 && parts.slice(0, 3).every(v => numeric.test(v) && Number.isFinite(Number(v)))) return { axis: parts.slice(0, 3).map(Number) as [number, number, number], degrees };
  return null;
}

export function rotationField(value: string) {
  const parsed = parseRotation(value);
  // Retain explicit axes and expressions so field edits cannot flatten 3D rotations.
  if (!parsed || (value.trim() !== "none" && value.trim().split(/\s+/).length !== 1)) return { value, suffix: undefined };
  return { value: String(Math.round(parsed.degrees * 1e6) / 1e6), suffix: "°" };
}

export function rotationInput(value: string) {
  const trimmed = value.trim();
  return numeric.test(trimmed) && Number.isFinite(Number(trimmed)) ? `${trimmed}deg` : trimmed;
}
