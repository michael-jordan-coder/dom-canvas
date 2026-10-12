import { useCallback, useRef, useState } from "react";
import type { Artboard, Camera } from "@/features/canvas/types";
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
  const committed = useRef(artboards);
  const past = useRef<Artboard[][]>([]);
  const future = useRef<Artboard[][]>([]);

  const apply = useCallback((next: Artboard[]) => {
    latest.current = next;
    setArtboards(next);
  }, []);

  const update = useCallback((fn: Updater) => apply(fn(latest.current)), [apply]);

  const commit = useCallback((fn?: Updater) => {
    const base = fn ? fn(latest.current) : latest.current;
    const snapshot = base.map((ab) => {
      const root = hosts.get(ab.id)?.shadowRoot;
      return root ? { ...ab, html: serializeRoot(root) } : ab;
    });
    past.current = [...past.current, committed.current].slice(-HISTORY_LIMIT);
    future.current = [];
    committed.current = snapshot;
    apply(snapshot);
    setSaveStatus(saveDocument(snapshot) ? "Saved locally" : "Not saved — storage full or unavailable");
  }, [apply, hosts]);

  const undo = useCallback(() => {
    const previous = past.current.at(-1);
    if (!previous) return false;
    past.current = past.current.slice(0, -1);
    future.current = [committed.current, ...future.current];
    committed.current = previous;
    apply(previous);
    setSaveStatus(saveDocument(previous) ? "Saved locally" : "Not saved — storage full or unavailable");
    return true;
  }, [apply]);

  const redo = useCallback(() => {
    const next = future.current[0];
    if (!next) return false;
    future.current = future.current.slice(1);
    past.current = [...past.current, committed.current];
    committed.current = next;
    apply(next);
    setSaveStatus(saveDocument(next) ? "Saved locally" : "Not saved — storage full or unavailable");
    return true;
  }, [apply]);

  return { artboards, latest, update, commit, undo, redo, saveStatus, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
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
