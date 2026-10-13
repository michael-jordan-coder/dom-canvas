import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Artboard } from "@/features/canvas/types";
import { ColorField, Field, Row, Section, SelectField } from "./InspectorControls";

export type FramePatch = { id: string; patch: Partial<Artboard> };
const common = (values: string[]) => values.every(value => value === values[0]) ? values[0] : null;

export function MultipleFramesInspector({ frames, hosts, onUpdate }: {
  frames: Artboard[];
  hosts: Map<string, HTMLDivElement>;
  onUpdate: (patches: FramePatch[]) => void;
}) {
  const clipInput = useRef<HTMLInputElement>(null);
  const [resolved, setResolved] = useState<Record<string, { color: string; clip: boolean; height: number }>>({});
  useLayoutEffect(() => {
    const next = Object.fromEntries(frames.map(frame => {
      const host = hosts.get(frame.id);
      const style = host && getComputedStyle(host);
      return [frame.id, { color: style?.backgroundColor ?? frame.backgroundColor ?? "transparent", clip: style ? style.overflow !== "visible" : true, height: host?.offsetHeight ?? frame.height ?? 1 }];
    }));
    setResolved(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
  }, [frames, hosts]);
  const colors = frames.map(frame => resolved[frame.id]?.color ?? frame.backgroundColor ?? "transparent");
  const color = common(colors);
  const clips = frames.map(frame => frame.clipContent ?? resolved[frame.id]?.clip ?? true);
  const mixedClip = clips.some(value => value !== clips[0]);
  useEffect(() => { if (clipInput.current) clipInput.current.indeterminate = mixedClip; }, [mixedClip]);
  if (!frames.length) return null;
  const update = (patch: Partial<Artboard>) => onUpdate(frames.map(frame => ({ id: frame.id, patch })));
  const height = (frame: Artboard) => frame.height ?? resolved[frame.id]?.height ?? 1;
  const size = (axis: "width" | "height", value: string) => {
    if (!/^\d*\.?\d+$/.test(value.trim()) || !Number.isFinite(Number(value)) || Number(value) < 1) return false;
    const n = Number(value);
    onUpdate(frames.map(frame => ({ id: frame.id, patch: axis === "width"
      ? { width: n, ...(frame.aspectRatio ? { height: Math.max(1, Math.round(n / frame.aspectRatio)) } : {}) }
      : { height: n, ...(frame.aspectRatio ? { width: Math.max(1, Math.round(n * frame.aspectRatio)) } : {}) } })));
    return true;
  };
  return <>
    <div className="selection-summary"><strong>{frames.length} frames selected</strong><span>Frames</span></div>
    <Section title="Frame">
      <Row><Field label="Frame width" prefix="W" value={common(frames.map(frame => String(frame.width))) ?? "Mixed"} onCommit={value => size("width", value)} /><Field label="Frame height" prefix="H" value={common(frames.map(frame => String(height(frame)))) ?? "Mixed"} onCommit={value => size("height", value)} /></Row>
      <SelectField label="Height sizing" value={common(frames.map(frame => frame.height === undefined ? "hug" : "fixed")) ?? "Mixed"} options={[{ value: "hug", label: "Hug contents" }, { value: "fixed", label: "Fixed" }]} onCommit={value => {
        if (value !== "hug" && value !== "fixed") return false;
        onUpdate(frames.map(frame => ({ id: frame.id, patch: value === "hug" ? { height: undefined, aspectRatio: undefined } : { height: height(frame) } })));
      }} />
      <label className="property-checkbox"><input ref={clipInput} type="checkbox" aria-label="Clip frame content" aria-checked={mixedClip ? "mixed" : clips[0]} checked={!mixedClip && clips[0]} onChange={event => update({ clipContent: event.target.checked })} />Clip content</label>
    </Section>
    <Section title="Fill" onReset={frames.some(frame => frame.backgroundColor !== undefined) ? () => update({ backgroundColor: undefined }) : undefined}>
      <ColorField label="Frame fill" value={color ?? colors[0]} mixed={color === null} onCommit={value => { if (!CSS.supports("background-color", value)) return false; update({ backgroundColor: value }); return true; }} onReset={frames.some(frame => frame.backgroundColor !== undefined) ? () => update({ backgroundColor: undefined }) : undefined} />
    </Section>
    <p className="inspector-footnote">Changes apply to every selected frame. Size edits respect each frame’s aspect-ratio lock. Mixed means values differ.</p>
  </>;
}
