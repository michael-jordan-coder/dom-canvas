import { TextMetricField } from "./TextMetricField";
import { isLayerHidden, toggleLayerVisibility } from "@/features/layers/visibility";
import { FrameStyleSections } from "./FrameStyleSections";
import { TypeSettings } from "./TypeSettings";
import { frameGeometry } from "./inspectorGeometry";
import { propertyState, cssPropertyState, cornerRadiusState } from "./propertyState";
import { paddingPairValues } from "./sizingPolicy";
import { EditorTrigger } from "./FloatingEditor";
import { SizeModeMenu } from "./SizeModeMenu";
import { FilterEffects } from "./FilterEffects";
import { useSelectionRefresh } from "./useSelectionRefresh";
import { MultipleFramesInspector, type FramePatch } from "./MultipleFramesInspector";
import { MultipleInspector } from "./MultipleInspector";
import { FontWeightField } from "./FontWeightField";
import { splitCss, remapCssLayers } from "./cssList";
import { flippedScale } from "@/features/canvas/scale";
import { InspectorIcon } from "./InspectorIcon";
import { numericInput } from "./numeric";
import { lockedAncestor } from "@/features/layers/locking";
import { rotationField, rotationInput } from "@/features/canvas/rotation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { InspectorScope, useInspectorDisclosure } from "./InspectorPreferences";
import { getLayoutSize, getTranslate, setSize, setTranslate, screenDeltaToLocal } from "@/features/canvas/elementStyle";
import { SvgInspector } from "./SvgInspector";
import { ImageControls } from "./ImageControls";
import { LayoutItemControls } from "./LayoutItemControls";
import { GradientEditor } from "./GradientEditor";
import { ShadowEditor } from "./ShadowEditor";
import { CssVariables } from "./CssVariables";
import { isFlexMainAxis, setSizeMode, sizeMode, sizeModes, sizingProperties, type SizeAxis, type SizeMode } from "./sizing";
import type { Artboard, Selection } from "@/features/canvas/types";
import { layerName } from "@/features/layers/Layers";
import { ColorField, Field, InspectorEdits, Row, Section, Segmented, SelectField, TextArea } from "./InspectorControls";

type Props = {
  selection: Selection;
  hosts: Map<string, HTMLDivElement>;
  onUpdateArtboards: (patches: FramePatch[]) => void;
  onPreviewArtboards: (patches: FramePatch[]) => void;
  artboards: Artboard[];
  onUpdateArtboard: (id: string, patch: Partial<Artboard>) => void;
  version: number;
  onChange: () => void;
  onPreview: () => void;
  onPreviewArtboard: (id: string, patch: Partial<Artboard>) => void;
};

export function Inspector(props: Props) {
  useSelectionRefresh(props.selection, props.hosts);
  const session = useRef<{ dirty: boolean; restore: () => void } | null>(null);
  const begin = () => {
    if (session.current) finish(false);
    const selection = props.selection;
    if (selection.kind === "multiple") {
      const snapshots = selection.items.flatMap(item => item.kind === "element" ? [{ element: item.element, attributes: Array.from(item.element.attributes).map(attribute => ({ name: attribute.name, value: attribute.value, namespace: attribute.namespaceURI })) }] : []);
      const frames = props.artboards.filter(frame => selection.items.some(item => item.kind === "artboard" && item.artboardId === frame.id));
      session.current = { dirty: false, restore: () => {
        props.onPreviewArtboards(frames.map(frame => ({ id: frame.id, patch: { ...frame, height: frame.height, aspectRatio: frame.aspectRatio, backgroundColor: frame.backgroundColor, clipContent: frame.clipContent } })));
        snapshots.forEach(({ element, attributes }) => {
          Array.from(element.attributes).forEach(attribute => element.removeAttributeNode(attribute));
          attributes.forEach(attribute => element.setAttributeNS(attribute.namespace, attribute.name, attribute.value));
        });
        props.onPreview();
      } };
    } else if (selection.kind === "element") {
      const element = selection.element;
      const attributes = Array.from(element.attributes).map((attribute) => ({ name: attribute.name, value: attribute.value, namespace: attribute.namespaceURI }));
      session.current = { dirty: false, restore: () => {
        Array.from(element.attributes).forEach((attribute) => element.removeAttributeNode(attribute));
        attributes.forEach((attribute) => element.setAttributeNS(attribute.namespace, attribute.name, attribute.value));
        props.onPreview();
      } };
    } else if (selection.kind === "artboard") {
      const original = props.artboards.find((ab) => ab.id === selection.artboardId);
      if (original) session.current = { dirty: false, restore: () => props.onPreviewArtboard(original.id, { ...original, height: original.height, aspectRatio: original.aspectRatio, backgroundColor: original.backgroundColor, clipContent: original.clipContent }) };
    }
  };
  const finish = (cancel: boolean) => {
    const current = session.current;
    session.current = null;
    if (!current?.dirty) return;
    if (cancel) current.restore(); else props.onChange();
  };
  const selectionKey = props.selection.kind === "none" ? "none" : props.selection.kind === "multiple" ? props.selection.items.map(item => item.kind === "element" ? elementKey(item.element) : item.artboardId).join(":") : props.selection.kind === "element" ? elementKey(props.selection.element) : props.selection.artboardId;
  const scope = props.selection.kind === "multiple" ? "multiple" : props.selection.kind === "artboard" ? "frame" : props.selection.kind === "element" && props.selection.element instanceof SVGElement ? "svg" : "html";
  return <InspectorScope.Provider value={scope}><InspectorEdits.Provider value={{ begin, finish }}><InspectorContent key={selectionKey} {...props}
    onChange={() => { if (session.current) { session.current.dirty = true; props.onPreview(); } else props.onChange(); }}
    onUpdateArtboards={(patches) => { if (session.current) { session.current.dirty = true; props.onPreviewArtboards(patches); } else props.onUpdateArtboards(patches); }}
    onUpdateArtboard={(id, patch) => { if (session.current) { session.current.dirty = true; props.onPreviewArtboard(id, patch); } else props.onUpdateArtboard(id, patch); }}
  /></InspectorEdits.Provider></InspectorScope.Provider>;
}

function InspectorContent({ selection, artboards, hosts, onUpdateArtboards, onUpdateArtboard, onChange }: Props) {
  if (selection.kind === "none") return <div className="inspector-empty"><strong>Nothing selected</strong><p>Select a frame or an element to edit its properties.</p><span>⌘/Ctrl-click selects the frame.<br />Alt-click selects a parent.</span></div>;
  if (selection.kind === "multiple" && selection.items.every(item => item.kind === "artboard")) return <MultipleFramesInspector frames={artboards.filter(frame => selection.items.some(item => item.artboardId === frame.id))} hosts={hosts} onUpdate={onUpdateArtboards} />;
  if (selection.kind === "multiple") return <MultipleInspector items={selection.items} artboards={artboards} hosts={hosts} onUpdateFrames={onUpdateArtboards} onChange={onChange} />;
  if (selection.kind === "artboard") {
    const ab = artboards.find((item) => item.id === selection.artboardId);
    if (!ab) return null;
    const update = (patch: Partial<Artboard>) => {
      if (ab.aspectRatio && patch.aspectRatio !== undefined) { onUpdateArtboard(ab.id, patch); return; }
      if (ab.aspectRatio && patch.width !== undefined) patch.height = Math.round(patch.width / ab.aspectRatio);
      else if (ab.aspectRatio && patch.height !== undefined) patch.width = Math.round(patch.height * ab.aspectRatio);
      onUpdateArtboard(ab.id, patch);
    };
    const frameHost = document.querySelector<HTMLElement>(`[data-artboard="${ab.id}"]`);
    const measuredHeight = frameHost?.offsetHeight ?? 100;
    const frameState = (authored: string, computed: string) => propertyState([{ authored, computed, resettable: false }]);
    return <>
      <div className="selection-summary"><strong>{ab.name}</strong><span className="node-badge frame-badge">Frame</span></div>
      <Section title="Position">
        <Row><Field state={frameState(String(ab.x), String(ab.x))} prefix="X" label="Frame X" value={String(ab.x)} onCommit={(v) => { const n = numericInput(v); if (n === null) return false; update({ x: n }); }} /><Field state={frameState(String(ab.y), String(ab.y))} prefix="Y" label="Frame Y" value={String(ab.y)} onCommit={(v) => { const n = numericInput(v); if (n === null) return false; update({ y: n }); }} /></Row>
      </Section>
      <Section title="Layout">

        <div className="sizing-row"><Row><Field state={frameState(String(ab.width), String(ab.width))} prefix="W" label="Frame width" value={String(ab.width)} onCommit={(v) => { if (!/^\d*\.?\d+$/.test(v) || Number(v) < 1) return false; update({ width: Number(v) }); }} /><Field state={frameState(ab.height === undefined ? "" : String(ab.height), String(ab.height ?? measuredHeight))} prefix="H" label="Frame height" value={String(ab.height ?? measuredHeight)} onCommit={(v) => { if (!/^\d*\.?\d+$/.test(v) || Number(v) < 1) return false; update({ height: Number(v) }); }} trailing={<SizeModeMenu label="Frame height" value={ab.height === undefined ? "hug" : "fixed"} modes={["fixed", "hug"]} onChange={mode => onUpdateArtboard(ab.id, { height: mode === "hug" ? undefined : measuredHeight, aspectRatio: undefined })} />} /></Row><button className="inspector-icon" title="Lock frame aspect ratio" aria-label="Lock frame aspect ratio" disabled={measuredHeight <= 0 && !ab.aspectRatio} aria-pressed={!!ab.aspectRatio} onClick={() => onUpdateArtboard(ab.id, { aspectRatio: ab.aspectRatio ? undefined : ab.width / measuredHeight, ...(ab.aspectRatio ? {} : { height: measuredHeight }) })}><InspectorIcon name="ratio" /></button></div>
        <FrameClipping artboard={ab} onUpdate={update} />
      </Section>

      <FrameStyleSections part="appearance" frame={ab} host={hosts.get(ab.id)} onUpdate={update} />
      <FrameFill artboard={ab} onUpdate={update} />
      <FrameStyleSections part="stroke" frame={ab} host={hosts.get(ab.id)} onUpdate={update} />
      <FrameStyleSections part="effects" frame={ab} host={hosts.get(ab.id)} onUpdate={update} />
      <Section title="CSS advanced" defaultOpen={false}>
        <Field label="Frame name" value={ab.name} onCommit={name => update({ name: name || ab.name })} />
        <Segmented label="Frame preset" value={String(ab.width)} options={[{ value: "390", label: "Mobile" }, { value: "768", label: "Tablet" }, { value: "1440", label: "Desktop" }]} onChange={v => update({ width: Number(v) })} />
      </Section>
    </>;
  }
  const el = selection.element;
  if (!el.isConnected) return <div className="empty">Layer was removed.</div>;
  if (el instanceof SVGElement) return <SvgInspector key={elementKey(el)} element={el} onChange={onChange} />;
  return <ElementInspector key={elementKey(el)} element={el} onChange={onChange} />;
}

function FrameClipping({ artboard, onUpdate }: { artboard: Artboard; onUpdate: (patch: Partial<Artboard>) => void }) {
  const [clipped, setClipped] = useState(artboard.clipContent ?? true);
  useLayoutEffect(() => {
    const host = document.querySelector<HTMLElement>(`[data-artboard="${artboard.id}"]`);
    if (!host) return;
    const style = getComputedStyle(host);
    setClipped(style.overflowX !== "visible" || style.overflowY !== "visible" || /paint|strict|content/.test(style.contain));
  });
  return <div className="frame-clipping">
    <label className="property-checkbox"><input aria-label="Clip frame content" type="checkbox" checked={clipped} onChange={e => onUpdate({ clipContent: e.target.checked })} />Clip content</label>
    {artboard.clipContent !== undefined && <button className="small-toggle" aria-label="Reset frame clipping" onClick={() => onUpdate({ clipContent: undefined })}>Reset</button>}
  </div>;
}

function FrameFill({ artboard, onUpdate }: { artboard: Artboard; onUpdate: (patch: Partial<Artboard>) => void }) {
  const [color, setColor] = useState(artboard.backgroundColor ?? "#ffffff");
  useLayoutEffect(() => {
    const host = document.querySelector<HTMLElement>(`[data-artboard="${artboard.id}"]`);
    if (host) setColor(getComputedStyle(host).backgroundColor);
  });
  const reset = artboard.backgroundColor !== undefined ? () => onUpdate({ backgroundColor: undefined }) : undefined;
  return <Section title="Fill" onReset={reset}>
    <ColorField state={propertyState([{ authored: artboard.backgroundColor ?? "", computed: color }])} label="Frame fill" value={color} onCommit={(value) => { if (!CSS.supports("background-color", value)) return false; onUpdate({ backgroundColor: value }); return true; }} onReset={reset} />
  </Section>;
}

const elementKeys = new WeakMap<Element, number>();
let nextElementKey = 0;
function elementKey(element: Element) {
  if (!elementKeys.has(element)) elementKeys.set(element, ++nextElementKey);
  return elementKeys.get(element)!;
}

function containsHtmlText(element: Element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node instanceof Element) {
        return node.matches("svg, style, script, template, noscript") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
      }
      return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  return walker.nextNode() !== null;
}

function ElementInspector({ element, onChange }: { element: Element; onChange: () => void }) {
  const [individualPadding, setIndividualPadding] = useInspectorDisclosure("padding-sides", false);
  const [individualCorners, setIndividualCorners] = useInspectorDisclosure("corners", false);
  const [individualStroke, setIndividualStroke] = useInspectorDisclosure("stroke-sides", false);
  const [showConstraints, setShowConstraints] = useInspectorDisclosure("constraints", false);
  const [layoutOptions, setLayoutOptions] = useInspectorDisclosure("layout-options", false);
  const [positionOptions, setPositionOptions] = useInspectorDisclosure("position-options", false);
  const styled = element as HTMLElement | SVGElement;
  const computed = getComputedStyle(element);
  const hasText = containsHtmlText(element);
  const state = (prop: string) => cssPropertyState([styled], prop);
  const read = (prop: string) => state(prop).value;
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
  const property = (label: string, prop: string, prefix?: ReactNode, length = true) => <Field state={prop === "border-radius" ? cornerRadiusState(styled) : state(prop)} label={label} prefix={prefix} value={length ? trimNumber(read(prop)) : read(prop)} onCommit={(v) => set(prop, length ? withPx(v) : v)} onReset={prop === "border-radius" ? resetGroup(["border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"]) : resetProperty(prop)} />;
  const hasLayoutBox = element.getClientRects().length > 0;
  const geometry = frameGeometry(element);
  const moveTo = (x: number, y: number) => {
    const current = getTranslate(styled);
    const offset = screenDeltaToLocal(element, (x - geometry.x) * geometry.zoom, (y - geometry.y) * geometry.zoom);
    setTranslate(styled, current.x + offset.x, current.y + offset.y);
    onChange();
  };
  const variableBackground = splitCss(read("background-image"), ",").some(layer => /^var\(/i.test(layer));
  const backgroundImages = variableBackground ? computed.backgroundImage : read("background-image");
  const backgroundDefaults: Record<string, string> = { "background-size": "auto", "background-position": "0% 0%", "background-repeat": "repeat", "background-origin": "padding-box", "background-clip": "border-box", "background-attachment": "scroll", "background-blend-mode": "normal" };
  const backgroundList = (property: string) => {
    const authored = read(property);
    return /var\(/i.test(authored) || splitCss(authored, ",").some(item => /^(initial|inherit|unset|revert|revert-layer)$/i.test(item)) ? computed.getPropertyValue(property) : authored;
  };
  const backgroundLayerValue = (property: string, index: number) => {
    const values = splitCss(backgroundList(property), ",");
    return values[index % values.length] ?? backgroundDefaults[property];
  };
  const setBackgroundLayer = (property: string, index: number, value: string) => {
    if (splitCss(value, ",").length !== 1) return false;
    const values = splitCss(backgroundImages, ",").map((_, i) => i === index ? value : backgroundLayerValue(property, i));
    const next = values.join(", ");
    if (!CSS.supports(property, next)) return false;
    styled.style.setProperty(property, next, styled.style.getPropertyPriority(property));
    onChange();
    return true;
  };
  const backgroundLayerSettings = (index: number) => <>
    <Field label={`Background layer ${index + 1} size`} prefix="Size" value={backgroundLayerValue("background-size", index)} suggestions={["auto", "cover", "contain"].map(value => ({ value }))} onCommit={value => setBackgroundLayer("background-size", index, value)} />
    <Field label={`Background layer ${index + 1} position`} prefix="Position" value={backgroundLayerValue("background-position", index)} onCommit={value => setBackgroundLayer("background-position", index, value)} />
    <Field label={`Background layer ${index + 1} repeat`} prefix="Repeat" value={backgroundLayerValue("background-repeat", index)} suggestions={["repeat", "no-repeat", "repeat-x", "repeat-y", "space", "round"].map(value => ({ value }))} onCommit={value => setBackgroundLayer("background-repeat", index, value)} />
  </>;
  const changeBackgroundLayers = (layers: string[], order: (number | null)[]) => {
    const patch: Record<string, string> = { "background-image": layers.join(", ") || "none" };
    if (layers.length) for (const [property, fallback] of Object.entries(backgroundDefaults)) {
      patch[property] = remapCssLayers(backgroundList(property), order, fallback);
    }
    if (!Object.entries(patch).every(([property, value]) => CSS.supports(property, value))) return false;
    Object.entries(patch).forEach(([property, value]) => styled.style.setProperty(property, value, styled.style.getPropertyPriority(property)));
    onChange();
    return true;
  };
  const display = read("display");
  const isFlex = display.includes("flex");
  const isGrid = display.includes("grid");
  const layoutProps = ["display", "flex-direction", "flex-wrap", "justify-content", "justify-items", "align-items", "direction", "gap", "row-gap", "column-gap", "grid-template-columns", "grid-template-rows", "overflow"];
  const paddingProps = ["padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left"];
  const typographyProps = ["font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "word-spacing", "text-align", "text-transform", "text-decoration-line", "text-decoration-style", "text-decoration-thickness", "text-underline-offset", "text-decoration-skip-ink", "font-variation-settings", "white-space", "direction", "overflow-wrap", "color"];
  const sizeField = (axis: SizeAxis) => {
    const label = axis === "width" ? "Width" : "Height";
    const mode = sizeMode(styled, axis);
    const main = isFlexMainAxis(element, axis);
    const measured = getLayoutSize(element)[axis];
    const value = !hasLayoutBox ? read(axis) : mode === "custom" ? styled.style.getPropertyValue(axis) : String(measured);
    return <Field state={state(axis)} prefix={axis === "width" ? "W" : "H"} label={label} value={value}
      onReset={resetGroup(sizingProperties(element, axis))}
      onCommit={(v) => {
        if (/^\d*\.?\d+$/.test(v)) {
          const dimensions = getLayoutSize(element);
          const ratio = dimensions.width / dimensions.height;
          if (setSizeMode(styled, axis, "fixed", Number(v)) === false) return false;
          if (read("aspect-ratio") !== "auto" && Number.isFinite(ratio) && ratio > 0) setSizeMode(styled, axis === "width" ? "height" : "width", "fixed", axis === "width" ? Number(v) / ratio : Number(v) * ratio);
          onChange(); return true;
        }
        if (!CSS.supports(axis, v)) return false;
        if (main) { styled.style.flexGrow = "0"; styled.style.flexBasis = "auto"; }
        return set(axis, v);
      }}
      trailing={<SizeModeMenu label={label} value={mode} modes={sizeModes(styled, axis)} onLimits={() => setShowConstraints(true)} onChange={next => { if (setSizeMode(styled, axis, next, measured) === false) return; if (next !== "fixed" && read("aspect-ratio") !== "auto") styled.style.aspectRatio = "auto"; onChange(); }} />} />;
  };
  const paddingPair = (axis: "horizontal" | "vertical") => {
    const sides = axis === "horizontal" ? ["padding-left", "padding-right"] : ["padding-top", "padding-bottom"];
    const values = sides.map(read);
    return <Field label={`${axis === "horizontal" ? "Horizontal" : "Vertical"} padding`} prefix={<InspectorIcon name={axis} />} value={values[0] === values[1] ? trimNumber(values[0]) : values.map(trimNumber).join(", ")} onReset={resetGroup(sides)} onCommit={(value) => {
      const pair = paddingPairValues(value)?.map(withPx);
      if (!pair || !sides.every((side, index) => CSS.supports(side, pair[index]))) return false;
      sides.forEach((side, index) => styled.style.setProperty(side, pair[index]));
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
    {lockedAncestor(element) && <p className="inspector-footnote">Locked on canvas. Properties remain editable here.</p>}
    <div className="selection-meta">{overrides ? `${overrides} inline ${overrides === 1 ? "override" : "overrides"}` : "Using stylesheet values"}<span title="Blue markers identify properties set on this element.">CSS</span></div>
    <Section title="Position" help={<>
      <p className="property-note">{["absolute", "fixed"].includes(read("position")) ? "Outside the document flow. Insets are relative to the containing block." : read("position") === "sticky" ? "Stays in flow and sticks within its scroll container. Set an inset to choose the sticky edge." : "Occupies space in the parent layout. Transforms move its appearance without moving siblings."}</p>
      <p className="property-note">X and Y adjust the visual transform. Insets control CSS placement. Alignment uses the visible bounds of the element and its frame, without changing document flow.</p>
    </>} onReset={resetGroup(["position", "top", "right", "bottom", "left", "translate", "rotate", "scale", "transform-origin", "z-index"])}>
      <div className="position-align" role="group" aria-label="Align to frame">
        {([
          { icon: "alignLeft", label: "Align left to frame", x: 0 },
          { icon: "alignCenterX", label: "Align horizontal center to frame", x: (geometry.frameWidth - geometry.width) / 2 },
          { icon: "alignRight", label: "Align right to frame", x: geometry.frameWidth - geometry.width },
          { icon: "alignTop", label: "Align top to frame", y: 0 },
          { icon: "alignCenterY", label: "Align vertical center to frame", y: (geometry.frameHeight - geometry.height) / 2 },
          { icon: "alignBottom", label: "Align bottom to frame", y: geometry.frameHeight - geometry.height },
        ] as const).map(action => <button key={action.icon} className="inspector-icon" aria-label={action.label} title={action.label} disabled={!hasLayoutBox || !geometry.hasFrame} onClick={() => moveTo("x" in action ? action.x : geometry.x, "y" in action ? action.y : geometry.y)}><InspectorIcon name={action.icon} /></button>)}
      </div>
      {hasLayoutBox ? <Row><Field prefix="X" label="X" value={String(geometry.x)} onCommit={(v) => { const n = numericInput(v); if (n === null) return false; moveTo(n, geometry.y); }} /><Field prefix="Y" label="Y" value={String(geometry.y)} onCommit={(v) => { const n = numericInput(v); if (n === null) return false; moveTo(geometry.x, n); }} /></Row> : <p className="property-note">Show the layer to edit its visual position.</p>}
      <div className="transform-row"><Field prefix={<InspectorIcon name="rotation" />} label="Rotation" {...rotationField(read("rotate"))} onCommit={(v) => set("rotate", rotationInput(v))} onReset={resetProperty("rotate")} />
        {([0, 1] as const).map(axis => {
          const next = flippedScale(computed.scale, axis);
          const label = axis === 0 ? "Flip horizontally" : "Flip vertically";
          return <button key={axis} className="inspector-icon" aria-label={label} title={`${label} around transform origin`} disabled={next === null} onClick={() => { if (next !== null) set("scale", next); }}><InspectorIcon name={axis === 0 ? "flipHorizontal" : "flipVertical"} /></button>;
        })}
      </div>
      <details className="layout-details" open={positionOptions} onToggle={e => setPositionOptions(e.currentTarget.open)}>
        <summary><span>CSS positioning</span><span className="disclosure-value">{read("position") === "static" ? "Flow" : read("position")}</span></summary>
        <div className="layout-details-body">
      <SelectField label="Position mode" value={read("position")} options={[{ value: "static", label: "Normal flow" }, { value: "relative", label: "Relative" }, { value: "absolute", label: "Absolute" }, { value: "fixed", label: "Fixed" }, { value: "sticky", label: "Sticky" }]} onCommit={(v) => set("position", v)} />
      {read("position") !== "static" && <><div className="property-subheading"><span>Insets</span></div><Row>{property("Left inset", "left", "Left")}{property("Top inset", "top", "Top")}</Row><Row>{property("Right inset", "right", "Right")}{property("Bottom inset", "bottom", "Bottom")}</Row></>}
      <Row>{property("Scale", "scale", "Scale", false)}{property("Z index", "z-index", "Z", false)}</Row>
      <Field label="Transform origin" prefix="Origin" value={read("transform-origin")} onCommit={(v) => set("transform-origin", v)} onReset={resetProperty("transform-origin")} />
      {computed.transform !== "none" && <p className="property-note">Rotation adds to the existing CSS transform.</p>}
        </div>
      </details>
    </Section>

    {element instanceof HTMLImageElement && <ImageControls image={element} onChange={onChange} />}

    <Section preferenceKey="layout" title={isFlex ? "Auto layout" : isGrid ? "Grid layout" : "Layout"} actions={<button className="inspector-icon" title="Min / Max constraints" aria-label="Min / Max" aria-expanded={showConstraints} onClick={() => setShowConstraints(!showConstraints)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 5V3h10v2M3 11v2h10v-2M5 8h6M8 5v6" /></svg></button>} onReset={resetGroup([...layoutProps, ...paddingProps.filter((p) => p.startsWith("padding")), "width", "height", "min-width", "max-width", "min-height", "max-height", "flex-grow", "flex-shrink", "flex-basis", "aspect-ratio"])}>
      <Segmented label="Layout" value={isFlex ? "flex" : isGrid ? "grid" : display} options={[{ value: "block", label: "Block" }, { value: "flex", label: "Flex" }, { value: "grid", label: "Grid" }]} onChange={(v) => set("display", v)} />
      {!['block', 'flex', 'grid'].includes(display) && <SelectField label="Display" value={display} options={["block", "flex", "grid", "inline", "inline-block", "inline-flex", "inline-grid", "none"]} onCommit={(v) => set("display", v)} />}
      <div className="sizing-row"><Row>{sizeField("width")}{sizeField("height")}</Row><button className="inspector-icon" title="Lock aspect ratio" aria-label="Lock aspect ratio" disabled={!hasLayoutBox && read("aspect-ratio") === "auto"} aria-pressed={read("aspect-ratio") !== "auto"} onClick={() => {
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
      <label className="property-checkbox"><input type="checkbox" checked={[computed.overflowX, computed.overflowY].every(axis => axis !== "visible")} onChange={(e) => set("overflow", e.target.checked ? "hidden" : "visible")} />Clip content</label>
    </Section>

    <Section title="Appearance" actions={<button className="inspector-icon" title="Individual corners" aria-label="Individual corners" aria-pressed={individualCorners} onClick={() => setIndividualCorners(!individualCorners)}><InspectorIcon name="corners" /></button>} onReset={resetGroup(["opacity", "visibility", "mix-blend-mode", "border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"])}>
      <Row><Field label="Opacity" prefix={<InspectorIcon name="opacity" />} suffix="%" value={String(Math.round(Number(computed.opacity) * 100))} onCommit={(v) => { const n = numericInput(v, "%"); if (n === null) return false; const clamped = Math.min(100, Math.max(0, n)); return set("opacity", String(clamped / 100)) === false ? false : String(clamped); }} onReset={resetProperty("opacity")} />{property("Corner radius", "border-radius", <InspectorIcon name="radius" />)}</Row>
      <Row><SelectField label="Blend mode" value={read("mix-blend-mode")} options={["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"]} onCommit={v => set("mix-blend-mode", v)} /><label className="property-checkbox"><input aria-label="Hide" type="checkbox" checked={isLayerHidden(element) || read("visibility") === "hidden"} onChange={e => { if (isLayerHidden(element) !== e.target.checked) toggleLayerVisibility(element); if (!e.target.checked && read("visibility") === "hidden") styled.style.visibility = "visible"; onChange(); }} />Hide</label></Row>
      {individualCorners && <><Row>{property("Top left radius", "border-top-left-radius", "TL")}{property("Top right radius", "border-top-right-radius", "TR")}</Row><Row>{property("Bottom left radius", "border-bottom-left-radius", "BL")}{property("Bottom right radius", "border-bottom-right-radius", "BR")}</Row></>}
    </Section>


    {hasText && element.children.length === 0 && <Section title="Typography" actions={<EditorTrigger title="Type settings"><TypeSettings element={styled} onChange={onChange} /></EditorTrigger>} onReset={resetGroup(typographyProps)}>
      {element.children.length > 0 && <p className="property-note">Nested text inherits these styles unless it has its own overrides.</p>}
      <Field label="Font family" value={read("font-family")} onCommit={(v) => set("font-family", v)} onReset={resetProperty("font-family")} suggestions={["Arial, sans-serif", "Helvetica, sans-serif", "Inter, sans-serif", "Geist, sans-serif", "Georgia, serif", "system-ui", "monospace"].map((value) => ({ value }))} />
      <Row><FontWeightField state={state("font-weight")} value={read("font-weight")} onCommit={(v) => set("font-weight", v)} onReset={resetProperty("font-weight")} /><Field label="Font size" prefix="Size" value={trimNumber(read("font-size"))} suggestions={[10,11,12,13,14,16,18,20,24,28,32,36,40,48,64,72,96,128].map((size) => ({ value: String(size) }))} onCommit={(v) => set("font-size", withPx(v))} onReset={resetProperty("font-size")} /></Row>
      <Row><TextMetricField element={styled} property="line-height" onChange={onChange} onReset={resetProperty("line-height")} /><TextMetricField element={styled} property="letter-spacing" onChange={onChange} onReset={resetProperty("letter-spacing")} /></Row>
      <Segmented label="Text alignment" value={read("text-align") === "left" ? (computed.direction === "rtl" ? "end" : "start") : read("text-align") === "right" ? (computed.direction === "rtl" ? "start" : "end") : read("text-align")} options={[{ value: "start", label: "Start", icon: <InspectorIcon name={computed.direction === "rtl" ? "end" : "start"} /> }, { value: "center", label: "Center", icon: <InspectorIcon name="center" /> }, { value: "end", label: "End", icon: <InspectorIcon name={computed.direction === "rtl" ? "start" : "end"} /> }, { value: "justify", label: "Justify", icon: <InspectorIcon name="justify" /> }]} onChange={(v) => set("text-align", v)} />
      <ColorField state={state("color")} label="Text color" value={computed.color} onCommit={(v) => set("color", v)} onReset={resetProperty("color")} />
      {element.children.length === 0 && <TextArea value={element.textContent ?? ""} onCommit={(v) => { element.textContent = v; onChange(); }} />}
    </Section>}


    <Section title="Fill" onReset={resetGroup(["background", "background-color", "background-image", ...Object.keys(backgroundDefaults)])}>
      <ColorField state={state("background-color")} label="Fill color" value={computed.backgroundColor} onCommit={(v) => set("background-color", v)} onReset={resetProperty("background-color")} />
      <div className="property-subheading"><span>Image or gradient</span></div>
      {variableBackground ? <><Field label="Background image variable" state={state("background-image")} value={read("background-image")} onCommit={value => set("background-image", value)} /><button className="small-toggle" onClick={() => set("background-image", computed.backgroundImage)}>Detach background variable</button></> : <GradientEditor value={backgroundImages} computedValue={computed.backgroundImage} onCommit={(v) => set("background-image", v)} onLayersChange={changeBackgroundLayers} renderLayerSettings={backgroundLayerSettings} />}
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



    <Section title="Effects" defaultOpen={false} onReset={resetGroup(["box-shadow", "filter", "backdrop-filter"])}>
      <ShadowEditor value={read("box-shadow")} computedValue={computed.boxShadow} onCommit={(v) => set("box-shadow", v)} />
      <FilterEffects element={styled} onChange={onChange} />
    </Section>
    <Section title="CSS advanced" defaultOpen={false}>
    {hasText && element.children.length > 0 && <Section title="Typography" actions={<EditorTrigger title="Type settings"><TypeSettings element={styled} onChange={onChange} /></EditorTrigger>} onReset={resetGroup(typographyProps)}>
      {element.children.length > 0 && <p className="property-note">Nested text inherits these styles unless it has its own overrides.</p>}
      <Field label="Font family" value={read("font-family")} onCommit={(v) => set("font-family", v)} onReset={resetProperty("font-family")} suggestions={["Arial, sans-serif", "Helvetica, sans-serif", "Inter, sans-serif", "Geist, sans-serif", "Georgia, serif", "system-ui", "monospace"].map((value) => ({ value }))} />
      <Row><FontWeightField state={state("font-weight")} value={read("font-weight")} onCommit={(v) => set("font-weight", v)} onReset={resetProperty("font-weight")} /><Field label="Font size" prefix="Size" value={trimNumber(read("font-size"))} suggestions={[10,11,12,13,14,16,18,20,24,28,32,36,40,48,64,72,96,128].map((size) => ({ value: String(size) }))} onCommit={(v) => set("font-size", withPx(v))} onReset={resetProperty("font-size")} /></Row>
      <Row><TextMetricField element={styled} property="line-height" onChange={onChange} onReset={resetProperty("line-height")} /><TextMetricField element={styled} property="letter-spacing" onChange={onChange} onReset={resetProperty("letter-spacing")} /></Row>
      <Segmented label="Text alignment" value={read("text-align") === "left" ? (computed.direction === "rtl" ? "end" : "start") : read("text-align") === "right" ? (computed.direction === "rtl" ? "start" : "end") : read("text-align")} options={[{ value: "start", label: "Start", icon: <InspectorIcon name={computed.direction === "rtl" ? "end" : "start"} /> }, { value: "center", label: "Center", icon: <InspectorIcon name="center" /> }, { value: "end", label: "End", icon: <InspectorIcon name={computed.direction === "rtl" ? "start" : "end"} /> }, { value: "justify", label: "Justify", icon: <InspectorIcon name="justify" /> }]} onChange={(v) => set("text-align", v)} />
      <ColorField state={state("color")} label="Text color" value={computed.color} onCommit={(v) => set("color", v)} onReset={resetProperty("color")} />
      {element.children.length === 0 && <TextArea value={element.textContent ?? ""} onCommit={(v) => { element.textContent = v; onChange(); }} />}
    </Section>}


    <LayoutItemControls element={element as HTMLElement} onChange={onChange} />

    <Section title="Margin" defaultOpen={false} onReset={resetGroup(paddingProps.filter((p) => p.startsWith("margin")))}>
      <div className="property-subheading"><span>Margin</span></div>
      {property("Margin", "margin", "All")}
      <Row>{property("Margin top", "margin-top", "T")}{property("Margin right", "margin-right", "R")}</Row>
      <Row>{property("Margin bottom", "margin-bottom", "B")}{property("Margin left", "margin-left", "L")}</Row>
    </Section>

      <CssVariables element={styled} onChange={onChange} />
    </Section>
    <div className="inspector-footnote">↑ ↓ to adjust values · Shift for 10 · Alt for 0.1<br />Blue markers show inline overrides. Reset returns to the stylesheet.</div>
  </>;
}

function trimNumber(value: string) { return value.split(/\s+/).map((part) => /^-?\d*\.?\d+px$/.test(part) ? String(Math.round(parseFloat(part) * 100) / 100) : part).join(" "); }
function withPx(value: string) { return value.split(/\s+/).map((part) => /^-?\d*\.?\d+$/.test(part) ? `${part}px` : part).join(" "); }
