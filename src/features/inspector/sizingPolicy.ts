export type SizeMode = "css" | "fixed" | "hug" | "fill" | "custom";
export type SizingContext = { box: boolean; inline: boolean; parentLayout: "flex" | "grid" | null; parentDefinite: boolean };

export function availableSizeModes(context: SizingContext): SizeMode[] {
  const modes: SizeMode[] = ["css"];
  if (!context.box) return modes;
  modes.push("fixed", "hug");
  if (!context.inline && context.parentDefinite && context.parentLayout) modes.push("fill");
  return modes;
}

export function paddingPairValues(value: string): [string, string] | null {
  const parts = value.split(",").map(part => part.trim());
  return parts.length === 1 && parts[0] ? [parts[0], parts[0]]
    : parts.length === 2 && parts.every(Boolean) ? [parts[0], parts[1]] : null;
}
