import { useEffect, useState } from "react";
import type { Artboard, Selection } from "@/features/canvas/types";

type Props = {
  selection: Selection;
  artboards: Artboard[];
  onUpdateArtboard: (id: string, patch: Partial<Artboard>) => void;
  version: number;
  onChange: () => void;
};

const STYLE_FIELDS: { label: string; prop: keyof CSSStyleDeclaration & string }[] = [
  { label: "Width", prop: "width" },
  { label: "Height", prop: "height" },
  { label: "Color", prop: "color" },
  { label: "Background", prop: "backgroundColor" },
  { label: "Font size", prop: "fontSize" },
  { label: "Font weight", prop: "fontWeight" },
  { label: "Padding", prop: "padding" },
  { label: "Margin", prop: "margin" },
  { label: "Radius", prop: "borderRadius" },
  { label: "Opacity", prop: "opacity" },
  { label: "Translate", prop: "translate" },
];

export function Inspector({ selection, artboards, onUpdateArtboard, version, onChange }: Props) {
  if (selection.kind === "none") {
    return <div className="empty">Select an element or artboard.</div>;
  }

  if (selection.kind === "artboard") {
    const ab = artboards.find((a) => a.id === selection.artboardId);
    if (!ab) return null;
    return (
      <div className="panel-body">
        <div className="section-title">Artboard</div>
        <TextField label="Name" value={ab.name} onCommit={(v) => onUpdateArtboard(ab.id, { name: v })} />
        <TextField label="X" value={String(ab.x)} onCommit={(v) => onUpdateArtboard(ab.id, { x: Number(v) || 0 })} />
        <TextField label="Y" value={String(ab.y)} onCommit={(v) => onUpdateArtboard(ab.id, { y: Number(v) || 0 })} />
        <TextField label="Width" value={String(ab.width)} onCommit={(v) => onUpdateArtboard(ab.id, { width: Number(v) || ab.width })} />
      </div>
    );
  }

  const el = selection.element;
  if (!el.isConnected) return <div className="empty">Element was removed.</div>;
  return <ElementFields key={version} element={el} onChange={onChange} />;
}

function ElementFields({ element, onChange }: { element: Element; onChange: () => void }) {
  const styled = element as HTMLElement | SVGElement;
  const computed = getComputedStyle(element);
  const isLeaf = element.children.length === 0;

  const write = (prop: string, value: string) => {
    styled.style.setProperty(kebab(prop), value);
    onChange();
  };

  return (
    <div className="panel-body">
      <div className="section-title">
        &lt;{element.tagName.toLowerCase()}&gt;
        {element.classList.length > 0 && ` .${Array.from(element.classList).join(".")}`}
      </div>

      {isLeaf && (
        <TextField
          label="Text"
          multiline
          value={element.textContent ?? ""}
          onCommit={(v) => { element.textContent = v; onChange(); }}
        />
      )}

      <div className="section-title">Style</div>
      {STYLE_FIELDS.map(({ label, prop }) => (
        <TextField
          key={prop}
          label={label}
          value={styled.style.getPropertyValue(kebab(prop)) || computed.getPropertyValue(kebab(prop))}
          placeholder={computed.getPropertyValue(kebab(prop))}
          onCommit={(v) => write(prop, v)}
        />
      ))}
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  onCommit: (value: string) => void;
};

function TextField({ label, value, placeholder, multiline, onCommit }: FieldProps) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => { if (draft !== value) onCommit(draft); };

  return (
    <div className="field">
      <label>{label}</label>
      {multiline ? (
        <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} />
      ) : (
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        />
      )}
    </div>
  );
}

function kebab(prop: string) {
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
