export type CodeEdit = { value: string; start: number; end: number };

export function indentCode(value: string, start: number, end: number, outdent = false): CodeEdit {
  if (!outdent && start === end) return { value: value.slice(0, start) + "  " + value.slice(end), start: start + 2, end: start + 2 };
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lastPosition = end > start && value[end - 1] === "\n" ? end - 1 : end;
  const nextBreak = value.indexOf("\n", lastPosition);
  const lineEnd = nextBreak < 0 ? value.length : nextBreak;
  let firstDelta = 0, totalDelta = 0;
  const lines = value.slice(lineStart, lineEnd).split("\n").map((line, index) => {
    const removed = outdent ? (line.match(/^(?:\t| {1,2})/)?.[0].length ?? 0) : 0;
    const delta = outdent ? -removed : 2;
    if (index === 0) firstDelta = delta;
    totalDelta += delta;
    return outdent ? line.slice(removed) : `  ${line}`;
  });
  return { value: value.slice(0, lineStart) + lines.join("\n") + value.slice(lineEnd), start: Math.max(lineStart, start + firstDelta), end: Math.max(lineStart, end + totalDelta) };
}

export function newlineCode(value: string, start: number, end: number): CodeEdit {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const before = value.slice(lineStart, start);
  const indentation = before.match(/^[\t ]*/)?.[0] ?? "";
  const opensBlock = before.trimEnd().endsWith("{");
  const nextIndent = indentation + (opensBlock ? "  " : "");
  const closesBlock = opensBlock && value.slice(end).startsWith("}");
  const insertion = `\n${nextIndent}${closesBlock ? `\n${indentation}` : ""}`;
  const caret = start + 1 + nextIndent.length;
  return { value: value.slice(0, start) + insertion + value.slice(end), start: caret, end: caret };
}
