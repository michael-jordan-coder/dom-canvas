const paths = {
  flowHorizontal: "M2 8h12M10 4l4 4-4 4",
  flowVertical: "M8 2v12M4 10l4 4 4-4",
  ratio: 'm6 10 4-4M5 7l-1 1a2.8 2.8 0 0 0 4 4l1-1M7 5l1-1a2.8 2.8 0 0 1 4 4l-1 1',
  corners: 'M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4',
  padding: 'M2 2h12v12H2zM5 5h6v6H5z',
  horizontal: 'M2 3v10M14 3v10M5 8h6M6 6 4 8l2 2M10 6l2 2-2 2',
  vertical: 'M3 2h10M3 14h10M8 5v6M6 6l2-2 2 2M6 10l2 2 2-2',
  opacity: 'M8 2a6 6 0 1 0 0 12V2Zm0 0a6 6 0 0 1 0 12M8 4h3M8 6h5M8 8h5M8 10h5M8 12h3',
  radius: 'M3 13V7a4 4 0 0 1 4-4h6',
  lineHeight: 'M2 3h12M2 13h12M8 4v8M6 6l2-2 2 2M6 10l2 2 2-2',
  tracking: 'M2 3v10M14 3v10M5 11l3-7 3 7M6 9h4',
  start: 'M2 3h12M2 6h8M2 9h12M2 12h8',
  center: 'M2 3h12M4 6h8M2 9h12M4 12h8',
  end: 'M2 3h12M6 6h8M2 9h12M6 12h8',
  justify: 'M2 3h12M2 6h12M2 9h12M2 12h12',
} as const;
export function InspectorIcon({ name }: { name: keyof typeof paths }) {
  return <svg className="property-icon" viewBox="0 0 16 16" aria-hidden="true"><path d={paths[name]} /></svg>;
}
