import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizePackageName, validateTargetDir } from '../src/utils/naming.js';

describe('naming utilities', () => {
  it('sanitizes project names for package.json', () => {
    assert.strictEqual(sanitizePackageName('My Fullstack App'), 'my-fullstack-app');
    assert.strictEqual(sanitizePackageName('@scope/my-app'), '@scope/my-app');
    assert.strictEqual(sanitizePackageName('special__#chars!'), 'special-chars');
  });

  it('validates directory existence', () => {
    const res = validateTargetDir(process.cwd());
    assert.strictEqual(typeof res.valid, 'boolean');
  });
});
