import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textMetricInput, textMetricDisplay } from '../src/features/inspector/textMetric.ts';

test('numeric line-height is pixels rather than a font-size multiplier', () => {
  assert.equal(textMetricInput('line-height', '40'), '40px');
  assert.equal(textMetricInput('line-height', 'Auto'), 'normal');
  assert.equal(textMetricInput('line-height', '120%'), '120%');
});
test('percentage tracking remains relative when the font size changes', () => {
  assert.equal(textMetricInput('letter-spacing', '20%'), '0.2em');
  assert.equal(textMetricInput('letter-spacing', '-2%'), '-0.02em');
  assert.equal(textMetricDisplay('letter-spacing', '0.2em', '3.2px'), '20%');
  assert.equal(textMetricDisplay('letter-spacing', '0.2em', '4px'), '20%');
});
test('automatic metrics and authored relative line-height display their rendered values', () => {
  assert.equal(textMetricDisplay('line-height', '1.4', '22.4px'), '22.4');
  assert.equal(textMetricDisplay('line-height', '', 'normal'), 'Auto');
  assert.equal(textMetricDisplay('letter-spacing', '', 'normal'), '0%');
});
