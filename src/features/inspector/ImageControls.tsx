import { useEffect, useState } from "react";
import { Field, Section, SelectField } from "./InspectorControls";

export function ImageControls({ image, onChange }: { image: HTMLImageElement; onChange: () => void }) {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh(value => value + 1);
    image.addEventListener("load", update); image.addEventListener("error", update);
    return () => { image.removeEventListener("load", update); image.removeEventListener("error", update); };
  }, [image]);
  const computed = getComputedStyle(image);
  const set = (property: string, value: string) => {
    if (!CSS.supports(property, value)) return false;
    image.style.setProperty(property, value); onChange(); return true;
  };
  const reset = (properties: string[]) => properties.some(property => image.style.getPropertyValue(property)) ? () => { properties.forEach(property => image.style.removeProperty(property)); onChange(); } : undefined;
  return <Section title="Image" onReset={reset(["object-fit", "object-position"])}>
    <div className="flow-layout">
      <div className="flow-controls">
        <SelectField label="Fit" value={computed.objectFit} options={[{ value: "cover", label: "Fill" }, { value: "contain", label: "Fit" }, { value: "fill", label: "Stretch" }, { value: "none", label: "Original" }, { value: "scale-down", label: "Shrink" }]} onCommit={value => set("object-fit", value)} />
        <p className="property-note">{image.naturalWidth ? `${image.naturalWidth} × ${image.naturalHeight} original` : image.complete ? "Image unavailable" : "Loading image…"}</p>
      </div>
      <div className="alignment-grid" role="group" aria-label="Image alignment">
        {[0, 50, 100].flatMap((y, row) => [0, 50, 100].map((x, column) => <button key={`${x}-${y}`} aria-label={`Image align ${["top", "middle", "bottom"][row]} ${["left", "center", "right"][column]}`} aria-pressed={computed.objectPosition === `${x}% ${y}%`} onClick={() => set("object-position", `${x}% ${y}%`)}><span /></button>))}
      </div>
    </div>
    <Field label="Image position" prefix="Position" value={image.style.objectPosition || computed.objectPosition} onCommit={value => set("object-position", value)} onReset={reset(["object-position"])} />
    <Field label="Image description" prefix="Alt" value={image.getAttribute("alt") ?? ""} onCommit={value => { image.setAttribute("alt", value); onChange(); }} />
  </Section>;
}
