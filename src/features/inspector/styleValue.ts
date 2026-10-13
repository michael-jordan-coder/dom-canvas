// CSS-wide keywords describe the cascade, not a paint layer or a numeric value.
// Resolve them for controls without rewriting the original declaration.
export function inspectorStyleValue(authored: string, computed: string) {
  return !authored || /^(initial|inherit|unset|revert|revert-layer)$/i.test(authored.trim())
    ? computed
    : authored;
}
