import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRotation, rotationField, rotationInput } from '../src/features/canvas/rotation.ts';

test('angle units represent the same quarter turn', () => {
  for (const value of ['90deg', '100grad', '0.25turn', `${Math.PI / 2}rad`]) {
    assert.ok(Math.abs(parseRotation(value).degrees - 90) < 1e-9);
    assert.deepEqual(rotationField(value), { value: '90', suffix: '°' });
  }
});
test('3D axes remain explicit instead of becoming Z rotation', () => {
  assert.deepEqual(parseRotation('x 30deg'), { axis: [1, 0, 0], degrees: 30 });
  assert.deepEqual(parseRotation('y .5turn'), { axis: [0, 1, 0], degrees: 180 });
  assert.deepEqual(parseRotation('0 0 -1 45deg'), { axis: [0, 0, -1], degrees: 45 });
  assert.deepEqual(rotationField('x 30deg'), { value: 'x 30deg', suffix: undefined });
});
test('numeric edits become degrees; CSS expressions and invalid input stay intact for browser validation', () => {
  assert.equal(rotationInput('-22.5'), '-22.5deg');
  assert.equal(rotationInput(' 1e2 '), '1e2deg');
  for (const value of ['.5turn', 'var(--angle)', 'calc(1turn / 4)', 'bad', '']) assert.equal(rotationInput(value), value);
  assert.equal(parseRotation('1e999deg'), null);
  assert.equal(parseRotation('bad'), null);
  assert.deepEqual(rotationField('none'), { value: '0', suffix: '°' });
});
