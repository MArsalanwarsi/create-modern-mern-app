import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateClient } from '../src/generator/clientGenerator.js';
import { generateServer } from '../src/generator/serverGenerator.js';
import { generateRoot } from '../src/generator/rootGenerator.js';

describe('end-to-end fullstack scaffolding', () => {
  const rootDir = path.join(os.tmpdir(), 'test-e2e-app-' + Date.now());

  before(() => fs.mkdirSync(rootDir, { recursive: true }));
  after(() => fs.rmSync(rootDir, { recursive: true, force: true }));

  it('generates a complete, functional full-stack project structure', async () => {
    const clientDir = path.join(rootDir, 'client');
    const serverDir = path.join(rootDir, 'server');
    fs.mkdirSync(clientDir);
    fs.mkdirSync(serverDir);

    await generateClient(clientDir, {
      projectName: 'fullstack-demo',
      variant: 'ts-compiler',
      packages: ['tailwind', 'shadcn', 'toastify', 'redux']
    });

    await generateServer(serverDir, {
      projectName: 'fullstack-demo',
      language: 'ts',
      addOns: ['cors', 'multer', 'cloudinary', 'nodemailer', 'dotenv']
    });

    await generateRoot(rootDir, 'fullstack-demo');

    // 1. Root assertions
    assert.ok(fs.existsSync(path.join(rootDir, 'package.json')));
    assert.ok(fs.existsSync(path.join(rootDir, 'README.md')));
    assert.ok(fs.existsSync(path.join(rootDir, '.gitignore')));

    // 2. Client assertions
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/slices/Navbar.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/slices/Sidebar.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/slices/Footer.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/slices/Header.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/WebsiteLayout.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/DashboardLayout.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Overview.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Settings.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/website/Home.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/website/About.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/website/Contact.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/components/Card.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/components/ui/button.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/store/index.ts')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/store/slices/counterSlice.ts')));

    // 3. Server assertions
    assert.ok(fs.existsSync(path.join(serverDir, 'src/config/db.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/config/cloudinary.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/models/user.model.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/controllers/api.controller.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/routes/api.routes.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/middlewares/multer.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/middlewares/errorHandler.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/utils/nodemailer.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/index.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, '.env.example')));
    assert.ok(fs.existsSync(path.join(serverDir, 'tsconfig.json')));

    // 4. Verify valid JSON manifests
    const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));

    assert.strictEqual(rootPkg.name, 'fullstack-demo');
    assert.strictEqual(clientPkg.name, 'fullstack-demo-client');
    assert.strictEqual(serverPkg.name, 'fullstack-demo-server');
  });
});
