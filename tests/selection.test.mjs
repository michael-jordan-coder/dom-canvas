import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSelection, selectionItems, toggleSelection } from '../src/features/canvas/selection.ts';

const frame = id => ({ kind: 'artboard', artboardId: id });
test('multiple selection deduplicates targets and returns single/empty states', () => {
  assert.deepEqual(makeSelection([frame('a'), frame('a')]), frame('a'));
  assert.equal(makeSelection([frame('a'), frame('b')]).kind, 'multiple');
  assert.deepEqual(makeSelection([]), { kind: 'none' });
});
test('selected ancestors absorb descendants to prevent double movement and deletion', () => {
  const child = { contains: node => node === child };
  const parent = { contains: node => node === parent || node === child };
  const element = node => ({ kind: 'element', artboardId: 'a', element: node });
  assert.deepEqual(makeSelection([element(child), element(parent)]), element(parent));
  assert.deepEqual(makeSelection([element(child), frame('a'), element(parent)]), frame('a'));
  assert.equal(selectionItems(makeSelection([element(child), frame('b')])).length, 2);
});
test('additive toggles retain unrelated selections and remove existing targets', () => {
  const both = toggleSelection(frame('a'), frame('b'));
  assert.equal(selectionItems(both).length, 2);
  assert.deepEqual(toggleSelection(both, frame('a')), frame('b'));
  assert.deepEqual(toggleSelection(frame('b'), frame('b')), { kind: 'none' });
});
