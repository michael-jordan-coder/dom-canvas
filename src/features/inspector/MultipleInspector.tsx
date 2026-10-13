import type { SelectionItem } from "@/features/canvas/types";
import { ColorField, Field, Row, Section } from "./InspectorControls";
import { FontWeightField } from "./FontWeightField";

const common = (values: string[]) => values.every(value => value === values[0]) ? values[0] : null;
const length = (value: string) => /^-?\d*\.?\d+$/.test(value.trim()) ? `${value.trim()}px` : value;

export function MultipleInspector({ items, onChange }: { items: SelectionItem[]; onChange: () => void }) {
  const elements = items.flatMap(item => item.kind === "element" && (item.element instanceof HTMLElement || item.element instanceof SVGElement) && item.element.isConnected ? [item.element] : []);
  const allElements = elements.length === items.length;
  const allHtml = allElements && elements.every(element => element instanceof HTMLElement);
  const text = allElements && elements.every(element => !!element.textContent?.trim());
  const read = (property: string) => common(elements.map(element => getComputedStyle(element).getPropertyValue(property).trim()));
  const set = (property: string, value: string) => {
    if (!value.trim() || !CSS.supports(property, value)) return false;
    elements.forEach(element => element.style.setProperty(property, value));
    onChange(); return true;
  };
  const reset = (properties: string[]) => elements.some(element => properties.some(property => !!element.style.getPropertyValue(property))) ? () => {
    elements.forEach(element => properties.forEach(property => element.style.removeProperty(property))); onChange();
  } : undefined;
  const field = (label: string, property: string, isLength = false) => <Field label={label} prefix={({ Width: "W", Height: "H", "Font size": "Size", "Corner radius": "R", "Line height": "LH", "Letter spacing": "LS" } as Record<string, string>)[label]} value={read(property)?.replace(isLength ? /px$/ : /$^/, "") ?? "Mixed"} onCommit={value => set(property, isLength ? length(value) : value)} onReset={reset([property])} />;
  const color = (label: string, property: string) => <ColorField label={label} value={read(property) ?? getComputedStyle(elements[0]).getPropertyValue(property)} mixed={read(property) === null} onCommit={value => set(property, value)} onReset={reset([property])} />;
  return <>
    <div className="selection-summary"><strong>{items.length} selected</strong><span>Multiple</span></div>
    {!allElements ? <p className="inspector-footnote">Drag to move together. Shift-click to add or remove. Shared properties are available when the selection contains only elements.</p> : <>
      <Section title="Appearance" onReset={reset(["opacity", "border-radius"])}>
        <Row><Field label="Opacity" suffix="%" value={read("opacity") === null ? "Mixed" : String(Math.round(Number(read("opacity")) * 100))} onCommit={value => {
          const n = Number(value.trim()); if (!value.trim() || !Number.isFinite(n)) return false;
          const accepted = Math.min(100, Math.max(0, n)); set("opacity", String(accepted / 100)); return String(accepted);
        }} onReset={reset(["opacity"])} />{allHtml && field("Corner radius", "border-radius", true)}</Row>
      </Section>
      {allHtml && <Section title="Size" onReset={reset(["width", "height"])}><Row>{field("Width", "width", true)}{field("Height", "height", true)}</Row></Section>}
      {allHtml && <Section title="Fill" onReset={reset(["background-color"])}>{color("Fill", "background-color")}</Section>}
      {text && <Section title="Typography" onReset={reset(["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color"])}>
        {field("Font family", "font-family")}
        <Row><FontWeightField value={read("font-weight") ?? "Mixed"} onCommit={value => set("font-weight", value)} onReset={reset(["font-weight"])} />{field("Font size", "font-size", true)}</Row>
        <Row>{field("Line height", "line-height")}{field("Letter spacing", "letter-spacing", true)}</Row>
        {color("Text color", "color")}
      </Section>}
      <p className="inspector-footnote">Mixed means the selected elements have different values. Editing applies one value to every selected element. Reset removes their inline override.</p>
    </>}
  </>;
}
