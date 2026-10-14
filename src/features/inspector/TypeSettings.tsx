import { useId, useState } from "react";
import { cssPropertyState } from "./propertyState";
import { Field, Row, Segmented, SelectField } from "./InspectorControls";
import { InspectorIcon } from "./InspectorIcon";

export function TypeSettings({ element, onChange }: { element: HTMLElement | SVGElement; onChange: () => void }) {
  const panelId = useId();
  const [tab, setTab] = useState("basics");
  const state = (property: string) => cssPropertyState([element], property);
  const read = (property: string) => state(property).value;
  const lines = read("text-decoration-line").split(/\s+/).filter(line => line !== "none");
  const set = (property: string, value: string) => { if (!CSS.supports(property, value)) return false; element.style.setProperty(property, value); onChange(); return true; };
  const toggle = (line: string) => set("text-decoration-line", (lines.includes(line) ? lines.filter(item => item !== line) : [...lines, line]).join(" ") || "none");
  return <>
    <div className="type-tabs" role="tablist" aria-label="Type settings tabs" onKeyDown={event => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const next = event.key === "Home" ? "basics" : event.key === "End" ? "details" : tab === "basics" ? "details" : "basics"; setTab(next); event.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus(); }}>
      {[["basics", "Basics"], ["details", "Details"]].map(([key, label]) => <button key={key} role="tab" data-tab={key} tabIndex={tab === key ? 0 : -1} aria-controls={panelId} aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>)}
    </div>
    <div id={panelId} role="tabpanel" aria-label={tab === "basics" ? "Basics" : "Details"}>
    {tab === "basics" ? <div className="type-settings-fields">
      <div className="segmented" role="group" aria-label="Text style">
        <button aria-label="Italic" title="Italic" aria-pressed={read("font-style") !== "normal"} onClick={() => set("font-style", read("font-style") === "normal" ? "italic" : "normal")}><InspectorIcon name="italic" /></button>
        <button aria-label="Underline" title="Underline" aria-pressed={lines.includes("underline")} onClick={() => toggle("underline")}><InspectorIcon name="underline" /></button>
        <button aria-label="Strikethrough" title="Strikethrough" aria-pressed={lines.includes("line-through")} onClick={() => toggle("line-through")}><InspectorIcon name="strikethrough" /></button>
      </div>
      <SelectField label="Case" value={read("text-transform")} options={[{ value: "none", label: "As typed" }, { value: "uppercase", label: "Uppercase" }, { value: "lowercase", label: "Lowercase" }, { value: "capitalize", label: "Title case" }]} onCommit={value => set("text-transform", value)} />
      <SelectField label="Decoration style" disabled={!lines.length} value={read("text-decoration-style")} options={["solid", "dotted", "dashed", "wavy", "double"]} onCommit={value => set("text-decoration-style", value)} />
      <Row><Field label="Decoration thickness" prefix="Size" disabled={!lines.length} state={state("text-decoration-thickness")} value={read("text-decoration-thickness")} onCommit={value => set("text-decoration-thickness", /^\d*\.?\d+$/.test(value) ? `${value}px` : value)} /><Field label="Underline offset" prefix="Offset" disabled={!lines.includes("underline")} state={state("text-underline-offset")} value={read("text-underline-offset")} onCommit={value => set("text-underline-offset", /^-?\d*\.?\d+$/.test(value) ? `${value}px` : value)} /></Row>
      <SelectField label="Skip ink" disabled={!lines.includes("underline")} value={read("text-decoration-skip-ink")} options={["auto", "none", "all"].filter(value => CSS.supports("text-decoration-skip-ink", value))} onCommit={value => set("text-decoration-skip-ink", value)} />
    </div> : <div className="type-settings-fields">
      <SelectField label="Wrapping" value={read("white-space")} options={[{ value: "normal", label: "Wrap" }, { value: "nowrap", label: "No wrap" }, { value: "pre-wrap", label: "Preserve breaks" }, { value: "break-spaces", label: "Preserve spaces" }]} onCommit={value => set("white-space", value)} />
      <SelectField label="Text direction" value={read("direction")} options={[{ value: "ltr", label: "Left to right" }, { value: "rtl", label: "Right to left" }]} onCommit={value => set("direction", value)} />
      <SelectField label="Long words" value={read("overflow-wrap")} options={[{ value: "normal", label: "Keep whole" }, { value: "break-word", label: "Break if needed" }, { value: "anywhere", label: "Fit width" }]} onCommit={value => set("overflow-wrap", value)} />
      <Field label="Word spacing" prefix="Words" state={state("word-spacing")} value={read("word-spacing")} onCommit={value => set("word-spacing", /^-?\d*\.?\d+$/.test(value) ? `${value}px` : value)} />
      <Field label="Font variations" state={state("font-variation-settings")} value={read("font-variation-settings")} onCommit={value => set("font-variation-settings", value)} />
    </div>}
    </div>
  </>;
}
