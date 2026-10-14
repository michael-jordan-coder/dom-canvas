import { test } from 'node:test';
import assert from 'node:assert/strict';
import { propertyState } from '../src/features/inspector/propertyState.ts';
import { availableSizeModes, paddingPairValues } from '../src/features/inspector/sizingPolicy.ts';

test('CSS-wide values resolve without discarding authored/reset information', () => {
  const state = propertyState([{ authored: 'inherit', computed: 'rgb(255, 0, 0)' }]);
  assert.equal(state.value, 'rgb(255, 0, 0)');
  assert.equal(state.authored, 'inherit');
  assert.equal(state.canReset, true);
});
test('different variable bindings remain Mixed even with the same resolved paint', () => {
  const state = propertyState([{ authored: 'var(--a)', computed: 'red' }, { authored: 'var(--b)', computed: 'red' }]);
  assert.equal(state.mixed, true);
  assert.equal(state.value, '');
  assert.equal(state.computed, 'red');
  assert.equal(state.bound, true);
});
test('unsupported targets do not contribute fabricated values to shared edits', () => {
  const state = propertyState([{ authored: '', computed: '20px' }, { authored: '', computed: '', available: false }]);
  assert.equal(state.mixed, false);
  assert.equal(state.value, '20px');
  assert.equal(state.supported, 1);
  assert.equal(state.total, 2);
  assert.equal(propertyState([]).available, false);
});
test('Fill depends on an in-flow flex/grid item and a definite parent axis', () => {
  const base = { box: true, inline: false, parentLayout: 'flex', parentDefinite: true };
  assert.equal(availableSizeModes(base).includes('fill'), true);
  assert.equal(availableSizeModes({ ...base, parentDefinite: false }).includes('fill'), false);
  assert.equal(availableSizeModes({ ...base, parentLayout: null }).includes('fill'), false);
  assert.equal(availableSizeModes({ ...base, inline: true }).includes('fill'), false);
  assert.deepEqual(availableSizeModes({ ...base, box: false }), ['css']);
});
test('paired padding supports an asymmetric pair and rejects ambiguous lists', () => {
  assert.deepEqual(paddingPairValues('10, 20'), ['10', '20']);
  assert.deepEqual(paddingPairValues('12'), ['12', '12']);
  assert.equal(paddingPairValues('10,'), null);
  assert.equal(paddingPairValues('10,20,30'), null);
});
test('the same variable resolves to Mixed when parent scopes supply different values', () => {
  const state = propertyState([{ authored: 'var(--color)', computed: 'red' }, { authored: 'var(--color)', computed: 'blue' }]);
  assert.equal(state.mixed, true);
  assert.equal(state.value, '');
  assert.equal(state.authored, 'var(--color)');
});
test('an authored source may be preserved without offering reset of imported attributes', () => {
  assert.equal(propertyState([{ authored: '#22aa66', computed: 'rgb(34, 170, 102)', resettable: false }]).canReset, false);
});
