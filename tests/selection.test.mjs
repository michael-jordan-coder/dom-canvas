import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSelection, selectionItems, toggleSelection, reconcileSelection } from '../src/features/canvas/selection.ts';

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

const node = () => ({ contains(other) { return this === other; } });
const target = (element, id = 'a') => ({ kind: 'element', artboardId: id, element });
test('DOM replacement rebinds every selected element without changing unrelated frames', () => {
  const oldA = node(), oldB = node(), newA = node(), newB = node();
  const selection = makeSelection([target(oldA), target(oldB), frame('b')]);
  const replacements = new Map([[oldA, newA], [oldB, newB]]);
  assert.deepEqual(selectionItems(reconcileSelection(selection, () => true, item => replacements.get(item.element))), [target(newA), target(newB), frame('b')]);
});
test('removed multiple-selection members never widen selection to their frame', () => {
  const a = node(), b = node();
  const selection = makeSelection([target(a), target(b), frame('removed')]);
  assert.deepEqual(reconcileSelection(selection, id => id !== 'removed', item => item.element === b ? b : null), target(b));
  assert.deepEqual(reconcileSelection(selection, () => true, () => null), frame('removed'));
  assert.deepEqual(reconcileSelection(selection, () => false, () => null), { kind: 'none' });
});
test('stable selection preserves identity and single-element fallback remains available', () => {
  const selection = makeSelection([target(node()), target(node())]);
  assert.equal(reconcileSelection(selection, () => true, item => item.element), selection);
  assert.deepEqual(reconcileSelection(target(node()), () => true, () => null), frame('a'));
});
