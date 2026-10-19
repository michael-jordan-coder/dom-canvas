// JSX only looks like HTML; these markers say it has to run first.
export function looksLikeReact(text: string) {
  return /^\s*(?:import|export)\s/m.test(text) || /\bclassName=/.test(text) || /<>|<\/>/.test(text);
}
