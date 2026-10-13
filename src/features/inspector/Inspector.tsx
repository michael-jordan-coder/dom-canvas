import { InspectorIcon } from "./InspectorIcon";
import { rotationField, rotationInput } from "@/features/canvas/rotation";
import { useRef, type ReactNode } from "react";
import { InspectorScope, useInspectorDisclosure } from "./InspectorPreferences";
import { getLayoutSize, getTranslate, setSize, setTranslate, screenDeltaToLocal } from "@/features/canvas/elementStyle";
import { SvgInspector } from "./SvgInspector";
import { ImageControls } from "./ImageControls";
import { LayoutItemControls } from "./LayoutItemControls";
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
      const attributes = Array.from(element.attributes).map((attribute) => ({ name: attribute.name, value: attribute.value, namespace: attribute.namespaceURI }));
      session.current = { dirty: false, restore: () => {
        Array.from(element.attributes).forEach((attribute) => element.removeAttributeNode(attribute));
        attributes.forEach((attribute) => element.setAttributeNS(attribute.namespace, attribute.name, attribute.value));
        props.onPreview();
      } };
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
  const scope = props.selection.kind === "artboard" ? "frame" : props.selection.kind === "element" && props.selection.element instanceof SVGElement ? "svg" : "html";
  return <InspectorScope.Provider value={scope}><InspectorEdits.Provider value={{ begin, finish }}><InspectorContent {...props}
    onChange={() => { if (session.current) { session.current.dirty = true; props.onPreview(); } else props.onChange(); }}
    onUpdateArtboard={(id, patch) => { if (session.current) { session.current.dirty = true; props.onPreviewArtboard(id, patch); } else props.onUpdateArtboard(id, patch); }}
  /></InspectorEdits.Provider></InspectorScope.Provider>;
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
        <div className="sizing-row"><Row><Field prefix="W" label="Frame width" value={String(ab.width)} onCommit={(v) => { if (!/^\d*\.?\d+$/.test(v) || Number(v) < 1) return false; update({ width: Number(v) }); }} /><Field prefix="H" label="Frame height" value={String(ab.height ?? measuredHeight)} onCommit={(v) => { if (!/^\d*\.?\d+$/.test(v) || Number(v) < 1) return false; update({ height: Number(v) }); }} trailing={<select className="size-mode" data-mode={ab.height === undefined ? "hug" : "fixed"} aria-label="Frame height sizing" value={ab.height === undefined ? "hug" : "fixed"} onChange={(e) => onUpdateArtboard(ab.id, { height: e.target.value === "hug" ? undefined : measuredHeight, aspectRatio: undefined })}><option value="hug">Hug</option><option value="fixed">Fixed</option></select>} /></Row><button className="inspector-icon" title="Lock frame aspect ratio" aria-label="Lock frame aspect ratio" aria-pressed={!!ab.aspectRatio} onClick={() => onUpdateArtboard(ab.id, { aspectRatio: ab.aspectRatio ? undefined : ab.width / measuredHeight, ...(ab.aspectRatio ? {} : { height: measuredHeight }) })}><InspectorIcon name="ratio" /></button></div>
      </Section>
      <Section title="Position">
        <Row><Field prefix="X" label="Frame X" value={String(ab.x)} onCommit={(v) => update({ x: number(v, ab.x) })} /><Field prefix="Y" label="Frame Y" value={String(ab.y)} onCommit={(v) => update({ y: number(v, ab.y) })} /></Row>
      </Section>
      <div className="inspector-footnote">Frame size controls the canvas bounds. Select an element inside to edit its layout and appearance.</div>
    </>;
  }
  const el = selection.element;
  if (!el.isConnected) return <div className="empty">Layer was removed.</div>;
  if (el instanceof SVGElement) return <SvgInspector key={elementKey(el)} element={el} onChange={onChange} />;
  return <ElementInspector key={elementKey(el)} element={el} onChange={onChange} />;
}

const elementKeys = new WeakMap<Element, number>();
let nextElementKey = 0;
function elementKey(element: Element) {
  if (!elementKeys.has(element)) elementKeys.set(element, ++nextElementKey);
  return elementKeys.get(element)!;
}

function ElementInspector({ element, onChange }: { element: Element; onChange: () => void }) {
  const [individualPadding, setIndividualPadding] = useInspectorDisclosure("padding-sides", false);
  const [individualCorners, setIndividualCorners] = useInspectorDisclosure("corners", false);
  const [individualStroke, setIndividualStroke] = useInspectorDisclosure("stroke-sides", false);
  const [showConstraints, setShowConstraints] = useInspectorDisclosure("constraints", false);
  const [layoutOptions, setLayoutOptions] = useInspectorDisclosure("layout-options", false);
  const [typeOptions, setTypeOptions] = useInspectorDisclosure("type-options", false);
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
  const property = (label: string, prop: string, prefix?: ReactNode, length = true) => <Field label={label} prefix={prefix} value={length ? trimNumber(read(prop)) : read(prop)} onCommit={(v) => set(prop, length ? withPx(v) : v)} onReset={resetProperty(prop)} />;
  const geometry = frameGeometry(element);
  const moveTo = (x: number, y: number) => {
    const current = getTranslate(styled);
    const offset = screenDeltaToLocal(element, (x - geometry.x) * geometry.zoom, (y - geometry.y) * geometry.zoom);
    setTranslate(styled, current.x + offset.x, current.y + offset.y);
    onChange();
  };
  const display = read("display");
  const isFlex = display.includes("flex");
  const isGrid = display.includes("grid");
  const layoutProps = ["display", "flex-direction", "flex-wrap", "justify-content", "justify-items", "align-items", "direction", "gap", "row-gap", "column-gap", "grid-template-columns", "grid-template-rows", "overflow"];
  const paddingProps = ["padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left"];
  const typographyProps = ["font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "word-spacing", "text-align", "text-transform", "text-decoration-line", "white-space", "color"];
  const decorationLines = computed.textDecorationLine.split(/\s+/).filter(value => value !== "none");
  const toggleDecoration = (line: string) => {
    const next = decorationLines.includes(line) ? decorationLines.filter(value => value !== line) : [...decorationLines, line];
    set("text-decoration-line", next.join(" ") || "none");
  };
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
      trailing={<select className="size-mode" data-mode={mode} aria-label={`${label} sizing`} value={mode} title={`${label}: ${mode === "css" ? "Stylesheet" : mode}. CSS follows the stylesheet. Fill uses available parent space.`} onChange={(e) => { setSizeMode(styled, axis, e.target.value as SizeMode, measured); if (e.target.value !== "fixed" && read("aspect-ratio") !== "auto") styled.style.aspectRatio = "auto"; onChange(); }}>
        <option value="css">CSS</option><option value="fixed">Fixed</option><option value="hug">Hug</option><option value="fill">Fill</option>{mode === "custom" && <option value="custom">Custom</option>}
      </select>} />;
  };
  const paddingPair = (axis: "horizontal" | "vertical") => {
    const sides = axis === "horizontal" ? ["padding-left", "padding-right"] : ["padding-top", "padding-bottom"];
    const values = sides.map(read);
    return <Field label={`${axis === "horizontal" ? "Horizontal" : "Vertical"} padding`} prefix={<InspectorIcon name={axis} />} value={values[0] === values[1] ? trimNumber(values[0]) : "Mixed"} onReset={resetGroup(sides)} onCommit={(value) => {
      const next = withPx(value);
      if (!sides.every((side) => CSS.supports(side, next))) return false;
      sides.forEach((side) => styled.style.setProperty(side, next));
      onChange(); return true;
    }} />;
  };
  const paddingControls = <>
    <div className="property-subheading"><span>Padding</span><button className="inspector-icon" title="Individual padding" aria-label="Individual padding" aria-pressed={individualPadding} onClick={() => setIndividualPadding(!individualPadding)}><InspectorIcon name="padding" /></button></div>
    {individualPadding ? <><Row>{property("Padding top", "padding-top", "T")}{property("Padding right", "padding-right", "R")}</Row><Row>{property("Padding bottom", "padding-bottom", "B")}{property("Padding left", "padding-left", "L")}</Row></> : <Row>{paddingPair("horizontal")}{paddingPair("vertical")}</Row>}
  </>;
  const overrides = styled.style.length;

  return <>
    <div className="selection-summary"><strong title={layerName(element)}>{layerName(element)}</strong><span className="node-badge">{element.tagName.toLowerCase()}</span></div>
    <div className="selection-meta">{overrides ? `${overrides} inline ${overrides === 1 ? "override" : "overrides"}` : "Using stylesheet values"}<span title="Blue markers identify properties set on this element.">CSS</span></div>
    {element instanceof HTMLImageElement && <ImageControls image={element} onChange={onChange} />}

    <Section preferenceKey="layout" title={isFlex ? "Auto layout" : isGrid ? "Grid layout" : "Layout"} actions={<button className="inspector-icon" title="Min / Max constraints" aria-label="Min / Max" aria-expanded={showConstraints} onClick={() => setShowConstraints(!showConstraints)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 5V3h10v2M3 11v2h10v-2M5 8h6M8 5v6" /></svg></button>} onReset={resetGroup([...layoutProps, ...paddingProps.filter((p) => p.startsWith("padding")), "width", "height", "min-width", "max-width", "min-height", "max-height", "flex-grow", "flex-shrink", "flex-basis", "aspect-ratio"])}>
      <Segmented label="Layout" value={isFlex ? "flex" : isGrid ? "grid" : display} options={[{ value: "block", label: "Block" }, { value: "flex", label: "Flex" }, { value: "grid", label: "Grid" }]} onChange={(v) => set("display", v)} />
      {!['block', 'flex', 'grid'].includes(display) && <SelectField label="Display" value={display} options={["block", "flex", "grid", "inline", "inline-block", "inline-flex", "inline-grid", "none"]} onCommit={(v) => set("display", v)} />}
      <div className="sizing-row"><Row>{sizeField("width")}{sizeField("height")}</Row><button className="inspector-icon" title="Lock aspect ratio" aria-label="Lock aspect ratio" aria-pressed={read("aspect-ratio") !== "auto"} onClick={() => {
        if (read("aspect-ratio") !== "auto") { set("aspect-ratio", "auto"); return; }
        const { width: w, height: h } = getLayoutSize(element);
        setSize(styled, { width: w, height: h });
        styled.style.aspectRatio = `${parseFloat(getComputedStyle(element).width) || w} / ${parseFloat(getComputedStyle(element).height) || h}`;
        onChange();
      }}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 10 4-4M5 7l-1 1a2.8 2.8 0 0 0 4 4l1-1M7 5l1-1a2.8 2.8 0 0 1 4 4l-1 1" /></svg></button></div>
      {showConstraints && <><Row>{property("Minimum width", "min-width", "Min W")}{property("Maximum width", "max-width", "Max W")}</Row><Row>{property("Minimum height", "min-height", "Min H")}{property("Maximum height", "max-height", "Max H")}</Row><p className="property-note">Min / Max follow the CSS box model. In content-box, padding and borders add to these limits.</p></>}
      {(isFlex || isGrid) && <>
        <div className="flow-layout">
          <div className="flow-controls">
            {isFlex && <Segmented label="Direction" value={read("flex-direction").startsWith("column") ? "column" : "row"} options={[{ value: "row", label: "Horizontal", icon: <InspectorIcon name="flowHorizontal" /> }, { value: "column", label: "Vertical", icon: <InspectorIcon name="flowVertical" /> }]} onChange={(v) => set("flex-direction", `${v}${read("flex-direction").endsWith("reverse") ? "-reverse" : ""}`)} />}
            <Row>{property("Column gap", "column-gap", <InspectorIcon name="horizontal" />)}{property("Row gap", "row-gap", <InspectorIcon name="vertical" />)}</Row>
            {isGrid && <span className="property-note">Cell alignment</span>}
          </div>
          <div className="alignment-grid" role="group" aria-label="Content alignment">
            {["flex-start", "center", "flex-end"].flatMap((vertical, row) => ["flex-start", "center", "flex-end"].map((horizontal, column) => {
              const columnDirection = isFlex && read("flex-direction").startsWith("column");
              const reverse = read("flex-direction").endsWith("reverse");
              const rtl = computed.direction === "rtl";
              const wrapReverse = read("flex-wrap") === "wrap-reverse";
              const flipX = isFlex ? (columnDirection ? rtl !== wrapReverse : rtl !== reverse) : rtl;
              const flipY = isFlex && (columnDirection ? reverse : read("flex-wrap") === "wrap-reverse");
              const flip = (v: string, reversed: boolean) => !reversed || v === "center" ? v : v === "flex-start" ? "flex-end" : "flex-start";
              const x = flip(horizontal, flipX);
              const y = flip(vertical, flipY);
              const justify = isGrid ? x.replace("flex-", "") : columnDirection ? y : x;
              const align = isGrid ? y.replace("flex-", "") : columnDirection ? x : y;
              const horizontalProperty = isGrid ? "justify-items" : "justify-content";
              const active = read(horizontalProperty) === justify && read("align-items") === align;
              return <button key={`${row}-${column}`} aria-label={`Align ${["top", "middle", "bottom"][row]} ${["left", "center", "right"][column]}`} aria-pressed={active} onClick={() => { styled.style.setProperty(horizontalProperty, justify); styled.style.alignItems = align; onChange(); }}><span /></button>;
            }))}
          </div>
        </div>
        <details className="layout-details" open={layoutOptions} onToggle={(e) => setLayoutOptions(e.currentTarget.open)}>
          <summary aria-label="More layout settings"><span>Layout options</span><span className="layout-state">{[computed.direction === "rtl" ? "RTL" : "", isFlex && read("flex-direction").endsWith("reverse") ? "Reverse" : "", isFlex && read("flex-wrap") !== "nowrap" ? read("flex-wrap") === "wrap-reverse" ? "Wrap ↶" : "Wrap" : ""].filter(Boolean).join(" · ")}</span></summary>
          <div className="layout-details-body">
            <div className="alignment-options"><SelectField label="Distribute" value={read("justify-content")} options={[{ value: "normal", label: "Default" }, { value: "flex-start", label: "Start" }, { value: "center", label: "Center" }, { value: "flex-end", label: "End" }, { value: "space-between", label: "Space between" }, { value: "space-around", label: "Space around" }, { value: "space-evenly", label: "Space evenly" }]} onCommit={(v) => set("justify-content", v)} /><SelectField label="Align" value={read("align-items").replace(/^start$/, "flex-start").replace(/^end$/, "flex-end")} options={[{ value: "normal", label: "Default" }, { value: "stretch", label: "Stretch" }, { value: "flex-start", label: "Start" }, { value: "center", label: "Center" }, { value: "flex-end", label: "End" }, { value: "baseline", label: "Baseline" }]} onCommit={(v) => set("align-items", v)} /></div>
            {isFlex && <>
        <label className="property-checkbox"><input type="checkbox" checked={read("flex-direction").endsWith("reverse")} onChange={(e) => set("flex-direction", `${read("flex-direction").startsWith("column") ? "column" : "row"}${e.target.checked ? "-reverse" : ""}`)} />Reverse order</label>
        <SelectField label="Wrap" value={read("flex-wrap")} options={[{ value: "nowrap", label: "No wrap" }, { value: "wrap", label: "Wrap" }, { value: "wrap-reverse", label: "Reverse wrap" }]} onCommit={(v) => set("flex-wrap", v)} />
            </>}
            <SelectField label="Reading order" value={read("direction")} options={[{ value: "ltr", label: "Left to right" }, { value: "rtl", label: "Right to left" }]} onCommit={(v) => set("direction", v)} />
          </div>
        </details>
      </>}
      {isGrid && <><Field label="Grid columns" prefix="Cols" value={read("grid-template-columns")} onCommit={(v) => set("grid-template-columns", v)} onReset={resetProperty("grid-template-columns")} /><Field label="Grid rows" prefix="Rows" value={read("grid-template-rows")} onCommit={(v) => set("grid-template-rows", v)} onReset={resetProperty("grid-template-rows")} /></>}
      {paddingControls}
      <label className="property-checkbox"><input type="checkbox" checked={["hidden", "clip"].includes(read("overflow"))} onChange={(e) => set("overflow", e.target.checked ? "hidden" : "visible")} />Clip content</label>
    </Section>

    <LayoutItemControls element={element as HTMLElement} onChange={onChange} />

    <Section title="Spacing" defaultOpen={false} onReset={resetGroup(paddingProps.filter((p) => p.startsWith("margin")))}>
      <div className="property-subheading"><span>Margin</span></div>
      {property("Margin", "margin", "All")}
      <Row>{property("Margin top", "margin-top", "T")}{property("Margin right", "margin-right", "R")}</Row>
      <Row>{property("Margin bottom", "margin-bottom", "B")}{property("Margin left", "margin-left", "L")}</Row>
    </Section>

    {hasText && <Section title="Typography" onReset={resetGroup(typographyProps)}>
      <Field label="Font family" value={read("font-family")} onCommit={(v) => set("font-family", v)} onReset={resetProperty("font-family")} suggestions={["Arial, sans-serif", "Helvetica, sans-serif", "Inter, sans-serif", "Geist, sans-serif", "Georgia, serif", "system-ui", "monospace"].map((value) => ({ value }))} />
      <Row><SelectField label="Weight" value={read("font-weight")} options={[{ value: "100", label: "Thin" }, { value: "200", label: "Extra light" }, { value: "300", label: "Light" }, { value: "400", label: "Regular" }, { value: "500", label: "Medium" }, { value: "600", label: "Semibold" }, { value: "700", label: "Bold" }, { value: "800", label: "Extra bold" }, { value: "900", label: "Black" }]} onCommit={(v) => set("font-weight", v)} /><Field label="Font size" prefix="Size" value={trimNumber(read("font-size"))} suggestions={[10,11,12,13,14,16,18,20,24,28,32,36,40,48,64,72,96,128].map((size) => ({ value: String(size) }))} onCommit={(v) => set("font-size", withPx(v))} onReset={resetProperty("font-size")} /></Row>
      <Row>{property("Line height", "line-height", <InspectorIcon name="lineHeight" />, false)}{property("Letter spacing", "letter-spacing", <InspectorIcon name="tracking" />)}</Row>
      <Segmented label="Text alignment" value={read("text-align") === "left" ? (computed.direction === "rtl" ? "end" : "start") : read("text-align") === "right" ? (computed.direction === "rtl" ? "start" : "end") : read("text-align")} options={[{ value: "start", label: "Start", icon: <InspectorIcon name={computed.direction === "rtl" ? "end" : "start"} /> }, { value: "center", label: "Center", icon: <InspectorIcon name="center" /> }, { value: "end", label: "End", icon: <InspectorIcon name={computed.direction === "rtl" ? "start" : "end"} /> }, { value: "justify", label: "Justify", icon: <InspectorIcon name="justify" /> }]} onChange={(v) => set("text-align", v)} />
      <ColorField label="Text color" value={computed.color} onCommit={(v) => set("color", v)} onReset={resetProperty("color")} />
      <details className="layout-details" open={typeOptions} onToggle={(e) => setTypeOptions(e.currentTarget.open)}>
        <summary><span>Type options</span><span className="layout-state">{[computed.fontStyle !== "normal" ? "Italic" : "", decorationLines.includes("underline") ? "Underline" : "", decorationLines.includes("line-through") ? "Strike" : "", computed.textTransform !== "none" ? computed.textTransform : ""].filter(Boolean).join(" · ")}</span></summary>
        <div className="layout-details-body">
          <div className="segmented" role="group" aria-label="Text style">
            <button title="Italic" aria-label="Italic" aria-pressed={computed.fontStyle !== "normal"} onClick={() => set("font-style", computed.fontStyle === "normal" ? "italic" : "normal")}><InspectorIcon name="italic" /></button>
            <button title="Underline" aria-label="Underline" aria-pressed={decorationLines.includes("underline")} onClick={() => toggleDecoration("underline")}><InspectorIcon name="underline" /></button>
            <button title="Strikethrough" aria-label="Strikethrough" aria-pressed={decorationLines.includes("line-through")} onClick={() => toggleDecoration("line-through")}><InspectorIcon name="strikethrough" /></button>
          </div>
          <SelectField label="Case" value={read("text-transform")} options={[{ value: "none", label: "Original" }, { value: "uppercase", label: "UPPERCASE" }, { value: "lowercase", label: "lowercase" }, { value: "capitalize", label: "Title Case" }]} onCommit={(v) => set("text-transform", v)} />
          <SelectField label="Wrapping" value={read("white-space")} options={[{ value: "normal", label: "Wrap" }, { value: "nowrap", label: "No wrap" }, { value: "pre-wrap", label: "Preserve breaks" }, { value: "break-spaces", label: "Preserve spaces" }]} onCommit={(v) => set("white-space", v)} />
          {property("Word spacing", "word-spacing", "Words")}
        </div>
      </details>
      {element.children.length === 0 && <TextArea value={element.textContent ?? ""} onCommit={(v) => { element.textContent = v; onChange(); }} />}
    </Section>}

    <Section title="Appearance" actions={<button className="inspector-icon" title="Individual corners" aria-label="Individual corners" aria-pressed={individualCorners} onClick={() => setIndividualCorners(!individualCorners)}><InspectorIcon name="corners" /></button>} onReset={resetGroup(["opacity", "border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"])}>
      <Row><Field label="Opacity" prefix={<InspectorIcon name="opacity" />} suffix="%" value={String(Math.round(parseFloat(read("opacity") || "1") * 100))} onCommit={(v) => set("opacity", String(Math.min(100, Math.max(0, number(v, 100))) / 100))} onReset={resetProperty("opacity")} />{property("Corner radius", "border-radius", <InspectorIcon name="radius" />)}</Row>
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
      {individualStroke && ["top", "right", "bottom", "left"].map((side) => <div className="effect-layer" key={side}>
        <div className="property-subheading"><span>{side[0].toUpperCase() + side.slice(1)}</span>{resetGroup([`border-${side}-width`, `border-${side}-style`, `border-${side}-color`]) && <button className="small-toggle" aria-label={`Reset ${side} stroke`} onClick={() => reset([`border-${side}-width`, `border-${side}-style`, `border-${side}-color`])}>Reset</button>}</div>
        <Row><Field label={`Stroke ${side} width`} prefix="Width" value={trimNumber(read(`border-${side}-width`))} onCommit={(v) => {
          if (!CSS.supports(`border-${side}-width`, withPx(v))) return false;
          styled.style.setProperty(`border-${side}-width`, withPx(v));
          if (read(`border-${side}-style`) === "none") styled.style.setProperty(`border-${side}-style`, "solid");
          onChange(); return true;
        }} /><SelectField label={`Stroke ${side} style`} value={read(`border-${side}-style`)} options={["none", "solid", "dashed", "dotted", "double"]} onCommit={(v) => set(`border-${side}-style`, v)} /></Row>
        <ColorField label={`Stroke ${side} color`} value={computed.getPropertyValue(`border-${side}-color`)} onCommit={(v) => set(`border-${side}-color`, v)} />
      </div>)}
      <ColorField label="Stroke color" value={computed.borderTopColor} onCommit={(v) => set("border-color", v)} onReset={resetProperty("border-color")} />
    </Section>

    <Section title="Position" defaultOpen={false} onReset={resetGroup(["position", "top", "right", "bottom", "left", "translate", "rotate", "transform-origin", "z-index"])}>
      <SelectField label="Position mode" value={read("position")} options={[{ value: "static", label: "Normal flow" }, { value: "relative", label: "Relative" }, { value: "absolute", label: "Absolute" }, { value: "fixed", label: "Fixed" }, { value: "sticky", label: "Sticky" }]} onCommit={(v) => set("position", v)} />
      <p className="property-note">{["absolute", "fixed"].includes(read("position")) ? "Outside the document flow. Insets are relative to the containing block." : read("position") === "sticky" ? "Stays in flow and sticks within its scroll container. Set an inset to choose the sticky edge." : "Occupies space in the parent layout. Transforms move its appearance without moving siblings."}</p>
      {read("position") !== "static" && <><div className="property-subheading"><span>Insets</span></div><Row>{property("Left inset", "left", "Left")}{property("Top inset", "top", "Top")}</Row><Row>{property("Right inset", "right", "Right")}{property("Bottom inset", "bottom", "Bottom")}</Row></>}
      <div className="property-subheading"><span>Visual position in frame</span></div>
      <Row><Field prefix="X" label="X" value={String(geometry.x)} onCommit={(v) => moveTo(number(v, geometry.x), geometry.y)} /><Field prefix="Y" label="Y" value={String(geometry.y)} onCommit={(v) => moveTo(geometry.x, number(v, geometry.y))} /></Row>
      <Row><Field prefix={<InspectorIcon name="rotation" />} label="Rotation" {...rotationField(read("rotate"))} onCommit={(v) => set("rotate", rotationInput(v))} onReset={resetProperty("rotate")} />{property("Z index", "z-index", "Z", false)}</Row>
      <Field label="Transform origin" prefix="Origin" value={read("transform-origin")} onCommit={(v) => set("transform-origin", v)} onReset={resetProperty("transform-origin")} />
      {computed.transform !== "none" && <p className="property-note">Rotation adds to the existing CSS transform.</p>}
      <p className="property-note">X and Y adjust the visual transform. Insets control CSS placement.</p>
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
  if (!host) return { x: 0, y: 0, width: rect.width, height: rect.height, zoom: 1 };
  const parent = host.getBoundingClientRect();
  const zoom = parent.width / host.offsetWidth || 1;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { zoom, x: round((rect.left - parent.left) / zoom), y: round((rect.top - parent.top) / zoom), width: round(rect.width / zoom), height: round(rect.height / zoom) };
}
function trimNumber(value: string) { return value.split(/\s+/).map((part) => /^-?\d*\.?\d+px$/.test(part) ? String(Math.round(parseFloat(part) * 100) / 100) : part).join(" "); }
function number(value: string, fallback: number) { const n = parseFloat(value); return Number.isFinite(n) ? Math.round(n * 100) / 100 : fallback; }
function withPx(value: string) { return value.split(/\s+/).map((part) => /^-?\d*\.?\d+$/.test(part) ? `${part}px` : part).join(" "); }
