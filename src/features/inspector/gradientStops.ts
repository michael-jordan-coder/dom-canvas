/** Resolve CSS single-percentage stops without guessing at length or double-position stops. */
export function percentageStops(positions: string[]): number[] | null {
  if (positions.length < 2) return null;
  const values: (number | null)[] = [];
  for (const position of positions) {
    if (!position) { values.push(null); continue; }
    if (!/^-?(?:\d+\.?\d*|\.\d+)%$/.test(position)) return null;
    const value = parseFloat(position);
    if (!Number.isFinite(value) || value < 0 || value > 100) return null;
    values.push(value);
  }
  values[0] ??= 0;
  values[values.length - 1] ??= 100;
  let previous = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] !== null) values[i] = previous = Math.max(previous, values[i]!);
  }
  let start = 0;
  for (let end = 1; end < values.length; end++) {
    if (values[end] === null) continue;
    const from = values[start]!, to = values[end]!;
    for (let i = start + 1; i < end; i++) values[i] = from + (to - from) * (i - start) / (end - start);
    start = end;
  }
  return values as number[];
}
