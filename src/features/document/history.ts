/** Snapshot history with optional grouping for one continuous input gesture. */
export class SnapshotHistory<T> {
  current: T;
  private past: T[] = [];
  private future: T[] = [];
  private group: symbol | undefined;
  private limit: number;
  constructor(initial: T, limit = 100) { this.current = initial; this.limit = limit; }
  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
  breakGroup() { this.group = undefined; }
  commit(next: T, group?: symbol) {
    if (group === undefined || group !== this.group) this.past = [...this.past, this.current].slice(-this.limit);
    this.group = group;
    this.future = [];
    this.current = next;
  }
  undo() {
    this.breakGroup();
    if (!this.past.length) return undefined;
    this.future = [this.current, ...this.future];
    this.current = this.past.pop()!;
    return this.current;
  }
  redo() {
    this.breakGroup();
    if (!this.future.length) return undefined;
    this.past = [...this.past, this.current].slice(-this.limit);
    this.current = this.future.shift()!;
    return this.current;
  }
}
