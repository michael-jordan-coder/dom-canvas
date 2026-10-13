import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SnapshotHistory } from '../src/features/document/history.ts';

test('a held arrow is one undo step and redo restores its final position', () => {
  const history = new SnapshotHistory({ x: 0 });
  const hold = Symbol();
  for (let x = 1; x <= 120; x++) history.commit({ x }, hold);
  assert.deepEqual(history.undo(), { x: 0 });
  assert.equal(history.canUndo, false);
  assert.deepEqual(history.redo(), { x: 120 });
});
test('separate key presses and other edits remain separate', () => {
  const history = new SnapshotHistory(0);
  const hold = Symbol();
  history.commit(1, hold); history.commit(2, hold);
  history.commit(3, Symbol()); history.commit(4);
  assert.equal(history.undo(), 3);
  assert.equal(history.undo(), 2);
  assert.equal(history.undo(), 0);
});
test('undo, redo and intermediate updates break grouping', () => {
  const history = new SnapshotHistory(0);
  const hold = Symbol();
  history.commit(1, hold); history.breakGroup(); history.commit(2, hold);
  assert.equal(history.undo(), 1);
  assert.equal(history.redo(), 2);
  history.commit(3, hold);
  assert.equal(history.undo(), 2);
  history.commit(4, hold);
  assert.equal(history.canRedo, false);
  assert.equal(history.undo(), 2);
});
test('history retains the configured number of independent steps', () => {
  const history = new SnapshotHistory(0, 2);
  history.commit(1); history.commit(2); history.commit(3);
  assert.equal(history.undo(), 2); assert.equal(history.undo(), 1);
  assert.equal(history.undo(), undefined);
});
