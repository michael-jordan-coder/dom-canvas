import { EditorTrigger } from "./FloatingEditor";
import { Field } from "./InspectorControls";
import { cssPropertyState, type PropertyState } from "./propertyState";

export function FilterEffects({ element, onChange, getState, onSet, onReset }: { element: HTMLElement | SVGElement; onChange: () => void; getState?: (property: string) => PropertyState; onSet?: (property: string, value: string) => boolean; onReset?: (property: string) => void }) {
  return <>{(["filter", "backdrop-filter"] as const).map(property => {
    const state = getState?.(property) ?? cssPropertyState([element], property);
    const raw = state.value || "none";
    const match = raw.match(/blur\(([-\d.]+)px\)/);
    const set = (next: string) => { if (!CSS.supports(property, next)) return false; if (onSet) return onSet(property, next); element.style.setProperty(property, next); onChange(); return true; };
    const title = property === "filter" ? "Layer blur" : "Background blur";
    return <div className="effect-heading" key={property}>
      <span className="background-layer-label">{title}</span>
      <span className="effect-value">{match ? `${match[1]}px` : "None"}</span>
      <EditorTrigger title={title}><Field label={`${title} radius`} prefix="Blur" value={match?.[1] ?? "0"} onCommit={value => {
        const n = Number(value); if (!value.trim() || !Number.isFinite(n) || n < 0) return false;
        return set(match ? raw.replace(match[0], `blur(${n}px)`) : `${raw === "none" ? "" : raw + " "}blur(${n}px)`);
      }} />
      <Field label={`${title} CSS`} value={raw} state={state} onCommit={set} />
      {match && <button className="small-toggle" onClick={() => set(raw.replace(match[0], "").trim() || "none")}>Remove blur</button>}
      {state.canReset && <button className="small-toggle" onClick={() => { if (onReset) onReset(property); else { element.style.removeProperty(property); onChange(); } }}>Reset to stylesheet</button>}
      </EditorTrigger>
    </div>;
  })}</>;
}
