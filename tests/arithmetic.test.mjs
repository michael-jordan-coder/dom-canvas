import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numericExpression } from '../src/features/inspector/arithmetic.ts';

test('numeric arithmetic respects precedence, grouping and unary signs', () => {
  for (const [source, value] of [['320 / 2',160],['24 + 8 * 2',40],['(24 + 8) * 2',64],['10 - -2',12],['-.5 * 4',-2],['10 / 2 / 5',1],['0.1 + 0.2',.3]]) {
    assert.deepEqual(numericExpression(source), { value });
  }
});
test('invalid arithmetic is rejected without falling back to a property value', () => {
  for (const source of ['1/0','0/0','1 +','(2 * 3','1 2 + 3','1..2 + 3','2 ** 3','()','('.repeat(300)]) {
    assert.deepEqual(numericExpression(source), { error: true }, source);
  }
});
test('ordinary values and CSS syntax remain unchanged for the existing validator', () => {
  for (const source of ['12','-1.5','24px','50%','calc(100% - 20px)','var(--width)','auto','10px + 2px','alert(1)']) {
    assert.equal(numericExpression(source), null, source);
  }
});
