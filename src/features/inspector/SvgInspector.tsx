import { getLayoutSize, setSize } from "@/features/canvas/elementStyle";
import { layerName } from "@/features/layers/Layers";
import { ColorField, Field, Row, Section, SelectField, TextArea } from "./InspectorControls";

export function SvgInspector({ element, onChange }: { element: SVGElement; onChange: () => void }) {
  const computed = getComputedStyle(element);
  const tag = element.tagName.toLowerCase();
  const read = (property: string) => element.style.getPropertyValue(property) || computed.getPropertyValue(property) || element.getAttribute(property) || "0";
  const set = (property: string, value: string) => {
    if (!CSS.supports(property, value)) return false;
    element.style.setProperty(property, value); onChange(); return true;
  };
  const reset = (properties: string[]) => properties.some((property) => element.style.getPropertyValue(property)) ? () => { properties.forEach((property) => element.style.removeProperty(property)); onChange(); } : undefined;
  const opacityField = (property: string, label: string) => <Field label={label} prefix="Opacity" suffix="%" value={String(Math.round(parseFloat(read(property)) * (read(property).endsWith("%") ? 1 : 100)))} onCommit={(value) => value.trim() && Number.isFinite(Number(value)) ? set(property, String(Math.max(0, Math.min(100, Number(value))) / 100)) : false} onReset={reset([property])} />;
  const geometry: Record<string, string[]> = { rect: ["x", "y", "width", "height", "rx", "ry"], circle: ["cx", "cy", "r"], ellipse: ["cx", "cy", "rx", "ry"], line: ["x1", "y1", "x2", "y2"] };
  const coordinate = (property: string) => <Field key={property} label={`SVG ${property}`} prefix={property.toUpperCase()} value={read(property).replace(/px$/, "")} onCommit={(value) => {
    if (!/^-?(?:\d*\.)?\d+$/.test(value) || (["width", "height", "r", "rx", "ry"].includes(property) && Number(value) < 0)) return false;
    if (CSS.supports(property, `${value}px`)) element.style.setProperty(property, `${value}px`);
    else element.setAttribute(property, value);
    onChange(); return true;
  }} onReset={reset([property])} />;
  return <>
    <div className="selection-summary"><strong>{layerName(element)}</strong><span className="node-badge">{tag}</span></div>
    <Section title={tag === "svg" ? "SVG viewport" : "Vector geometry"}>
      {tag === "svg" ? <>
        <Row>{(["width", "height"] as const).map((axis) => <Field key={axis} label={`SVG ${axis}`} prefix={axis === "width" ? "W" : "H"} value={String(getLayoutSize(element)[axis])} onCommit={(value) => { if (!/^\d*\.?\d+$/.test(value) || Number(value) <= 0) return false; setSize(element, { [axis]: Number(value) }); onChange(); return true; }} onReset={reset([axis])} />)}</Row>
        <Field label="SVG viewBox" value={element.getAttribute("viewBox") ?? ""} onCommit={(value) => { const numbers = value.trim().split(/[\s,]+/).map(Number); if (numbers.length !== 4 || numbers.some((n) => !Number.isFinite(n)) || numbers[2] <= 0 || numbers[3] <= 0) return false; element.setAttribute("viewBox", numbers.join(" ")); onChange(); return true; }} />
      </> : geometry[tag] ? <div className="property-row">{geometry[tag].map(coordinate)}</div> : <p className="property-note">{tag === "path" ? "Path geometry is preserved. Edit its fill, stroke and transforms below." : "Geometry follows the SVG content."}</p>}
      <p className="property-note">Coordinates use the SVG viewBox. Fill and stroke apply to vector shapes.</p>
    </Section>
    {(tag === "text" || tag === "tspan") && <Section title="Typography" onReset={reset(["font-family", "font-size", "font-weight", "text-anchor"])}>
      <Field label="Font family" value={computed.fontFamily} onCommit={(v) => set("font-family", v)} />
      <Row><Field prefix="Size" label="Font size" value={computed.fontSize.replace(/px$/, "")} onCommit={(v) => set("font-size", /^\d*\.?\d+$/.test(v) ? `${v}px` : v)} /><Field prefix="Weight" label="Font weight" value={computed.fontWeight} onCommit={(v) => set("font-weight", v)} /></Row>
      <SelectField label="Text anchor" value={read("text-anchor")} options={["start", "middle", "end"]} onCommit={(v) => set("text-anchor", v)} />
      {element.children.length === 0 && <TextArea value={element.textContent ?? ""} onCommit={(v) => { element.textContent = v; onChange(); }} />}
    </Section>}
    <Section title="Fill" onReset={reset(["fill", "fill-opacity", "fill-rule"])}>
      <ColorField label="Vector fill" value={computed.fill} onCommit={(v) => set("fill", v)} onReset={reset(["fill"])} />
      {opacityField("fill-opacity", "Vector fill paint opacity")}
      <SelectField label="Fill rule" value={read("fill-rule")} options={["nonzero", "evenodd"]} onCommit={(v) => set("fill-rule", v)} />
      <button className="small-toggle" onClick={() => set("fill", "none")}>Remove vector fill</button>
    </Section>
    <Section title="Stroke" onReset={reset(["stroke", "stroke-width", "stroke-opacity", "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "vector-effect"])}>
      <ColorField label="Vector stroke" value={computed.stroke} onCommit={(v) => set("stroke", v)} onReset={reset(["stroke"])} />
      {opacityField("stroke-opacity", "Vector stroke paint opacity")}
      <Row><Field label="Vector stroke width" prefix="Width" value={read("stroke-width").replace(/px$/, "")} onCommit={(v) => set("stroke-width", v)} /><SelectField label="Line cap" value={read("stroke-linecap")} options={["butt", "round", "square"]} onCommit={(v) => set("stroke-linecap", v)} /></Row>
      <SelectField label="Line join" value={read("stroke-linejoin")} options={["miter", "round", "bevel"]} onCommit={(v) => set("stroke-linejoin", v)} />
      <Field label="Dash pattern" value={read("stroke-dasharray")} onCommit={(v) => set("stroke-dasharray", v)} />
      <label className="property-checkbox"><input type="checkbox" checked={read("vector-effect") === "non-scaling-stroke"} onChange={(e) => set("vector-effect", e.target.checked ? "non-scaling-stroke" : "none")} />Keep stroke width when scaled</label>
    </Section>
    <Section title="Appearance" onReset={reset(["opacity", "transform", "transform-origin"])}>
      <Field label="Opacity" prefix="Opacity" suffix="%" value={String(Math.round(Number(computed.opacity) * 100))} onCommit={(v) => v.trim() && Number.isFinite(Number(v)) ? set("opacity", String(Math.max(0, Math.min(100, Number(v))) / 100)) : false} />
      <Field label="Vector transform" value={element.style.transform || computed.transform || "none"} onCommit={(v) => set("transform", v)} onReset={reset(["transform"])} />
    </Section>
  </>;
}
