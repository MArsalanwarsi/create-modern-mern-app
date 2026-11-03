import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ensureDir, writeFileTree } from '../src/utils/fs-helpers.js';

describe('fs-helpers utility tests', () => {
  const tmpDir = path.join(os.tmpdir(), 'test-fs-helpers-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));

  before(() => fs.mkdirSync(tmpDir, { recursive: true }));
  after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  it('ensureDir creates directories recursively and is idempotent', () => {
    const deepDir = path.join(tmpDir, 'level1', 'level2', 'level3');
    assert.strictEqual(fs.existsSync(deepDir), false);
    ensureDir(deepDir);
    assert.strictEqual(fs.existsSync(deepDir), true);
    // Idempotency: calling again should not throw
    assert.doesNotThrow(() => ensureDir(deepDir));
  });

  it('writeFileTree writes files, creates nested directories, and sets .env permissions', async () => {
    const target = path.join(tmpDir, 'tree');
    await writeFileTree(target, {
      'index.js': 'console.log("hello");',
      'src/nested/file.txt': 'sample text',
      '.env': 'SECRET=123'
    });

    assert.strictEqual(fs.readFileSync(path.join(target, 'index.js'), 'utf8'), 'console.log("hello");');
    assert.strictEqual(fs.readFileSync(path.join(target, 'src/nested/file.txt'), 'utf8'), 'sample text');
    assert.strictEqual(fs.readFileSync(path.join(target, '.env'), 'utf8'), 'SECRET=123');

    // On POSIX systems, verify mode 0o600 for .env
    if (process.platform !== 'win32') {
      const stat = fs.statSync(path.join(target, '.env'));
      assert.strictEqual(stat.mode & 0o777, 0o600);
    }
  });

  it('writeFileTree throws when file already exists due to wx flag', async () => {
    const target = path.join(tmpDir, 'tree-duplicate');
    await writeFileTree(target, {
      'test.txt': 'initial'
    });

    await assert.rejects(
      async () => {
        await writeFileTree(target, {
          'test.txt': 'overwrite'
        });
      },
      { code: 'EEXIST' }
    );
  });
});
