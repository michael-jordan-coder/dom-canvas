export type Artboard = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  aspectRatio?: number;
  backgroundColor?: string;
  clipContent?: boolean;
  html: string;
  css: string;
  fonts?: string;
};

export type Camera = { x: number; y: number; z: number };

export type Tool = "move" | "frame" | "rect" | "text" | "hand";

export type SelectionItem =
  | { kind: "artboard"; artboardId: string }
  | { kind: "element"; artboardId: string; element: Element };

export type Selection = { kind: "none" } | SelectionItem | { kind: "multiple"; items: SelectionItem[] };
