import type { ReactNode } from "react";
import { FrameIcon, HandIcon, MoveIcon, RectIcon, TextIcon } from "@/design-system/icons";
import type { Tool } from "./types";

type Props = {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  children?: ReactNode;
};

const TOOLS: { id: Tool; label: string; shortcut: string; icon: ReactNode }[] = [
  { id: "move", label: "Move", shortcut: "V", icon: <MoveIcon /> },
  { id: "frame", label: "Frame", shortcut: "F", icon: <FrameIcon width={20} height={20} /> },
  { id: "rect", label: "Rectangle", shortcut: "R", icon: <RectIcon width={20} height={20} /> },
  { id: "text", label: "Text", shortcut: "T", icon: <TextIcon width={20} height={20} /> },
  { id: "hand", label: "Hand tool", shortcut: "H", icon: <HandIcon /> },
];

export function Toolbar({ tool, onToolChange, children }: Props) {
  return (
    <div className="toolbar" role="toolbar">
      {TOOLS.map(({ id, label, shortcut, icon }) => (
        <button
          key={id}
          className={`tool${tool === id ? " active" : ""}`}
          title={`${label} (${shortcut})`}
          aria-pressed={tool === id}
          onClick={() => onToolChange(id)}
        >
          {icon}
        </button>
      ))}
      {children && <span className="toolbar-divider" />}
      {children}
    </div>
  );
}
