import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indentCode, newlineCode } from '../src/features/inspector/codeEditing.ts';
test('tab inserts at the caret and indents a multiline selection without the following line', () => {
  assert.deepEqual(indentCode('ab',1,1),{value:'a  b',start:3,end:3});
  assert.deepEqual(indentCode('a\nb\nc',0,4),{value:'  a\n  b\nc',start:2,end:8});
});
test('outdent handles mixed whitespace, a caret in indentation and unindented lines', () => {
  assert.deepEqual(indentCode('  a\n\tb\nc',0,7,true),{value:'a\nb\nc',start:0,end:4});
  assert.deepEqual(indentCode('  a',1,1,true),{value:'a',start:0,end:0});
  assert.deepEqual(indentCode('a',0,0,true),{value:'a',start:0,end:0});
});
test('enter continues indentation and inserts a blank indented line inside braces', () => {
  assert.deepEqual(newlineCode('a {}',3,3),{value:'a {\n  \n}',start:6,end:6});
  assert.deepEqual(newlineCode('  color:red;',12,12),{value:'  color:red;\n  ',start:15,end:15});
});
