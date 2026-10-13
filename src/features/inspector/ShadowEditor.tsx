import { splitCss } from "./cssList";
import { useState } from "react";
import { ColorField, Field, Row, SelectField } from "./InspectorControls";
import { InspectorIcon } from "./InspectorIcon";

type Shadow = { x: number; y: number; blur: number; spread: number; color: string; inset: boolean };

export function parseShadow(value: string): Shadow | null {
  const tokens = splitCss(value, " ");
  const lengths = tokens.filter((token) => /^-?(?:\d*\.)?\d+(?:px)?$/.test(token));
  const colors = tokens.filter((token) => token !== "inset" && !lengths.includes(token));
  if (lengths.length < 2 || lengths.length > 4 || colors.length !== 1 || !CSS.supports("color", colors[0])) return null;
  return { x: parseFloat(lengths[0]), y: parseFloat(lengths[1]), blur: parseFloat(lengths[2] || "0"), spread: parseFloat(lengths[3] || "0"), color: colors[0], inset: tokens.includes("inset") };
}

function serialize(shadow: Shadow) {
  return `${shadow.inset ? "inset " : ""}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}

export function ShadowEditor({ value, computedValue, onCommit }: { value: string; computedValue: string; onCommit: (value: string) => boolean }) {
  const [advanced, setAdvanced] = useState(false);
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);
  const layers = value === "none" ? [] : splitCss(value, ",");
  const rendered = computedValue === "none" ? [] : splitCss(computedValue, ",");
  const change = (index: number, patch: Partial<Shadow>, shadow: Shadow) => onCommit(layers.map((layer, i) => i === index ? serialize({ ...shadow, ...patch }) : layer).join(", "));
  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= layers.length) return;
    const next = [...layers];
    [next[index], next[target]] = [next[target], next[index]];
    if (onCommit(next.join(", "))) setExpandedLayer(current => current === index ? target : current === target ? index : current);
  };
  const remove = (index: number) => {
    if (onCommit(layers.filter((_, i) => i !== index).join(", ") || "none")) {
      setExpandedLayer(current => current === null || current === index ? null : current > index ? current - 1 : current);
    }
  };
  const duplicate = (index: number) => {
    const next = [...layers];
    next.splice(index + 1, 0, layers[index]);
    if (onCommit(next.join(", "))) setExpandedLayer(index + 1);
  };
  return <>
    {layers.length === 0 && <p className="property-note">No shadows</p>}
    {layers.map((layer, index) => {
      const resolved = rendered.length === layers.length ? parseShadow(rendered[index] ?? "") : null;
      const authored = parseShadow(layer);
      const shadow = authored ? { ...authored, color: resolved?.color ?? authored.color } : resolved;
      return <div className="effect-layer shadow-layer" key={index}>
        <div className="effect-heading">
          <button className="effect-summary" aria-label={`Edit shadow ${index + 1}`} aria-expanded={expandedLayer === index} onClick={() => setExpandedLayer(expandedLayer === index ? null : index)}>
            <span className={`section-chevron${expandedLayer === index ? " open" : ""}`} aria-hidden="true" />
            <span className="effect-swatch" style={{ background: shadow?.color ?? "transparent" }} />
            <span>{shadow ? shadow.inset ? "Inner shadow" : "Drop shadow" : "Custom shadow"}</span>
          </button>
          <button className="inspector-icon" title="Duplicate shadow" aria-label={`Duplicate shadow ${index + 1}`} onClick={() => duplicate(index)}><InspectorIcon name="duplicate" /></button>
          {layers.length > 1 && <>
            <button className="inspector-icon" title="Move shadow up" aria-label={`Move shadow ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}><InspectorIcon name="moveUp" /></button>
            <button className="inspector-icon" title="Move shadow down" aria-label={`Move shadow ${index + 1} down`} disabled={index === layers.length - 1} onClick={() => move(index, 1)}><InspectorIcon name="moveDown" /></button>
          </>}
          <button className="inspector-icon" title="Remove shadow" aria-label={`Remove shadow ${index + 1}`} onClick={() => remove(index)}><InspectorIcon name="remove" /></button>
        </div>
        {expandedLayer === index && (shadow ? <>
          <SelectField label="Type" value={shadow.inset ? "inset" : "drop"} options={[{ value: "drop", label: "Drop shadow" }, { value: "inset", label: "Inner shadow" }]} onCommit={(v) => change(index, { inset: v === "inset" }, shadow)} />
          <Row>{(["x", "y"] as const).map((key) => <Field key={key} prefix={key.toUpperCase()} label={`Shadow ${index + 1} ${key.toUpperCase()}`} value={String(shadow[key])} onCommit={(v) => v.trim() && Number.isFinite(Number(v)) ? change(index, { [key]: Number(v) }, shadow) : false} />)}</Row>
          <Row>{(["blur", "spread"] as const).map((key) => <Field key={key} prefix={key === "blur" ? "Blur" : "Spread"} label={`Shadow ${index + 1} ${key}`} value={String(shadow[key])} onCommit={(v) => v.trim() && Number.isFinite(Number(v)) && (key !== "blur" || Number(v) >= 0) ? change(index, { [key]: Number(v) }, shadow) : false} />)}</Row>
          <ColorField label={`Shadow ${index + 1} color`} value={shadow.color} onCommit={(color) => change(index, { color }, shadow)} />
        </> : <p className="property-note">Edit this effect with the CSS field below.</p>)}
      </div>;
    })}
    <div className="effect-actions"><button className="add-property" onClick={() => { if (onCommit([...layers, "0px 4px 16px 0px #00000026"].join(", "))) setExpandedLayer(layers.length); }}>+ Add shadow</button><button className="small-toggle" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}>CSS value</button></div>
    {(advanced || layers.some((layer, i) => !parseShadow(layer) && !(rendered.length === layers.length && parseShadow(rendered[i] ?? "")))) && <Field label="Box shadow" value={value} onCommit={onCommit} />}
  </>;
}
