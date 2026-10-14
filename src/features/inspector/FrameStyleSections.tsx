import type { Artboard } from "@/features/canvas/types";
import { propertyState } from "./propertyState";
import { readFrameStyle, setFrameStyle } from "./frameStyle";
import { ColorField, Field, Row, Section, SelectField } from "./InspectorControls";
import { InspectorIcon } from "./InspectorIcon";
import { ShadowEditor } from "./ShadowEditor";
import { FilterEffects } from "./FilterEffects";
import { useInspectorDisclosure } from "./InspectorPreferences";

export function FrameStyleSections({ part, frame, host, onUpdate }: { part: "appearance" | "stroke" | "effects"; frame: Artboard; host?: HTMLDivElement; onUpdate: (patch: Partial<Artboard>) => void }) {
  const [corners, setCorners] = useInspectorDisclosure("corners", false);
  if (!host) return null;
  const authored = readFrameStyle(frame.css), computed = getComputedStyle(host);
  const state = (property: string) => propertyState([{ authored: authored.getPropertyValue(property), computed: computed.getPropertyValue(property) }]);
  const set = (property: string, value: string) => { if (!CSS.supports(property, value)) return false; onUpdate({ css: setFrameStyle(frame.css, property, value) }); return true; };
  const reset = (properties: string[]) => properties.some(property => !!authored.getPropertyValue(property)) ? () => onUpdate({ css: properties.reduce((css, property) => setFrameStyle(css, property, ""), frame.css) }) : undefined;
  const radius = (property: string, label: string, prefix: string) => <Field state={property === "border-radius" ? propertyState(["top-left", "top-right", "bottom-left", "bottom-right"].map(corner => ({ authored: authored.getPropertyValue(`border-${corner}-radius`), computed: computed.getPropertyValue(`border-${corner}-radius`) }))) : state(property)} label={label} prefix={prefix} value={state(property).value.replace(/px/g, "")} onCommit={value => set(property, /^\d*\.?\d+$/.test(value) ? `${value}px` : value)} onReset={reset([property])} />;
  if (part === "appearance") return <Section title="Appearance" onReset={reset(["opacity", "border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius", "mix-blend-mode"])} actions={<button className="inspector-icon" aria-label="Individual corners" aria-pressed={corners} onClick={() => setCorners(!corners)}><InspectorIcon name="corners" /></button>}>
    <Row><Field state={state("opacity")} prefix="◒" label="Frame opacity" suffix="%" value={String(Math.round(Number(computed.opacity) * 100))} onCommit={value => { const n = Number(value); if (!value.trim() || !Number.isFinite(n)) return false; const clamped = Math.min(100, Math.max(0, n)); return set("opacity", String(clamped / 100)) === false ? false : String(clamped); }} onReset={reset(["opacity"])} />{radius("border-radius", "Frame corner radius", "R")}</Row>
    {corners && <><Row>{radius("border-top-left-radius", "Frame top left radius", "TL")}{radius("border-top-right-radius", "Frame top right radius", "TR")}</Row><Row>{radius("border-bottom-left-radius", "Frame bottom left radius", "BL")}{radius("border-bottom-right-radius", "Frame bottom right radius", "BR")}</Row></>}
    <SelectField label="Blend mode" value={state("mix-blend-mode").value} options={["normal", "multiply", "screen", "overlay", "darken", "lighten", "difference", "exclusion"]} onCommit={value => set("mix-blend-mode", value)} />
  </Section>;
  if (part === "stroke") return <Section title="Stroke" defaultOpen={false} onReset={reset(["border", "border-width", "border-style", "border-color"])}>
    <Row><Field state={state("border-width")} label="Frame stroke width" prefix="W" value={state("border-width").value.replace(/px/g, "")} onCommit={value => {
      const width = /^\d*\.?\d+$/.test(value) ? `${value}px` : value;
      if (!CSS.supports("border-width", width)) return false;
      let css = setFrameStyle(frame.css, "border-width", width);
      if (computed.borderTopStyle === "none") css = setFrameStyle(css, "border-style", "solid");
      onUpdate({ css }); return true;
    }} /><SelectField label="Frame stroke style" value={state("border-style").value} options={["none", "solid", "dashed", "dotted", "double"]} onCommit={value => set("border-style", value)} /></Row>
    <ColorField state={state("border-color")} label="Frame stroke color" value={computed.borderTopColor} onCommit={value => set("border-color", value)} onReset={reset(["border-color"])} />
  </Section>;
  return <Section title="Effects" defaultOpen={false} onReset={reset(["box-shadow", "filter", "backdrop-filter"])}>
    <ShadowEditor value={state("box-shadow").value} computedValue={computed.boxShadow} onCommit={value => set("box-shadow", value)} />
    <FilterEffects element={host} onChange={() => {}} getState={state} onSet={set} onReset={property => reset([property])?.()} />
  </Section>;
}
