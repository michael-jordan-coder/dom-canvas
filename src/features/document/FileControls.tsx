import { useRef, useState } from "react";
import { decodeProject, type ProjectFile } from "./projectFile";

export function FileControls({ onSave, onOpen, onError }: { onSave: () => void; onOpen: (project: ProjectFile) => void; onError: (message: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return <div className="file-controls">
    <button className="inspector-icon" aria-label="Save canvas file" title="Save canvas file" onClick={onSave}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8m-3-3 3 3 3-3M3 11v3h10v-3" /></svg></button>
    <button className="inspector-icon" aria-label="Open canvas file" title="Open canvas file (Undo restores the current document)" disabled={busy} onClick={() => input.current?.click()}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5V3h5l2 2h5v8H2V5Zm0 2h12" /></svg></button>
    <input ref={input} type="file" accept=".json,application/json" aria-label="Canvas file" hidden onChange={async (event) => {
      const file = event.target.files?.[0]; event.target.value = "";
      if (!file) return;
      setBusy(true);
      try { onOpen(decodeProject(await file.text())); }
      catch (error) { onError(error instanceof Error ? error.message : "Could not open this canvas file."); }
      finally { setBusy(false); }
    }} />
  </div>;
}
