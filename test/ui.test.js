import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextSteps } from '../src/ui/summary.js';

test('shows copyable commands in setup order', () => {
  assert.equal(nextSteps('my-app', false), 'Done. Now run:\n\n  cd my-app\n  npm install\n  npm run dev');
});
test('omits completed steps when already in the project directory', () => {
  assert.equal(nextSteps('.', true), 'Done. Now run:\n\n  npm run dev');
});
test('quotes a workspace name containing spaces', () => {
  assert.ok(nextSteps('My App', true).includes('cd "My App"'));
});
