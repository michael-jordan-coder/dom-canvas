import { useEffect, useRef, useState } from "react";
import { clampZoom } from "./geometry";

const percent = (zoom: number) => String(Math.round(zoom * 10000) / 100);

export function ZoomControl({ zoom, onChange }: { zoom: number; onChange: (zoom: number) => void }) {
  const [draft, setDraft] = useState(() => percent(zoom));
  const [invalid, setInvalid] = useState(false);
  const skipBlur = useRef(false);
  useEffect(() => { setDraft(percent(zoom)); setInvalid(false); }, [zoom]);
  const parse = () => {
    const value = draft.trim().replace(/%$/, "").trim();
    return /^(?:\d+\.?\d*|\.\d+)$/.test(value) && Number(value) > 0 ? Number(value) / 100 : null;
  };
  const apply = (value: number | null) => {
    if (value === null || !Number.isFinite(value)) { setInvalid(true); return false; }
    const next = clampZoom(value);
    setInvalid(false); setDraft(percent(next)); onChange(next); return true;
  };
  return <label className="zoom-control" title="Zoom 2–800%. Shift+0 for actual size.">
    <input aria-label="Zoom percentage" role="spinbutton" inputMode="decimal" aria-valuemin={2} aria-valuemax={800} aria-valuenow={Number(percent(zoom))} aria-invalid={invalid || undefined} value={draft}
      onFocus={(e) => e.target.select()}
      onChange={(e) => { setDraft(e.target.value); setInvalid(false); }}
      onBlur={() => { if (skipBlur.current) skipBlur.current = false; else apply(parse()); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault(); e.stopPropagation();
          if (apply(parse())) { skipBlur.current = true; e.currentTarget.blur(); }
        } else if (e.key === "Escape") {
          e.preventDefault(); e.stopPropagation();
          setDraft(percent(zoom)); setInvalid(false); skipBlur.current = true; e.currentTarget.blur();
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault(); e.stopPropagation();
          const step = e.altKey ? .01 : e.shiftKey ? .25 : .1;
          apply((parse() ?? zoom) + (e.key === "ArrowUp" ? step : -step));
        }
      }} />
    <span aria-hidden="true">%</span>
  </label>;
}
