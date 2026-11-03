import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const cases = {
  default: [],
  tailwind: ['--language', 'ts', '--styling', 'tailwind', '--auth'],
  minimal: ['--language', 'js', '--styling', 'css', '--no-auth']
};
const selected = process.argv.slice(2);
const scratch = mkdtempSync(path.join(tmpdir(), 'mern-packed-'));
const npm = process.env.npm_execpath;

function run(args, cwd, capture = false) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Failed: ${args.join(' ')}\n${result.stderr ?? ''}`);
  return result.stdout;
}

try {
  const filename = run([npm, 'pack', '--silent', '--pack-destination', scratch], process.cwd(), true).trim();
  const consumer = path.join(scratch, 'consumer');
  mkdirSync(consumer);
  run([npm, 'install', '--prefix', consumer, '--no-audit', '--no-fund', path.join(scratch, filename)], scratch);
  const cli = path.join(consumer, 'node_modules', 'create-modern-mern-app', 'bin', 'index.js');
  for (const name of selected.length ? selected : Object.keys(cases)) {
    assert.ok(Object.hasOwn(cases, name), 'Unknown packed test case: ' + name);
    run([cli, name, '--yes', '--no-install', ...cases[name]], scratch);
    const app = path.join(scratch, name);
    const guide = readFileSync(path.join(app, 'README.md'), 'utf8');
    assert.equal(guide.includes('JWT_SECRET'), name !== 'minimal');
    assert.equal(guide.includes('editable shadcn/ui'), name === 'default');
    for (const command of [['install', '--no-audit', '--no-fund'], ['run', 'build'], ['run', 'lint'], ['test']]) {
      run([npm, ...command], app);
    }
    if (name === 'default' && process.env.TEST_MONGO_URI) {
      run([path.join(import.meta.dirname, 'test-replicas.js')], path.join(app, 'server'));
    }
    if (name === 'default' && process.env.TEST_BROWSER === '1') {
      run([path.join(import.meta.dirname, 'test-browser.js'), path.join(app, 'client', 'dist')], app);
    }
    console.log('Packed CLI verified:', name);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true, maxRetries: 5 });
}
