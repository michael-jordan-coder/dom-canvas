import { useCallback, useRef, useState } from "react";
import type { Artboard, Camera } from "@/features/canvas/types";
import { SnapshotHistory } from "./history";
import { serializeRoot } from "./serialize";

const DOC_KEY = "dom-canvas:doc:v1";
const CAMERA_KEY = "dom-canvas:camera:v1";
const HISTORY_LIMIT = 100;

type Updater = (list: Artboard[]) => Artboard[];

// The live DOM inside each shadow root is the source of truth while editing.
// A commit serializes it back into artboard.html, which is what history,
// persistence and re-rendering all read.
export function useDocument(hosts: Map<string, HTMLDivElement>, initial: () => Artboard[]) {
  const [artboards, setArtboards] = useState<Artboard[]>(() => loadDocument() ?? initial());
  const [saveStatus, setSaveStatus] = useState("Local document");
  const latest = useRef(artboards);
  const history = useRef(new SnapshotHistory(artboards, HISTORY_LIMIT));

  const apply = useCallback((next: Artboard[]) => {
    latest.current = next;
    setArtboards(next);
  }, []);

  const update = useCallback((fn: Updater) => { history.current.breakGroup(); apply(fn(latest.current)); }, [apply]);

  const commit = useCallback((fn?: Updater, group?: symbol) => {
    const base = fn ? fn(latest.current) : latest.current;
    const snapshot = base.map((ab) => {
      const root = hosts.get(ab.id)?.shadowRoot;
      return root ? { ...ab, html: serializeRoot(root) } : ab;
    });
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

  return { artboards, latest, update, commit, undo, redo, saveStatus, canUndo: history.current.canUndo, canRedo: history.current.canRedo };
}

function loadDocument(): Artboard[] | null {
  try {
    const raw = localStorage.getItem(DOC_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveDocument(artboards: Artboard[]) {
  try {
    localStorage.setItem(DOC_KEY, JSON.stringify(artboards));
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
