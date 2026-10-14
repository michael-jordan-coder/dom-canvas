export function frameGeometry(element: Element) {
  const root = element.getRootNode();
  const host = root instanceof ShadowRoot ? (root.host as HTMLElement) : null;
  const rect = element.getBoundingClientRect();
  if (!host) return { x: 0, y: 0, width: rect.width, height: rect.height, zoom: 1, frameWidth: 0, frameHeight: 0, hasFrame: false };
  const parent = host.getBoundingClientRect();
  const zoom = parent.width / host.offsetWidth || 1;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { zoom, frameWidth: parent.width / zoom, frameHeight: parent.height / zoom, hasFrame: true, x: round((rect.left - parent.left) / zoom), y: round((rect.top - parent.top) / zoom), width: round(rect.width / zoom), height: round(rect.height / zoom) };
}
