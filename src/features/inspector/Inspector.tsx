import { useEffect, useState, type ReactNode } from "react";
import { getTranslate, setSize, setTranslate } from "@/features/canvas/elementStyle";
import type { Artboard, Selection } from "@/features/canvas/types";
import { layerName } from "@/features/layers/Layers";

type Props = {
  selection: Selection;
  artboards: Artboard[];
  onUpdateArtboard: (id: string, patch: Partial<Artboard>) => void;
  version: number;
  onChange: () => void;
};

export function Inspector({ selection, artboards, onUpdateArtboard, onChange }: Props) {
  if (selection.kind === "none") {
    return <div className="empty">Select a layer to edit it.</div>;
  }

  if (selection.kind === "artboard") {
    const ab = artboards.find((a) => a.id === selection.artboardId);
    if (!ab) return null;
    const num = (v: string, fallback: number) => (Number.isFinite(parseFloat(v)) ? Math.round(parseFloat(v)) : fallback);
    return (
      <>
        <div className="inspector-selection">
          <span className="tag">Frame</span>
        </div>
        <Section title="Frame">
          <Row single>
            <Field title="Frame name" value={ab.name} onCommit={(v) => onUpdateArtboard(ab.id, { name: v || ab.name })} />
          </Row>
        </Section>
        <Section title="Position">
          <Row>
            <Field prefix="X" value={String(ab.x)} onCommit={(v) => onUpdateArtboard(ab.id, { x: num(v, ab.x) })} />
            <Field prefix="Y" value={String(ab.y)} onCommit={(v) => onUpdateArtboard(ab.id, { y: num(v, ab.y) })} />
          </Row>
        </Section>
        <Section title="Frame size">
          <div className="frame-presets">
            {[{ name: "Mobile", width: 390 }, { name: "Tablet", width: 768 }, { name: "Desktop", width: 1440 }].map((preset) => (
              <button key={preset.name} title={`${preset.name}: ${preset.width}px`} aria-pressed={ab.width === preset.width} onClick={() => onUpdateArtboard(ab.id, { width: preset.width })}>{preset.name}</button>
            ))}
          </div>
          <Row>
            <Field prefix="W" value={String(ab.width)} onCommit={(v) => onUpdateArtboard(ab.id, { width: Math.max(1, num(v, ab.width)) })} />
            <Field
              prefix="H"
              title="Height (type hug to fit content)"
              value={ab.height === undefined ? "Hug" : String(ab.height)}
              onCommit={(v) =>
                onUpdateArtboard(ab.id, { height: /^hug$/i.test(v) ? undefined : Math.max(1, num(v, ab.height ?? 100)) })
              }
            />
          </Row>
          <button className="btn-ghost hug-button" onClick={() => onUpdateArtboard(ab.id, { height: undefined })}>Fit height to content</button>
        </Section>
      </>
    );
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
  const styled = element as HTMLElement | SVGElement;
  const computed = getComputedStyle(element);
  const hasOwnText = Array.from(element.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim());
  const isLeaf = element.children.length === 0;

  const set = (prop: string, value: string) => {
    styled.style.setProperty(prop, value);
    onChange();
  };
  const read = (prop: string) => styled.style.getPropertyValue(prop) || computed.getPropertyValue(prop);

  const frame = frameGeometry(element);
  const moveTo = (x: number, y: number) => {
    const t = getTranslate(styled);
    setTranslate(styled, t.x + x - frame.x, t.y + y - frame.y);
    onChange();
  };
  const resize = (size: { width?: number; height?: number }) => {
    setSize(styled, size);
    onChange();
  };

  return (
    <>
      <div className="inspector-selection">
        <span className="name">{layerName(element)}</span>
        <span className="tag">{element.tagName.toLowerCase()}</span>
      </div>

      {isLeaf && hasOwnText && (
        <Section title="Content">
          <TextArea value={element.textContent ?? ""} onCommit={(v) => { element.textContent = v; onChange(); }} />
        </Section>
      )}

      <Section title="Position">
        <Row>
          <Field prefix="X" value={String(frame.x)} onCommit={(v) => moveTo(toNumber(v, frame.x), frame.y)} />
          <Field prefix="Y" value={String(frame.y)} onCommit={(v) => moveTo(frame.x, toNumber(v, frame.y))} />
        </Row>
        <Row>
          <Field prefix="↻" suffix="°" title="Rotation" value={read("rotate") === "none" ? "0" : trimNumber(read("rotate"))} onCommit={(v) => set("rotate", `${toNumber(v, 0)}deg`)} />
        </Row>
      </Section>

      <Section title="Layout">
        <Row>
          <Field prefix="W" value={String(frame.width)} onCommit={(v) => resize({ width: toNumber(v, frame.width) })} />
          <Field prefix="H" value={String(frame.height)} onCommit={(v) => resize({ height: toNumber(v, frame.height) })} />
        </Row>
        <Row>
          <Field prefix="⇥" value={trimNumber(read("padding"))} title="Padding" onCommit={(v) => set("padding", withPx(v))} />
          <Field prefix="⇤" value={trimNumber(read("margin"))} title="Margin" onCommit={(v) => set("margin", withPx(v))} />
        </Row>
      </Section>

      <Section title="CSS layout">
        <SelectField label="Display" value={read("display")} options={["block", "flex", "grid", "inline", "inline-block", "inline-flex", "none"]} onCommit={(v) => set("display", v)} />
        <SelectField label="Position" value={read("position")} options={["static", "relative", "absolute", "fixed", "sticky"]} onCommit={(v) => set("position", v)} />
        {read("display").includes("flex") && <>
          <SelectField label="Direction" value={read("flex-direction")} options={["row", "column", "row-reverse", "column-reverse"]} onCommit={(v) => set("flex-direction", v)} />
          <SelectField label="Wrap" value={read("flex-wrap")} options={["nowrap", "wrap", "wrap-reverse"]} onCommit={(v) => set("flex-wrap", v)} />
        </>}
        {(read("display").includes("flex") || read("display").includes("grid")) && <>
          <SelectField label="Justify" value={read("justify-content")} options={["normal", "flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]} onCommit={(v) => set("justify-content", v)} />
          <SelectField label="Align" value={read("align-items")} options={["normal", "stretch", "flex-start", "center", "flex-end", "baseline"]} onCommit={(v) => set("align-items", v)} />
          <Row single><Field prefix="Gap" title="Gap" value={trimNumber(read("gap"))} onCommit={(v) => set("gap", withPx(v))} /></Row>
        </>}
        {read("display").includes("grid") && <Row single><Field prefix="Cols" title="Grid template columns" value={read("grid-template-columns")} onCommit={(v) => set("grid-template-columns", v)} /></Row>}
        <SelectField label="Overflow" value={read("overflow")} options={["visible", "hidden", "clip", "auto", "scroll"]} onCommit={(v) => set("overflow", v)} />
      </Section>

      <Section title="Appearance">
        <Row>
          <Field
            prefix="◐"
            suffix="%"
            title="Opacity"
            value={String(Math.round(parseFloat(read("opacity") || "1") * 100))}
            onCommit={(v) => set("opacity", String(Math.min(100, Math.max(0, toNumber(v, 100))) / 100))}
          />
          <Field prefix="◜" title="Corner radius" value={trimNumber(read("border-radius"))} onCommit={(v) => set("border-radius", withPx(v))} />
        </Row>
      </Section>

      <Section title="Fill">
        <Row single>
          <ColorField value={read("background-color")} onCommit={(v) => set("background-color", v)} />
        </Row>
      </Section>

      {hasOwnText && (
        <Section title="Typography">
          <Row single>
            <Field value={primaryFont(read("font-family"))} title="Font family" onCommit={(v) => set("font-family", v)} />
          </Row>
          <Row>
            <Field prefix="Aa" title="Font size" value={trimNumber(read("font-size"))} onCommit={(v) => set("font-size", withPx(v))} />
            <Field prefix="B" title="Font weight" value={read("font-weight")} onCommit={(v) => set("font-weight", v)} />
          </Row>
          <Row>
            <Field prefix="↕" title="Line height" value={trimNumber(read("line-height"))} onCommit={(v) => set("line-height", withPx(v))} />
            <Field prefix="↔" title="Letter spacing" value={trimNumber(read("letter-spacing"))} onCommit={(v) => set("letter-spacing", withPx(v))} />
          </Row>
          <Row single>
            <ColorField value={read("color")} onCommit={(v) => set("color", v)} />
          </Row>
        </Section>
      )}
    </>
  );
}

function SelectField({ label, value, options, onCommit }: { label: string; value: string; options: string[]; onCommit: (value: string) => void }) {
  const choices = options.includes(value) ? options : [value, ...options];
  return <label className="select-field"><span>{label}</span><select aria-label={label} value={value} onChange={(e) => onCommit(e.target.value)}>{choices.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="inspector-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function Row({ single, children }: { single?: boolean; children: ReactNode }) {
  return <div className={`field-row${single ? " single" : ""}`}>{children}</div>;
}

type FieldProps = {
  value: string;
  prefix?: string;
  suffix?: string;
  title?: string;
  disabled?: boolean;
  onCommit: (value: string) => void;
};

function Field({ value, prefix, suffix, title, disabled, onCommit }: FieldProps) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => { if (draft !== value) onCommit(draft.trim()); };

  return (
    <label className={`field${prefix ? "" : " no-prefix"}`} title={title}>
      {prefix && <span className="prefix">{prefix}</span>}
      <input
        value={draft}
        aria-label={title || prefix || "Value"}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setDraft(value); e.currentTarget.blur(); }
        }}
      />
      {suffix && <span className="suffix">{suffix}</span>}
    </label>
  );
}

function TextArea({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <textarea
      className="textarea-field"
      rows={3}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { if (draft !== value) onCommit(draft); }}
    />
  );
}

function ColorField({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const { hex, alpha } = parseColor(value);
  const [draft, setDraft] = useState(hex);
  useEffect(() => setDraft(hex), [hex]);
  const commit = () => {
    const clean = draft.replace(/^#/, "").trim();
    if (/^[0-9a-f]{6}$/i.test(clean) && clean.toUpperCase() !== hex) onCommit(`#${clean}`);
    else setDraft(hex);
  };

  return (
    <label className="field color">
      <span className="swatch">
        <span style={{ background: value }} />
        <input type="color" value={`#${hex}`} onChange={(e) => onCommit(e.target.value)} />
      </span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      />
      <span className="suffix">{Math.round(alpha * 100)}%</span>
    </label>
  );
}

// Position and size in the frame's coordinate space, derived from what is
// rendered so that flow-positioned elements report where they actually are.
function frameGeometry(element: Element) {
  const root = element.getRootNode();
  const host = root instanceof ShadowRoot ? (root.host as HTMLElement) : null;
  const r = element.getBoundingClientRect();
  if (!host) return { x: 0, y: 0, width: r.width, height: r.height };
  const hr = host.getBoundingClientRect();
  const z = hr.width / host.offsetWidth || 1;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { x: round((r.left - hr.left) / z), y: round((r.top - hr.top) / z), width: round(r.width / z), height: round(r.height / z) };
}

function parseColor(value: string) {
  const m = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/);
  if (!m) return { hex: "FFFFFF", alpha: value === "transparent" ? 0 : 1 };
  const hex = [m[1], m[2], m[3]].map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("").toUpperCase();
  return { hex, alpha: m[4] === undefined ? 1 : Number(m[4]) };
}

function primaryFont(family: string) {
  return family.split(",")[0]?.replace(/["']/g, "").trim() ?? family;
}

function trimNumber(value: string) {
  return value.replace(/(-?\d+\.\d+)/g, (n) => String(Math.round(parseFloat(n) * 100) / 100)).replace(/px/g, "").replace(/deg/g, "");
}

function toNumber(value: string, fallback: number) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : fallback;
}

function withPx(value: string) {
  return value.split(/\s+/).map((part) => (/^-?\d*\.?\d+$/.test(part) ? `${part}px` : part)).join(" ");
}
