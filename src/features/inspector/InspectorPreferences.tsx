import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const STORAGE_KEY = "dom-canvas:inspector:v1";
const Preferences = createContext<{
  values: Record<string, boolean>;
  set: (key: string, value: boolean) => void;
  register: (key: string) => () => void;
  setSections: (scope: string, open: boolean) => void;
} | null>(null);
export const InspectorScope = createContext("html");

export function InspectorPreferences({ children }: { children: ReactNode }) {
  const sections = useRef(new Map<string, number>());
  const register = useCallback((key: string) => {
    sections.current.set(key, (sections.current.get(key) ?? 0) + 1);
    return () => {
      const count = (sections.current.get(key) ?? 1) - 1;
      if (count) sections.current.set(key, count); else sections.current.delete(key);
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
    const keys = [...sections.current.keys()].filter(key => key.startsWith(`${scope}:section:`));
    setValues(current => Object.assign({}, current, ...keys.map(key => ({ [key]: open }))));
  }, []);
  return <Preferences.Provider value={{ values, register, setSections, set: (key, value) => setValues(current => current[key] === value ? current : { ...current, [key]: value }) }}>{children}</Preferences.Provider>;
}

export function useInspectorSectionActions() { return useContext(Preferences)?.setSections; }

export function useInspectorDisclosure(key: string, defaultOpen: boolean): [boolean, (value: boolean) => void] {
  const scope = useContext(InspectorScope);
  const preferences = useContext(Preferences);
  const [fallback, setFallback] = useState(defaultOpen);
  const id = `${scope}:${key}`;
  const register = preferences?.register;
  useEffect(() => key.startsWith("section:") ? register?.(id) : undefined, [id, key, register]);
  const stored = preferences?.values[id];
  return [typeof stored === "boolean" ? stored : preferences ? defaultOpen : fallback, value => preferences ? preferences.set(id, value) : setFallback(value)];
}
