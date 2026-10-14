import { FieldOptions } from "./FieldOptions";
import { ColorPopover } from "./ColorPopover";
import { useInspectorDisclosure } from "./InspectorPreferences";
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { colorWithAlpha, parseColor, rememberRecentColor } from "./color";
import { numericExpression } from "./arithmetic";
import type { PropertyState } from "./propertyState";

export const InspectorEdits = createContext<{ begin: () => void; finish: (cancel: boolean) => void } | null>(null);

type Commit = (value: string) => boolean | void;

export function Section({ title, preferenceKey, children, defaultOpen = true, onReset, actions, help }: { title: string; preferenceKey?: string; children: ReactNode; defaultOpen?: boolean; onReset?: () => void; actions?: ReactNode; help?: ReactNode }) {
  const headingId = useId();
  const [open, setOpen] = useInspectorDisclosure(`section:${preferenceKey ?? title}`, defaultOpen, { title, headingId });
  const helpId = useId();
  const [helpOpen, setHelpOpen] = useState(false);
  return <section className="property-section" aria-labelledby={headingId}>
    <div className="property-section-heading">
      <button id={headingId} className="section-toggle" aria-expanded={open} onClick={() => setOpen(!open)}><span className={`section-chevron${open ? " open" : ""}`} aria-hidden="true" />{title}</button>
      {actions}
      {help && <button className="inspector-icon section-help-toggle" aria-label={`${title} help`} title={`${title} help`} aria-expanded={helpOpen} aria-controls={helpOpen ? helpId : undefined} onClick={() => setHelpOpen(!helpOpen)}><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M8 7v4M8 4.5v.5" /></svg></button>}
      {onReset && <button className="property-reset" title={`Reset ${title.toLowerCase()} overrides`} aria-label={`Reset ${title.toLowerCase()} overrides`} onClick={onReset}>Reset</button>}
    </div>
    {help && helpOpen && <div id={helpId} className="section-help">{help}</div>}
    {open && <div className="property-section-body">{children}</div>}
  </section>;
}

export function Row({ single, children }: { single?: boolean; children: ReactNode }) {
  return <div className={`property-row${single ? " single" : ""}`}>{children}</div>;
}

export function Field({ value, state, mixed = false, disabled = false, label, prefix, suffix, onCommit, onReset, trailing, suggestions }: {
  value: string; label: string; prefix?: ReactNode; suffix?: string; onCommit: (value: string) => boolean | void | string; onReset?: () => void; trailing?: ReactNode; suggestions?: { value: string; label?: string }[];
  state?: PropertyState; mixed?: boolean; disabled?: boolean;
}) {
  mixed = state?.mixed ?? (mixed || value === "Mixed");
  disabled = disabled || state?.available === false;
  if (mixed) value = "";
  const listId = useId();
  const edits = useContext(InspectorEdits);
  const input = useRef<HTMLInputElement>(null);
  const editing = useRef(false);
  const dirty = useRef(false);
  const [scrubbing, setScrubbing] = useState(false);
  const drag = useRef<{ x: number; value: number; unit: string; initial: string; last: string; lastX: number; moved: boolean } | null>(null);
  const latestEdits = useRef(edits);
  latestEdits.current = edits;
  const keyAdjustment = useRef<{ key: string; initial: string } | null>(null);
  const finishKeys = (cancel: boolean) => {
    const current = keyAdjustment.current;
    if (!current) return false;
    keyAdjustment.current = null;
    latestEdits.current?.finish(cancel);
    if (cancel) { setDraft(current.initial); setInvalid(false); }
    return true;
  };
  useEffect(() => {
    if (!scrubbing) return;
    document.documentElement.dataset.scrubbing = "";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); finishScrub(true); } };
    window.addEventListener("keydown", escape, true);
    return () => { delete document.documentElement.dataset.scrubbing; window.removeEventListener("keydown", escape, true); };
  }, [scrubbing]);
  useEffect(() => {
    const finishOnWindowBlur = () => finishKeys(false);
    window.addEventListener("blur", finishOnWindowBlur);
    return () => {
      window.removeEventListener("blur", finishOnWindowBlur);
      finishKeys(true);
      if (drag.current) latestEdits.current?.finish(true);
    };
  }, []);
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionIndex, setOptionIndex] = useState(-1);
  const [filterOptions, setFilterOptions] = useState(false);
  useEffect(() => { if (optionsOpen && optionIndex >= 0) document.getElementById(`${listId}-${optionIndex}`)?.scrollIntoView({ block: "nearest" }); }, [optionIndex, optionsOpen, listId]);
  const options = (suggestions ?? []).filter((option) => !filterOptions || `${option.value} ${option.label ?? ""}`.toLowerCase().includes(draft.toLowerCase()));
  // A setter may return the canonical value after clamping or normalization.
  const submit = (next: string) => {
    const result = onCommit(next);
    setInvalid(result === false);
    if (result === false) return null;
    const accepted = typeof result === "string" ? result : next;
    setDraft(accepted);
    return accepted;
  };
  const chooseOption = (next: string) => { setDraft(next); submit(next); setOptionsOpen(false); setFilterOptions(false); input.current?.focus(); };
  const cancelled = useRef(false);
  // Parent renders (for example, canvas panning) must not erase an edit in progress.
  useEffect(() => { if (!editing.current || !dirty.current) { setDraft(value); setInvalid(false); } }, [value]);
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; return true; }
    if (!dirty.current || draft === value) { setInvalid(false); return true; }
    const numericValue = value.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
    const expression = numericValue ? numericExpression(draft) : null;
    if (expression && "error" in expression) { setInvalid(true); return false; }
    const next = expression ? `${expression.value}${numericValue![2]}` : draft.trim();
    return submit(next) !== null;
  };
  const finishScrub = (cancel: boolean) => {
    if (!drag.current) return;
    const initial = drag.current.initial;
    drag.current = null;
    setScrubbing(false);
    edits?.finish(cancel);
    if (cancel) { setDraft(initial); setInvalid(false); }
  };
  const numeric = !disabled && /^(-?\d*\.?\d+)([a-z%]*)$/i.test(value);
  return <div className={`property-shell${onReset ? " overridden" : ""}${mixed ? " mixed" : ""}${state?.bound ? " bound" : ""}`} data-source={state?.bound ? "variable" : state?.authored ? "authored" : "computed"}>
    <div className={`field${prefix ? "" : " no-prefix"}${invalid ? " invalid" : ""}`} title={invalid ? `Invalid value for ${label}` : numeric ? `${label} · Calculate with + − * / and parentheses` : label}>
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
          const accepted = submit(next);
          if (accepted !== null) { current.value = parseFloat(accepted); current.last = accepted; }
        }}
        onPointerUp={(e) => { finishScrub(false); if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
        onPointerCancel={() => finishScrub(true)} onLostPointerCapture={() => finishScrub(false)}
        onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finishScrub(true); } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.focus(); } }}
      >{prefix}</span>}
      <input ref={input} disabled={disabled} placeholder={mixed ? "Mixed" : undefined} role={suggestions ? "combobox" : undefined} aria-autocomplete={suggestions ? "list" : undefined} aria-expanded={suggestions ? optionsOpen : undefined} aria-controls={suggestions && optionsOpen ? listId : undefined} aria-activedescendant={optionsOpen && optionIndex >= 0 && options[optionIndex] ? `${listId}-${optionIndex}` : undefined} aria-label={label} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${listId}-error` : undefined} value={draft}
        onChange={(e) => { dirty.current = true; finishKeys(false); setDraft(e.target.value); setInvalid(false); if (suggestions) { setOptionsOpen(true); setFilterOptions(true); setOptionIndex(-1); } }} onBlur={() => { editing.current = false; setOptionsOpen(false); if (!finishKeys(false)) commit(); dirty.current = false; }} onFocus={(e) => { editing.current = true; dirty.current = false; e.target.select(); }}
        onKeyUp={(e) => { if (e.key === keyAdjustment.current?.key) finishKeys(false); }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (keyAdjustment.current && e.key === "Escape") {
            e.preventDefault(); e.stopPropagation(); finishKeys(true);
            cancelled.current = true; e.currentTarget.blur(); return;
          }
          if (keyAdjustment.current && e.key !== keyAdjustment.current.key && !["Shift", "Alt"].includes(e.key)) finishKeys(false);
          if (suggestions && (e.key === "ArrowDown" || e.key === "ArrowUp") && !e.shiftKey && !e.altKey) {
            e.preventDefault(); e.stopPropagation();
            setOptionsOpen(true);
            setOptionIndex((current) => options.length ? current < 0 ? (e.key === "ArrowDown" ? 0 : options.length - 1) : (current + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length : -1);
            return;
          }
          if (optionsOpen && (e.key === "Home" || e.key === "End")) { e.preventDefault(); e.stopPropagation(); setOptionIndex(e.key === "Home" ? 0 : options.length - 1); return; }
          if (optionsOpen && e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOptionsOpen(false); return; }
          if (optionsOpen && e.key === "Enter" && optionIndex >= 0 && options[optionIndex]) { e.preventDefault(); chooseOption(options[optionIndex].value); return; }
          if (e.key === "Enter") {
            e.preventDefault(); e.stopPropagation();
            if (commit()) { cancelled.current = true; e.currentTarget.blur(); }
            return;
          }
          if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cancelled.current = true; setDraft(value); setInvalid(false); e.currentTarget.blur(); }
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            if (e.metaKey || e.ctrlKey) return;
            const match = draft.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
            if (!match) return;
            e.preventDefault(); e.stopPropagation();
            if (!keyAdjustment.current && edits) {
              keyAdjustment.current = { key: e.key, initial: value };
              edits.begin();
            }
            const step = (e.shiftKey ? 10 : e.altKey ? 0.1 : 1) * (e.key === "ArrowUp" ? 1 : -1);
            const next = `${Math.round((Number(match[1]) + step) * 100) / 100}${match[2]}`;
            setDraft(next); submit(next);
          }
        }} />
      {suffix && <span className="suffix">{suffix}</span>}
      {suggestions && <button type="button" className="suggestion-toggle" aria-label={`Show ${label} options`} tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => { setOptionsOpen(!optionsOpen); setFilterOptions(false); setOptionIndex(-1); input.current?.focus(); }}>⌄</button>}
      {trailing}
    </div>
    {suggestions && optionsOpen && input.current && <FieldOptions anchor={input.current} id={listId} label={`${label} options`}>
      {options.length ? options.map((option, index) => <button type="button" role="option" tabIndex={-1} id={`${listId}-${index}`} aria-selected={index === optionIndex} key={option.value} onMouseDown={(e) => e.preventDefault()} onClick={() => chooseOption(option.value)}>{option.label ?? option.value}</button>) : <div className="field-options-empty">Press Enter to use this value</div>}
    </FieldOptions>}
    {onReset && <button className="reset-value" title={`Reset ${label} to stylesheet`} aria-label={`Reset ${label} to stylesheet`} onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft(value); setInvalid(false); onReset(); }}>↺</button>}
    {invalid && <span id={`${listId}-error`} className="invalid-value" role="alert">Invalid value · Esc to revert</span>}
  </div>;
}

export function SelectField({ label, value, options, onCommit, disabled = false }: { label: string; value: string; options: (string | { value: string; label: string })[]; onCommit: Commit; disabled?: boolean }) {
  const normalized = options.map((option) => typeof option === "string" ? { value: option, label: option } : option);
  const choices = normalized.some((option) => option.value === value) ? normalized : [{ value, label: value }, ...normalized];
  return <label className="select-field"><span>{label}</span><select disabled={disabled} aria-label={label} value={value} onChange={(e) => onCommit(e.target.value)}>{choices.map((option) => <option disabled={option.value === "Mixed"} key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function Segmented({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string; icon?: ReactNode }[]; onChange: (value: string) => void }) {
  return <div className="segmented" role="group" aria-label={label}>{options.map((option) => <button key={option.value} title={`${label}: ${option.label}`} aria-label={`${label}: ${option.label}`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.icon ?? option.label}</button>)}</div>;
}

export function TextArea({ value, onCommit }: { value: string; onCommit: Commit }) {
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);
  const dirty = useRef(false);
  useEffect(() => { if (!dirty.current) setDraft(value); }, [value]);
  return <textarea className="content-input" aria-label="Text content" rows={2} value={draft} onChange={(e) => { dirty.current = true; setDraft(e.target.value); }} onBlur={() => { const edited = dirty.current; dirty.current = false; if (cancelled.current) { cancelled.current = false; return; } if (edited && draft !== value) onCommit(draft); }} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); cancelled.current = true; setDraft(value); e.currentTarget.blur(); } }} />;
}

export function ColorField({ value, state, label, onCommit, onReset, mixed = false }: { value: string; label: string; onCommit: Commit; onReset?: () => void; mixed?: boolean; state?: PropertyState }) {
  mixed = state?.mixed ?? mixed;
  const parsed = parseColor(value);
  const edits = useContext(InspectorEdits);
  const swatch = useRef<HTMLButtonElement>(null);
  const openingColor = useRef(value);
  const [open, setOpen] = useState(false);
  return <div className="color-property">
    <button ref={swatch} className="color-picker" title={`Pick ${label}`} aria-label={`Pick ${label}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => { if (open) { if (value !== openingColor.current) rememberRecentColor(value); edits?.finish(false); setOpen(false); } else { openingColor.current = value; edits?.begin(); setOpen(true); } }}>
      <span style={{ background: mixed ? undefined : value }}>{mixed ? "—" : null}</span>
    </button>
    {open && swatch.current && <ColorPopover label={label} value={value} anchor={swatch.current} onPreview={onCommit} onClose={(cancel) => { edits?.finish(cancel); setOpen(false); }} />}
    <Field state={state} label={label} value={state?.bound ? state.authored : mixed ? "Mixed" : parsed?.hex ?? value} onCommit={(v) => {
      const next = /^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ? `#${v}` : v;
      const color = parseColor(next);
      return onCommit(color && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(next) ? colorWithAlpha(color.hex, mixed ? 1 : parsed?.alpha ?? 1) : next);
    }} onReset={onReset} />
    {parsed && !mixed && <div className="color-alpha"><Field label={`${label} opacity`} value={String(Math.round(parsed.alpha * 100))} suffix="%" onCommit={(v) => {
      const alpha = Number(v);
      if (!v || !Number.isFinite(alpha) || alpha < 0 || alpha > 100) return false;
      return onCommit(colorWithAlpha(parsed.hex, alpha / 100));
    }} /></div>}
  </div>;
}
