import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numericInput } from '../src/features/inspector/numeric.ts';

test('geometry accepts complete finite numbers and pixel units', () => {
  for (const [input, expected] of [['-12.5',-12.5],['10px',10],[' +.25px ',.25],['1e2',100],['1.234',1.23]]) assert.equal(numericInput(input),expected);
});
test('partial numbers, wrong units and non-finite values cannot silently move a layer', () => {
  for (const input of ['', ' ', '12oops', '10%', '1 / 0', 'Infinity', '1e999', '0x10']) assert.equal(numericInput(input),null,input);
});
test('percentage input accepts percent units without accepting lengths', () => {
  assert.equal(numericInput('50%', '%'),50);
  assert.equal(numericInput('12.5', '%'),12.5);
  for (const input of ['12px','55oops','']) assert.equal(numericInput(input,'%'),null);
});
