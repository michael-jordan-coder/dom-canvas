import { useCallback, useEffect, useRef, useState } from "react";
import type { Artboard } from "@/features/canvas/types";
import { documentName } from "./projectFile";
import { SnapshotHistory } from "./history";
import { serializeRoot } from "./serialize";
import type { DocumentSnapshot, DocumentStore } from "./store";

const HISTORY_LIMIT = 100;

type Updater = (list: Artboard[]) => Artboard[];

// The live DOM inside each shadow root is the source of truth while editing.
// A commit serializes it back into artboard.html, which is what history,
// persistence and re-rendering all read.
export function useDocument(hosts: Map<string, HTMLDivElement>, initial: () => Artboard[], store: DocumentStore) {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot>(() => store.initial ?? { name: "Untitled", artboards: initial() });
  const { artboards, name } = snapshot;
  const [saveStatus, setSaveStatus] = useState(store.kind === "local" ? "Local document" : store.savedLabel);
  const latest = useRef(artboards);
  const latestName = useRef(name);
  const history = useRef(new SnapshotHistory(snapshot, HISTORY_LIMIT));

  const apply = useCallback((next: DocumentSnapshot) => {
    latest.current = next.artboards;
    latestName.current = next.name;
    setSnapshot(next);
  }, []);

  const persist = useCallback((next: DocumentSnapshot) => {
    if (store.kind !== "local") setSaveStatus("Saving…");
    store.save(next).then((ok) => setSaveStatus(ok ? store.savedLabel : "Not saved — storage full or unavailable"));
  }, [store]);

  const update = useCallback((fn: Updater) => { history.current.breakGroup(); apply({ name: latestName.current, artboards: fn(latest.current) }); }, [apply]);

  const commit = useCallback((fn?: Updater, group?: symbol, nextName?: string) => {
    const base = fn ? fn(latest.current) : latest.current;
    const frames = base.map((ab) => {
      const root = hosts.get(ab.id)?.shadowRoot;
      return root ? { ...ab, html: serializeRoot(root) } : ab;
    });
    const snapshot = { name: nextName === undefined ? latestName.current : documentName(nextName), artboards: frames };
    history.current.commit(snapshot, group);
    apply(snapshot);
    persist(snapshot);
  }, [apply, hosts, persist]);

  const undo = useCallback(() => {
    const previous = history.current.undo();
    if (!previous) return false;
    apply(previous);
    persist(previous);
    return true;
  }, [apply, persist]);

  const redo = useCallback(() => {
    const next = history.current.redo();
    if (!next) return false;
    apply(next);
    persist(next);
    return true;
  }, [apply, persist]);

  // A document rewritten outside this browser replaces the current one as an
  // undoable step, and is not written back: the file is already what it says.
  useEffect(() => store.onExternalChange?.((next) => {
    history.current.commit(next);
    apply(next);
    setSaveStatus(`Reloaded from ${store.savedLabel.replace(/^Saved to /, "")}`);
  }), [apply, store]);

  return { artboards, name, latest, update, commit, undo, redo, saveStatus, canUndo: history.current.canUndo, canRedo: history.current.canRedo };
}
