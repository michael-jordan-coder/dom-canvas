import { ColorPopover } from "./ColorPopover";
import { useInspectorDisclosure } from "./InspectorPreferences";
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { colorWithAlpha, parseColor } from "./color";

export const InspectorEdits = createContext<{ begin: () => void; finish: (cancel: boolean) => void } | null>(null);

type Commit = (value: string) => boolean | void;

export function Section({ title, preferenceKey, children, defaultOpen = true, onReset, actions }: { title: string; preferenceKey?: string; children: ReactNode; defaultOpen?: boolean; onReset?: () => void; actions?: ReactNode }) {
  const [open, setOpen] = useInspectorDisclosure(`section:${preferenceKey ?? title}`, defaultOpen);
  const headingId = useId();
  return <section className="property-section" aria-labelledby={headingId}>
    <div className="property-section-heading">
      <button id={headingId} className="section-toggle" aria-expanded={open} onClick={() => setOpen(!open)}><span className={`section-chevron${open ? " open" : ""}`} aria-hidden="true" />{title}</button>
      {actions}
      {onReset && <button className="property-reset" title={`Reset ${title.toLowerCase()} overrides`} aria-label={`Reset ${title.toLowerCase()} overrides`} onClick={onReset}>Reset</button>}
    </div>
    {open && <div className="property-section-body">{children}</div>}
  </section>;
}

export function Row({ single, children }: { single?: boolean; children: ReactNode }) {
  return <div className={`property-row${single ? " single" : ""}`}>{children}</div>;
}

export function Field({ value, label, prefix, suffix, onCommit, onReset, trailing, suggestions }: {
  value: string; label: string; prefix?: ReactNode; suffix?: string; onCommit: Commit; onReset?: () => void; trailing?: ReactNode; suggestions?: { value: string; label?: string }[];
}) {
  const listId = useId();
  const edits = useContext(InspectorEdits);
  const input = useRef<HTMLInputElement>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const drag = useRef<{ x: number; value: number; unit: string; initial: string; last: string; lastX: number; moved: boolean } | null>(null);
  const latestEdits = useRef(edits);
  latestEdits.current = edits;
  useEffect(() => {
    if (!scrubbing) return;
    document.documentElement.dataset.scrubbing = "";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); finishScrub(true); } };
    window.addEventListener("keydown", escape, true);
    return () => { delete document.documentElement.dataset.scrubbing; window.removeEventListener("keydown", escape, true); };
  }, [scrubbing]);
  useEffect(() => () => { if (drag.current) latestEdits.current?.finish(true); }, []);
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionIndex, setOptionIndex] = useState(-1);
  const [filterOptions, setFilterOptions] = useState(false);
  const [optionsAbove, setOptionsAbove] = useState(false);
  useEffect(() => { if (optionsOpen && input.current) setOptionsAbove(window.innerHeight - input.current.getBoundingClientRect().bottom < 210); }, [optionsOpen]);
  useEffect(() => { if (optionsOpen && optionIndex >= 0) document.getElementById(`${listId}-${optionIndex}`)?.scrollIntoView({ block: "nearest" }); }, [optionIndex, optionsOpen, listId]);
  const options = (suggestions ?? []).filter((option) => !filterOptions || `${option.value} ${option.label ?? ""}`.toLowerCase().includes(draft.toLowerCase()));
  const chooseOption = (next: string) => { setDraft(next); setInvalid(onCommit(next) === false); setOptionsOpen(false); setFilterOptions(false); input.current?.focus(); };
  const cancelled = useRef(false);
  useEffect(() => { setDraft(value); setInvalid(false); }, [value, onCommit]);
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; return; }
    if (draft !== value) setInvalid(onCommit(draft.trim()) === false);
  };
  const finishScrub = (cancel: boolean) => {
    if (!drag.current) return;
    const initial = drag.current.initial;
    drag.current = null;
    setScrubbing(false);
    edits?.finish(cancel);
    if (cancel) { setDraft(initial); setInvalid(false); }
  };
  const numeric = /^(-?\d*\.?\d+)([a-z%]*)$/i.test(value);
  return <div className={`property-shell${onReset ? " overridden" : ""}`}>
    <div className={`field${prefix ? "" : " no-prefix"}${invalid ? " invalid" : ""}`} title={invalid ? `Invalid value for ${label}` : label}>
      {prefix && <span className={`prefix${numeric && edits ? " scrub-label" : ""}`} title={numeric && edits ? `Drag to adjust ${label}. Shift: 10× · Alt: 0.1× · Escape: cancel` : undefined}
        tabIndex={numeric && edits ? 0 : undefined} role={numeric && edits ? "button" : undefined} aria-label={numeric && edits ? `Adjust ${label}` : undefined}
        onPointerDown={(e) => {
          if (!numeric || !edits || e.button !== 0) return;
          e.preventDefault(); e.stopPropagation();
          input.current?.blur();
          const match = value.match(/^(-?\d*\.?\d+)([a-z%]*)$/i)!;
          drag.current = { x: e.clientX, value: Number(match[1]), unit: match[2], initial: value, last: value, lastX: e.clientX, moved: false };
          edits.begin(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const current = drag.current;
          if (!current || (!current.moved && Math.abs(e.clientX - current.x) < 2)) return;
          if (!current.moved) setScrubbing(true);
          current.moved = true;
          const step = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
          // Follow clamped values, and apply modifier speed only to new travel.
          const observed = parseFloat(value);
          if (Number.isFinite(observed) && value !== current.last) current.value = observed;
          const candidate = current.value + (e.clientX - current.lastX) * step;
          current.lastX = e.clientX;
          const next = `${Math.round(candidate * 100) / 100}${current.unit}`;
          if (next === current.last) return;
          if (onCommit(next) !== false) { current.value = candidate; current.last = next; setDraft(next); setInvalid(false); }
        }}
        onPointerUp={(e) => { finishScrub(false); if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
        onPointerCancel={() => finishScrub(true)} onLostPointerCapture={() => finishScrub(false)}
        onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finishScrub(true); } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.focus(); } }}
      >{prefix}</span>}
      <input ref={input} role={suggestions ? "combobox" : undefined} aria-autocomplete={suggestions ? "list" : undefined} aria-expanded={suggestions ? optionsOpen : undefined} aria-controls={suggestions && optionsOpen ? listId : undefined} aria-activedescendant={optionsOpen && optionIndex >= 0 && options[optionIndex] ? `${listId}-${optionIndex}` : undefined} aria-label={label} aria-invalid={invalid || undefined} value={draft}
        onChange={(e) => { setDraft(e.target.value); setInvalid(false); if (suggestions) { setOptionsOpen(true); setFilterOptions(true); setOptionIndex(-1); } }} onBlur={() => { setOptionsOpen(false); commit(); }} onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (suggestions && (e.key === "ArrowDown" || e.key === "ArrowUp") && !e.shiftKey && !e.altKey) {
            e.preventDefault(); e.stopPropagation();
            setOptionsOpen(true);
            setOptionIndex((current) => options.length ? current < 0 ? (e.key === "ArrowDown" ? 0 : options.length - 1) : (current + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length : -1);
            return;
          }
          if (optionsOpen && (e.key === "Home" || e.key === "End")) { e.preventDefault(); e.stopPropagation(); setOptionIndex(e.key === "Home" ? 0 : options.length - 1); return; }
          if (optionsOpen && e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOptionsOpen(false); return; }
          if (optionsOpen && e.key === "Enter" && optionIndex >= 0 && options[optionIndex]) { e.preventDefault(); chooseOption(options[optionIndex].value); return; }
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
      {suggestions && <button type="button" className="suggestion-toggle" aria-label={`Show ${label} options`} tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => { setOptionsOpen(!optionsOpen); setFilterOptions(false); setOptionIndex(-1); input.current?.focus(); }}>⌄</button>}
      {trailing}
    </div>
    {suggestions && optionsOpen && <div className={`field-options${optionsAbove ? " above" : ""}`} role="listbox" id={listId} aria-label={`${label} options`}>
      {options.length ? options.map((option, index) => <button type="button" role="option" tabIndex={-1} id={`${listId}-${index}`} aria-selected={index === optionIndex} key={option.value} onMouseDown={(e) => e.preventDefault()} onClick={() => chooseOption(option.value)}>{option.label ?? option.value}</button>) : <div className="field-options-empty">Press Enter to use this value</div>}
    </div>}
    {onReset && <button className="reset-value" title={`Reset ${label} to stylesheet`} aria-label={`Reset ${label} to stylesheet`} onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft(value); setInvalid(false); onReset(); }}>↺</button>}
    {invalid && <span className="invalid-value" role="alert">Invalid value</span>}
  </div>;
}

export function SelectField({ label, value, options, onCommit }: { label: string; value: string; options: (string | { value: string; label: string })[]; onCommit: Commit }) {
  const normalized = options.map((option) => typeof option === "string" ? { value: option, label: option } : option);
  const choices = normalized.some((option) => option.value === value) ? normalized : [{ value, label: value }, ...normalized];
  return <label className="select-field"><span>{label}</span><select aria-label={label} value={value} onChange={(e) => onCommit(e.target.value)}>{choices.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function Segmented({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string; icon?: ReactNode }[]; onChange: (value: string) => void }) {
  return <div className="segmented" role="group" aria-label={label}>{options.map((option) => <button key={option.value} title={`${label}: ${option.label}`} aria-label={`${label}: ${option.label}`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.icon ?? option.label}</button>)}</div>;
}

export function TextArea({ value, onCommit }: { value: string; onCommit: Commit }) {
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);
  useEffect(() => setDraft(value), [value]);
  return <textarea className="content-input" aria-label="Text content" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => { if (cancelled.current) { cancelled.current = false; return; } if (draft !== value) onCommit(draft); }} onKeyDown={(e) => { if (e.key === "Escape") { cancelled.current = true; setDraft(value); e.currentTarget.blur(); } }} />;
}

export function ColorField({ value, label, onCommit, onReset }: { value: string; label: string; onCommit: Commit; onReset?: () => void }) {
  const parsed = parseColor(value);
  const edits = useContext(InspectorEdits);
  const swatch = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return <div className="color-property">
    <button ref={swatch} className="color-picker" title={`Pick ${label}`} aria-label={`Pick ${label}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => { if (open) { edits?.finish(false); setOpen(false); } else { edits?.begin(); setOpen(true); } }}>
      <span style={{ background: value }} />
    </button>
    {open && swatch.current && <ColorPopover label={label} value={value} anchor={swatch.current} onPreview={onCommit} onClose={(cancel) => { edits?.finish(cancel); setOpen(false); }} />}
    <Field label={label} value={parsed?.hex ?? value} onCommit={(v) => {
      const next = /^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ? `#${v}` : v;
      const color = parseColor(next);
      return onCommit(color && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(next) ? colorWithAlpha(color.hex, parsed?.alpha || 1) : next);
    }} onReset={onReset} />
    {parsed && <div className="color-alpha"><Field label={`${label} opacity`} value={String(Math.round(parsed.alpha * 100))} suffix="%" onCommit={(v) => {
      const alpha = Number(v);
      if (!v || !Number.isFinite(alpha) || alpha < 0 || alpha > 100) return false;
      return onCommit(colorWithAlpha(parsed.hex, alpha / 100));
    }} /></div>}
  </div>;
}
