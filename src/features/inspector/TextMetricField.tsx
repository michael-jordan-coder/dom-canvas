import { Field } from "./InspectorControls";
import { InspectorIcon } from "./InspectorIcon";
import { cssPropertyState } from "./propertyState";
import { textMetricDisplay, textMetricInput } from "./textMetric";

export function TextMetricField({ element, property, onChange, onReset }: { element: HTMLElement | SVGElement; property: "line-height" | "letter-spacing"; onChange: () => void; onReset?: () => void }) {
  const state = cssPropertyState([element], property);
  return <Field label={property === "line-height" ? "Line height" : "Letter spacing"} state={state} prefix={<InspectorIcon name={property === "line-height" ? "lineHeight" : "tracking"} />} value={textMetricDisplay(property, state.authored, state.computed)} onReset={onReset} onCommit={value => {
    const next = textMetricInput(property, value);
    if (!CSS.supports(property, next)) return false;
    element.style.setProperty(property, next); onChange(); return true;
  }} />;
}
