/** Parse resolved individual CSS scale without flattening its third axis. */
export function parseScale(value: string): [number, number, number] | null {
  if (value.trim() === "none") return [1, 1, 1];
  const parts = value.trim().split(/\s+/);
  if (parts.length < 1 || parts.length > 3) return null;
  const values = parts.map(part => {
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?%?$/i.test(part)) return NaN;
    return Number(part.replace(/%$/, "")) / (part.endsWith("%") ? 100 : 1);
  });
  if (!values.every(Number.isFinite)) return null;
  return [values[0], values[1] ?? values[0], values[2] ?? 1];
}

export function flippedScale(value: string, axis: 0 | 1): string | null {
  const scale = parseScale(value);
  if (!scale || scale[axis] === 0) return null;
  scale[axis] *= -1;
  return scale.join(" ");
}
