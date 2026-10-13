import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitCss } from '../src/features/inspector/cssList.ts';

test('quoted URL delimiters cannot split a background layer', () => {
  const image = 'url("data:image/svg+xml,<svg><text>a),b(c</text></svg>")';
  const gradient = 'linear-gradient(90deg, red, rgb(0, 0, 255))';
  assert.deepEqual(splitCss(`${image}, ${gradient}`, ','), [image, gradient]);
  assert.deepEqual(splitCss("url('a),b(c'), none", ','), ["url('a),b(c')", 'none']);
});

test('escapes and comments preserve list boundaries and exact source', () => {
  const source = String.raw`url("a\"),b(c"), /* keep , ) ( */ linear-gradient(red, blue)`;
  assert.deepEqual(splitCss(source, ','), [String.raw`url("a\"),b(c")`, '/* keep , ) ( */ linear-gradient(red, blue)']);
  assert.deepEqual(splitCss(String.raw`one\,two, three`, ','), [String.raw`one\,two`, 'three']);
});

test('shadow and gradient token lists retain nested function arguments', () => {
  assert.deepEqual(splitCss('inset  0px 4px 12px rgb(0 0 0 / .5)', ' '), ['inset', '0px', '4px', '12px', 'rgb(0 0 0 / .5)']);
  assert.deepEqual(splitCss('var(--ink, rgb(0, 0, 0)) 50%', ' '), ['var(--ink, rgb(0, 0, 0))', '50%']);
});
