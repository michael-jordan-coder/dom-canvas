import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scopeCss, extractFonts } from '../src/features/canvas/paste.ts';

test('width media queries become frame container queries', () => {
  assert.equal(scopeCss('@media (max-width: 600px) { .a { x: 1 } }'), '@container frame (max-width: 600px) { .a { x: 1 } }');
  assert.equal(scopeCss('@media screen and (min-width: 40em) and (max-width: 60em) {}'), '@container frame (min-width: 40em) and (max-width: 60em) {}');
  assert.equal(scopeCss('@media (width >= 768px) {}'), '@container frame (width >= 768px) {}');
});
test('media queries that depend on more than width stay media queries', () => {
  for (const css of ['@media (prefers-color-scheme: dark) {}', '@media print {}', '@media (max-device-width: 600px) {}', '@media (max-width: 600px), print {}', '@media (hover: hover) and (min-width: 600px) {}'])
    assert.equal(scopeCss(css), css);
});
test('@font-face blocks move out of frame CSS', () => {
  const { css, fonts } = extractFonts('@font-face { font-family: X; src: url(x.woff2); }\n.a { font-family: X; }');
  assert.equal(css.trim(), '.a { font-family: X; }');
  assert.match(fonts, /^@font-face \{ font-family: X;/);
});
test('rem becomes px at the 16px browser default', () => {
  assert.equal(scopeCss('.a { padding: 4rem 0.5rem; width: calc(100% - 1.25rem); }'), '.a { padding: 64px 8px; width: calc(100% - 20px); }');
  assert.equal(scopeCss('.a { margin: -2rem; }'), '.a { margin: -32px; }');
});
test('only known font hosts move to the document', () => {
  const { css, fonts } = extractFonts('@import url("https://fonts.googleapis.com/css2?family=Inter");\n@import "https://cdn.example.com/fonts/theme.css";\n.a {}');
  assert.equal(fonts, '@import url("https://fonts.googleapis.com/css2?family=Inter");');
  assert.match(css, /cdn\.example\.com/);
});
