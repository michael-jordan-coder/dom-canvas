export type Artboard = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  html: string;
  css: string;
  fonts?: string;
};

export type Camera = { x: number; y: number; z: number };

export type Selection =
  | { kind: "none" }
  | { kind: "artboard"; artboardId: string }
  | { kind: "element"; artboardId: string; element: Element };
