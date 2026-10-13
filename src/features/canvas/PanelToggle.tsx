export function PanelToggle({ side, visible, onToggle }: { side: "left" | "right"; visible: boolean; onToggle: () => void }) {
  const name = side === "left" ? "layers" : "inspector";
  return <button type="button" data-panel-toggle={`${side}-${visible ? "hide" : "show"}`} className={visible ? "inspector-icon panel-toggle" : `panel-restore ${side}`} aria-label={`${visible ? "Hide" : "Show"} ${name} panel`} title={`${visible ? "Hide" : "Show"} ${name} panel`} onClick={() => {
    onToggle();
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-panel-toggle="${side}-${visible ? "show" : "hide"}"]`)?.focus({ preventScroll: true }));
  }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d={side === "left" ? "M6 3v10" : "M10 3v10"}/></svg>
  </button>;
}
