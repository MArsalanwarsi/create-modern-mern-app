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

    // Check store import in TS
    const storeContent = fs.readFileSync(path.join(testDir, 'src/store/index.ts'), 'utf8');
    assert.ok(!storeContent.includes("counterSlice.'"));
    assert.ok(storeContent.includes("counterSlice'"));
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

    // Check vite.config has no leading comma syntax error
    const viteConfig = fs.readFileSync(path.join(jsDir, 'vite.config.js'), 'utf8');
    assert.ok(!viteConfig.includes('react({,'));

    const pkg = JSON.parse(fs.readFileSync(path.join(jsDir, 'package.json'), 'utf8'));
    assert.ok(pkg.devDependencies['babel-plugin-react-compiler']);
  });

  it('scaffolds typescript with shadcn without trailing dot import in button.tsx', async () => {
    const tsShadcnDir = path.join(testDir, 'ts-shadcn-client');
    fs.mkdirSync(tsShadcnDir, { recursive: true });

    await generateClient(tsShadcnDir, {
      projectName: 'test-ts-shadcn',
      variant: 'ts-compiler',
      packages: ['shadcn']
    });

    const buttonContent = fs.readFileSync(path.join(tsShadcnDir, 'src/components/ui/button.tsx'), 'utf8');
    assert.ok(!buttonContent.includes("utils.'"));
    assert.ok(buttonContent.includes("utils'"));

    const viteConfig = fs.readFileSync(path.join(tsShadcnDir, 'vite.config.ts'), 'utf8');
    assert.ok(!viteConfig.includes('react({,'));
  });
});
