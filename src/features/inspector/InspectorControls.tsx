import { useEffect, useRef, useState, type ReactNode } from "react";

type Commit = (value: string) => boolean | void;

export function Section({ title, children, defaultOpen = true, onReset }: { title: string; children: ReactNode; defaultOpen?: boolean; onReset?: () => void }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className="property-section">
    <div className="property-section-heading">
      <button className="section-toggle" aria-expanded={open} onClick={() => setOpen(!open)}><span className={`section-chevron${open ? " open" : ""}`} aria-hidden="true" />{title}</button>
      {onReset && <button className="property-reset" title={`Reset ${title.toLowerCase()} overrides`} aria-label={`Reset ${title.toLowerCase()} overrides`} onClick={onReset}>Reset</button>}
    </div>
    {open && <div className="property-section-body">{children}</div>}
  </section>;
}

export function Row({ single, children }: { single?: boolean; children: ReactNode }) {
  return <div className={`property-row${single ? " single" : ""}`}>{children}</div>;
}

export function Field({ value, label, prefix, suffix, onCommit, onReset }: {
  value: string; label: string; prefix?: string; suffix?: string; onCommit: Commit; onReset?: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const cancelled = useRef(false);
  useEffect(() => { setDraft(value); setInvalid(false); }, [value]);
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; return; }
    if (draft !== value) setInvalid(onCommit(draft.trim()) === false);
  };
  return <div className={`property-shell${onReset ? " overridden" : ""}`}>
    <label className={`field${prefix ? "" : " no-prefix"}${invalid ? " invalid" : ""}`} title={invalid ? `Invalid value for ${label}` : label}>
      {prefix && <span className="prefix">{prefix}</span>}
      <input aria-label={label} aria-invalid={invalid || undefined} value={draft}
        onChange={(e) => { setDraft(e.target.value); setInvalid(false); }} onBlur={commit} onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { e.preventDefault(); cancelled.current = true; setDraft(value); setInvalid(false); e.currentTarget.blur(); }
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            const match = draft.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
            if (!match) return;
            e.preventDefault(); e.stopPropagation();
            const step = (e.shiftKey ? 10 : e.altKey ? 0.1 : 1) * (e.key === "ArrowUp" ? 1 : -1);
            const next = `${Math.round((Number(match[1]) + step) * 100) / 100}${match[2]}`;
            setDraft(next); setInvalid(onCommit(next) === false);
          }
        }} />
      {suffix && <span className="suffix">{suffix}</span>}
    </label>
    {onReset && <button className="reset-value" title={`Reset ${label} to stylesheet`} aria-label={`Reset ${label} to stylesheet`} onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft(value); setInvalid(false); onReset(); }}>↺</button>}
    {invalid && <span className="invalid-value" role="alert">Invalid value</span>}
  </div>;
}

export function SelectField({ label, value, options, onCommit }: { label: string; value: string; options: string[]; onCommit: Commit }) {
  const choices = options.includes(value) ? options : [value, ...options];
  return <label className="select-field"><span>{label}</span><select aria-label={label} value={value} onChange={(e) => onCommit(e.target.value)}>{choices.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

export function Segmented({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <div className="segmented" role="group" aria-label={label}>{options.map((option) => <button key={option.value} title={`${label}: ${option.label}`} aria-label={`${label}: ${option.label}`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}

export function TextArea({ value, onCommit }: { value: string; onCommit: Commit }) {
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);
  useEffect(() => setDraft(value), [value]);
  return <textarea className="content-input" aria-label="Text content" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => { if (cancelled.current) { cancelled.current = false; return; } if (draft !== value) onCommit(draft); }} onKeyDown={(e) => { if (e.key === "Escape") { cancelled.current = true; setDraft(value); e.currentTarget.blur(); } }} />;
}

export function ColorField({ value, label, onCommit, onReset }: { value: string; label: string; onCommit: Commit; onReset?: () => void }) {
  const normalized = normalizeColor(value);
  return <div className="color-property">
    <label className="color-picker" title={`Pick ${label}`}>
      <span style={{ background: value }} />
      <input type="color" aria-label={`Pick ${label}`} value={normalized.hex} onChange={(e) => onCommit(e.target.value)} />
    </label>
    <Field label={label} value={normalized.text} onCommit={(v) => onCommit(/^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ? `#${v}` : v)} onReset={onReset} />
  </div>;
}

function normalizeColor(value: string) {
  if (/^#[\da-f]{6}$/i.test(value)) return { hex: value, text: value.toUpperCase() };
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
  if (rgb) {
    const hex = `#${rgb.slice(1, 4).map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))).toString(16).padStart(2, "0")).join("")}`;
    return { hex, text: rgb[4] !== undefined && Number(rgb[4]) < 1 ? value : hex.toUpperCase() };
  }
  return { hex: "#000000", text: value };
}
