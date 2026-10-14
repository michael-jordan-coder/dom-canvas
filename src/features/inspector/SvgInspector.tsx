import { CssVariables } from "./CssVariables";
import { EditorTrigger } from "./FloatingEditor";
import { TypeSettings } from "./TypeSettings";
import { cssPropertyState } from "./propertyState";
import { FilterEffects } from "./FilterEffects";
import { FontWeightField } from "./FontWeightField";
import { numericInput } from "./numeric";
import { getLayoutSize, setSize } from "@/features/canvas/elementStyle";
import { flippedScale } from "@/features/canvas/scale";
import { rotationField, rotationInput } from "@/features/canvas/rotation";
import { layerName } from "@/features/layers/Layers";
import { ColorField, Field, Row, Section, SelectField, TextArea } from "./InspectorControls";
import { InspectorIcon } from "./InspectorIcon";
import { SizeModeMenu } from "./SizeModeMenu";
import { sizeMode, sizeModes, setSizeMode } from "./sizing";

export function SvgInspector({ element, onChange }: { element: SVGElement; onChange: () => void }) {
  const computed = getComputedStyle(element);
  const tag = element.tagName.toLowerCase();
  const state = (property: string) => cssPropertyState([element], property);
  const read = (property: string) => state(property).value || element.getAttribute(property) || "0";
  const set = (property: string, value: string) => { if (!CSS.supports(property, value)) return false; element.style.setProperty(property, value); onChange(); return true; };
  const reset = (properties: string[]) => properties.some(property => state(property).canReset) ? () => { properties.forEach(property => element.style.removeProperty(property)); onChange(); } : undefined;
  const setOpacity = (property: string, value: string) => {
    const n = numericInput(value, "%"); if (n === null) return false;
    const clamped = Math.min(100, Math.max(0, n)); return set(property, String(clamped / 100)) === false ? false : String(clamped);
  };
  const opacityField = (property: string, label: string) => <Field state={state(property)} label={label} prefix="◒" suffix="%" value={String(Math.round(parseFloat(computed.getPropertyValue(property)) * 100))} onCommit={value => setOpacity(property, value)} onReset={reset([property])} />;
  const geometry: Record<string, string[]> = { rect: ["x", "y", "width", "height"], circle: ["cx", "cy", "r"], ellipse: ["cx", "cy", "rx", "ry"], line: ["x1", "y1", "x2", "y2"] };
  const positions = ["x", "y", "cx", "cy", "x1", "y1", "x2", "y2"];
  const coordinate = (property: string) => <Field key={property} state={state(property)} label={`SVG ${property}`} prefix={property.toUpperCase()} value={read(property).replace(/px$/, "")} onCommit={value => {
    if (!/^-?(?:\d*\.)?\d+$/.test(value) || (["width", "height", "r", "rx", "ry"].includes(property) && Number(value) < 0)) return false;
    if (CSS.supports(property, `${value}px`)) element.style.setProperty(property, `${value}px`); else element.setAttribute(property, value);
    onChange(); return true;
  }} onReset={reset([property])} />;
  return <>
    <div className="selection-summary"><strong>{layerName(element)}</strong><span className="node-badge">{tag}</span></div>
    <Section title="Position">
      {geometry[tag] && <div className="property-row">{geometry[tag].filter(property => positions.includes(property)).map(coordinate)}</div>}
      <div className="transform-row"><Field label="Rotation" prefix={<InspectorIcon name="rotation" />} {...rotationField(read("rotate"))} onCommit={value => set("rotate", rotationInput(value))} onReset={reset(["rotate"])} />
        {([0, 1] as const).map(axis => { const next = flippedScale(computed.scale, axis); return <button key={axis} className="inspector-icon" aria-label={axis === 0 ? "Flip horizontally" : "Flip vertically"} disabled={next === null} onClick={() => { if (next !== null) set("scale", next); }}><InspectorIcon name={axis === 0 ? "flipHorizontal" : "flipVertical"} /></button>; })}
      </div>
    </Section>
    <Section title="Layout">
      {tag === "svg" ? <Row>{(["width", "height"] as const).map(axis => <Field key={axis} state={state(axis)} label={`SVG ${axis}`} prefix={axis === "width" ? "W" : "H"} value={String(getLayoutSize(element)[axis])} onCommit={value => { const n = numericInput(value); if (n === null || n <= 0) return false; setSize(element, { [axis]: n }); onChange(); return true; }} onReset={reset([axis])} trailing={<SizeModeMenu label={`SVG ${axis}`} value={sizeMode(element, axis)} modes={sizeModes(element, axis)} onChange={mode => { if (setSizeMode(element, axis, mode, getLayoutSize(element)[axis]) !== false) onChange(); }} />} />)}</Row>
        : geometry[tag] ? <div className="property-row">{geometry[tag].filter(property => !positions.includes(property)).map(coordinate)}</div> : <p className="property-note">Geometry follows the SVG path.</p>}
    </Section>
    <Section title="Appearance" onReset={reset(["opacity", "rx", "ry", "mix-blend-mode"])}>
      {opacityField("opacity", "Opacity")}
      {tag === "rect" && <Row>{coordinate("rx")}{coordinate("ry")}</Row>}
      <SelectField label="Blend mode" value={read("mix-blend-mode")} options={["normal", "multiply", "screen", "overlay", "darken", "lighten", "difference", "exclusion"]} onCommit={value => set("mix-blend-mode", value)} />
    </Section>
    {(tag === "text" || tag === "tspan") && <Section title="Typography" actions={<EditorTrigger title="Type settings"><TypeSettings element={element} onChange={onChange} /></EditorTrigger>} onReset={reset(["font-family", "font-size", "font-weight", "text-anchor"])}>
      <Field state={state("font-family")} label="Font family" value={read("font-family")} onCommit={value => set("font-family", value)} />
      <Row><FontWeightField state={state("font-weight")} value={read("font-weight")} onCommit={value => set("font-weight", value)} onReset={reset(["font-weight"])} /><Field prefix="Size" label="Font size" value={computed.fontSize.replace(/px$/, "")} onCommit={value => set("font-size", /^\d*\.?\d+$/.test(value) ? `${value}px` : value)} /></Row>
      <SelectField label="Text anchor" value={read("text-anchor")} options={["start", "middle", "end"]} onCommit={value => set("text-anchor", value)} />
      {element.children.length === 0 && <TextArea value={element.textContent ?? ""} onCommit={value => { element.textContent = value; onChange(); }} />}
    </Section>}
    <Section title="Fill" onReset={reset(["fill", "fill-opacity"])}>
      <ColorField state={state("fill")} label="Vector fill" value={computed.fill} onCommit={value => set("fill", value)} onReset={reset(["fill"])} />
      {opacityField("fill-opacity", "Vector fill paint opacity")}
      <button className="small-toggle" onClick={() => set("fill", "none")}>Remove vector fill</button>
    </Section>
    <Section title="Stroke" defaultOpen={computed.stroke !== "none"} onReset={reset(["stroke", "stroke-width", "stroke-opacity", "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "vector-effect"])}>
      <ColorField state={state("stroke")} label="Vector stroke" value={computed.stroke} onCommit={value => set("stroke", value)} onReset={reset(["stroke"])} />
      {opacityField("stroke-opacity", "Vector stroke paint opacity")}
      <Row><Field label="Vector stroke width" prefix="W" value={read("stroke-width").replace(/px$/, "")} onCommit={value => set("stroke-width", value)} /><SelectField label="Line cap" value={read("stroke-linecap")} options={["butt", "round", "square"]} onCommit={value => set("stroke-linecap", value)} /></Row>
      <SelectField label="Line join" value={read("stroke-linejoin")} options={["miter", "round", "bevel"]} onCommit={value => set("stroke-linejoin", value)} />
      <Field label="Dash pattern" value={read("stroke-dasharray")} onCommit={value => set("stroke-dasharray", value)} />
      <label className="property-checkbox"><input type="checkbox" checked={read("vector-effect") === "non-scaling-stroke"} onChange={event => set("vector-effect", event.target.checked ? "non-scaling-stroke" : "none")} />Keep stroke width when scaled</label>
    </Section>
    <Section title="Effects" defaultOpen={false}><FilterEffects element={element} onChange={onChange} /></Section>
    <Section title="CSS advanced" defaultOpen={false}>
      <Field label="Vector transform" state={state("transform")} value={read("transform")} onCommit={value => set("transform", value)} onReset={reset(["transform"])} />
      <Field label="Transform origin" state={state("transform-origin")} value={read("transform-origin")} onCommit={value => set("transform-origin", value)} onReset={reset(["transform-origin"])} />
      <SelectField label="Fill rule" value={read("fill-rule")} options={["nonzero", "evenodd"]} onCommit={value => set("fill-rule", value)} />
      {tag === "svg" && <Field label="SVG viewBox" value={element.getAttribute("viewBox") ?? ""} onCommit={value => { const n = value.trim().split(/[\s,]+/).map(Number); if (n.length !== 4 || n.some(value => !Number.isFinite(value)) || n[2] <= 0 || n[3] <= 0) return false; element.setAttribute("viewBox", n.join(" ")); onChange(); return true; }} />}
      <CssVariables element={element} onChange={onChange} />
    </Section>
  </>;
}
