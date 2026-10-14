const start = '/* dom-canvas:frame-style */';
const end = '/* /dom-canvas:frame-style */';
const ownedRule = /\/\* dom-canvas:frame-style \*\/\s*:host\s*\{([\s\S]*?)\}\s*\/\* \/dom-canvas:frame-style \*\//;

/** Frame appearance uses the existing stylesheet field, preserving version-1 files. */
export function readFrameStyle(css: string): CSSStyleDeclaration {
  const style = document.createElement('div').style;
  style.cssText = css.match(ownedRule)?.[1] ?? '';
  return style;
}
export function setFrameStyle(css: string, property: string, value: string) {
  const style = readFrameStyle(css);
  if (value) style.setProperty(property, value); else style.removeProperty(property);
  const base = css.replace(ownedRule, '').trimEnd();
  return style.length ? `${base}\n${start}\n:host { ${style.cssText} }\n${end}` : base;
}
