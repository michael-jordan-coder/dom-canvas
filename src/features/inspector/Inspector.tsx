import { useRef, useState } from "react";
import { getLayoutSize, getTranslate, setSize, setTranslate } from "@/features/canvas/elementStyle";
import { GradientEditor } from "./GradientEditor";
import { ShadowEditor } from "./ShadowEditor";
import { isFlexMainAxis, setSizeMode, sizeMode, sizingProperties, type SizeAxis, type SizeMode } from "./sizing";
import type { Artboard, Selection } from "@/features/canvas/types";
import { layerName } from "@/features/layers/Layers";
import { ColorField, Field, InspectorEdits, Row, Section, Segmented, SelectField, TextArea } from "./InspectorControls";

type Props = {
  selection: Selection;
  artboards: Artboard[];
  onUpdateArtboard: (id: string, patch: Partial<Artboard>) => void;
  version: number;
  onChange: () => void;
  onPreview: () => void;
  onPreviewArtboard: (id: string, patch: Partial<Artboard>) => void;
};

export function Inspector(props: Props) {
  const session = useRef<{ dirty: boolean; restore: () => void } | null>(null);
  const begin = () => {
    const selection = props.selection;
    if (selection.kind === "element") {
      const element = selection.element;
      const style = element.getAttribute("style");
      session.current = { dirty: false, restore: () => { if (style === null) element.removeAttribute("style"); else element.setAttribute("style", style); props.onPreview(); } };
    } else if (selection.kind === "artboard") {
      const original = props.artboards.find((ab) => ab.id === selection.artboardId);
      if (original) session.current = { dirty: false, restore: () => props.onPreviewArtboard(original.id, { ...original, height: original.height, aspectRatio: original.aspectRatio }) };
    }
  };
  const finish = (cancel: boolean) => {
    const current = session.current;
    session.current = null;
    if (!current?.dirty) return;
    if (cancel) current.restore(); else props.onChange();
  };
  return <InspectorEdits.Provider value={{ begin, finish }}><InspectorContent {...props}
    onChange={() => { if (session.current) { session.current.dirty = true; props.onPreview(); } else props.onChange(); }}
    onUpdateArtboard={(id, patch) => { if (session.current) { session.current.dirty = true; props.onPreviewArtboard(id, patch); } else props.onUpdateArtboard(id, patch); }}
  /></InspectorEdits.Provider>;
}

function InspectorContent({ selection, artboards, onUpdateArtboard, onChange }: Props) {
  if (selection.kind === "none") return <div className="inspector-empty"><strong>Nothing selected</strong><p>Select a frame or an element to edit its properties.</p><span>⌘/Ctrl-click selects the frame.<br />Alt-click selects a parent.</span></div>;
  if (selection.kind === "artboard") {
    const ab = artboards.find((item) => item.id === selection.artboardId);
    if (!ab) return null;
    const update = (patch: Partial<Artboard>) => {
      if (ab.aspectRatio && patch.aspectRatio !== undefined) { onUpdateArtboard(ab.id, patch); return; }
      if (ab.aspectRatio && patch.width !== undefined) patch.height = Math.round(patch.width / ab.aspectRatio);
      else if (ab.aspectRatio && patch.height !== undefined) patch.width = Math.round(patch.height * ab.aspectRatio);
      onUpdateArtboard(ab.id, patch);
    };
    const measuredHeight = document.querySelector<HTMLElement>(`[data-artboard="${ab.id}"]`)?.offsetHeight ?? 100;
    return <>
      <div className="selection-summary"><strong>{ab.name}</strong><span className="node-badge frame-badge">Frame</span></div>
      <Section title="Frame">
        <Field label="Frame name" value={ab.name} onCommit={(name) => update({ name: name || ab.name })} />
        <Segmented label="Frame preset" value={String(ab.width)} options={[{ value: "390", label: "Mobile" }, { value: "768", label: "Tablet" }, { value: "1440", label: "Desktop" }]} onChange={(v) => update({ width: Number(v) })} />
        <div className="property-subheading"><span>Resizing</span><button className="small-toggle" aria-label="Lock frame aspect ratio" aria-pressed={!!ab.aspectRatio} onClick={() => onUpdateArtboard(ab.id, { aspectRatio: ab.aspectRatio ? undefined : ab.width / measuredHeight, ...(ab.aspectRatio ? {} : { height: measuredHeight }) })}>{ab.aspectRatio ? "Ratio locked" : "Lock ratio"}</button></div>
        <Row><Field prefix="W" label="Frame width" value={String(ab.width)} suffix="px" onCommit={(v) => { if (!/^\d*\.?\d+$/.test(v) || Number(v) < 1) return false; update({ width: Number(v) }); }} /><Field prefix="H" label="Frame height" value={String(ab.height ?? measuredHeight)} onCommit={(v) => { if (!/^\d*\.?\d+$/.test(v) || Number(v) < 1) return false; update({ height: Number(v) }); }} trailing={<select className="size-mode" aria-label="Frame height sizing" value={ab.height === undefined ? "hug" : "fixed"} onChange={(e) => onUpdateArtboard(ab.id, { height: e.target.value === "hug" ? undefined : measuredHeight, aspectRatio: undefined })}><option value="hug">Hug</option><option value="fixed">Fixed</option></select>} /></Row>
      </Section>
      <Section title="Position">
        <Row><Field prefix="X" label="Frame X" value={String(ab.x)} onCommit={(v) => update({ x: number(v, ab.x) })} /><Field prefix="Y" label="Frame Y" value={String(ab.y)} onCommit={(v) => update({ y: number(v, ab.y) })} /></Row>
      </Section>
      <div className="inspector-footnote">Frame size controls the canvas bounds. Select an element inside to edit its layout and appearance.</div>
    </>;
  }
  const el = selection.element;
  if (!el.isConnected) return <div className="empty">Layer was removed.</div>;
  return <ElementInspector key={elementKey(el)} element={el} onChange={onChange} />;
}

const elementKeys = new WeakMap<Element, number>();
let nextElementKey = 0;
function elementKey(element: Element) {
  if (!elementKeys.has(element)) elementKeys.set(element, ++nextElementKey);
  return elementKeys.get(element)!;
}

function ElementInspector({ element, onChange }: { element: Element; onChange: () => void }) {
  const [individualPadding, setIndividualPadding] = useState(false);
  const [individualCorners, setIndividualCorners] = useState(false);
  const [individualStroke, setIndividualStroke] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const styled = element as HTMLElement | SVGElement;
  const computed = getComputedStyle(element);
  const hasText = Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim());
  const read = (prop: string) => styled.style.getPropertyValue(prop) || computed.getPropertyValue(prop);
  const set = (prop: string, value: string) => {
    if (!CSS.supports(prop, value)) return false;
    styled.style.setProperty(prop, value);
    onChange();
    return true;
  };
  const reset = (props: string[]) => {
    props.forEach((prop) => styled.style.removeProperty(prop));
    onChange();
  };
  const resetGroup = (props: string[]) => props.some((prop) => styled.style.getPropertyValue(prop)) ? () => reset(props) : undefined;
  const resetProperty = (prop: string) => resetGroup([prop]);
  const property = (label: string, prop: string, prefix?: string, length = true) => <Field label={label} prefix={prefix} value={length ? trimNumber(read(prop)) : read(prop)} onCommit={(v) => set(prop, length ? withPx(v) : v)} onReset={resetProperty(prop)} />;
  const geometry = frameGeometry(element);
  const moveTo = (x: number, y: number) => {
    const current = getTranslate(styled);
    setTranslate(styled, current.x + x - geometry.x, current.y + y - geometry.y);
    onChange();
  };
  const display = read("display");
  const isFlex = display.includes("flex");
  const isGrid = display.includes("grid");
  const layoutProps = ["display", "flex-direction", "flex-wrap", "justify-content", "align-items", "gap", "row-gap", "column-gap", "grid-template-columns", "grid-template-rows", "overflow"];
  const paddingProps = ["padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left"];
  const typographyProps = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align", "color"];
  const sizeField = (axis: SizeAxis) => {
    const label = axis === "width" ? "Width" : "Height";
    const mode = sizeMode(styled, axis);
    const main = isFlexMainAxis(element, axis);
    const measured = getLayoutSize(element)[axis];
    const value = mode === "custom" ? styled.style.getPropertyValue(axis) : String(measured);
    return <Field prefix={axis === "width" ? "W" : "H"} label={label} value={value}
      onReset={resetGroup(sizingProperties(element, axis))}
      onCommit={(v) => {
        if (/^\d*\.?\d+$/.test(v)) {
          const dimensions = getLayoutSize(element);
          const ratio = dimensions.width / dimensions.height;
          setSizeMode(styled, axis, "fixed", Number(v));
          if (read("aspect-ratio") !== "auto" && Number.isFinite(ratio) && ratio > 0) setSizeMode(styled, axis === "width" ? "height" : "width", "fixed", axis === "width" ? Number(v) / ratio : Number(v) * ratio);
          onChange(); return true;
        }
        if (!CSS.supports(axis, v)) return false;
        if (main) { styled.style.flexGrow = "0"; styled.style.flexBasis = "auto"; }
        return set(axis, v);
      }}
      trailing={<select className="size-mode" aria-label={`${label} sizing`} value={mode} title={`${label} sizing. CSS follows the stylesheet. Fill uses available parent space.`} onChange={(e) => { setSizeMode(styled, axis, e.target.value as SizeMode, measured); if (e.target.value !== "fixed" && read("aspect-ratio") !== "auto") styled.style.aspectRatio = "auto"; onChange(); }}>
        <option value="css">CSS</option><option value="fixed">Fixed</option><option value="hug">Hug</option><option value="fill">Fill</option>{mode === "custom" && <option value="custom">Custom</option>}
      </select>} />;
  };
  const paddingControls = <>
    <div className="property-subheading"><span>Padding</span><button className="small-toggle" aria-label="Individual padding" aria-pressed={individualPadding} onClick={() => setIndividualPadding(!individualPadding)}>{individualPadding ? "All sides" : "Individual sides"}</button></div>
    {individualPadding ? <><Row>{property("Padding top", "padding-top", "T")}{property("Padding right", "padding-right", "R")}</Row><Row>{property("Padding bottom", "padding-bottom", "B")}{property("Padding left", "padding-left", "L")}</Row></> : property("Padding", "padding", "All")}
  </>;
  const overrides = styled.style.length;

  return <>
    <div className="selection-summary"><strong title={layerName(element)}>{layerName(element)}</strong><span className="node-badge">{element.tagName.toLowerCase()}</span></div>
    <div className="selection-meta">{overrides ? `${overrides} inline ${overrides === 1 ? "override" : "overrides"}` : "Using stylesheet values"}<span title="Blue markers identify properties set on this element.">CSS</span></div>

    <Section title={isFlex || isGrid ? "Auto layout" : "Layout"} onReset={resetGroup([...layoutProps, ...paddingProps.filter((p) => p.startsWith("padding")), "width", "height", "min-width", "max-width", "min-height", "max-height", "flex-grow", "flex-shrink", "flex-basis", "aspect-ratio"])}>
      <Segmented label="Layout" value={isFlex ? "flex" : isGrid ? "grid" : display} options={[{ value: "block", label: "Block" }, { value: "flex", label: "Flex" }, { value: "grid", label: "Grid" }]} onChange={(v) => set("display", v)} />
      {!['block', 'flex', 'grid'].includes(display) && <SelectField label="Display" value={display} options={["block", "flex", "grid", "inline", "inline-block", "inline-flex", "inline-grid", "none"]} onCommit={(v) => set("display", v)} />}
      <div className="property-subheading"><span>Resizing</span><div><button className="small-toggle" aria-label="Lock aspect ratio" aria-pressed={read("aspect-ratio") !== "auto"} onClick={() => {
        if (read("aspect-ratio") !== "auto") { set("aspect-ratio", "auto"); return; }
        const { width: w, height: h } = getLayoutSize(element);
        setSize(styled, { width: w, height: h });
        styled.style.aspectRatio = `${parseFloat(getComputedStyle(element).width) || w} / ${parseFloat(getComputedStyle(element).height) || h}`;
        onChange();
      }}>{read("aspect-ratio") !== "auto" ? "Ratio locked" : "Lock ratio"}</button><button className="small-toggle" aria-expanded={showConstraints} onClick={() => setShowConstraints(!showConstraints)}>Min / Max</button></div></div>
      <Row>{sizeField("width")}{sizeField("height")}</Row>
      {showConstraints && <><Row>{property("Minimum width", "min-width", "Min W")}{property("Maximum width", "max-width", "Max W")}</Row><Row>{property("Minimum height", "min-height", "Min H")}{property("Maximum height", "max-height", "Max H")}</Row><p className="property-note">Min / Max follow the CSS box model. In content-box, padding and borders add to these limits.</p></>}
      {isFlex && <>
        <Segmented label="Direction" value={read("flex-direction")} options={[{ value: "row", label: "Horizontal" }, { value: "column", label: "Vertical" }]} onChange={(v) => set("flex-direction", v)} />
        <SelectField label="Wrap" value={read("flex-wrap")} options={[{ value: "nowrap", label: "No wrap" }, { value: "wrap", label: "Wrap" }, { value: "wrap-reverse", label: "Reverse wrap" }]} onCommit={(v) => set("flex-wrap", v)} />
      </>}
      {(isFlex || isGrid) && <>
        <div className="layout-alignment">
          <div className="alignment-grid" role="group" aria-label="Content alignment">
            {["flex-start", "center", "flex-end"].flatMap((vertical, row) => ["flex-start", "center", "flex-end"].map((horizontal, column) => {
              const columnDirection = isFlex && read("flex-direction").startsWith("column");
              const reverse = read("flex-direction").endsWith("reverse");
              const rtl = computed.direction === "rtl";
              const flipX = columnDirection || !isFlex ? rtl : rtl !== reverse;
              const flipY = isFlex && (columnDirection ? reverse : read("flex-wrap") === "wrap-reverse");
              const flip = (v: string, reversed: boolean) => !reversed || v === "center" ? v : v === "flex-start" ? "flex-end" : "flex-start";
              const x = flip(horizontal, flipX);
              const y = flip(vertical, flipY);
              const justify = columnDirection ? y : x;
              const align = columnDirection ? x : y;
              const active = read("justify-content") === justify && read("align-items") === align;
              return <button key={`${row}-${column}`} aria-label={`Align ${["top", "middle", "bottom"][row]} ${["left", "center", "right"][column]}`} aria-pressed={active} onClick={() => { styled.style.justifyContent = justify; styled.style.alignItems = align; onChange(); }}><span /></button>;
            }))}
          </div>
          <div className="alignment-options"><SelectField label="Distribute" value={read("justify-content")} options={[{ value: "normal", label: "Default" }, { value: "flex-start", label: "Start" }, { value: "center", label: "Center" }, { value: "flex-end", label: "End" }, { value: "space-between", label: "Space between" }, { value: "space-around", label: "Space around" }, { value: "space-evenly", label: "Space evenly" }]} onCommit={(v) => set("justify-content", v)} /><SelectField label="Align" value={read("align-items")} options={[{ value: "normal", label: "Default" }, { value: "stretch", label: "Stretch" }, { value: "flex-start", label: "Start" }, { value: "center", label: "Center" }, { value: "flex-end", label: "End" }, { value: "baseline", label: "Baseline" }]} onCommit={(v) => set("align-items", v)} /></div>
        </div>
        <Row>{property("Column gap", "column-gap", "↔")}{property("Row gap", "row-gap", "↕")}</Row>
      </>}
      {isGrid && <><Field label="Grid columns" prefix="Cols" value={read("grid-template-columns")} onCommit={(v) => set("grid-template-columns", v)} onReset={resetProperty("grid-template-columns")} /><Field label="Grid rows" prefix="Rows" value={read("grid-template-rows")} onCommit={(v) => set("grid-template-rows", v)} onReset={resetProperty("grid-template-rows")} /></>}
      {paddingControls}
      <label className="property-checkbox"><input type="checkbox" checked={["hidden", "clip"].includes(read("overflow"))} onChange={(e) => set("overflow", e.target.checked ? "hidden" : "visible")} />Clip content</label>
    </Section>

    <Section title="Spacing" defaultOpen={false} onReset={resetGroup(paddingProps.filter((p) => p.startsWith("margin")))}>
      <div className="property-subheading"><span>Margin</span></div>
      {property("Margin", "margin", "All")}
      <Row>{property("Margin top", "margin-top", "T")}{property("Margin right", "margin-right", "R")}</Row>
      <Row>{property("Margin bottom", "margin-bottom", "B")}{property("Margin left", "margin-left", "L")}</Row>
    </Section>

    {hasText && <Section title="Typography" onReset={resetGroup(typographyProps)}>
      <Field label="Font family" value={read("font-family")} onCommit={(v) => set("font-family", v)} onReset={resetProperty("font-family")} suggestions={["Arial, sans-serif", "Helvetica, sans-serif", "Inter, sans-serif", "Geist, sans-serif", "Georgia, serif", "system-ui", "monospace"].map((value) => ({ value }))} />
      <Row><SelectField label="Weight" value={read("font-weight")} options={[{ value: "100", label: "Thin" }, { value: "200", label: "Extra light" }, { value: "300", label: "Light" }, { value: "400", label: "Regular" }, { value: "500", label: "Medium" }, { value: "600", label: "Semibold" }, { value: "700", label: "Bold" }, { value: "800", label: "Extra bold" }, { value: "900", label: "Black" }]} onCommit={(v) => set("font-weight", v)} /><Field label="Font size" prefix="Size" value={trimNumber(read("font-size"))} suggestions={[10,11,12,13,14,16,18,20,24,28,32,36,40,48,64,72,96,128].map((size) => ({ value: String(size) }))} onCommit={(v) => set("font-size", withPx(v))} onReset={resetProperty("font-size")} /></Row>
      <Row>{property("Line height", "line-height", "Line", false)}{property("Letter spacing", "letter-spacing", "Track")}</Row>
      <Segmented label="Text alignment" value={read("text-align")} options={[{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }]} onChange={(v) => set("text-align", v)} />
      <ColorField label="Text color" value={computed.color} onCommit={(v) => set("color", v)} onReset={resetProperty("color")} />
      {element.children.length === 0 && <TextArea value={element.textContent ?? ""} onCommit={(v) => { element.textContent = v; onChange(); }} />}
    </Section>}

    <Section title="Appearance" onReset={resetGroup(["opacity", "border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"])}>
      <Row><Field label="Opacity" prefix="Opacity" suffix="%" value={String(Math.round(parseFloat(read("opacity") || "1") * 100))} onCommit={(v) => set("opacity", String(Math.min(100, Math.max(0, number(v, 100))) / 100))} onReset={resetProperty("opacity")} />{property("Corner radius", "border-radius", "Radius")}</Row>
      <div className="property-subheading"><span>Corners</span><button className="small-toggle" aria-label="Individual corners" aria-pressed={individualCorners} onClick={() => setIndividualCorners(!individualCorners)}>Individual corners</button></div>
      {individualCorners && <><Row>{property("Top left radius", "border-top-left-radius", "TL")}{property("Top right radius", "border-top-right-radius", "TR")}</Row><Row>{property("Bottom left radius", "border-bottom-left-radius", "BL")}{property("Bottom right radius", "border-bottom-right-radius", "BR")}</Row></>}
    </Section>

    <Section title="Fill" onReset={resetGroup(["background", "background-color", "background-image", "background-size", "background-position"])}>
      <ColorField label="Fill color" value={computed.backgroundColor} onCommit={(v) => set("background-color", v)} onReset={resetProperty("background-color")} />
      <div className="property-subheading"><span>Image or gradient</span></div>
      <GradientEditor value={read("background-image")} computedValue={computed.backgroundImage} onCommit={(v) => set("background-image", v)} />
      {read("background-image") !== "none" && <><SelectField label="Image sizing" value={read("background-size")} options={[{ value: "auto", label: "Original size" }, { value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }]} onCommit={(v) => set("background-size", v)} /><Field label="Background position" prefix="Position" value={read("background-position")} onCommit={(v) => set("background-position", v)} /></>}
    </Section>

    <Section title="Stroke" defaultOpen={false} onReset={resetGroup(["border", "border-width", "border-style", "border-color", ...["top", "right", "bottom", "left"].flatMap((side) => [`border-${side}`, `border-${side}-width`, `border-${side}-style`, `border-${side}-color`])])}>
      <Row><Field label="Stroke width" prefix="Size" value={trimNumber(read("border-width"))} onReset={resetProperty("border-width")} onCommit={(v) => {
        if (!CSS.supports("border-width", withPx(v))) return false;
        styled.style.borderWidth = withPx(v);
        if (read("border-style") === "none") styled.style.borderStyle = "solid";
        onChange(); return true;
      }} /><SelectField label="Style" value={read("border-style")} options={["none", "solid", "dashed", "dotted", "double"]} onCommit={(v) => set("border-style", v)} /></Row>
      <div className="property-subheading"><span>Sides</span><button className="small-toggle" aria-label="Individual strokes" aria-pressed={individualStroke} onClick={() => setIndividualStroke(!individualStroke)}>Individual strokes</button></div>
      {individualStroke && <div className="property-row">{["top", "right", "bottom", "left"].map((side) => <Field key={side} label={`Stroke ${side} width`} prefix={side[0].toUpperCase()} value={trimNumber(read(`border-${side}-width`))} onReset={resetGroup([`border-${side}-width`, `border-${side}-style`])} onCommit={(v) => {
        if (!CSS.supports(`border-${side}-width`, withPx(v))) return false;
        styled.style.setProperty(`border-${side}-width`, withPx(v));
        if (read(`border-${side}-style`) === "none") styled.style.setProperty(`border-${side}-style`, "solid");
        onChange(); return true;
      }} />)}</div>}
      <ColorField label="Stroke color" value={computed.borderTopColor} onCommit={(v) => set("border-color", v)} onReset={resetProperty("border-color")} />
    </Section>

    <Section title="Position" defaultOpen={false} onReset={resetGroup(["position", "translate", "rotate", "z-index"])}>
      <SelectField label="Position" value={read("position")} options={["static", "relative", "absolute", "fixed", "sticky"]} onCommit={(v) => set("position", v)} />
      <Row><Field prefix="X" label="X" value={String(geometry.x)} onCommit={(v) => moveTo(number(v, geometry.x), geometry.y)} /><Field prefix="Y" label="Y" value={String(geometry.y)} onCommit={(v) => moveTo(geometry.x, number(v, geometry.y))} /></Row>
      <Row><Field prefix="Angle" label="Rotation" suffix="°" value={read("rotate") === "none" ? "0" : read("rotate").replace(/deg$/, "")} onCommit={(v) => set("rotate", `${number(v, 0)}deg`)} />{property("Z index", "z-index", "Z", false)}</Row>
      <p className="property-note">X and Y move the element visually; its place in the document flow stays the same.</p>
    </Section>

    <Section title="Effects" defaultOpen={false} onReset={resetGroup(["box-shadow", "overflow"])}>
      <ShadowEditor value={read("box-shadow")} computedValue={computed.boxShadow} onCommit={(v) => set("box-shadow", v)} />
      <SelectField label="Overflow" value={read("overflow")} options={["visible", "hidden", "clip", "auto", "scroll"]} onCommit={(v) => set("overflow", v)} />
    </Section>
    <div className="inspector-footnote">↑ ↓ to adjust values · Shift for 10 · Alt for 0.1<br />Blue markers show inline overrides. Reset returns to the stylesheet.</div>
  </>;
}

function frameGeometry(element: Element) {
  const root = element.getRootNode();
  const host = root instanceof ShadowRoot ? (root.host as HTMLElement) : null;
  const rect = element.getBoundingClientRect();
  if (!host) return { x: 0, y: 0, width: rect.width, height: rect.height };
  const parent = host.getBoundingClientRect();
  const zoom = parent.width / host.offsetWidth || 1;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { x: round((rect.left - parent.left) / zoom), y: round((rect.top - parent.top) / zoom), width: round(rect.width / zoom), height: round(rect.height / zoom) };
}
function trimNumber(value: string) { return value.split(/\s+/).map((part) => /^-?\d*\.?\d+px$/.test(part) ? String(Math.round(parseFloat(part) * 100) / 100) : part).join(" "); }
function number(value: string, fallback: number) { const n = parseFloat(value); return Number.isFinite(n) ? Math.round(n * 100) / 100 : fallback; }
function withPx(value: string) { return value.split(/\s+/).map((part) => /^-?\d*\.?\d+$/.test(part) ? `${part}px` : part).join(" "); }
