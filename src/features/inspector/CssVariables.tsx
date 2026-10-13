import { useState } from "react";
import { Field, Section } from "./InspectorControls";

function variablesFor(element: HTMLElement | SVGElement) {
  const names = new Set<string>();
  const readStyle = (style: CSSStyleDeclaration) => {
    for (const property of Array.from(style)) {
      if (property.startsWith("--")) names.add(property);
      for (const match of style.getPropertyValue(property).matchAll(/var\(\s*(--[\w-]+)/g)) names.add(match[1]);
    }
  };
  const root = element.getRootNode();
  const readRules = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if ("style" in rule) readStyle((rule as CSSStyleRule).style);
      if ("cssRules" in rule) readRules((rule as CSSGroupingRule).cssRules);
    }
  };
  if (root instanceof ShadowRoot) {
    for (const node of root.querySelectorAll("style")) {
      try { if (node.sheet) readRules(node.sheet.cssRules); } catch { /* Inaccessible sheets remain editable through CSS. */ }
    }
    readStyle((root.host as HTMLElement).style);
  }
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (node instanceof HTMLElement || node instanceof SVGElement) readStyle(node.style);
  }
  const computed = getComputedStyle(element);
  return [...names].sort().filter(name => element.style.getPropertyValue(name) || computed.getPropertyValue(name).trim());
}

export function CssVariables({ element, onChange }: { element: HTMLElement | SVGElement; onChange: () => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const names = variablesFor(element);
  const computed = getComputedStyle(element);
  const set = (property: string, next: string) => {
    if (!next.trim() || !CSS.supports(property, next)) return false;
    if (element.style.getPropertyValue(property) === next) return true;
    element.style.setProperty(property, next, element.style.getPropertyPriority(property));
    onChange();
    return true;
  };
  const add = () => {
    const property = name.trim();
    if (!property.startsWith("--") || property.length < 3 || !CSS.supports(property, "initial")) { setError("Use a CSS variable name such as --brand."); return; }
    if (names.includes(property)) { setError("This variable is listed above. Edit its value there."); return; }
    if (!set(property, value.trim())) { setError("Enter a valid CSS value."); return; }
    setAdding(false); setName(""); setValue(""); setFilter(""); setError("");
  };
  return <Section title="CSS variables" defaultOpen={false} help={<p className="property-note">Values are set on this element and can inherit to its children. Use var(--name) in CSS to reference them. Reset removes a local definition; inherited or stylesheet values can remain.</p>}>
    {names.length > 6 && <input className="variable-input" aria-label="Filter CSS variables" placeholder="Filter variables…" value={filter} onChange={event => setFilter(event.target.value)} />}
    {names.filter(property => property.toLowerCase().includes(filter.toLowerCase())).map(property => {
      const local = element.style.getPropertyValue(property);
      const resolved = computed.getPropertyValue(property).trim();
      return <div className="variable-row" key={property}>
        <div className="variable-heading"><code title={`${property}${resolved ? ` · Resolved: ${resolved}` : ""}`}>{property}</code><span>{local ? "Local" : "CSS"}</span>{local && <button className="variable-reset" aria-label={`Reset CSS variable ${property}`} title="Remove local definition" onClick={() => { element.style.removeProperty(property); onChange(); }}>↺</button>}</div>
        <Field label={`CSS variable ${property}`} prefix={CSS.supports("color", resolved) ? <span className="variable-color" style={{ background: resolved }} aria-hidden="true" /> : undefined} value={local || resolved} onCommit={next => set(property, next)} />
      </div>;
    })}
    {!names.length && <p className="property-note">No CSS variables on this element.</p>}
    {names.length > 0 && !names.some(property => property.toLowerCase().includes(filter.toLowerCase())) && <p className="property-note">No matching variables.</p>}
    {adding ? <div className="variable-add">
      <input autoFocus className="variable-input" aria-label="New CSS variable name" placeholder="--brand" value={name} onChange={event => { setName(event.target.value); setError(""); }} />
      <input className="variable-input" aria-label="New CSS variable value" placeholder="Value, e.g. #7c3aed or 16px" value={value} onChange={event => { setValue(event.target.value); setError(""); }} onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); add(); } }} />
      {error && <p className="variable-error" role="alert">{error}</p>}
      <div className="effect-actions"><button className="add-property" onClick={add}>Add variable</button><button className="small-toggle" onClick={() => { setAdding(false); setError(""); }}>Cancel</button></div>
    </div> : <button className="add-property" onClick={() => setAdding(true)}>+ Add variable</button>}
  </Section>;
}
