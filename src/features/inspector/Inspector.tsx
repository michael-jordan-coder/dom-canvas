import { useState } from "react";
import { getTranslate, setSize, setTranslate } from "@/features/canvas/elementStyle";
import type { Artboard, Selection } from "@/features/canvas/types";
import { layerName } from "@/features/layers/Layers";
import { ColorField, Field, Row, Section, Segmented, SelectField, TextArea } from "./InspectorControls";

type Props = {
  selection: Selection;
  artboards: Artboard[];
  onUpdateArtboard: (id: string, patch: Partial<Artboard>) => void;
  version: number;
  onChange: () => void;
};

export function Inspector({ selection, artboards, onUpdateArtboard, onChange }: Props) {
  if (selection.kind === "none") return <div className="inspector-empty"><strong>Nothing selected</strong><p>Select a frame or an element to edit its properties.</p><span>⌘/Ctrl-click selects the frame.<br />Alt-click selects a parent.</span></div>;
  if (selection.kind === "artboard") {
    const ab = artboards.find((item) => item.id === selection.artboardId);
    if (!ab) return null;
    const update = (patch: Partial<Artboard>) => onUpdateArtboard(ab.id, patch);
    const measuredHeight = document.querySelector<HTMLElement>(`[data-artboard="${ab.id}"]`)?.offsetHeight ?? 100;
    return <>
      <div className="selection-summary"><strong>{ab.name}</strong><span className="node-badge frame-badge">Frame</span></div>
      <Section title="Frame">
        <Field label="Frame name" value={ab.name} onCommit={(name) => update({ name: name || ab.name })} />
        <Segmented label="Frame preset" value={String(ab.width)} options={[{ value: "390", label: "Mobile" }, { value: "768", label: "Tablet" }, { value: "1440", label: "Desktop" }]} onChange={(v) => update({ width: Number(v) })} />
        <Row><Field prefix="W" label="Frame width" value={String(ab.width)} onCommit={(v) => update({ width: Math.max(1, number(v, ab.width)) })} /><Field prefix="H" label="Frame height" value={ab.height === undefined ? "Hug" : String(ab.height)} onCommit={(v) => update({ height: /^hug$/i.test(v) ? undefined : Math.max(1, number(v, measuredHeight)) })} /></Row>
        <Segmented label="Frame height mode" value={ab.height === undefined ? "hug" : "fixed"} options={[{ value: "hug", label: "Hug content" }, { value: "fixed", label: "Fixed height" }]} onChange={(mode) => update({ height: mode === "hug" ? undefined : measuredHeight })} />
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
  const overrides = styled.style.length;

  return <>
    <div className="selection-summary"><strong title={layerName(element)}>{layerName(element)}</strong><span className="node-badge">{element.tagName.toLowerCase()}</span></div>
    <div className="selection-meta">{overrides ? `${overrides} inline ${overrides === 1 ? "override" : "overrides"}` : "Using stylesheet values"}<span title="Blue markers identify properties set on this element.">CSS</span></div>

    <Section title="Layout" onReset={resetGroup(layoutProps)}>
      <Segmented label="Layout" value={isFlex ? "flex" : isGrid ? "grid" : display} options={[{ value: "block", label: "Block" }, { value: "flex", label: "Flex" }, { value: "grid", label: "Grid" }]} onChange={(v) => set("display", v)} />
      {!['block', 'flex', 'grid'].includes(display) && <SelectField label="Display" value={display} options={["block", "flex", "grid", "inline", "inline-block", "inline-flex", "inline-grid", "none"]} onCommit={(v) => set("display", v)} />}
      <Row>
        <Field prefix="W" label="Width" value={trimNumber(styled.style.width) || String(geometry.width)} onReset={resetProperty("width")} onCommit={(v) => { if (/^-?\d*\.?\d+$/.test(v)) { setSize(styled, { width: number(v, geometry.width) }); onChange(); return true; } return set("width", v); }} />
        <Field prefix="H" label="Height" value={trimNumber(styled.style.height) || String(geometry.height)} onReset={resetProperty("height")} onCommit={(v) => { if (/^-?\d*\.?\d+$/.test(v)) { setSize(styled, { height: number(v, geometry.height) }); onChange(); return true; } return set("height", v); }} />
      </Row>
      {isFlex && <>
        <Segmented label="Direction" value={read("flex-direction")} options={[{ value: "row", label: "Horizontal" }, { value: "column", label: "Vertical" }]} onChange={(v) => set("flex-direction", v)} />
        <SelectField label="Wrap" value={read("flex-wrap")} options={["nowrap", "wrap", "wrap-reverse"]} onCommit={(v) => set("flex-wrap", v)} />
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
          <div className="alignment-options"><SelectField label="Distribute" value={read("justify-content")} options={["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]} onCommit={(v) => set("justify-content", v)} /><SelectField label="Align" value={read("align-items")} options={["stretch", "flex-start", "center", "flex-end", "baseline"]} onCommit={(v) => set("align-items", v)} /></div>
        </div>
        <Row>{property("Column gap", "column-gap", "↔")}{property("Row gap", "row-gap", "↕")}</Row>
      </>}
      {isGrid && <><Field label="Grid columns" prefix="Cols" value={read("grid-template-columns")} onCommit={(v) => set("grid-template-columns", v)} onReset={resetProperty("grid-template-columns")} /><Field label="Grid rows" prefix="Rows" value={read("grid-template-rows")} onCommit={(v) => set("grid-template-rows", v)} onReset={resetProperty("grid-template-rows")} /></>}
    </Section>

    <Section title="Spacing" defaultOpen={!hasText} onReset={resetGroup(paddingProps)}>
      <div className="property-subheading"><span>Padding</span><button className="small-toggle" aria-pressed={individualPadding} onClick={() => setIndividualPadding(!individualPadding)}>{individualPadding ? "All sides" : "Individual sides"}</button></div>
      {individualPadding ? <><Row>{property("Padding top", "padding-top", "T")}{property("Padding right", "padding-right", "R")}</Row><Row>{property("Padding bottom", "padding-bottom", "B")}{property("Padding left", "padding-left", "L")}</Row></> : property("Padding", "padding", "All")}
      <div className="property-subheading"><span>Margin</span></div>
      {property("Margin", "margin", "All")}
    </Section>

    {hasText && <Section title="Typography" onReset={resetGroup(typographyProps)}>
      <Field label="Font family" value={read("font-family")} onCommit={(v) => set("font-family", v)} onReset={resetProperty("font-family")} />
      <Row>{property("Font size", "font-size", "Size")}<Field label="Font weight" prefix="Wt" value={read("font-weight")} onCommit={(v) => set("font-weight", v)} onReset={resetProperty("font-weight")} /></Row>
      <Row>{property("Line height", "line-height", "Line", false)}{property("Letter spacing", "letter-spacing", "Track")}</Row>
      <Segmented label="Text alignment" value={read("text-align")} options={[{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }]} onChange={(v) => set("text-align", v)} />
      <ColorField label="Text color" value={computed.color} onCommit={(v) => set("color", v)} onReset={resetProperty("color")} />
      {element.children.length === 0 && <TextArea value={element.textContent ?? ""} onCommit={(v) => { element.textContent = v; onChange(); }} />}
    </Section>}

    <Section title="Appearance" onReset={resetGroup(["opacity", "border-radius", "background-color"])}>
      <Row><Field label="Opacity" prefix="Opacity" suffix="%" value={String(Math.round(parseFloat(read("opacity") || "1") * 100))} onCommit={(v) => set("opacity", String(Math.min(100, Math.max(0, number(v, 100))) / 100))} onReset={resetProperty("opacity")} />{property("Corner radius", "border-radius", "Radius")}</Row>
      <div className="property-subheading"><span>Fill</span></div>
      <ColorField label="Fill color" value={computed.backgroundColor} onCommit={(v) => set("background-color", v)} onReset={resetProperty("background-color")} />
    </Section>

    <Section title="Stroke" defaultOpen={false} onReset={resetGroup(["border", "border-width", "border-style", "border-color"])}>
      <Row><Field label="Stroke width" prefix="Size" value={trimNumber(read("border-width"))} onReset={resetProperty("border-width")} onCommit={(v) => {
        if (!CSS.supports("border-width", withPx(v))) return false;
        styled.style.borderWidth = withPx(v);
        if (read("border-style") === "none") styled.style.borderStyle = "solid";
        onChange(); return true;
      }} /><SelectField label="Style" value={read("border-style")} options={["none", "solid", "dashed", "dotted", "double"]} onCommit={(v) => set("border-style", v)} /></Row>
      <ColorField label="Stroke color" value={computed.borderTopColor} onCommit={(v) => set("border-color", v)} onReset={resetProperty("border-color")} />
    </Section>

    <Section title="Position" defaultOpen={false} onReset={resetGroup(["position", "translate", "rotate", "z-index"])}>
      <SelectField label="Position" value={read("position")} options={["static", "relative", "absolute", "fixed", "sticky"]} onCommit={(v) => set("position", v)} />
      <Row><Field prefix="X" label="X" value={String(geometry.x)} onCommit={(v) => moveTo(number(v, geometry.x), geometry.y)} /><Field prefix="Y" label="Y" value={String(geometry.y)} onCommit={(v) => moveTo(geometry.x, number(v, geometry.y))} /></Row>
      <Row><Field prefix="Angle" label="Rotation" suffix="°" value={read("rotate") === "none" ? "0" : read("rotate").replace(/deg$/, "")} onCommit={(v) => set("rotate", `${number(v, 0)}deg`)} />{property("Z index", "z-index", "Z", false)}</Row>
      <p className="property-note">X and Y move the element visually; its place in the document flow stays the same.</p>
    </Section>

    <Section title="Effects" defaultOpen={false} onReset={resetGroup(["box-shadow", "overflow"])}>
      <Field label="Box shadow" value={read("box-shadow")} onCommit={(v) => set("box-shadow", v)} onReset={resetProperty("box-shadow")} />
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
