/** Inspector numeric text metrics use pixels; percent tracking maps to CSS em. */
export function textMetricInput(property: "line-height" | "letter-spacing", value: string) {
  const input = value.trim();
  if (/^auto$/i.test(input)) return "normal";
  if (property === "letter-spacing" && /^-?\d*\.?\d+%$/.test(input)) return `${parseFloat(input) / 100}em`;
  return /^-?\d*\.?\d+$/.test(input) ? `${input}px` : input;
}
export function textMetricDisplay(property: "line-height" | "letter-spacing", authored: string, computed: string) {
  if (computed === "normal") return property === "line-height" ? "Auto" : "0%";
  if (property === "letter-spacing" && /^-?\d*\.?\d+em$/.test(authored)) return `${Math.round(parseFloat(authored) * 10000) / 100}%`;
  return computed.replace(/px$/, "");
}
