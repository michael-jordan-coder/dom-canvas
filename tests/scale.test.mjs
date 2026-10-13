import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseScale, flippedScale } from '../src/features/canvas/scale.ts';

test('flips preserve independent scale magnitudes and the third axis', () => {
  assert.equal(flippedScale('none', 0), '-1 1 1');
  assert.equal(flippedScale('2', 1), '2 -2 1');
  assert.equal(flippedScale('-1.5 75% 2', 0), '1.5 0.75 2');
  assert.deepEqual(parseScale(flippedScale(flippedScale('2 .5 3', 0), 0)), [2, .5, 3]);
});

test('unresolved expressions and zero axes cannot be silently replaced', () => {
  for (const value of ['', 'calc(1 + 2)', 'var(--scale)', 'Infinity', '1 2 3 4']) {
    assert.equal(parseScale(value), null);
  }
  assert.equal(flippedScale('0 2', 0), null);
  assert.equal(flippedScale('0 2', 1), '0 -2 1');
});
