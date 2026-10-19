export type TokenKind = "tag" | "attr" | "string" | "punct" | "comment" | "selector" | "property" | "value" | "at";
export type Token = { text: string; kind?: TokenKind };

// Tokenizes the code view's own output: HTML with one tag per line and, in
// <style>, CSS with one selector or declaration per line. It is not a
// general parser; anything unexpected falls through as plain text.
export function highlight(code: string): Token[] {
  const out: Token[] = [];
  let inStyle = false;
  code.split("\n").forEach((line, index) => {
    if (index) out.push({ text: "\n" });
    const trimmed = line.trim();
    if (inStyle && trimmed !== "</style>") cssLine(line, out);
    else htmlLine(line, out);
    if (trimmed === "<style>") inStyle = true;
    if (trimmed === "</style>") inStyle = false;
  });
  return out;
}

const TAG = /<!--[\s\S]*?(?:-->|$)|<\/?[!\w:-][^>]*>?/g;
const TAG_PART = /(\s+)|([^\s=/>]+)(?:(=)("[^"]*"|'[^']*'|[^\s>]+))?|(\/?>)/g;

function htmlLine(line: string, out: Token[]) {
  let last = 0;
  for (const match of line.matchAll(TAG)) {
    if (match.index > last) out.push({ text: line.slice(last, match.index) });
    const tag = match[0];
    if (tag.startsWith("<!--")) out.push({ text: tag, kind: "comment" });
    else {
      const head = /^(<\/?)([!\w:-]+)/.exec(tag)!;
      out.push({ text: head[1], kind: "punct" }, { text: head[2], kind: "tag" });
      for (const part of tag.slice(head[0].length).matchAll(TAG_PART)) {
        if (part[1]) out.push({ text: part[1] });
        else if (part[5]) out.push({ text: part[5], kind: "punct" });
        else {
          out.push({ text: part[2], kind: "attr" });
          if (part[3]) out.push({ text: part[3], kind: "punct" }, { text: part[4], kind: "string" });
        }
      }
    }
    last = match.index + tag.length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
}

function cssLine(line: string, out: Token[]) {
  const indent = /^\s*/.exec(line)![0];
  const text = line.slice(indent.length);
  if (indent) out.push({ text: indent });
  if (!text) return;
  if (text.startsWith("/*")) {
    out.push({ text, kind: "comment" });
  } else if (text === "}") {
    out.push({ text, kind: "punct" });
  } else if (text.endsWith("{")) {
    const head = text.slice(0, -1).trimEnd();
    const at = /^@[\w-]+/.exec(head);
    if (at) out.push({ text: at[0], kind: "at" }, { text: head.slice(at[0].length), kind: "value" });
    else out.push({ text: head, kind: "selector" });
    out.push({ text: text.slice(head.length, -1) }, { text: "{", kind: "punct" });
  } else {
    const declaration = /^((?:--)?[\w-]+)(\s*:\s*)(.*?)(;?)$/.exec(text);
    if (declaration) {
      out.push({ text: declaration[1], kind: "property" }, { text: declaration[2], kind: "punct" });
      valueTokens(declaration[3], out);
      if (declaration[4]) out.push({ text: ";", kind: "punct" });
    } else {
      out.push({ text });
    }
  }
}

function valueTokens(value: string, out: Token[]) {
  let last = 0;
  for (const match of value.matchAll(/"[^"]*"|'[^']*'/g)) {
    if (match.index > last) out.push({ text: value.slice(last, match.index), kind: "value" });
    out.push({ text: match[0], kind: "string" });
    last = match.index + match[0].length;
  }
  if (last < value.length) out.push({ text: value.slice(last), kind: "value" });
}
