import type { Artboard, Camera } from "@/features/canvas/types";
import { documentName } from "./projectFile";

export type DocumentSnapshot = { name: string; artboards: Artboard[] };

// Where the document lives. Standalone, it is the browser's storage; served by
// Sketchpad at /board/#/<project>, it is that project's board.json on disk, so
// every browser and the agent read the same file.
export interface DocumentStore {
  readonly kind: "local" | "sketchpad";
  readonly initial: DocumentSnapshot | null;
  readonly camera: Camera | null;
  /** The status line after a successful save. */
  readonly savedLabel: string;
  save(snapshot: DocumentSnapshot): Promise<boolean>;
  saveCamera(camera: Camera): void;
  /** Fires when the document changed on disk by another hand (the agent, another browser). */
  onExternalChange?(listener: (snapshot: DocumentSnapshot) => void): () => void;
}

const DOC_KEY = "dom-canvas:doc:v1";
const CAMERA_KEY = "dom-canvas:camera:v1";

function parseSnapshot(raw: unknown): DocumentSnapshot | null {
  if (Array.isArray(raw)) return { name: "Untitled", artboards: raw };
  const parsed = raw as { name?: unknown; artboards?: unknown } | null;
  if (!parsed || !Array.isArray(parsed.artboards)) return null;
  return { name: documentName(typeof parsed.name === "string" ? parsed.name : "Untitled"), artboards: parsed.artboards as Artboard[] };
}

function readLocal<T>(key: string, check: (value: unknown) => T | null): T | null {
  try {
    return check(JSON.parse(localStorage.getItem(key) ?? "null"));
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const parseCamera = (value: unknown): Camera | null =>
  value && typeof (value as Camera).z === "number" ? (value as Camera) : null;

export function localStore(): DocumentStore {
  return {
    kind: "local",
    initial: readLocal(DOC_KEY, parseSnapshot),
    camera: readLocal(CAMERA_KEY, parseCamera),
    savedLabel: "Saved locally",
    save: async (snapshot) => writeLocal(DOC_KEY, snapshot),
    saveCamera: (camera) => void writeLocal(CAMERA_KEY, camera),
  };
}

export async function sketchpadStore(project: string): Promise<DocumentStore> {
  const endpoint = `/api/board?project=${encodeURIComponent(project)}`;
  const cameraKey = `${CAMERA_KEY}:${project}`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Sketchpad has no project named ${project}.`);
  // What this browser last wrote, so its own save coming back as a change event is not reloaded.
  let lastSaved = await response.text();
  const initial = parseSnapshot(lastSaved === "null" ? null : JSON.parse(lastSaved));
  return {
    kind: "sketchpad",
    initial,
    camera: readLocal(cameraKey, parseCamera),
    savedLabel: `Saved to ${project}/board.json`,
    async save(snapshot) {
      const body = JSON.stringify({ format: "dom-canvas", version: 1, ...snapshot }, null, 2);
      lastSaved = body;
      const res = await fetch(endpoint, { method: "PUT", body });
      return res.ok;
    },
    saveCamera: (camera) => void writeLocal(cameraKey, camera),
    onExternalChange(listener) {
      const events = new EventSource("/events");
      events.onmessage = async (message) => {
        const event = JSON.parse(message.data);
        if (event.type !== "change" || event.path !== `${project}/board.json`) return;
        const text = await (await fetch(endpoint)).text();
        if (text === lastSaved || text === "null") return;
        lastSaved = text;
        const snapshot = parseSnapshot(JSON.parse(text));
        if (snapshot) listener(snapshot);
      };
      return () => events.close();
    },
  };
}

// /board/#/<project> is the Sketchpad-served board; anything else is the standalone app.
export function createStore(): Promise<DocumentStore> {
  if (!location.pathname.startsWith("/board")) return Promise.resolve(localStore());
  const project = location.hash.replace(/^#\/?/, "").split("/")[0];
  if (!project) throw new Error("Open the board as /board/#/<project>.");
  return sketchpadStore(decodeURIComponent(project));
}
