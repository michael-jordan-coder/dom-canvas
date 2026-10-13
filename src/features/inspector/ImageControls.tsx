import { useEffect, useState } from "react";
import { Field, Section, SelectField } from "./InspectorControls";
import { useInspectorDisclosure } from "./InspectorPreferences";

export function ImageControls({ image, onChange }: { image: HTMLImageElement; onChange: () => void }) {
  const [, refresh] = useState(0);
  const [sourceOpen, setSourceOpen] = useInspectorDisclosure("image-source", false);
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
  const pictureSources = image.parentElement?.tagName === "PICTURE" ? Array.from(image.parentElement.querySelectorAll(":scope > source[srcset]")) : [];
  const responsive = image.hasAttribute("srcset") || pictureSources.length > 0;
  const replaceSource = (value: string) => {
    if (!value.trim()) return false;
    let url: URL;
    try { url = new URL(value, image.baseURI); } catch { return false; }
    if (!["http:", "https:", "blob:"].includes(url.protocol) && !(url.protocol === "data:" && /^data:image\//i.test(value))) return false;
    // A chosen replacement must not be masked by a responsive candidate.
    pictureSources.forEach(source => source.removeAttribute("srcset"));
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
    image.setAttribute("src", value);
    onChange();
    return true;
  };
  return <Section title="Image" onReset={reset(["object-fit", "object-position"])}>
    <div className="flow-layout">
      <div className="flow-controls">
        <SelectField label="Fit" value={computed.objectFit} options={[{ value: "cover", label: "Fill" }, { value: "contain", label: "Fit" }, { value: "fill", label: "Stretch" }, { value: "none", label: "Original" }, { value: "scale-down", label: "Shrink" }]} onCommit={value => set("object-fit", value)} />
        <p className="property-note" role="status">{!image.complete ? "Loading image…" : image.naturalWidth ? `${image.naturalWidth} × ${image.naturalHeight} original` : "Image unavailable"}</p>
      </div>
      <div className="alignment-grid" role="group" aria-label="Image alignment">
        {[0, 50, 100].flatMap((y, row) => [0, 50, 100].map((x, column) => <button key={`${x}-${y}`} aria-label={`Image align ${["top", "middle", "bottom"][row]} ${["left", "center", "right"][column]}`} aria-pressed={computed.objectPosition === `${x}% ${y}%`} onClick={() => set("object-position", `${x}% ${y}%`)}><span /></button>))}
      </div>
    </div>
    <Field label="Image position" prefix="Position" value={image.style.objectPosition || computed.objectPosition} onCommit={value => set("object-position", value)} onReset={reset(["object-position"])} />
    <Field label="Image description" prefix="Alt" value={image.getAttribute("alt") ?? ""} onCommit={value => { image.setAttribute("alt", value); onChange(); }} />
    <details className="layout-details" open={sourceOpen} onToggle={e => setSourceOpen(e.currentTarget.open)}>
      <summary><span>Image source</span></summary>
      <div className="layout-details-body">
        <Field label="Image URL" value={image.getAttribute("src") ?? ""} onCommit={replaceSource} />
        {responsive && <p className="property-note">Responsive sources are active. Replacing the URL uses one image at all sizes.</p>}
      </div>
    </details>
  </Section>;
}
