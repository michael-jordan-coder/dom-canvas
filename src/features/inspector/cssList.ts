/** Split CSS lists while preserving functions, quoted strings and escapes verbatim. */
export function splitCss(value: string, separator: "," | " ") {
  const parts: string[] = [];
  let depth = 0, start = 0;
  let quote: string | null = null;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === "\\") { i++; continue; }
    if (quote) { if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === "/" && value[i + 1] === "*") {
      const end = value.indexOf("*/", i + 2);
      i = end < 0 ? value.length : end + 1;
      continue;
    }
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (depth === 0 && (separator === " " ? /\s/.test(char) : char === separator)) {
      if (value.slice(start, i).trim()) parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (value.slice(start).trim()) parts.push(value.slice(start).trim());
  return parts;
}
