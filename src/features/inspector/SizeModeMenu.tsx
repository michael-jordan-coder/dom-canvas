import { useRef, useState } from "react";
import { FloatingEditor } from "./FloatingEditor";
import type { SizeMode } from "./sizingPolicy";

const labels: Record<SizeMode, string> = { css: "Stylesheet", fixed: "Fixed", hug: "Hug contents", fill: "Fill container", custom: "Custom CSS" };
export function SizeModeMenu({ label, value, modes, onChange, onLimits }: { label: string; value: SizeMode | "mixed"; modes: SizeMode[]; onChange: (mode: SizeMode) => void; onLimits?: () => void }) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return <>
    <button ref={anchor} type="button" className="size-mode" data-mode={value} aria-label={`${label} sizing`} title={`${label}: ${value === "mixed" ? "Mixed" : labels[value]}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>{value === "mixed" ? "—" : value === "css" ? "CSS" : value === "custom" ? "CSS*" : value === "fixed" ? "▣" : value === "hug" ? "↔" : "↦"}<span aria-hidden="true">⌄</span></button>
    {open && anchor.current && <FloatingEditor title={`${label} sizing`} anchor={anchor.current} onClose={() => setOpen(false)}>
      <div className="sizing-options" role="radiogroup" aria-label={`${label} sizing mode`} onKeyDown={event => { if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return; event.preventDefault(); const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")); const current = controls.indexOf(document.activeElement as HTMLButtonElement); const next = event.key === "Home" ? 0 : event.key === "End" ? controls.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + controls.length) % controls.length; controls[next]?.focus(); }}>
        {(["css", "fixed", "hug", "fill"] as const).map(mode => <button key={mode} role="radio" type="button" aria-checked={value === mode} disabled={!modes.includes(mode)} onClick={() => { onChange(mode); setOpen(false); anchor.current?.focus(); }}><span>{value === mode ? "✓" : ""}</span>{labels[mode]}</button>)}
      </div>
      {onLimits && <button className="size-limit-action" onClick={() => { onLimits(); setOpen(false); }}>Min / Max…</button>}
    </FloatingEditor>}
  </>;
}
