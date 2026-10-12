import { useEffect, useRef, useState, type FormEvent } from "react";
import { LinkIcon } from "@/design-system/icons";
import { isUrl } from "./importUrl";

type Props = {
  busy: boolean;
  error: string | null;
  onImport: (url: string) => void;
};

export function ImportButton({ busy, error, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!isUrl(trimmed)) return;
    onImport(trimmed);
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        className={`tool${open ? " active" : ""}`}
        title="Import website"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <LinkIcon />
      </button>
      {open && (
        <form className="popover" onSubmit={submit}>
          <div className="popover-title">Import website</div>
          <div className="popover-row">
            <label className="field no-prefix">
              <input
                ref={inputRef}
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={busy}
              />
            </label>
            <button className="btn-primary" type="submit" disabled={busy || !isUrl(url)}>
              {busy ? "Importing…" : "Import"}
            </button>
          </div>
          {error ? (
            <div className="popover-error">{error}</div>
          ) : (
            <div className="popover-hint">Tip: paste a URL anywhere on the canvas.</div>
          )}
        </form>
      )}
    </div>
  );
}
