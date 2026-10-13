import { useContext, useEffect, useRef, type CSSProperties } from "react";
import { InspectorEdits } from "./InspectorControls";

export function GradientStopTrack({ positions, colors, selected, label, onChange }: {
  positions: number[]; colors: string[]; selected: number; label: string; onChange: (positions: number[]) => boolean;
}) {
  const edits = useContext(InspectorEdits);
  const active = useRef(false);
  const latest = useRef(edits);
  latest.current = edits;
  const finish = (cancel: boolean) => {
    if (!active.current) return;
    active.current = false;
    latest.current?.finish(cancel);
  };
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !active.current) return;
      event.preventDefault(); event.stopImmediatePropagation(); finish(true);
    };
    window.addEventListener("keydown", cancel, true);
    return () => { window.removeEventListener("keydown", cancel, true); finish(true); };
  }, []);
  const min = positions[selected - 1] ?? 0;
  const max = positions[selected + 1] ?? 100;
  const set = (value: number) => {
    const next = Math.max(min, Math.min(max, Math.round(value * 10) / 10));
    if (next === positions[selected]) return;
    onChange(positions.map((position, index) => index === selected ? next : position));
  };
  return <div className="gradient-stop-track" style={{ "--stop-color": colors[selected] } as CSSProperties}>
    <div className="gradient-stop-ramp" style={{ backgroundImage: `linear-gradient(90deg, ${colors.map((color, index) => `${color} ${positions[index]}%`).join(", ")})` }} />
    <div className="gradient-stop-markers" aria-hidden="true">{positions.map((position, index) => <span key={index} style={{ left: `${position}%`, background: colors[index] }} />)}</div>
    <input type="range" min={0} max={100} step={0.1} value={positions[selected]} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuetext={`${Math.round(positions[selected] * 10) / 10}%`} title="Drag the selected stop · Arrows: 1% · Shift: 10% · Alt: 0.1% · Escape: cancel"
      onPointerDown={event => {
        if (event.button !== 0 || !edits) return;
        active.current = true; edits.begin(); event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onChange={event => set(Number(event.currentTarget.value))}
      onPointerUp={() => finish(false)} onPointerCancel={() => finish(true)} onLostPointerCapture={() => finish(false)} onBlur={() => finish(false)}
      onKeyDown={event => {
        if (event.metaKey || event.ctrlKey) return;
        const direction = ["ArrowRight", "ArrowUp"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowDown"].includes(event.key) ? -1 : 0;
        if (!direction && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault(); event.stopPropagation();
        if (!active.current && edits) { active.current = true; edits.begin(); }
        set(event.key === "Home" ? min : event.key === "End" ? max : positions[selected] + direction * (event.shiftKey ? 10 : event.altKey ? 0.1 : 1));
      }}
      onKeyUp={event => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) finish(false); }} />
  </div>;
}
