export type RGBA = { hex: string; alpha: number };

export function parseColor(value: string): RGBA | null {
  if (value === "transparent") return { hex: "#000000", alpha: 0 };
  const hex = value.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i)?.[1];
  if (hex) {
    const expanded = hex.length < 5 ? [...hex].map((c) => c + c).join("") : hex;
    return { hex: `#${expanded.slice(0, 6)}`.toUpperCase(), alpha: expanded.length === 8 ? parseInt(expanded.slice(6), 16) / 255 : 1 };
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+%?)[,\s]+([\d.]+%?)[,\s]+([\d.]+%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (!rgb) return null;
  const channel = (n: string) => Math.max(0, Math.min(255, Math.round(parseFloat(n) * (n.endsWith("%") ? 2.55 : 1))));
  const alpha = rgb[4] ? parseFloat(rgb[4]) / (rgb[4].endsWith("%") ? 100 : 1) : 1;
  return { hex: `#${rgb.slice(1, 4).map((n) => channel(n).toString(16).padStart(2, "0")).join("")}`.toUpperCase(), alpha: Math.max(0, Math.min(1, alpha)) };
}

export function colorWithAlpha(hex: string, alpha: number) {
  const color = parseColor(hex);
  if (!color) return hex;
  return alpha >= 1 ? color.hex : `${color.hex}${Math.round(Math.max(0, alpha) * 255).toString(16).padStart(2, "0").toUpperCase()}`;
}
