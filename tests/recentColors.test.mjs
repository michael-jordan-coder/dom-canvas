import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recentColorList } from '../src/features/inspector/color.ts';

test('recent colors keep alpha and order while excluding arbitrary stored values', () => {
  assert.deepEqual(recentColorList(['#ff660080', '#FF660080', '#00000000', 'url(https://example.com)', null, 42, '#bad']), ['#FF660080', '#00000000']);
  assert.deepEqual(recentColorList({ color: '#FFFFFF' }), []);
});

test('a full palette is bounded to the twelve most recent distinct colors', () => {
  const colors = Array.from({ length: 20 }, (_, i) => `#${i.toString(16).padStart(6, '0')}`);
  assert.deepEqual(recentColorList(colors), colors.slice(0, 12).map(value => value.toUpperCase()));
});
