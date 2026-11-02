import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateClient } from '../src/generator/clientGenerator.js';

describe('clientGenerator', () => {
  const testDir = path.join(os.tmpdir(), 'test-client-scaffold-' + Date.now());

  before(() => fs.mkdirSync(testDir, { recursive: true }));
  after(() => fs.rmSync(testDir, { recursive: true, force: true }));

  it('scaffolds client with required sliced layouts, pages, and react-router-dom', async () => {
    await generateClient(testDir, {
      projectName: 'test-app',
      variant: 'ts',
      packages: ['tailwind', 'redux', 'toastify']
    });

    // Check directory structure
    assert.ok(fs.existsSync(path.join(testDir, 'src/components')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/dashboard/Overview.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/dashboard/Settings.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/website/Home.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/website/About.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/website/Contact.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/slices/Navbar.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/slices/Sidebar.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/WebsiteLayout.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/DashboardLayout.tsx')));

    // Check package.json dependencies
    const pkg = JSON.parse(fs.readFileSync(path.join(testDir, 'package.json'), 'utf8'));
    assert.ok(pkg.dependencies['react-router-dom']);
    assert.ok(pkg.dependencies['@reduxjs/toolkit']);
    assert.ok(pkg.dependencies['react-toastify']);
    assert.ok(pkg.devDependencies['tailwindcss']);
  });

  it('scaffolds javascript variant correctly', async () => {
    const jsDir = path.join(testDir, 'js-client');
    fs.mkdirSync(jsDir, { recursive: true });

    await generateClient(jsDir, {
      projectName: 'test-js-app',
      variant: 'js-compiler',
      packages: ['tailwind', 'shadcn']
    });

    assert.ok(fs.existsSync(path.join(jsDir, 'src/pages/dashboard/Overview.jsx')));
    assert.ok(fs.existsSync(path.join(jsDir, 'src/layout/slices/Navbar.jsx')));
    assert.ok(fs.existsSync(path.join(jsDir, 'components.json')));
    assert.ok(fs.existsSync(path.join(jsDir, 'src/lib/utils.js')));

    const pkg = JSON.parse(fs.readFileSync(path.join(jsDir, 'package.json'), 'utf8'));
    assert.ok(pkg.devDependencies['babel-plugin-react-compiler']);
  });
});
