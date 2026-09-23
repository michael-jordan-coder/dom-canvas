import { useState, type FormEvent } from "react";
import { isUrl } from "./importUrl";

type Props = {
  busy: boolean;
  error: string | null;
  onImport: (url: string) => void;
};

export function ImportBar({ busy, error, onImport }: Props) {
  const [url, setUrl] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!isUrl(trimmed)) return;
    onImport(trimmed);
  };

  return (
    <form className="toolbar" onSubmit={submit}>
      <input
        className="url-input"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={busy}
      />
      <button className="primary" type="submit" disabled={busy || !isUrl(url)}>
        {busy ? "Importing…" : "Import"}
      </button>
      {error && <span className="toolbar-error">{error}</span>}
    </form>
  );
}
