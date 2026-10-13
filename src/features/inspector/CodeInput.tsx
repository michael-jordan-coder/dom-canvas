import { useLayoutEffect, useRef } from "react";
import { indentCode, newlineCode, type CodeEdit } from "./codeEditing";

export function CodeInput({ label, value, identity, placeholder, onChange, onApply }: { label: string; value: string; identity: unknown; placeholder?: string; onChange: (value: string) => void; onApply: () => void }) {
  const input = useRef<HTMLTextAreaElement>(null);
  const pending = useRef<CodeEdit | null>(null);
  const exitTab = useRef(false);
  const history = useRef({ identity, entries: [{ value, start: 0, end: 0 }] as CodeEdit[], index: 0 });
  useLayoutEffect(() => {
    const state = history.current;
    if (state.identity !== identity || state.entries[state.index].value !== value) {
      history.current = { identity, entries: [{ value, start: 0, end: 0 }], index: 0 };
      pending.current = null;
    }
    const edit = pending.current;
    if (edit && edit.value === value) {
      input.current?.setSelectionRange(edit.start, edit.end);
      pending.current = null;
    }
  }, [value, identity]);
  const edit = (next: CodeEdit) => {
    if (next.value === value) { input.current?.setSelectionRange(next.start, next.end); return; }
    const state = history.current;
    state.entries[state.index] = { value, start: Math.min(value.length, input.current?.selectionStart ?? 0), end: Math.min(value.length, input.current?.selectionEnd ?? 0) };
    state.entries = [...state.entries.slice(0, state.index + 1), next].slice(-100);
    state.index = state.entries.length - 1;
    pending.current = next;
    onChange(next.value);
  };
  return <textarea ref={input} className="code-input" aria-label={label} aria-description="Tab indents. Press Escape then Tab to leave the editor. Command or Control plus Enter applies changes." value={value} placeholder={placeholder} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off"
    onChange={event => edit({ value: event.target.value, start: event.target.selectionStart, end: event.target.selectionEnd })} onBlur={() => { exitTab.current = false; }}
    onKeyDown={event => {
      if (event.nativeEvent.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && ["z", "y"].includes(event.key.toLowerCase())) {
        event.preventDefault(); event.stopPropagation();
        const state = history.current;
        const index = state.index + (event.key.toLowerCase() === "y" || event.shiftKey ? 1 : -1);
        if (index < 0 || index >= state.entries.length) return;
        state.index = index;
        pending.current = state.entries[index];
        onChange(pending.current.value);
        return;
      }
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); exitTab.current = true; return; }
      if (event.key === "Tab" && exitTab.current) { exitTab.current = false; return; }
      exitTab.current = false;
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); onApply(); return; }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const { selectionStart, selectionEnd } = event.currentTarget;
      if (event.key === "Tab") { event.preventDefault(); edit(indentCode(value, selectionStart, selectionEnd, event.shiftKey)); }
      else if (event.key === "Enter") { event.preventDefault(); edit(newlineCode(value, selectionStart, selectionEnd)); }
    }} />;
}
