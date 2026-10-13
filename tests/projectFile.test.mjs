import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeProject, decodeProject } from '../src/features/document/projectFile.ts';
const frame = { id: 'a', name: 'Example', x: -30, y: 12, width: 400, html: '<div>Hello</div>', css: ':host {color: red}', fonts: '@font-face{}', height: 300, aspectRatio: 4 / 3 };
const camera = { x: 40, y: 25, z: 1.25 };
test('canvas file preserves frame content, dimensions, fonts and camera', () => {
  const restored = decodeProject(encodeProject([frame], camera));
  assert.deepEqual(restored.artboards, [frame]); assert.deepEqual(restored.camera, camera);
});
test('invalid format, dimensions and camera are rejected before loading', () => {
  for (const source of ['bad', 'null', '{}', JSON.stringify({format:'dom-canvas',version:2,artboards:[]})]) assert.throws(() => decodeProject(source));
  for (const patch of [{width:0},{x:null},{height:-2},{html:12},{fonts:[]}]) assert.throws(() => decodeProject(encodeProject([{...frame,...patch}],camera)));
  assert.throws(() => decodeProject(encodeProject([frame],{...camera,z:20})));
});
test('empty documents are valid and unknown frame properties are discarded', () => {
  assert.deepEqual(decodeProject(encodeProject([],camera)).artboards, []);
  assert.equal('untrusted' in decodeProject(encodeProject([{...frame,untrusted:'extra'}],camera)).artboards[0],false);
});
