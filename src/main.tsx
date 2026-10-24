import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createStore } from "./features/document/store";
import { InspectorPreferences } from "./features/inspector/InspectorPreferences";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);

createStore().then(
  (store) => root.render(
    <StrictMode>
      <InspectorPreferences><App store={store} /></InspectorPreferences>
    </StrictMode>,
  ),
  (error: unknown) => root.render(<p style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>{error instanceof Error ? error.message : String(error)}</p>),
);
