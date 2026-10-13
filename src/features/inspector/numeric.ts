export function numericInput(source: string, unit: "px" | "%" = "px"): number | null {
  const text = source.trim();
  const pattern = unit === "px"
    ? /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(?:px)?$/i
    : /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(?:%)?$/i;
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Number(value.toFixed(2)) : null;
}
