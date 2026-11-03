import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateRoot } from '../src/generator/rootGenerator.js';

describe('rootGenerator', () => {
  const testDir = path.join(os.tmpdir(), 'test-root-scaffold-' + Date.now());

  before(() => fs.mkdirSync(testDir, { recursive: true }));
  after(() => fs.rmSync(testDir, { recursive: true, force: true }));

  it('scaffolds root package.json with concurrent dev script and README', async () => {
    await generateRoot(testDir, 'my-fullstack-app');

    assert.ok(fs.existsSync(path.join(testDir, 'package.json')));
    assert.ok(fs.existsSync(path.join(testDir, 'README.md')));
    assert.ok(fs.existsSync(path.join(testDir, '.gitignore')));

    const pkg = JSON.parse(fs.readFileSync(path.join(testDir, 'package.json'), 'utf8'));
    assert.ok(pkg.scripts['dev']);
    assert.ok(pkg.scripts['install:all']);
    assert.ok(pkg.scripts['dev:client']);
    assert.ok(pkg.scripts['dev:server']);
    assert.ok(pkg.scripts['test']);
    assert.strictEqual(pkg.engines?.node, '>=24.16.0');

    const readme = fs.readFileSync(path.join(testDir, 'README.md'), 'utf8');
    assert.ok(readme.includes('Node.js 24.16'));
  });
});
