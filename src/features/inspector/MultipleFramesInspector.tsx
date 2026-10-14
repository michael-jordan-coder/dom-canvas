import { readFrameStyle, setFrameStyle } from "./frameStyle";
import { ShadowEditor } from "./ShadowEditor";
import { propertyState } from "./propertyState";
import { SizeModeMenu } from "./SizeModeMenu";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Artboard } from "@/features/canvas/types";
import { ColorField, Field, Row, Section, SelectField } from "./InspectorControls";

export type FramePatch = { id: string; patch: Partial<Artboard> };
const common = (values: string[]) => { const state = propertyState(values.map(computed => ({ authored: "", computed }))); return state.mixed ? null : state.value; };

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
  });
  const colors = frames.map(frame => resolved[frame.id]?.color ?? frame.backgroundColor ?? "transparent");
  const color = common(colors);
  const clips = frames.map(frame => frame.clipContent ?? resolved[frame.id]?.clip ?? true);
  const mixedClip = clips.some(value => value !== clips[0]);
  useEffect(() => { if (clipInput.current) clipInput.current.indeterminate = mixedClip; }, [mixedClip]);
  if (!frames.length) return null;
  const update = (patch: Partial<Artboard>) => onUpdate(frames.map(frame => ({ id: frame.id, patch })));
  const styleState = (property: string) => propertyState(frames.map(frame => ({ authored: readFrameStyle(frame.css).getPropertyValue(property), computed: hosts.get(frame.id) ? getComputedStyle(hosts.get(frame.id)!).getPropertyValue(property) : property === "opacity" ? "1" : property === "border-radius" ? "0px" : "none" })));
  const setStyle = (property: string, value: string) => { if (!CSS.supports(property, value)) return false; onUpdate(frames.map(frame => ({ id: frame.id, patch: { css: setFrameStyle(frame.css, property, value) } }))); return true; };
  const resetStyle = (properties: string[]) => properties.some(property => styleState(property).canReset) ? () => onUpdate(frames.map(frame => ({ id: frame.id, patch: { css: properties.reduce((css, property) => setFrameStyle(css, property, ""), frame.css) } }))) : undefined;
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
    <Section title="Position"><Row>{(["x", "y"] as const).map(axis => <Field key={axis} label={`Frame ${axis.toUpperCase()}`} prefix={axis.toUpperCase()} value={common(frames.map(frame => String(frame[axis]))) ?? "Mixed"} onCommit={value => { const n = Number(value); if (!value.trim() || !Number.isFinite(n)) return false; update({ [axis]: n }); return true; }} />)}</Row></Section>
    <Section title="Layout">
      <Row><Field label="Frame width" prefix="W" value={common(frames.map(frame => String(frame.width))) ?? "Mixed"} onCommit={value => size("width", value)} /><Field label="Frame height" prefix="H" value={common(frames.map(frame => String(height(frame)))) ?? "Mixed"} onCommit={value => size("height", value)} /></Row>
      <div className="property-subheading"><span>Height sizing</span><SizeModeMenu label="Height" value={(common(frames.map(frame => frame.height === undefined ? "hug" : "fixed")) ?? "mixed") as "hug" | "fixed" | "mixed"} modes={["hug", "fixed"]} onChange={mode => onUpdate(frames.map(frame => ({ id: frame.id, patch: mode === "hug" ? { height: undefined, aspectRatio: undefined } : { height: height(frame) } })))} /></div>
      <label className="property-checkbox"><input ref={clipInput} type="checkbox" aria-label="Clip frame content" aria-checked={mixedClip ? "mixed" : clips[0]} checked={!mixedClip && clips[0]} onChange={event => update({ clipContent: event.target.checked })} />Clip content</label>
    </Section>
    <Section title="Appearance" onReset={resetStyle(["opacity", "border-radius"])}>
      <Row><Field label="Frame opacity" state={styleState("opacity")} prefix="◒" suffix="%" value={String(Math.round(Number(styleState("opacity").computed || styleState("opacity").value) * 100))} onCommit={value => { const n = Number(value); if (!value.trim() || !Number.isFinite(n)) return false; const clamped = Math.min(100, Math.max(0, n)); return setStyle("opacity", String(clamped / 100)) === false ? false : String(clamped); }} onReset={resetStyle(["opacity"])} /><Field label="Frame corner radius" state={styleState("border-radius")} prefix="R" value={styleState("border-radius").value.replace(/px/g, "")} onCommit={value => setStyle("border-radius", /^\d*\.?\d+$/.test(value) ? `${value}px` : value)} onReset={resetStyle(["border-radius"])} /></Row>
    </Section>
    <Section title="Fill" onReset={frames.some(frame => frame.backgroundColor !== undefined) ? () => update({ backgroundColor: undefined }) : undefined}>
      <ColorField label="Frame fill" value={color ?? colors[0]} mixed={color === null} onCommit={value => { if (!CSS.supports("background-color", value)) return false; update({ backgroundColor: value }); return true; }} onReset={frames.some(frame => frame.backgroundColor !== undefined) ? () => update({ backgroundColor: undefined }) : undefined} />
    </Section>
    <Section title="Stroke" defaultOpen={false} onReset={resetStyle(["border", "border-width", "border-style", "border-color"])}>
      <Row><Field label="Frame stroke width" state={styleState("border-width")} prefix="W" value={styleState("border-width").value.replace(/px/g, "")} onCommit={value => {
        const width = /^\d*\.?\d+$/.test(value) ? `${value}px` : value;
        if (!CSS.supports("border-width", width)) return false;
        onUpdate(frames.map(frame => { let css = setFrameStyle(frame.css, "border-width", width); const host = hosts.get(frame.id); if (host && getComputedStyle(host).borderTopStyle === "none") css = setFrameStyle(css, "border-style", "solid"); return { id: frame.id, patch: { css } }; })); return true;
      }} /><SelectField label="Frame stroke style" value={styleState("border-style").mixed ? "Mixed" : styleState("border-style").value} options={["none", "solid", "dashed", "dotted", "double"]} onCommit={value => setStyle("border-style", value)} /></Row>
      <ColorField label="Frame stroke color" state={styleState("border-color")} value={styleState("border-color").computed || "#000000"} onCommit={value => setStyle("border-color", value)} />
    </Section>
    <Section title="Effects" defaultOpen={false} onReset={resetStyle(["box-shadow"])}>
      {styleState("box-shadow").mixed ? <Field label="Box shadow" state={styleState("box-shadow")} value="" onCommit={value => setStyle("box-shadow", value)} /> : <ShadowEditor value={styleState("box-shadow").value} computedValue={styleState("box-shadow").computed} onCommit={value => setStyle("box-shadow", value)} />}
    </Section>
    <p className="inspector-footnote">Changes apply to every selected frame. Size edits respect each frame’s aspect-ratio lock. Mixed means values differ.</p>
  </>;
}
