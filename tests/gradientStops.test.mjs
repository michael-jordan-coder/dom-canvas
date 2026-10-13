import { test } from 'node:test';
import assert from 'node:assert/strict';
import { percentageStops } from '../src/features/inspector/gradientStops.ts';

test('resolves auto runs and CSS stop fixup without shifting other effective positions', () => {
  assert.deepEqual(percentageStops(['', '', '', '']), [0, 100 / 3, 200 / 3, 100]);
  assert.deepEqual(percentageStops(['10%', '', '50%', '', '90%']), [10, 30, 50, 70, 90]);
  assert.deepEqual(percentageStops(['60%', '20%', '', '']), [60, 60, 80, 100]);
  assert.deepEqual(percentageStops(['', '0%', '100%', '']), [0, 0, 100, 100]);
});

test('falls back for values the percentage track cannot represent faithfully', () => {
  for (const value of ['20px', '20% 40%', 'calc(50% - 2px)', '-1%', '101%', 'var(--stop)', 'Infinity%']) {
    assert.equal(percentageStops(['0%', value, '100%']), null);
  }
  assert.equal(percentageStops(['50%']), null);
});
