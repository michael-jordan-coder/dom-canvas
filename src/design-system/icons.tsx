import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  "aria-hidden": true,
  ...props,
});

export const FrameIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M5.5 2.5v11M10.5 2.5v11M2.5 5.5h11M2.5 10.5h11" /></svg>
);

export const RectIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3.5" y="3.5" width="9" height="9" rx="0.5" /></svg>
);

export const TextIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3.5 4.5v-1h9v1M8 3.5v9M6.5 12.5h3" /></svg>
);

export const ImageIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="3.5" width="11" height="9" rx="1" />
    <circle cx="6" cy="6.5" r="1" />
    <path d="M2.5 11l3.5-3 3 2.5 2-1.5 2.5 2" />
  </svg>
);

export const VectorIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 12.5c2-6 4-8 10-9.5" /><circle cx="3" cy="12.5" r="1" fill="currentColor" /><circle cx="13" cy="3" r="1" fill="currentColor" /></svg>
);

export const ChevronIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M6.5 5l3 3-3 3" /></svg>
);

export const MoveIcon = (p: IconProps) => (
  <svg {...base({ ...p, viewBox: "0 0 24 24", width: 24, height: 24 })}>
    <path d="M7 5.5v12.2l3.4-3.2 2.3 5 2-.9-2.3-5 4.6-.4z" fill="currentColor" stroke="none" />
  </svg>
);

export const HandIcon = (p: IconProps) => (
  <svg {...base({ ...p, viewBox: "0 0 24 24", width: 24, height: 24 })}>
    <path d="M8.5 12.5V6.8a1.2 1.2 0 0 1 2.4 0v4.7M10.9 11.5V5.7a1.2 1.2 0 0 1 2.4 0v5.8M13.3 11.5V6.7a1.2 1.2 0 0 1 2.4 0v5.8M15.7 12.5V9a1.2 1.2 0 0 1 2.4 0v4.5c0 3.3-2.4 5.9-5.6 5.9-2.2 0-3.6-1-4.8-2.8l-2.1-3.2a1.2 1.2 0 0 1 2-1.3l.9 1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LinkIcon = (p: IconProps) => (
  <svg {...base({ ...p, viewBox: "0 0 24 24", width: 24, height: 24 })}>
    <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1M13.5 10.5a3.5 3.5 0 0 0-5 0L6 13a3.5 3.5 0 0 0 5 5l1-1" strokeLinecap="round" />
  </svg>
);

export const CodeIcon = (p: IconProps) => (
  <svg {...base({ ...p, viewBox: "0 0 24 24", width: 24, height: 24 })}>
    <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
