export type Artboard = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  aspectRatio?: number;
  backgroundColor?: string;
  html: string;
  css: string;
  fonts?: string;
};

export type Camera = { x: number; y: number; z: number };

export type Tool = "move" | "frame" | "rect" | "text" | "hand";

export type Selection =
  | { kind: "none" }
  | { kind: "artboard"; artboardId: string }
  | { kind: "element"; artboardId: string; element: Element };
