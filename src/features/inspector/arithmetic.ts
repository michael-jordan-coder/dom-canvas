// Plain numeric arithmetic only. CSS functions/units stay with the CSS validator.
export function numericExpression(source: string): { value: number } | { error: true } | null {
  const text = source.trim();
  if (/^-?\d*\.?\d+$/.test(text) || !/^[\d.\s()+*/-]+$/.test(text)) return null;
  if (!/[+*/()-]/.test(text)) return null;
  if (text.length > 256) return { error: true };
  const tokens = text.match(/\d*\.?\d+|[()+*/-]|\S/g) ?? [];
  let index = 0;
  const primary = (): number => {
    const token = tokens[index++];
    if (token === "+") return primary();
    if (token === "-") return -primary();
    if (token === "(") {
      const value = sum();
      if (tokens[index++] !== ")") throw new Error("Missing closing parenthesis");
      return value;
    }
    if (!token || !/^\d*\.?\d+$/.test(token)) throw new Error("Expected number");
    return Number(token);
  };
  const product = (): number => {
    let value = primary();
    while (tokens[index] === "*" || tokens[index] === "/") {
      const operator = tokens[index++];
      const right = primary();
      if (operator === "/" && right === 0) throw new Error("Division by zero");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  };
  const sum = (): number => {
    let value = product();
    while (tokens[index] === "+" || tokens[index] === "-") {
      const operator = tokens[index++];
      const right = product();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };
  try {
    const value = sum();
    return index === tokens.length && Number.isFinite(value) ? { value: Number(value.toPrecision(12)) } : { error: true };
  } catch { return { error: true }; }
}
