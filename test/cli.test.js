import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import { parseCliArgs } from '../src/cli.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const binPath = path.join(rootDir, 'bin', 'index.js');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

describe('CLI command-line interface', () => {
  it('displays help text with --help', () => {
    const result = spawnSync(process.execPath, [binPath, '--help'], {
      cwd: rootDir,
      encoding: 'utf8'
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /Usage: create-modern-mern-app/);
    assert.match(result.stdout, /--version/);
    assert.match(result.stdout, /--help/);
  });

  it('displays help text with -h', () => {
    const result = spawnSync(process.execPath, [binPath, '-h'], {
      cwd: rootDir,
      encoding: 'utf8'
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /Usage: create-modern-mern-app/);
    assert.match(result.stdout, /Display this help message/);
  });

  it('displays correct version with --version', () => {
    const result = spawnSync(process.execPath, [binPath, '--version'], {
      cwd: rootDir,
      encoding: 'utf8'
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, new RegExp(`v${pkg.version}`));
  });

  it('displays correct version with -v', () => {
    const result = spawnSync(process.execPath, [binPath, '-v'], {
      cwd: rootDir,
      encoding: 'utf8'
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, new RegExp(`v${pkg.version}`));
  });

  it('package.json points bin executable to bin/index.js and file is executable', () => {
    assert.strictEqual(pkg.bin['create-modern-mern-app'], 'bin/index.js');
    assert.ok(fs.existsSync(binPath));
    const content = fs.readFileSync(binPath, 'utf8');
    assert.ok(content.startsWith('#!/usr/bin/env node'));
  });

  it('scaffolds project non-interactively with --yes and --no-install', () => {
    const testAppDir = path.join(os.tmpdir(), `test-cli-yes-${Date.now()}`);
    try {
      const result = spawnSync(process.execPath, [binPath, testAppDir, '--yes', '--no-install'], {
        cwd: rootDir,
        encoding: 'utf8'
      });
      assert.strictEqual(result.status, 0);
      assert.ok(fs.existsSync(path.join(testAppDir, 'client', 'package.json')));
      assert.ok(fs.existsSync(path.join(testAppDir, 'server', 'package.json')));
      assert.ok(fs.existsSync(path.join(testAppDir, 'package.json')));
    } finally {
      fs.rmSync(testAppDir, { recursive: true, force: true });
    }
  });
});

describe('CLI argument parsing (parseCliArgs)', () => {
  it('parses --yes and -y flags', () => {
    assert.strictEqual(parseCliArgs(['node', 'bin', '--yes']).yes, true);
    assert.strictEqual(parseCliArgs(['node', 'bin', '-y']).yes, true);
    assert.strictEqual(parseCliArgs(['node', 'bin']).yes, false);
  });

  it('parses positional project name', () => {
    assert.strictEqual(parseCliArgs(['node', 'bin', 'my-custom-app']).projectName, 'my-custom-app');
  });

  it('parses --language and -l flags', () => {
    assert.strictEqual(parseCliArgs(['node', 'bin', '--language', 'ts']).language, 'ts');
    assert.strictEqual(parseCliArgs(['node', 'bin', '-l', 'js-compiler']).language, 'js-compiler');
    assert.strictEqual(parseCliArgs(['node', 'bin', '--language=ts-compiler']).language, 'ts-compiler');
  });

  it('parses --styling and -s flags', () => {
    assert.strictEqual(parseCliArgs(['node', 'bin', '--styling', 'tailwind']).styling, 'tailwind');
    assert.strictEqual(parseCliArgs(['node', 'bin', '-s', 'css']).styling, 'css');
    assert.strictEqual(parseCliArgs(['node', 'bin', '--styling=shadcn']).styling, 'shadcn');
  });

  it('parses --auth and --no-auth flags', () => {
    assert.strictEqual(parseCliArgs(['node', 'bin', '--auth']).auth, true);
    assert.strictEqual(parseCliArgs(['node', 'bin', '--no-auth']).auth, false);
  });

  it('parses --install and --no-install flags', () => {
    assert.strictEqual(parseCliArgs(['node', 'bin', '--install']).install, true);
    assert.strictEqual(parseCliArgs(['node', 'bin', '--no-install']).install, false);
  });
});
