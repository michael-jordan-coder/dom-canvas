import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const STORAGE_KEY = "dom-canvas:inspector:v1";
type SectionTarget = { key: string; title: string; headingId: string };
const Preferences = createContext<{
  values: Record<string, boolean>;
  set: (key: string, value: boolean) => void;
  register: (target: SectionTarget) => () => void;
  targets: SectionTarget[];
  reveal: (target: SectionTarget) => void;
  setSections: (scope: string, open: boolean) => void;
} | null>(null);
export const InspectorScope = createContext("html");

export function InspectorPreferences({ children }: { children: ReactNode }) {
  const sections = useRef(new Map<string, SectionTarget>());
  const [targets, setTargets] = useState<SectionTarget[]>([]);
  const register = useCallback((target: SectionTarget) => {
    sections.current.set(target.headingId, target);
    setTargets([...sections.current.values()]);
    return () => {
      sections.current.delete(target.headingId);
      setTargets([...sections.current.values()]);
    };
  }, []);
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved)
        ? Object.fromEntries(Object.entries(saved).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean")) : {};
    } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch { /* Preferences remain available for this session. */ }
  }, [values]);
  const setSections = useCallback((scope: string, open: boolean) => {
    const keys = [...sections.current.values()].map(target => target.key).filter(key => key.startsWith(`${scope}:section:`));
    setValues(current => Object.assign({}, current, ...keys.map(key => ({ [key]: open }))));
  }, []);
  const reveal = useCallback((target: SectionTarget) => {
    setValues(current => ({ ...current, [target.key]: true }));
    requestAnimationFrame(() => {
      const heading = document.getElementById(target.headingId);
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }, []);
  return <Preferences.Provider value={{ values, register, targets, reveal, setSections, set: (key, value) => setValues(current => current[key] === value ? current : { ...current, [key]: value }) }}>{children}</Preferences.Provider>;
}

export function useInspectorSectionNavigation() {
  const preferences = useContext(Preferences);
  return { targets: preferences?.targets ?? [], reveal: preferences?.reveal };
}

export function useInspectorSectionActions() { return useContext(Preferences)?.setSections; }

export function useInspectorDisclosure(key: string, defaultOpen: boolean, target?: { title: string; headingId: string }): [boolean, (value: boolean) => void] {
  const scope = useContext(InspectorScope);
  const preferences = useContext(Preferences);
  const [fallback, setFallback] = useState(defaultOpen);
  const id = `${scope}:${key}`;
  const register = preferences?.register;
  const title = target?.title;
  const headingId = target?.headingId;
  useEffect(() => title && headingId ? register?.({ key: id, title, headingId }) : undefined, [id, title, headingId, register]);
  const stored = preferences?.values[id];
  return [typeof stored === "boolean" ? stored : preferences ? defaultOpen : fallback, value => preferences ? preferences.set(id, value) : setFallback(value)];
}
