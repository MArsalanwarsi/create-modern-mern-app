import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripVTControlCharacters } from 'node:util';
import { renderBanner } from '../src/ui/banner.js';

test('standard header fits in two lines and shows the version once', () => {
  assert.equal(stripVTControlCharacters(renderBanner(80, { isTTY: true, version: '4.0.0' })),
    'Modern MERN  v4.0.0\nFull-stack application setup');
});

test('narrow terminals retain the name and version', () => {
  assert.equal(renderBanner(24, { plain: true, version: '4.0.0' }), 'Modern MERN\nv4.0.0');
});

test('redirected output contains no terminal escape sequences', () => {
  const output = renderBanner(80, { isTTY: false });
  assert.equal(output, stripVTControlCharacters(output));
});
