import { before, after, describe, it } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import { TextPrompt, SelectPrompt, ConfirmPrompt, MultiSelectPrompt, CANCEL_SYMBOL } from '@clack/core';
import { parseCliArgs, runCli } from '../src/cli.js';
import { renderBanner } from '../src/ui/banner.js';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { sanitizePackageName, validateTargetDir } from '../src/utils/naming.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const binPath = path.join(rootDir, 'bin', 'index.js');

describe('Adversarial: CLI Arguments and Options Contracts', () => {
  it('handles unknown and invalid CLI flags safely without throwing', () => {
    const flags = parseCliArgs(['node', 'bin', '--invalid-flag', '--unknown-option=123', '-z']);
    assert.strictEqual(flags.projectName, undefined);
    assert.strictEqual(flags.yes, false);
    assert.strictEqual(flags.language, undefined);
    assert.strictEqual(flags.styling, undefined);
    assert.strictEqual(flags.auth, undefined);
    assert.strictEqual(flags.install, undefined);
  });

  it('handles trailing option flags without values safely', () => {
    const flagsLang = parseCliArgs(['node', 'bin', '--language']);
    assert.strictEqual(flagsLang.language, undefined);

    const flagsStyling = parseCliArgs(['node', 'bin', '-s']);
    assert.strictEqual(flagsStyling.styling, undefined);
  });

  it('retains only first positional argument as projectName when multiple are passed', () => {
    const flags = parseCliArgs(['node', 'bin', 'first-project', 'second-ignored']);
    assert.strictEqual(flags.projectName, 'first-project');
  });

  it('scaffolds successfully with unknown flags present when --yes is supplied', () => {
    const testAppDir = path.join(os.tmpdir(), `test-cli-unknown-flags-${Date.now()}`);
    try {
      const result = spawnSync(process.execPath, [binPath, testAppDir, '--yes', '--no-install', '--unknown-flag', '-x'], {
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

  it('prioritizes fast-path --help over invalid flags and exits 0', () => {
    const result = spawnSync(process.execPath, [binPath, '--help', '--bogus-flag'], {
      cwd: rootDir,
      encoding: 'utf8'
    });
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /Usage: create-modern-mern-app/);
  });

  it('prioritizes fast-path --version over invalid flags and exits 0', () => {
    const result = spawnSync(process.execPath, [binPath, '--version', '--bogus-flag'], {
      cwd: rootDir,
      encoding: 'utf8'
    });
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /v\d+\.\d+\.\d+/);
  });
});

describe('Adversarial: Terminal Geometry and Negative Columns', () => {
  const originalNoColor = process.env.NO_COLOR;
  before(() => { delete process.env.NO_COLOR; });
  after(() => {
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
  });
  it('safely handles negative, zero, and NaN columns in banner rendering', () => {
    const negBanner = renderBanner(-10, { isTTY: true });
    assert.ok(stripAnsi(negBanner).includes('Modern MERN'));

    const zeroBanner = renderBanner(0, { isTTY: true });
    assert.ok(stripAnsi(zeroBanner).includes('Modern MERN'));

    const nanBanner = renderBanner(NaN, { isTTY: true });
    assert.ok(stripAnsi(nanBanner).includes('Modern MERN'));
  });


});

describe('Adversarial: Project Naming and Directory Collisions', () => {
  it('detects directory collision with occupied directory and returns informative error', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-coll-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'existing.txt'), 'data');
      const check = validateTargetDir(tmpDir);
      assert.strictEqual(check.valid, false);
      assert.ok(check.error.includes('already exists and is not empty'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('detects directory collision with an existing file and returns informative error', () => {
    const tmpFile = path.join(os.tmpdir(), `test-file-coll-${Date.now()}.txt`);
    try {
      fs.writeFileSync(tmpFile, 'content');
      const check = validateTargetDir(tmpFile);
      assert.strictEqual(check.valid, false);
      assert.strictEqual(check.error, 'Target path is an existing file.');
    } finally {
      fs.rmSync(tmpFile, { force: true });
    }
  });

  it('permits scaffolding into an existing empty directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-empty-coll-'));
    try {
      const check = validateTargetDir(tmpDir);
      assert.strictEqual(check.valid, true);
      assert.strictEqual(check.exists, true);
      assert.strictEqual(check.isEmpty, true);

      const result = spawnSync(process.execPath, [binPath, tmpDir, '--yes', '--no-install'], {
        cwd: rootDir,
        encoding: 'utf8'
      });
      assert.strictEqual(result.status, 0);
      assert.ok(fs.existsSync(path.join(tmpDir, 'package.json')));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('permits scaffolding into a directory containing only .git repository metadata', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-git-coll-'));
    try {
      fs.mkdirSync(path.join(tmpDir, '.git'));
      const check = validateTargetDir(tmpDir);
      assert.strictEqual(check.valid, true);
      assert.strictEqual(check.isEmpty, true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('exits with code 1 and prints Scaffolding Error when directory collision occurs via CLI', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-cli-coll-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
      const result = spawnSync(process.execPath, [binPath, tmpDir, '--yes', '--no-install'], {
        cwd: rootDir,
        encoding: 'utf8'
      });
      assert.strictEqual(result.status, 1);
      assert.match(stripAnsi(result.stderr), /Scaffolding Error: Directory .* already exists and is not empty\./);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('sanitizes special characters and spaces into valid npm package names', () => {
    assert.strictEqual(sanitizePackageName('My Special App!'), 'my-special-app');
    assert.strictEqual(sanitizePackageName('   spaces-around   '), 'spaces-around');
    assert.strictEqual(sanitizePackageName('UPPER_CASE_APP'), 'upper-case-app');
    assert.strictEqual(sanitizePackageName('dots...and---dashes'), 'dots...and-dashes');
    assert.strictEqual(sanitizePackageName('@my-org/my-package'), '@my-org/my-package');
    assert.strictEqual(sanitizePackageName(''), 'mern-app');
  });

  it('scaffolds project with spaced name cleanly sanitizing package.json', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-space-'));
    const targetDir = path.join(tmpDir, 'my cool app');
    try {
      const result = spawnSync(process.execPath, [binPath, targetDir, '--yes', '--no-install'], {
        cwd: rootDir,
        encoding: 'utf8'
      });
      assert.strictEqual(result.status, 0);
      assert.ok(fs.existsSync(targetDir));
      const rootPkg = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf8'));
      assert.strictEqual(rootPkg.name, 'my-cool-app');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('Adversarial: Cancellation Flow (ERR_CANCELLED) Simulation', () => {
  const steps = [
    { step: 1, name: 'Project Name prompt' },
    { step: 2, name: 'Language & Compiler prompt' },
    { step: 3, name: 'Styling Framework prompt' },
    { step: 4, name: 'Authentication prompt' },
    { step: 5, name: 'Extra Add-ons multiselect' },
    { step: 6, name: 'Install dependencies prompt' }
  ];

  for (const { step, name } of steps) {
    it(`cancelling at Step ${step} (${name}) aborts cleanly throwing ERR_CANCELLED without creating files`, async () => {
      const origText = TextPrompt.prototype.prompt;
      const origSelect = SelectPrompt.prototype.prompt;
      const origConfirm = ConfirmPrompt.prototype.prompt;
      const origMulti = MultiSelectPrompt.prototype.prompt;

      const testDirName = `test-cancel-step-${step}-${Date.now()}`;
      const targetDir = path.resolve(process.cwd(), testDirName);

      let selectCount = 0;
      let confirmCount = 0;

      try {
        TextPrompt.prototype.prompt = async function() {
          if (step === 1) return CANCEL_SYMBOL;
          return testDirName;
        };

        SelectPrompt.prototype.prompt = async function() {
          selectCount++;
          if (selectCount === 1 && step === 2) return CANCEL_SYMBOL;
          if (selectCount === 2 && step === 3) return CANCEL_SYMBOL;
          return this.options ? this.options[0].value : 'ts-compiler';
        };

        ConfirmPrompt.prototype.prompt = async function() {
          confirmCount++;
          if (confirmCount === 1 && step === 4) return CANCEL_SYMBOL;
          if (confirmCount === 2 && step === 6) return CANCEL_SYMBOL;
          return true;
        };

        MultiSelectPrompt.prototype.prompt = async function() {
          if (step === 5) return CANCEL_SYMBOL;
          return ['toastify'];
        };

        let thrownError = null;
        try {
          await runCli(['node', 'bin']);
        } catch (err) {
          thrownError = err;
        }

        assert.ok(thrownError, `Expected runCli to throw when cancelled at Step ${step}`);
        assert.strictEqual(thrownError.code, 'ERR_CANCELLED');
        assert.strictEqual(thrownError.message, 'Operation cancelled by user');
        assert.strictEqual(fs.existsSync(targetDir), false, `No target directory should be created on disk when cancelled at Step ${step}`);
      } finally {
        TextPrompt.prototype.prompt = origText;
        SelectPrompt.prototype.prompt = origSelect;
        ConfirmPrompt.prototype.prompt = origConfirm;
        MultiSelectPrompt.prototype.prompt = origMulti;
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
      }
    });
  }

  it('bin/index.js traps ERR_CANCELLED and terminates with exit code 0 without unhandled rejection', () => {
    const inlineScript = `
      import { pathToFileURL } from 'node:url';
      import { TextPrompt, CANCEL_SYMBOL } from '@clack/core';
      TextPrompt.prototype.prompt = async () => CANCEL_SYMBOL;
      const binUrl = pathToFileURL(${JSON.stringify(binPath)}).href;
      await import(binUrl);
    `;

    const result = spawnSync(process.execPath, ['--input-type=module', '-e', inlineScript], {
      cwd: rootDir,
      encoding: 'utf8'
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /Setup cancelled\. No files were generated\./);
    assert.strictEqual(result.stderr.trim(), '');
  });
});
