# Full-Stack CLI Project Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a production-ready interactive npm CLI tool that scaffolds a complete full-stack web application featuring Vite React on the frontend (with sliced layouts and multiple variants) and an Express + MongoDB backend (supporting JavaScript ESM or TypeScript and selective feature add-ons).

**Architecture:** Modular embedded template generator using `@clack/prompts` to drive an interactive terminal wizard. The generator dynamically merges base templates with conditional add-on modules (Tailwind, Shadcn UI, Redux Toolkit, Multer, Cloudinary, Nodemailer) and writes pre-wired, idiomatic code and `package.json` manifests for both client and server.

**Tech Stack:** Node.js (>=18), `@clack/prompts`, `picocolors`, `node:fs`, `node:path`, `node:child_process`, Vitest/Node test runner.

**Spec:** [docs/superpowers/specs/2026-11-02-fullstack-cli-generator-design.md](file:///c:/Users/arsalan/Desktop/Complete%20Npm%20package/docs/superpowers/specs/2026-11-02-fullstack-cli-generator-design.md)

## Global Constraints

- Runtime: Node.js >= 18.0.0.
- Cross-platform support: Must run reliably on Windows, macOS, and Linux without platform-specific path separator bugs.
- Self-contained packaging: All templates and scaffolding logic must be bundled inside the published npm package so scaffolding works completely offline.
- No dead code: Unselected optional libraries must not leave unused imports or broken references in the generated code.
- React Router DOM is required across all client variants to power nested sliced layouts.
- Express and Mongoose (MongoDB) form the core backend foundation.

## Review Focus

1. **Target directory collision:** If the target directory already exists and contains files, the CLI must detect it, warn the user, and refuse to overwrite silently. (Covered in Task 1).
2. **NPM package name sanitization:** If the user enters a project name with spaces or uppercase letters (e.g. `My Fullstack App`), the folder uses the raw input but `package.json` `name` is sanitized to `my-fullstack-app`. (Covered in Task 1).
3. **Cross-platform path handling:** Generated ESM import statements inside templates must always use forward slashes (`/`), even when executed on Windows. (Covered in Task 2 & Task 3).
4. **Conditional backend import safety:** Deselecting Multer, Cloudinary, or Nodemailer must completely omit their import statements, configuration calls, and route mounts from `index.{js,ts}`. (Covered in Task 3).
5. **Graceful installer fallback:** If `npm install` fails (e.g. offline or interrupted), the CLI must log a helpful recovery message with manual instructions instead of throwing an unhandled process crash. (Covered in Task 4).

---

## File Structure

```
├── bin/
│   └── index.js                         # Executable CLI binary entry (#!/usr/bin/env node)
├── src/
│   ├── cli.js                           # Interactive prompt orchestration using @clack/prompts
│   ├── utils/
│   │   ├── naming.js                    # Package name sanitization and path resolution
│   │   ├── fs-helpers.js                # Recursive copy, template rendering, and file writing
│   │   └── package-merger.js            # Dynamic package.json construction & merging
│   ├── generator/
│   │   ├── clientGenerator.js           # Client scaffolding: variants, sliced layouts, optional packages
│   │   ├── serverGenerator.js           # Server scaffolding: JS ESM vs TS, config, controllers, routes
│   │   ├── rootGenerator.js             # Root package.json, gitignore, and README scaffolding
│   │   └── installer.js                 # Subprocess package installation runner
│   └── templates/                       # Static template files and snippet overlays
│       ├── client/
│       │   ├── base-js/
│       │   ├── base-ts/
│       │   └── snippets/
│       └── server/
│           ├── base-js/
│           ├── base-ts/
│           └── snippets/
├── test/
│   ├── naming.test.js
│   ├── clientGenerator.test.js
│   ├── serverGenerator.test.js
│   └── rootGenerator.test.js
└── package.json
```

---

### Task 1: CLI Foundation, Bin Entry & Naming Utilities

**Files:**
- Create: `package.json`
- Create: `bin/index.js`
- Create: `src/utils/naming.js`
- Create: `src/utils/fs-helpers.js`
- Test: `test/naming.test.js`

**Interfaces:**
- Produces: `sanitizePackageName(rawName: string) -> string`
- Produces: `validateTargetDir(targetPath: string) -> { valid: boolean, error?: string }`
- Produces: `writeFileTree(targetDir: string, files: Record<string, string>) -> Promise<void>`

- [ ] **Step 1: Write failing tests for naming sanitization and directory validation**

```javascript
// test/naming.test.js
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
    // Current dir is non-empty or empty
    assert.strictEqual(typeof res.valid, 'boolean');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/naming.test.js`
Expected: FAIL with module not found or undefined functions.

- [ ] **Step 3: Implement `package.json`, `bin/index.js`, `naming.js`, and `fs-helpers.js`**

Initialize the CLI project with dependencies `@clack/prompts` and `picocolors`. Configure `"bin": { "create-fullstack-app": "./bin/index.js" }` and `"type": "module"`. Implement `sanitizePackageName` using regex for npm naming rules, and recursive directory creation helpers in `fs-helpers.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/naming.test.js`
Expected: PASS

- [ ] **Step 5: Verify CLI binary invocation**

Run: `node ./bin/index.js --help`
Expected: Outputs program help and version without errors.

---

### Task 2: Frontend Client Generator & Sliced Layouts

**Files:**
- Create: `src/generator/clientGenerator.js`
- Create: `src/templates/client/` (base templates for JS, JS+Compiler, TS, TS+Compiler, and snippets)
- Test: `test/clientGenerator.test.js`

**Interfaces:**
- Consumes: `sanitizePackageName` from `src/utils/naming.js`, `writeFileTree` from `src/utils/fs-helpers.js`
- Produces: `generateClient(targetDir: string, options: ClientOptions) -> Promise<void>`
  where `ClientOptions` = `{ projectName: string, variant: 'js'|'js-compiler'|'ts'|'ts-compiler', packages: string[] }`

- [ ] **Step 1: Write failing test for client scaffolding**

```javascript
// test/clientGenerator.test.js
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/clientGenerator.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement client templates and `clientGenerator.js`**

Implement templates for:
- 4 variants: JavaScript, JavaScript + React Compiler (React 19 compiler babel plugin), TypeScript, TypeScript + React Compiler.
- Sliced layout components: `Navbar`, `Footer`, `Sidebar`, `Header` in `src/layout/slices/`.
- Layout wrappers: `WebsiteLayout` and `DashboardLayout` mounting `<Outlet />`.
- Page views: `pages/website/Home`, `About`, `Contact` and `pages/dashboard/Overview`, `Settings`.
- Routing configuration in `App.{jsx,tsx}` wrapping routes cleanly with React Router DOM.
- Integrations for Tailwind CSS (postCSS & config), Shadcn UI (`components.json`, `lib/utils`, sample button), Redux Toolkit (`store/index` and `counterSlice`), and React-Toastify (`<ToastContainer />`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/clientGenerator.test.js`
Expected: PASS

---

### Task 3: Backend Server Generator (ESM & TypeScript)

**Files:**
- Create: `src/generator/serverGenerator.js`
- Create: `src/templates/server/` (base templates for JS ESM, TS, and add-on snippets)
- Test: `test/serverGenerator.test.js`

**Interfaces:**
- Consumes: `writeFileTree` from `src/utils/fs-helpers.js`
- Produces: `generateServer(targetDir: string, options: ServerOptions) -> Promise<void>`
  where `ServerOptions` = `{ projectName: string, language: 'js'|'ts', addOns: string[] }`

- [ ] **Step 1: Write failing test for server scaffolding**

```javascript
// test/serverGenerator.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateServer } from '../src/generator/serverGenerator.js';

describe('serverGenerator', () => {
  const testDir = path.join(os.tmpdir(), 'test-server-scaffold-' + Date.now());

  before(() => fs.mkdirSync(testDir, { recursive: true }));
  after(() => fs.rmSync(testDir, { recursive: true, force: true }));

  it('scaffolds server with ES Modules, MongoDB, controllers, routes, and selected add-ons', async () => {
    await generateServer(testDir, {
      projectName: 'test-app',
      language: 'js',
      addOns: ['cors', 'multer', 'cloudinary', 'nodemailer', 'dotenv']
    });

    // Check directory structure
    assert.ok(fs.existsSync(path.join(testDir, 'src/config/db.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/config/cloudinary.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/models/user.model.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/controllers/api.controller.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/routes/api.routes.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/middlewares/multer.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/utils/nodemailer.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/index.js')));
    assert.ok(fs.existsSync(path.join(testDir, '.env.example')));

    // Check package.json dependencies
    const pkg = JSON.parse(fs.readFileSync(path.join(testDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.type, 'module');
    assert.ok(pkg.dependencies['express']);
    assert.ok(pkg.dependencies['mongoose']);
    assert.ok(pkg.dependencies['cors']);
    assert.ok(pkg.dependencies['multer']);
    assert.ok(pkg.dependencies['cloudinary']);
    assert.ok(pkg.dependencies['nodemailer']);
  });

  it('scaffolds server with TypeScript when selected', async () => {
    const tsDir = path.join(testDir, 'ts-server');
    fs.mkdirSync(tsDir, { recursive: true });
    await generateServer(tsDir, {
      projectName: 'test-ts-app',
      language: 'ts',
      addOns: ['cors']
    });

    assert.ok(fs.existsSync(path.join(tsDir, 'src/index.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'src/config/db.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'tsconfig.json')));
    const pkg = JSON.parse(fs.readFileSync(path.join(tsDir, 'package.json'), 'utf8'));
    assert.ok(pkg.devDependencies['tsx']);
    assert.ok(pkg.devDependencies['typescript']);
    assert.ok(pkg.devDependencies['@types/express']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/serverGenerator.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement server templates and `serverGenerator.js`**

Implement templates for:
- Modern ES Modules (`"type": "module"`) and TypeScript setups.
- `src/config/db.{js,ts}`: Mongoose connection with error handling.
- `src/models/user.model.{js,ts}`: Clean starter schema (with TS types if TypeScript).
- `src/controllers/api.controller.{js,ts}`: Basic controller endpoints.
- `src/routes/api.routes.{js,ts}`: Router module mounting controller methods.
- Conditional middlewares: `multer.{js,ts}` (configured storage), CORS setup in `index.{js,ts}`.
- Conditional utils & config: `cloudinary.{js,ts}`, `nodemailer.{js,ts}`.
- `src/index.{js,ts}`: Assembles middleware, routes, connects MongoDB, and listens on `process.env.PORT || 5000`.
- `.env.example` pre-populated with keys for MongoDB URI, Cloudinary credentials, and SMTP settings.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/serverGenerator.test.js`
Expected: PASS

---

### Task 4: Root Scaffolding, Package Installer & Interactive CLI Wizard

**Files:**
- Create: `src/generator/rootGenerator.js`
- Create: `src/generator/installer.js`
- Modify: `src/cli.js`
- Modify: `bin/index.js`
- Test: `test/rootGenerator.test.js`

**Interfaces:**
- Consumes: `generateClient` from `src/generator/clientGenerator.js`
- Consumes: `generateServer` from `src/generator/serverGenerator.js`
- Produces: `generateRoot(projectDir: string, projectName: string) -> Promise<void>`
- Produces: `runInstall(cwd: string, packageManager?: string) -> Promise<{ success: boolean, error?: string }>`
- Produces: `runCli(argv: string[]) -> Promise<void>`

- [ ] **Step 1: Write failing test for root generator and full project composition**

```javascript
// test/rootGenerator.test.js
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/rootGenerator.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `rootGenerator.js`, `installer.js`, and `src/cli.js`**

- Implement `rootGenerator.js` to create a root `package.json` with scripts:
  - `"dev"`: runs client and server concurrently (or gives instructions).
  - `"install:all"`: installs both client and server dependencies.
  - A clean, helpful `README.md` explaining the project architecture and environment variables.
- Implement `installer.js` using `node:child_process` `spawn` to run `npm install` with a spinner if the user opted in. If an error occurs, catch it and return a friendly recovery message.
- Implement `src/cli.js` using `@clack/prompts` to guide the user through:
  1. Project name
  2. Frontend variant (JS, JS+React Compiler, TS, TS+React Compiler)
  3. Frontend packages (Tailwind, Shadcn UI, React-Toastify, Redux Toolkit)
  4. Backend language (JavaScript vs TypeScript)
  5. Backend add-ons (CORS, Multer, Cloudinary, Nodemailer, dotenv)
  6. Dependency installation choice (Yes / No)
  7. Orchestrate `generateClient`, `generateServer`, `generateRoot`, and optionally `runInstall`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/rootGenerator.test.js`
Expected: PASS

---

### Task 5: End-to-End CLI Verification & Package Finalization

**Files:**
- Create: `test/e2e.test.js`
- Modify: `package.json`
- Test: Full test suite

- [ ] **Step 1: Write an end-to-end integration test**

Verify that running the generator programmatically produces the full directory tree (`client/`, `server/`, root files) with zero broken imports or invalid JSON.

```javascript
// test/e2e.test.js
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
      addOns: ['cors', 'multer', 'cloudinary', 'nodemailer']
    });

    await generateRoot(rootDir, 'fullstack-demo');

    // Assert full structural integrity
    assert.ok(fs.existsSync(path.join(rootDir, 'package.json')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/layout/slices/Navbar.tsx')));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/dashboard/Overview.tsx')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/config/db.ts')));
    assert.ok(fs.existsSync(path.join(serverDir, 'src/models/user.model.ts')));
  });
});
```

- [ ] **Step 2: Run all tests to verify full suite passes**

Run: `node --test test/*.test.js`
Expected: ALL PASS

- [ ] **Step 3: Test CLI bin execution locally via `npm pack --dry-run` and node binary execution**

Run: `npm pack --dry-run` to ensure all necessary templates and files are included in the published package payload, and verify `node ./bin/index.js` launches the `@clack/prompts` wizard properly.
