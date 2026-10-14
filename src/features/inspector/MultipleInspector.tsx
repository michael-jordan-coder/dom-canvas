import { textMetricInput, textMetricDisplay } from "./textMetric";
import { readFrameStyle, setFrameStyle } from "./frameStyle";
import type { Artboard, SelectionItem } from "@/features/canvas/types";
import { getLayoutSize, getTranslate, screenDeltaToLocal, setSize, setTranslate } from "@/features/canvas/elementStyle";
import { ColorField, Field, Row, Section } from "./InspectorControls";
import { propertyState, type PropertySample } from "./propertyState";
import { EditorTrigger } from "./FloatingEditor";
import { ShadowEditor } from "./ShadowEditor";
import { FontWeightField } from "./FontWeightField";
import type { FramePatch } from "./MultipleFramesInspector";
import { frameGeometry } from "./inspectorGeometry";

export function MultipleInspector({ items, artboards, hosts, onUpdateFrames, onChange }: {
  items: SelectionItem[]; artboards: Artboard[]; hosts: Map<string, HTMLDivElement>;
  onUpdateFrames: (patches: FramePatch[]) => void; onChange: () => void;
}) {
  type Target = { frame: Artboard | null; element: HTMLElement | SVGElement | null; host: HTMLDivElement | undefined };
  const targets = items.flatMap<Target>(item => {
    if (item.kind === "artboard") {
      const frame = artboards.find(frame => frame.id === item.artboardId);
      return frame ? [{ frame, element: null, host: hosts.get(frame.id) }] : [];
    }
    return item.element.isConnected && (item.element instanceof HTMLElement || item.element instanceof SVGElement)
      ? [{ frame: null, element: item.element, host: undefined }] : [];
  });
  const paint = (element: HTMLElement | SVGElement, property: string) => {
    if (property === "paint") return element instanceof SVGElement ? "fill" : "background-color";
    if (property === "stroke-color") return element instanceof SVGElement ? "stroke" : "border-color";
    if (property === "stroke-size") return element instanceof SVGElement ? "stroke-width" : "border-width";
    return property;
  };
  const frameProperty = (property: string) => property === "stroke-color" ? "border-color" : property === "stroke-size" ? "border-width" : property;
  const supported = (target: typeof targets[number], property: string) => {
    if (target.frame) return ["x", "y", "width", "height", "paint", "opacity", "border-radius", "box-shadow", "stroke-color", "stroke-size", "border-style"].includes(property);
    const element = target.element!;
    if (["width", "height"].includes(property)) return element instanceof HTMLElement || element.tagName.toLowerCase() === "svg";
    if (property === "box-shadow") return element instanceof HTMLElement;
    if (property === "border-radius") return element instanceof HTMLElement;
    if (/^(font-|line-height|letter-spacing|color|text-)/.test(property)) return !!element.textContent?.trim() && element.children.length === 0;
    return true;
  };
  const sample = (target: typeof targets[number], property: string): PropertySample => {
    if (!supported(target, property)) return { authored: "", computed: "", available: false };
    const frame = target.frame;
    if (frame) {
      if (property === "paint") return { authored: frame.backgroundColor ?? "", computed: target.host ? getComputedStyle(target.host).backgroundColor : frame.backgroundColor ?? "transparent" };
      if (["opacity", "border-radius", "box-shadow", "stroke-color", "stroke-size", "border-style"].includes(property)) return { authored: readFrameStyle(frame.css).getPropertyValue(frameProperty(property)), computed: target.host ? getComputedStyle(target.host).getPropertyValue(frameProperty(property)) : property === "opacity" ? "1" : property === "border-radius" ? "0px" : "none" };
      const value = property === "height" ? frame.height ?? target.host?.offsetHeight ?? 1 : frame[property as "x" | "y" | "width"];
      return { authored: property === "height" && frame.height === undefined ? "" : String(value), computed: String(value), resettable: property === "height" && frame.height !== undefined };
    }
    const element = target.element!;
    if (property === "x" || property === "y") return { authored: element.style.translate, computed: String(frameGeometry(element)[property]) };
    const prop = paint(element, property);
    const computed = getComputedStyle(element).getPropertyValue(prop);
    if (property === "width" || property === "height") return { authored: element.style.getPropertyValue(property), computed: String(getLayoutSize(element)[property]) };
    return { authored: element.style.getPropertyValue(prop) || (element instanceof SVGElement ? element.getAttribute(prop) ?? "" : ""), computed, resettable: !!element.style.getPropertyValue(prop) };
  };
  const state = (property: string) => propertyState(targets.map(target => {
    const value = sample(target, property);
    // Positions display geometry, not the translate declaration.
    return property === "x" || property === "y" ? { ...value, authored: "" } : value;
  }));
  const resettable = (property: string) => targets.some(target => supported(target, property) && (target.frame ? property === "paint" && target.frame.backgroundColor !== undefined || property === "height" && target.frame.height !== undefined || !!readFrameStyle(target.frame.css).getPropertyValue(frameProperty(property)) : !!target.element!.style.getPropertyValue(paint(target.element!, property))));
  const commit = (patches: FramePatch[]) => patches.length ? onUpdateFrames(patches) : onChange();
  const set = (property: string, value: string) => {
    const eligible = targets.filter(target => supported(target, property));
    if (!eligible.length || !value.trim()) return false;
    const numeric = ["x", "y", "width", "height"].includes(property);
    const number = Number(value);
    if (numeric && (!Number.isFinite(number) || (["width", "height"].includes(property) && number <= 0))) return false;
    if (!numeric && eligible.some(target => !CSS.supports(target.frame ? property === "paint" ? "background-color" : frameProperty(property) : paint(target.element!, property), value))) return false;
    const patches: FramePatch[] = [];
    eligible.forEach(target => {
      if (target.frame) {
        const frame = target.frame;
        const patch: Partial<Artboard> = property === "paint" ? { backgroundColor: value } : numeric ? { [property]: number } : { css: setFrameStyle(frame.css, frameProperty(property), value) };
        if (property === "stroke-size" && target.host && getComputedStyle(target.host).borderTopStyle === "none") patch.css = setFrameStyle(patch.css!, "border-style", "solid");
        if (frame.aspectRatio && property === "width") patch.height = Math.max(1, Math.round(number / frame.aspectRatio));
        if (frame.aspectRatio && property === "height") patch.width = Math.max(1, Math.round(number * frame.aspectRatio));
        patches.push({ id: frame.id, patch });
      } else {
        const element = target.element!;
        if (property === "x" || property === "y") {
          const geometry = frameGeometry(element), translate = getTranslate(element);
          const delta = screenDeltaToLocal(element, (property === "x" ? number - geometry.x : 0) * geometry.zoom, (property === "y" ? number - geometry.y : 0) * geometry.zoom);
          setTranslate(element, translate.x + delta.x, translate.y + delta.y);
        } else if (property === "width" || property === "height") setSize(element, { [property]: number });
        else {
          element.style.setProperty(paint(element, property), value);
          if (property === "stroke-size" && element instanceof HTMLElement && getComputedStyle(element).borderTopStyle === "none") element.style.borderStyle = "solid";
        }
      }
    });
    commit(patches); return true;
  };
  const reset = (properties: string[]) => properties.some(resettable) ? () => {
    const patches: FramePatch[] = [];
    targets.forEach(target => {
      if (target.frame) {
        const patch: Partial<Artboard> = {};
        if (properties.includes("paint") && target.frame.backgroundColor !== undefined) patch.backgroundColor = undefined;
        if (properties.includes("height") && target.frame.height !== undefined) { patch.height = undefined; patch.aspectRatio = undefined; }
        const resetStyle = properties.filter(property => !!readFrameStyle(target.frame!.css).getPropertyValue(frameProperty(property)));
        if (resetStyle.length) patch.css = resetStyle.reduce((css, property) => setFrameStyle(css, frameProperty(property), ""), target.frame.css);
        if (Object.keys(patch).length) patches.push({ id: target.frame.id, patch });
      } else properties.filter(property => supported(target, property)).forEach(property => target.element!.style.removeProperty(paint(target.element!, property)));
    });
    commit(patches);
  } : undefined;
  const field = (label: string, property: string, prefix?: string, isLength = false) => {
    const current = state(property);
    return <Field label={label} state={current} prefix={prefix} value={property === "line-height" || property === "letter-spacing" ? textMetricDisplay(property, current.authored, current.computed) : (["width", "height"].includes(property) ? current.computed : current.value).replace(isLength ? /px$/ : /$^/, "")} onCommit={value => set(property, property === "line-height" || property === "letter-spacing" ? textMetricInput(property, value) : isLength && /^-?\d*\.?\d+$/.test(value) ? `${value}px` : value)} onReset={reset([property])} />;
  };
  const opacity = state("opacity"), fill = state("paint");
  const firstPaint = (property: string) => targets.map(target => sample(target, property)).find(sample => sample.available !== false)?.computed || "transparent";
  return <>
    <div className="selection-summary"><strong>{items.length} selected</strong><span className="node-badge">Mixed</span></div>
    <Section title="Position"><Row>{field("X", "x", "X")}{field("Y", "y", "Y")}</Row></Section>
    <Section title="Layout" onReset={reset(["width", "height"])}><Row>{field("Width", "width", "W")}{field("Height", "height", "H")}</Row>{state("width").supported < targets.length && <p className="property-note">Sizing applies to {state("width").supported} of {targets.length} selected layers.</p>}</Section>
    {opacity.available && <Section title="Appearance" onReset={reset(["opacity", "border-radius"])}>
      <Row><Field label="Opacity" state={opacity} prefix="◒" suffix="%" value={opacity.mixed ? "" : String(Math.round(Number(opacity.computed || opacity.value) * 100))} onCommit={value => {
        const n = Number(value); if (!value.trim() || !Number.isFinite(n)) return false;
        const clamped = Math.min(100, Math.max(0, n)); set("opacity", String(clamped / 100)); return String(clamped);
      }} onReset={reset(["opacity"])} />{state("border-radius").available && field("Corner radius", "border-radius", "R", true)}</Row>{state("border-radius").supported > 0 && state("border-radius").supported < targets.length && <p className="property-note">Corners apply to {state("border-radius").supported} of {targets.length} selected layers.</p>}
      {opacity.supported < opacity.total && <p className="property-note">Appearance applies to {opacity.supported} of {opacity.total} selected layers.</p>}
    </Section>}
    {state("font-size").available && <Section title="Typography" onReset={reset(["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color"])}>
      {field("Font family", "font-family")}
      <Row><FontWeightField state={state("font-weight")} value={state("font-weight").mixed ? "Mixed" : state("font-weight").value} onCommit={value => set("font-weight", value)} onReset={reset(["font-weight"])} />{field("Font size", "font-size", "Size", true)}</Row>
      <Row>{field("Line height", "line-height", "LH")}{field("Letter spacing", "letter-spacing", "LS", true)}</Row>
      <ColorField label="Text color" value={state("color").computed || firstPaint("color")} mixed={state("color").mixed} onCommit={value => set("color", value)} onReset={reset(["color"])} />
      <p className="property-note">Typography applies to {state("font-size").supported} of {targets.length} selected layers.</p>
    </Section>}
    {fill.available && <Section title="Fill" onReset={reset(["paint"])}><ColorField label="Fill" value={fill.computed || firstPaint("paint")} mixed={fill.mixed} onCommit={value => set("paint", value)} onReset={reset(["paint"])} /></Section>}
    {state("stroke-color").available && <Section title="Stroke" defaultOpen={false} onReset={reset(["stroke-color", "stroke-size", "border-style"])}>
      <ColorField label="Stroke color" value={state("stroke-color").computed || firstPaint("stroke-color")} mixed={state("stroke-color").mixed} onCommit={value => set("stroke-color", value)} onReset={reset(["stroke-color"])} />
      {field("Stroke width", "stroke-size", "W", true)}
      {state("stroke-color").supported < targets.length && <p className="property-note">Stroke applies to {state("stroke-color").supported} of {targets.length} selected layers.</p>}
    </Section>}
    {state("box-shadow").available && <Section title="Effects" defaultOpen={false} onReset={reset(["box-shadow"])}>
      <div className="effect-heading"><span className="background-layer-label">Shadows</span><EditorTrigger title="Shared shadows">
        {state("box-shadow").mixed ? field("Box shadow", "box-shadow") : <ShadowEditor value={state("box-shadow").value || "none"} computedValue={state("box-shadow").computed || "none"} onCommit={value => set("box-shadow", value)} />}
      </EditorTrigger></div>
      {state("box-shadow").supported < targets.length && <p className="property-note">Shadows apply to {state("box-shadow").supported} of {targets.length} selected layers.</p>}
    </Section>}
  </>;
}
