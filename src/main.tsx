import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { InspectorPreferences } from "./features/inspector/InspectorPreferences";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InspectorPreferences><App /></InspectorPreferences>
  </StrictMode>,
);
