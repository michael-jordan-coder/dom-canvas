import { useState } from "react";
import { ColorField, Field } from "./InspectorControls";
import { splitCss } from "./cssList";

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

export function GradientEditor({ value, computedValue, onCommit }: { value: string; computedValue: string; onCommit: (value: string) => boolean }) {
  const [advanced, setAdvanced] = useState(false);
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);
  const layers = value === "none" ? [] : splitCss(value, ",");
  const computedLayers = splitCss(computedValue, ",");
  const update = (index: number, gradient: Gradient) => onCommit(layers.map((layer, i) => i === index ? serialize(gradient) : layer).join(", "));
  return <>
    {layers.map((layer, index) => {
      const gradient = parseGradient(layer);
      const resolved = computedLayers.length === layers.length ? parseGradient(computedLayers[index]) : null;
      return <div className="gradient-layer" key={index}>
        <div className="property-subheading"><span>{gradient ? "Linear gradient" : "Image / custom gradient"} {layers.length > 1 ? index + 1 : ""}</span><button className="small-toggle" aria-label={`Remove background layer ${index + 1}`} onClick={() => { if (onCommit(layers.filter((_, i) => i !== index).join(", ") || "none")) setExpandedLayer(current => current === null || current === index ? null : current > index ? current - 1 : current); }}>Remove</button></div>
        {gradient && <button className="gradient-summary" aria-label={`Edit gradient ${index + 1}`} aria-expanded={expandedLayer === index} onClick={() => setExpandedLayer(expandedLayer === index ? null : index)}><span className="gradient-summary-swatch" style={{ backgroundImage: layer }} /><span>{gradient.stops.length} colors · {Math.round(gradient.angle)}°</span><span className="gradient-disclosure">{expandedLayer === index ? "⌃" : "⌄"}</span></button>}
        {gradient && expandedLayer === index ? <>
          <div className="gradient-preview" style={{ backgroundImage: layer }} />
          <Field label={`Gradient ${index + 1} angle`} prefix="Angle" suffix="°" value={String(Math.round(gradient.angle * 100) / 100)} onCommit={(v) => v.trim() && Number.isFinite(Number(v)) ? update(index, { ...gradient, angle: Number(v) }) : false} />
          {gradient.stops.map((stop, stopIndex) => <div className="gradient-stop" key={stopIndex}>
            <ColorField label={`Gradient ${index + 1} stop ${stopIndex + 1} color`} value={resolved?.stops[stopIndex]?.color ?? stop.color} onCommit={(color) => update(index, { ...gradient, stops: gradient.stops.map((item, i) => i === stopIndex ? { ...item, color } : item) })} />
            <div className="gradient-stop-position"><Field label={`Gradient ${index + 1} stop ${stopIndex + 1} position`} prefix="Stop" value={stop.position || "Auto"} onCommit={(v) => update(index, { ...gradient, stops: gradient.stops.map((item, i) => i === stopIndex ? { ...item, position: /^auto$/i.test(v) ? "" : /^-?[\d.]+$/.test(v) ? `${v}%` : v } : item) })} /><button className="small-toggle" disabled={gradient.stops.length <= 2} aria-label={`Remove gradient ${index + 1} stop ${stopIndex + 1}`} onClick={() => update(index, { ...gradient, stops: gradient.stops.filter((_, i) => i !== stopIndex) })}>Remove stop</button></div>
          </div>)}
          <button className="add-property" onClick={() => {
            const before = gradient.stops.at(-2)!;
            const last = gradient.stops.at(-1)!;
            const position = /^-?[\d.]+%$/.test(before.position) && /^-?[\d.]+%$/.test(last.position) ? `${(parseFloat(before.position) + parseFloat(last.position)) / 2}%` : "";
            update(index, { ...gradient, stops: [...gradient.stops.slice(0, -1), { color: "#FFFFFF", position }, last] });
          }}>+ Add color stop</button>
        </> : !gradient ? <p className="property-note">This background is preserved. Use the CSS value below to edit it.</p> : null}
      </div>;
    })}
    <div className="effect-actions"><button className="add-property" onClick={() => { if (onCommit(["linear-gradient(135deg, #6366F1 0%, #EC4899 100%)", ...layers].join(", "))) setExpandedLayer(0); }}>+ Add gradient</button><button className="small-toggle" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}>CSS value</button></div>
    {(advanced || layers.some((layer) => !parseGradient(layer))) && <Field label="Background image or gradient" value={value} onCommit={onCommit} />}
  </>;
}
