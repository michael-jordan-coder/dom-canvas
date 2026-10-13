import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { colorWithAlpha, parseColor } from "./color";

function toHsv(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const hue = delta === 0 ? 0 : max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: (hue * 60 + 360) % 360, s: max === 0 ? 0 : delta / max, v: max };
}
function toHex(h: number, s: number, v: number) {
  const channel = (n: number) => { const k = (n + h / 60) % 6; return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)))).toString(16).padStart(2, "0"); };
  return `#${channel(5)}${channel(3)}${channel(1)}`.toUpperCase();
}
const clamp = (n: number) => Math.max(0, Math.min(1, n));

type Props = { label: string; value: string; anchor: HTMLElement; onPreview: (value: string) => void; onClose: (cancel: boolean) => void };
export function ColorPopover({ label, value, anchor, onPreview, onClose }: Props) {
  const initial = parseColor(value) ?? { hex: "#000000", alpha: 1 };
  const original = useRef(parseColor(value) ? colorWithAlpha(initial.hex, initial.alpha) : value);
  const lastEmitted = useRef(original.current);
  const [color, setColor] = useState(() => ({ ...toHsv(initial.hex), a: initial.alpha }));
  const [hexDraft, setHexDraft] = useState(initial.hex);
  const [invalid, setInvalid] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const mounted = useRef(false);
  const latest = useRef({ onPreview, onClose });
  latest.current = { onPreview, onClose };
  const finish = (cancel: boolean, focus = true) => {
    if (finished.current) return;
    finished.current = true;
    latest.current.onClose(cancel || lastEmitted.current === original.current);
    if (focus && anchor.isConnected) anchor.focus();
  };
  useEffect(() => {
    mounted.current = true;
    dialog.current?.querySelector<HTMLInputElement>('input')?.focus();
    const outside = (event: globalThis.PointerEvent) => {
      if (event.target instanceof Node && !dialog.current?.contains(event.target) && !anchor.contains(event.target)) finish(false, false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); finish(true); } };
    const resize = () => finish(false, false);
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("keydown", escape, true);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("pointerdown", outside, true); window.removeEventListener("keydown", escape, true); window.removeEventListener("resize", resize); mounted.current = false; queueMicrotask(() => { if (!mounted.current) finish(true, false); }); };
  }, []);
  const update = (next: typeof color) => {
    setColor(next);
    const hex = toHex(next.h, next.s, next.v);
    setHexDraft(hex); setInvalid(false);
    const output = colorWithAlpha(hex, next.a);
    if (output !== lastEmitted.current) { lastEmitted.current = output; latest.current.onPreview(output); }
  };
  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    update({ ...color, s: clamp((event.clientX - rect.left) / rect.width), v: 1 - clamp((event.clientY - rect.top) / rect.height) });
  };
  const applyHex = () => {
    const parsed = parseColor(hexDraft.startsWith("#") ? hexDraft : `#${hexDraft}`);
    if (!parsed) { setInvalid(true); return; }
    update({ ...toHsv(parsed.hex), a: /^#?[\da-f]{4}$|^#?[\da-f]{8}$/i.test(hexDraft) ? parsed.alpha : color.a });
  };
  const rect = anchor.getBoundingClientRect();
  const left = Math.max(8, Math.min(window.innerWidth - 248, rect.left - 248));
  const top = Math.max(8, Math.min(rect.top - 8, window.innerHeight - 380));
  return createPortal(<div ref={dialog} className="color-popover" role="dialog" aria-label={`${label} picker`} style={{ left, top }} onKeyDown={(event) => {
    event.stopPropagation();
    if (event.key !== "Tab") return;
    const controls = Array.from(dialog.current!.querySelectorAll<HTMLElement>('input:not(:disabled), button:not(:disabled)'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>
    <div className="color-popover-heading"><strong>{label}</strong><button title="Apply and close" aria-label="Close color picker" onClick={() => finish(false)}>×</button></div>
    <div className="color-sv" aria-hidden="true" style={{ backgroundColor: `hsl(${color.h} 100% 50%)` }} onPointerDown={(event) => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); pick(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pick(event); }} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
      <span style={{ left: `${color.s * 100}%`, top: `${(1 - color.v) * 100}%`, background: toHex(color.h, color.s, color.v) }} />
    </div>
    <div className="color-popover-body">
      <label className="color-range"><span>Hue</span><input className="hue-range" aria-label="Hue" type="range" min="0" max="359" step="1" value={color.h} onChange={(e) => update({ ...color, h: Number(e.target.value) })} /></label>
      <label className="color-range"><span>Alpha</span><input aria-label="Alpha" type="range" min="0" max="100" value={Math.round(color.a * 100)} onChange={(e) => update({ ...color, a: Number(e.target.value) / 100 })} /><output>{Math.round(color.a * 100)}%</output></label>
      <div className="color-channels">
        <label>Saturation<input aria-label="Saturation" type="number" min="0" max="100" value={Math.round(color.s * 100)} onChange={(e) => update({ ...color, s: clamp(Number(e.target.value) / 100) })} /></label>
        <label>Brightness<input aria-label="Brightness" type="number" min="0" max="100" value={Math.round(color.v * 100)} onChange={(e) => update({ ...color, v: clamp(Number(e.target.value) / 100) })} /></label>
      </div>
      <label className="color-hex">Hex<input aria-label="Picker hex" aria-invalid={invalid || undefined} spellCheck={false} value={hexDraft} onChange={(e) => { setHexDraft(e.target.value); setInvalid(false); }} onBlur={applyHex} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyHex(); } }} /></label>
      {invalid && <span className="invalid-value">Enter a valid hex color.</span>}
      <div className="editor-actions"><button className="btn-ghost" onClick={() => finish(true)}>Cancel</button><button className="btn-primary" disabled={invalid} onClick={() => finish(false)}>Done</button></div>
    </div>
  </div>, document.body);
}
