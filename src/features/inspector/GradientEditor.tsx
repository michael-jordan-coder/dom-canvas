import { FloatingEditor } from "./FloatingEditor";
import { InspectorIcon } from "./InspectorIcon";
import { useState, type ReactNode } from "react";
import { ColorField, Field } from "./InspectorControls";
import { splitCss } from "./cssList";
import { percentageStops } from "./gradientStops";
import { GradientStopTrack } from "./GradientStopTrack";

type Stop = { color: string; position: string };
type Gradient = { angle: number; stops: Stop[] };

export function parseGradient(value: string): Gradient | null {
  const match = value.match(/^linear-gradient\((.*)\)$/s);
  if (!match) return null;
  const parts = splitCss(match[1], ",");
  let angle = 180;
  const direction = parts[0]?.toLowerCase();
  const units = direction?.match(/^(-?[\d.]+)(deg|turn|rad|grad)$/);
  if (units) {
    angle = Number(units[1]) * ({ deg: 1, turn: 360, rad: 180 / Math.PI, grad: 0.9 }[units[2]] ?? 1);
    parts.shift();
  } else if (direction?.startsWith("to ")) {
    const angles: Record<string, number> = { "to top": 0, "to top right": 45, "to right top": 45, "to right": 90, "to bottom right": 135, "to right bottom": 135, "to bottom": 180, "to bottom left": 225, "to left bottom": 225, "to left": 270, "to top left": 315, "to left top": 315 };
    if (!(direction in angles) || direction.split(" ").length > 2) return null;
    angle = angles[direction]; parts.shift();
  }
  const stops: Stop[] = [];
  for (const part of parts) {
    const tokens = splitCss(part, " ");
    const color = tokens.shift();
    if (!color || !CSS.supports("color", color) || tokens.length > 2) return null;
    stops.push({ color, position: tokens.join(" ") });
  }
  return stops.length >= 2 ? { angle, stops } : null;
}

function serialize({ angle, stops }: Gradient) {
  return `linear-gradient(${Math.round(angle * 100) / 100}deg, ${stops.map((stop) => `${stop.color}${stop.position ? ` ${stop.position}` : ""}`).join(", ")})`;
}

export function GradientEditor({ value, computedValue, onCommit, onLayersChange, renderLayerSettings }: { value: string; computedValue: string; onCommit: (value: string) => boolean; onLayersChange: (layers: string[], order: (number | null)[]) => boolean; renderLayerSettings: (index: number) => ReactNode }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [selectedStop, setSelectedStop] = useState(0);
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);
  const layers = value === "none" ? [] : splitCss(value, ",");
  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= layers.length) return;
    const order = layers.map((_, i) => i);
    [order[index], order[target]] = [order[target], order[index]];
    if (onLayersChange(order.map(i => layers[i]), order)) setExpandedLayer(current => current === index ? target : current === target ? index : current);
  };
  const computedLayers = splitCss(computedValue, ",");
  const duplicate = (index: number) => {
    const order = layers.map((_, i) => i);
    order.splice(index + 1, 0, index);
    if (onLayersChange(order.map(i => layers[i]), order)) {
      setExpandedLayer(index + 1);
      setSelectedStop(0);
    }
  };
  const update = (index: number, gradient: Gradient) => onCommit(layers.map((layer, i) => i === index ? serialize(gradient) : layer).join(", "));
  return <>
    {layers.map((layer, index) => {
      const gradient = parseGradient(layer);
      const resolved = computedLayers.length === layers.length ? parseGradient(computedLayers[index]) : null;
      const positions = gradient ? percentageStops(gradient.stops.map(stop => stop.position)) : null;
      return <div className="gradient-layer" key={index}>
        <div className="effect-heading"><span className="background-layer-label">{gradient ? "Linear gradient" : "Image / custom"} {layers.length > 1 ? index + 1 : ""}</span>
          <button className="inspector-icon" title="Duplicate background layer" aria-label={`Duplicate background layer ${index + 1}`} onClick={() => duplicate(index)}><InspectorIcon name="duplicate" /></button>
          {layers.length > 1 && <>
            <button className="inspector-icon" title="Move background up" aria-label={`Move background layer ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}><InspectorIcon name="moveUp" /></button>
            <button className="inspector-icon" title="Move background down" aria-label={`Move background layer ${index + 1} down`} disabled={index === layers.length - 1} onClick={() => move(index, 1)}><InspectorIcon name="moveDown" /></button>
          </>}
          <button className="inspector-icon" title="Remove background layer" aria-label={`Remove background layer ${index + 1}`} onClick={() => { if (onLayersChange(layers.filter((_, i) => i !== index), layers.map((_, i) => i).filter(i => i !== index))) setExpandedLayer(current => current === null || current === index ? null : current > index ? current - 1 : current); }}><InspectorIcon name="remove" /></button>
        </div>
        <button className="gradient-summary" aria-label={gradient ? `Edit gradient ${index + 1}` : `Edit background layer ${index + 1}`} aria-expanded={expandedLayer === index} onClick={event => { setAnchor(event.currentTarget); setExpandedLayer(expandedLayer === index ? null : index); setSelectedStop(0); }}><span className="gradient-summary-swatch" style={{ backgroundImage: layer }} /><span>{gradient ? `${gradient.stops.length} colors · ${Math.round(gradient.angle)}°` : "Image / custom CSS"}</span><span className="gradient-disclosure">{expandedLayer === index ? "⌃" : "⌄"}</span></button>
        {expandedLayer === index && anchor && <FloatingEditor title={`Background layer ${index + 1}`} anchor={anchor} onClose={() => setExpandedLayer(null)}>
        {gradient ? <>
          {positions ? <GradientStopTrack positions={positions} colors={gradient.stops.map((stop, i) => resolved?.stops[i]?.color ?? stop.color)} selected={Math.min(selectedStop, gradient.stops.length - 1)} label={`Gradient ${index + 1} selected stop position`} onChange={next => update(index, { ...gradient, stops: gradient.stops.map((stop, i) => ({ ...stop, position: `${next[i]}%` })) })} /> : <div className="gradient-preview" style={{ backgroundImage: layer }} />}
          <Field label={`Gradient ${index + 1} angle`} prefix="Angle" suffix="°" value={String(Math.round(gradient.angle * 100) / 100)} onCommit={(v) => v.trim() && Number.isFinite(Number(v)) ? update(index, { ...gradient, angle: Number(v) }) : false} />
          <div className="gradient-stop-selector" role="group" aria-label={`Gradient ${index + 1} color stops`}>
            {gradient.stops.map((stop, stopIndex) => <button key={stopIndex} aria-label={`Select gradient ${index + 1} stop ${stopIndex + 1}`} aria-pressed={stopIndex === Math.min(selectedStop, gradient.stops.length - 1)} title={`Stop ${stopIndex + 1} · ${stop.position || "Auto"}`} onClick={() => setSelectedStop(stopIndex)}><span style={{ background: resolved?.stops[stopIndex]?.color ?? stop.color }} /><small>{stopIndex + 1}</small></button>)}
          </div>
          {gradient.stops.map((stop, stopIndex) => stopIndex === Math.min(selectedStop, gradient.stops.length - 1) ? <div className="gradient-stop" key={stopIndex}>
            <ColorField label={`Gradient ${index + 1} stop ${stopIndex + 1} color`} value={resolved?.stops[stopIndex]?.color ?? stop.color} onCommit={(color) => update(index, { ...gradient, stops: gradient.stops.map((item, i) => i === stopIndex ? { ...item, color } : item) })} />
            <div className="gradient-stop-position"><Field label={`Gradient ${index + 1} stop ${stopIndex + 1} position`} prefix="Stop" value={stop.position || "Auto"} onCommit={(v) => update(index, { ...gradient, stops: gradient.stops.map((item, i) => i === stopIndex ? { ...item, position: /^auto$/i.test(v) ? "" : /^-?[\d.]+$/.test(v) ? `${v}%` : v } : item) })} /><button className="small-toggle" disabled={gradient.stops.length <= 2} aria-label={`Remove gradient ${index + 1} stop ${stopIndex + 1}`} onClick={() => { if (update(index, { ...gradient, stops: gradient.stops.filter((_, i) => i !== stopIndex) })) setSelectedStop(Math.min(stopIndex, gradient.stops.length - 2)); }}>Remove stop</button></div>
          </div> : null)}
          <button className="add-property" onClick={() => {
            const before = gradient.stops.at(-2)!;
            const last = gradient.stops.at(-1)!;
            const position = /^-?[\d.]+%$/.test(before.position) && /^-?[\d.]+%$/.test(last.position) ? `${(parseFloat(before.position) + parseFloat(last.position)) / 2}%` : "";
            if (update(index, { ...gradient, stops: [...gradient.stops.slice(0, -1), { color: "#FFFFFF", position }, last] })) setSelectedStop(gradient.stops.length - 1);
          }}>+ Add color stop</button>
        </> : null}
        <>
          {!gradient && <Field label={`Background layer ${index + 1} CSS`} value={layer} onCommit={next => splitCss(next, ",").length === 1 && onCommit(layers.map((item, i) => i === index ? next : item).join(", "))} />}
          <details className="layout-details" open={!gradient || undefined}>
            <summary>Size & position</summary>
            <div className="layout-details-body">{renderLayerSettings(index)}</div>
          </details>
        </>
        </FloatingEditor>}
      </div>;
    })}
    <div className="effect-actions"><button className="add-property" onClick={event => { setAnchor(event.currentTarget); if (onLayersChange(["linear-gradient(135deg, #6366F1 0%, #EC4899 100%)", ...layers], [null, ...layers.map((_, i) => i)])) { setExpandedLayer(0); setSelectedStop(0); } }}>+ Add gradient</button><button className="small-toggle" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}>CSS value</button></div>
    {advanced && <Field label="Background image or gradient" value={value} onCommit={onCommit} />}
  </>;
}
