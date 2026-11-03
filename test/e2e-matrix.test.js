import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateClient } from '../src/generator/clientGenerator.js';
import { generateServer } from '../src/generator/serverGenerator.js';
import { generateRoot } from '../src/generator/rootGenerator.js';

describe('Tier 3: E2E Permutation Matrix (8 Permutations)', () => {
  const baseTestDir = path.join(
    os.tmpdir(),
    `test-e2e-matrix-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  before(() => fs.mkdirSync(baseTestDir, { recursive: true }));
  after(() => fs.rmSync(baseTestDir, { recursive: true, force: true }));

  // Helper to scaffold an entire project permutation
  async function scaffoldProject(dirName, config) {
    const projectDir = path.join(baseTestDir, dirName);
    const clientDir = path.join(projectDir, 'client');
    const serverDir = path.join(projectDir, 'server');

    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: dirName,
      variant: config.frontendVariant,
      packages: config.clientPackages || [],
      auth: config.auth,
      styling: config.styling
    });

    await generateServer(serverDir, {
      projectName: dirName,
      language: config.backendLanguage,
      addOns: config.serverAddOns || [],
      auth: config.auth
    });

    await generateRoot(projectDir, dirName);

    return { projectDir, clientDir, serverDir };
  }

  // 1. Permutation 1: JS + Auth + shadcn
  it('P1: JavaScript + Auth + shadcn fullstack scaffolding', async () => {
    const { projectDir, clientDir, serverDir } = await scaffoldProject('p1-js-auth-shadcn', {
      frontendVariant: 'js',
      backendLanguage: 'js',
      auth: true,
      styling: 'shadcn',
      clientPackages: ['toastify'],
      serverAddOns: ['cors', 'dotenv']
    });

    // Root manifests
    const rootPkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
    assert.deepEqual(rootPkg.workspaces, ['client', 'server']);
    assert.ok(fs.existsSync(path.join(projectDir, '.gitignore')));
    assert.ok(fs.existsSync(path.join(projectDir, 'README.md')));

    // Client manifests & files
    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.strictEqual(clientPkg.name, 'p1-js-auth-shadcn-client');
    assert.ok(clientPkg.dependencies['react']);
    assert.ok(clientPkg.dependencies['react-router-dom']);
    assert.ok(clientPkg.dependencies['react-toastify']);
    assert.ok(fs.existsSync(path.join(clientDir, 'src/main.jsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/App.jsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'vite.config.js')));
    assert.ok(fs.existsSync(path.join(clientDir, 'jsconfig.json')));
    assert.ok(fs.existsSync(path.join(clientDir, 'components.json')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Overview.jsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/components/ui/button.jsx')));

    const p1Navbar = fs.readFileSync(path.join(clientDir, 'src/layout/slices/Navbar.jsx'), 'utf8');
    assert.ok(p1Navbar.includes('p1-js-auth-shadcn'));
    assert.ok(!p1Navbar.includes('${projectName}'));

    // Server manifests & files
    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.strictEqual(serverPkg.name, 'p1-js-auth-shadcn-server');
    assert.strictEqual(serverPkg.type, 'module');
    assert.ok(serverPkg.dependencies['express']);
    assert.ok(serverPkg.dependencies['mongoose']);
    assert.ok(serverPkg.dependencies['cors']);
    assert.ok(fs.existsSync(path.join(serverDir, 'index.js')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/config/db.js')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/routes/api.routes.js')));
    assert.ok(fs.existsSync(path.join(serverDir, '.env')));
  });

  // 2. Permutation 2: JS + Auth + Tailwind (without shadcn)
  it('P2: JavaScript + Auth + Tailwind (minimal UI) scaffolding', async () => {
    const { clientDir, serverDir } = await scaffoldProject('p2-js-auth-tailwind', {
      frontendVariant: 'js',
      backendLanguage: 'js',
      auth: true,
      styling: 'tailwind',
      clientPackages: [],
      serverAddOns: ['cors', 'dotenv']
    });

    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.devDependencies['tailwindcss']);
    assert.ok(fs.existsSync(path.join(clientDir, 'src/main.jsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/WebsiteLayout.jsx')));

    const p2OverviewPath = path.join(clientDir, 'src/pages/dashboard/Overview.jsx');
    assert.ok(fs.existsSync(p2OverviewPath));
    assert.ok(fs.readFileSync(p2OverviewPath, 'utf8').includes('/dashboard/members'));

    const p2Navbar = fs.readFileSync(path.join(clientDir, 'src/layout/slices/Navbar.jsx'), 'utf8');
    assert.ok(p2Navbar.includes('p2-js-auth-tailwind'));
    assert.ok(!p2Navbar.includes('${projectName}'));

    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.dependencies['express']);
    assert.ok(fs.existsSync(path.join(serverDir, 'index.js')));
  });

  // 3. Permutation 3: JS + No-Auth + shadcn
  it('P3: JavaScript + No-Auth + shadcn scaffolding', async () => {
    const { clientDir, serverDir } = await scaffoldProject('p3-js-noauth-shadcn', {
      frontendVariant: 'js',
      backendLanguage: 'js',
      auth: false,
      styling: 'shadcn',
      clientPackages: ['toastify'],
      serverAddOns: ['cors', 'dotenv']
    });

    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.dependencies['react']);
    assert.ok(fs.existsSync(path.join(clientDir, 'components.json')));
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Overview.jsx')), false);
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Settings.jsx')), false);
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/dashboard')), false);
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/components/login-form.jsx')), false);

    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.dependencies['express']);
    assert.ok(fs.existsSync(path.join(serverDir, 'src/routes/api.routes.js')));
  });

  // 4. Permutation 4: JS + No-Auth + Tailwind (Minimalist Starter)
  it('P4: JavaScript + No-Auth + Tailwind minimal scaffolding', async () => {
    const { projectDir, clientDir, serverDir } = await scaffoldProject('p4-js-noauth-tailwind', {
      frontendVariant: 'js',
      backendLanguage: 'js',
      auth: false,
      styling: 'tailwind',
      clientPackages: [],
      serverAddOns: ['dotenv']
    });

    const rootPkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
    assert.ok(rootPkg.scripts.dev);

    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.devDependencies['tailwindcss']);

    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.dependencies['dotenv']);
    assert.ok(!serverPkg.dependencies['cors']);
  });

  // 5. Permutation 5: TS + Auth + shadcn (Enterprise Stack)
  it('P5: TypeScript + Auth + shadcn fullstack scaffolding', async () => {
    const { clientDir, serverDir } = await scaffoldProject('p5-ts-auth-shadcn', {
      frontendVariant: 'ts',
      backendLanguage: 'ts',
      auth: true,
      styling: 'shadcn',
      clientPackages: ['redux', 'toastify'],
      serverAddOns: ['cors', 'multer', 'dotenv']
    });

    // Client TS
    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.devDependencies['typescript']);
    assert.ok(clientPkg.dependencies['@reduxjs/toolkit']);
    assert.ok(fs.existsSync(path.join(clientDir, 'tsconfig.json')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/main.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/store/index.ts')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/components/ui/button.tsx')));

    const p5Navbar = fs.readFileSync(path.join(clientDir, 'src/layout/slices/Navbar.tsx'), 'utf8');
    assert.ok(p5Navbar.includes('p5-ts-auth-shadcn'));
    assert.ok(!p5Navbar.includes('${projectName}'));

    // Server TS
    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.devDependencies['typescript']);
    assert.ok(serverPkg.devDependencies['tsx']);
    assert.ok(serverPkg.dependencies['multer']);
    assert.ok(fs.existsSync(path.join(serverDir, 'tsconfig.json')));
    assert.ok(fs.existsSync(path.join(serverDir, 'index.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/middlewares/multer.ts')));
  });

  // 6. Permutation 6: TS + Auth + Tailwind (without shadcn)
  it('P6: TypeScript + Auth + Tailwind scaffolding', async () => {
    const { clientDir, serverDir } = await scaffoldProject('p6-ts-auth-tailwind', {
      frontendVariant: 'ts',
      backendLanguage: 'ts',
      auth: true,
      styling: 'tailwind',
      clientPackages: ['toastify'],
      serverAddOns: ['cors', 'dotenv']
    });

    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.devDependencies['typescript']);
    assert.ok(fs.existsSync(path.join(clientDir, 'src/main.tsx')));

    const p6OverviewPath = path.join(clientDir, 'src/pages/dashboard/Overview.tsx');
    assert.ok(fs.existsSync(p6OverviewPath));
    assert.ok(fs.readFileSync(p6OverviewPath, 'utf8').includes('/dashboard/members'));

    const p6Navbar = fs.readFileSync(path.join(clientDir, 'src/layout/slices/Navbar.tsx'), 'utf8');
    assert.ok(p6Navbar.includes('p6-ts-auth-tailwind'));
    assert.ok(!p6Navbar.includes('${projectName}'));

    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.devDependencies['typescript']);
    assert.ok(fs.existsSync(path.join(serverDir, 'index.ts')));
  });

  // 7. Permutation 7: TS + No-Auth + shadcn
  it('P7: TypeScript + No-Auth + shadcn scaffolding', async () => {
    const { clientDir, serverDir } = await scaffoldProject('p7-ts-noauth-shadcn', {
      frontendVariant: 'ts',
      backendLanguage: 'ts',
      auth: false,
      styling: 'shadcn',
      clientPackages: [],
      serverAddOns: ['cors', 'dotenv']
    });

    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.devDependencies['typescript']);
    assert.ok(fs.existsSync(path.join(clientDir, 'components.json')));
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Overview.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Settings.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/dashboard')), false);
    assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/components/login-form.tsx')), false);

    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.devDependencies['typescript']);
  });

  // 8. Permutation 8: TS + No-Auth + Tailwind
  it('P8: TypeScript + No-Auth + Tailwind scaffolding', async () => {
    const { projectDir, clientDir, serverDir } = await scaffoldProject('p8-ts-noauth-tailwind', {
      frontendVariant: 'ts',
      backendLanguage: 'ts',
      auth: false,
      styling: 'tailwind',
      clientPackages: [],
      serverAddOns: ['dotenv']
    });

    const rootPkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
    assert.strictEqual(rootPkg.name, 'p8-ts-noauth-tailwind');

    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.devDependencies['typescript']);
    assert.ok(fs.existsSync(path.join(clientDir, 'src/main.tsx')));

    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.devDependencies['typescript']);
    assert.ok(fs.existsSync(path.join(serverDir, 'index.ts')));
  });
});

describe('Tier 3: React 19 Compiler Variations', () => {
  const compilerTestDir = path.join(
    os.tmpdir(),
    `test-compiler-matrix-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  before(() => fs.mkdirSync(compilerTestDir, { recursive: true }));
  after(() => fs.rmSync(compilerTestDir, { recursive: true, force: true }));

  it('scaffolds js-compiler variant with babel compiler plugins in Vite config', async () => {
    const clientDir = path.join(compilerTestDir, 'js-compiler-client');
    fs.mkdirSync(clientDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: 'js-comp-app',
      variant: 'js-compiler',
      packages: ['tailwind']
    });

    const pkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(pkg.devDependencies['babel-plugin-react-compiler']);
    assert.ok(pkg.devDependencies['@rolldown/plugin-babel']);

    const viteConfig = fs.readFileSync(path.join(clientDir, 'vite.config.js'), 'utf8');
    assert.ok(viteConfig.includes('reactCompilerPreset'));
    assert.ok(viteConfig.includes('@rolldown/plugin-babel'));
  });

  it('scaffolds ts-compiler variant with TypeScript and React compiler plugins', async () => {
    const clientDir = path.join(compilerTestDir, 'ts-compiler-client');
    fs.mkdirSync(clientDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: 'ts-comp-app',
      variant: 'ts-compiler',
      packages: ['tailwind', 'shadcn']
    });

    const pkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(pkg.devDependencies['typescript']);
    assert.ok(pkg.devDependencies['babel-plugin-react-compiler']);

    const viteConfig = fs.readFileSync(path.join(clientDir, 'vite.config.ts'), 'utf8');
    assert.ok(viteConfig.includes('reactCompilerPreset'));
    assert.ok(viteConfig.includes('@rolldown/plugin-babel'));
  });
});

describe('Tier 4: Real-World Application Scenarios', () => {
  const scenarioTestDir = path.join(
    os.tmpdir(),
    `test-scenarios-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  before(() => fs.mkdirSync(scenarioTestDir, { recursive: true }));
  after(() => fs.rmSync(scenarioTestDir, { recursive: true, force: true }));

  // Scenario 1: Enterprise SaaS Starter
  it('Scenario 1: Enterprise SaaS Starter with TS, Compiler, Auth, shadcn, and all Server Add-ons', async () => {
    const projectDir = path.join(scenarioTestDir, 'enterprise-saas');
    const clientDir = path.join(projectDir, 'client');
    const serverDir = path.join(projectDir, 'server');
    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: 'enterprise-saas',
      variant: 'ts-compiler',
      packages: ['redux', 'toastify', 'shadcn', 'tailwind'],
      auth: true,
      styling: 'shadcn'
    });

    await generateServer(serverDir, {
      projectName: 'enterprise-saas',
      language: 'ts',
      addOns: ['cors', 'multer', 'cloudinary', 'nodemailer', 'dotenv'],
      auth: true
    });

    await generateRoot(projectDir, 'enterprise-saas');

    // 1. Root verification
    const rootPkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
    assert.deepEqual(rootPkg.workspaces, ['client', 'server']);
    assert.ok(rootPkg.scripts['install:all']);

    // 2. Client verification
    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.dependencies['@reduxjs/toolkit']);
    assert.ok(clientPkg.dependencies['react-toastify']);
    assert.ok(fs.existsSync(path.join(clientDir, 'src/store/index.ts')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/store/slices/counterSlice.ts')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Overview.tsx')));

    // 3. Server verification
    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.dependencies['cloudinary']);
    assert.ok(serverPkg.dependencies['nodemailer']);
    assert.ok(serverPkg.dependencies['multer']);
    assert.ok(fs.existsSync(path.join(serverDir, 'src/config/cloudinary.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/utils/nodemailer.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/middlewares/multer.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, '.env')));

    // 4. Cryptographic secret check
    const envContent = fs.readFileSync(path.join(serverDir, '.env'), 'utf8');
    assert.match(envContent, /^JWT_SECRET=[0-9a-f]{96}$/m);
  });

  // Scenario 2: High-Throughput Headless REST API
  it('Scenario 2: Headless REST API with JS, Express 5, MongoDB, Dotenv, and CORS (no frontend packages)', async () => {
    const projectDir = path.join(scenarioTestDir, 'headless-api');
    const serverDir = path.join(projectDir, 'server');
    fs.mkdirSync(serverDir, { recursive: true });

    await generateServer(serverDir, {
      projectName: 'headless-api',
      language: 'js',
      addOns: ['cors', 'dotenv'],
      auth: false
    });

    await generateRoot(projectDir, 'headless-api');

    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.ok(serverPkg.dependencies['cors']);
    assert.ok(serverPkg.dependencies['dotenv']);
    assert.ok(!serverPkg.dependencies['cloudinary']);
    assert.ok(!serverPkg.dependencies['nodemailer']);
    assert.ok(!serverPkg.dependencies['multer']);
    assert.ok(fs.existsSync(path.join(serverDir, 'src/config/db.js')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/routes/api.routes.js')));
  });

  // Scenario 3: Secure Internal Admin Portal
  it('Scenario 3: Secure Internal Admin Portal with role-based auth and dashboard layouts', async () => {
    const projectDir = path.join(scenarioTestDir, 'admin-portal');
    const clientDir = path.join(projectDir, 'client');
    const serverDir = path.join(projectDir, 'server');
    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: 'admin-portal',
      variant: 'ts',
      packages: ['shadcn', 'toastify'],
      auth: true,
      styling: 'shadcn'
    });

    await generateServer(serverDir, {
      projectName: 'admin-portal',
      language: 'ts',
      addOns: ['cors', 'dotenv'],
      auth: true
    });

    // Check dashboard layout & admin role routes
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/DashboardLayout.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Overview.tsx')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/middlewares/requireRole.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/middlewares/requireToken.ts')));

    // Check CSRF protection logic in server index.ts and csrf.ts middleware
    const indexTs = fs.readFileSync(path.join(serverDir, 'index.ts'), 'utf8');
    assert.ok(indexTs.includes("from './src/middlewares/csrf.js'"));
    assert.ok(indexTs.includes("app.use('/api', csrfProtection);"));

    assert.ok(fs.existsSync(path.join(serverDir, 'src/middlewares/csrf.ts')));
    const csrfTs = fs.readFileSync(path.join(serverDir, 'src/middlewares/csrf.ts'), 'utf8');
    assert.ok(csrfTs.includes("req.get('X-Requested-With') !== 'mern-client'"));
    assert.ok(csrfTs.includes("res.status(403).json({ message: 'Missing API request header.' });"));
  });

  // Scenario 4: CI/CD Automated Scaffolding (fast manifest validation without install)
  it('Scenario 4: CI/CD Scaffolding completes with zero network latency and valid JSON syntax', async () => {
    const startTime = Date.now();
    const projectDir = path.join(scenarioTestDir, 'ci-app');
    const clientDir = path.join(projectDir, 'client');
    const serverDir = path.join(projectDir, 'server');
    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: 'ci-app',
      variant: 'ts',
      packages: ['tailwind']
    });

    await generateServer(serverDir, {
      projectName: 'ci-app',
      language: 'ts',
      addOns: ['cors', 'dotenv']
    });

    await generateRoot(projectDir, 'ci-app');
    const duration = Date.now() - startTime;

    // Scaffolding must complete rapidly without external network dependency
    assert.ok(duration < 2000, `Scaffolding took too long: ${duration}ms`);

    // Verify all JSON files are well-formed
    for (const jsonFile of [
      path.join(projectDir, 'package.json'),
      path.join(clientDir, 'package.json'),
      path.join(clientDir, 'tsconfig.json'),
      path.join(serverDir, 'package.json'),
      path.join(serverDir, 'tsconfig.json')
    ]) {
      const content = fs.readFileSync(jsonFile, 'utf8');
      assert.doesNotThrow(() => JSON.parse(content), `Failed parsing JSON in ${jsonFile}`);
    }
  });

  // Scenario 5: Rapid Frontend-First Prototype
  it('Scenario 5: Rapid Frontend Prototype with React 19 Compiler, Tailwind v4, and Toast notifications', async () => {
    const projectDir = path.join(scenarioTestDir, 'proto-app');
    const clientDir = path.join(projectDir, 'client');
    fs.mkdirSync(clientDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: 'proto-app',
      variant: 'js-compiler',
      packages: ['toastify', 'shadcn']
    });

    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.ok(clientPkg.dependencies['react-toastify']);
    assert.ok(clientPkg.devDependencies['babel-plugin-react-compiler']);
    assert.ok(fs.existsSync(path.join(clientDir, 'src/App.jsx')));

    const appJsx = fs.readFileSync(path.join(clientDir, 'src/App.jsx'), 'utf8');
    assert.ok(appJsx.includes('ToastContainer'));
  });
});
