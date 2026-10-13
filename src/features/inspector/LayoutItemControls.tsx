import { Field, Row, Section, SelectField } from "./InspectorControls";
import { layoutItemKind } from "./sizing";

const alignment = ["auto", "start", "center", "end", "stretch", "baseline"];
export function LayoutItemControls({ element, onChange }: { element: HTMLElement; onChange: () => void }) {
  const kind = layoutItemKind(element);
  if (!kind) return null;
  const computed = getComputedStyle(element);
  const read = (property: string) => element.style.getPropertyValue(property) || computed.getPropertyValue(property);
  const set = (property: string, value: string) => {
    if (!CSS.supports(property, value)) return false;
    element.style.setProperty(property, value); onChange(); return true;
  };
  const reset = (properties: string[]) => properties.some(property => element.style.getPropertyValue(property)) ? () => { properties.forEach(property => element.style.removeProperty(property)); onChange(); } : undefined;
  const properties = ["order", "align-self", ...(kind === "flex" ? ["flex-grow", "flex-shrink", "flex-basis"] : ["grid-column", "grid-row", "justify-self"])];
  const field = (label: string, property: string, prefix: string) => <Field label={label} prefix={prefix} value={read(property)} onCommit={value => set(property, value)} onReset={reset([property])} />;
  return <Section title={kind === "flex" ? "Flex item" : "Grid item"} preferenceKey="layout-item" defaultOpen={false} onReset={reset(properties)}>
    {kind === "flex" ? <>
      <Row>{field("Flex grow", "flex-grow", "Grow")}{field("Flex shrink", "flex-shrink", "Shrink")}</Row>
      <Field label="Flex basis" prefix="Basis" value={read("flex-basis")} onCommit={value => set("flex-basis", /^\d*\.?\d+$/.test(value) ? `${value}px` : value)} onReset={reset(["flex-basis"])} />
    </> : <>
      {field("Grid column", "grid-column", "Column")}
      {field("Grid row", "grid-row", "Row")}
      <SelectField label="Justify self" value={read("justify-self")} options={alignment} onCommit={value => set("justify-self", value)} />
    </>}
    <SelectField label="Align self" value={read("align-self")} options={alignment} onCommit={value => set("align-self", value)} />
    {field("Layout order", "order", "Order")}
  </Section>;
}
