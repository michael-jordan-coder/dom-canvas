import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "dom-canvas:inspector:v1";
const Preferences = createContext<{ values: Record<string, boolean>; set: (key: string, value: boolean) => void } | null>(null);
export const InspectorScope = createContext("html");

export function InspectorPreferences({ children }: { children: ReactNode }) {
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
  return <Preferences.Provider value={{ values, set: (key, value) => setValues(current => current[key] === value ? current : { ...current, [key]: value }) }}>{children}</Preferences.Provider>;
}

export function useInspectorDisclosure(key: string, defaultOpen: boolean): [boolean, (value: boolean) => void] {
  const scope = useContext(InspectorScope);
  const preferences = useContext(Preferences);
  const [fallback, setFallback] = useState(defaultOpen);
  const id = `${scope}:${key}`;
  const stored = preferences?.values[id];
  return [typeof stored === "boolean" ? stored : preferences ? defaultOpen : fallback, value => preferences ? preferences.set(id, value) : setFallback(value)];
}
