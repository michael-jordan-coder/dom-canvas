import { useCallback, useRef, useState } from "react";
import type { Artboard, Camera } from "@/features/canvas/types";
import { documentName } from "./projectFile";
import { SnapshotHistory } from "./history";
import { serializeRoot } from "./serialize";

const DOC_KEY = "dom-canvas:doc:v1";
const CAMERA_KEY = "dom-canvas:camera:v1";
const HISTORY_LIMIT = 100;

type DocumentSnapshot = { name: string; artboards: Artboard[] };

type Updater = (list: Artboard[]) => Artboard[];

// The live DOM inside each shadow root is the source of truth while editing.
// A commit serializes it back into artboard.html, which is what history,
// persistence and re-rendering all read.
export function useDocument(hosts: Map<string, HTMLDivElement>, initial: () => Artboard[]) {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot>(() => loadDocument() ?? { name: "Untitled", artboards: initial() });
  const { artboards, name } = snapshot;
  const [saveStatus, setSaveStatus] = useState("Local document");
  const latest = useRef(artboards);
  const latestName = useRef(name);
  const history = useRef(new SnapshotHistory(snapshot, HISTORY_LIMIT));

  const apply = useCallback((next: DocumentSnapshot) => {
    latest.current = next.artboards;
    latestName.current = next.name;
    setSnapshot(next);
  }, []);

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
    setSaveStatus(saveDocument(snapshot) ? "Saved locally" : "Not saved — storage full or unavailable");
  }, [apply, hosts]);

  const undo = useCallback(() => {
    const previous = history.current.undo();
    if (!previous) return false;
    apply(previous);
    setSaveStatus(saveDocument(previous) ? "Saved locally" : "Not saved — storage full or unavailable");
    return true;
  }, [apply]);

  const redo = useCallback(() => {
    const next = history.current.redo();
    if (!next) return false;
    apply(next);
    setSaveStatus(saveDocument(next) ? "Saved locally" : "Not saved — storage full or unavailable");
    return true;
  }, [apply]);

  return { artboards, name, latest, update, commit, undo, redo, saveStatus, canUndo: history.current.canUndo, canRedo: history.current.canRedo };
}

function loadDocument(): DocumentSnapshot | null {
  try {
    const raw = localStorage.getItem(DOC_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return { name: "Untitled", artboards: parsed };
    return parsed && Array.isArray(parsed.artboards) ? { name: documentName(typeof parsed.name === "string" ? parsed.name : "Untitled"), artboards: parsed.artboards } : null;
  } catch {
    return null;
  }
}

function saveDocument(snapshot: DocumentSnapshot) {
  try {
    localStorage.setItem(DOC_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function loadCamera(): Camera | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(CAMERA_KEY) ?? "null");
    return parsed && typeof parsed.z === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCamera(camera: Camera) {
  try {
    localStorage.setItem(CAMERA_KEY, JSON.stringify(camera));
  } catch {
    // Storage unavailable: camera just resets on reload.
  }
}
